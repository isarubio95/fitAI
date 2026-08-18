import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GymPickerSheet } from "@/components/gym/GymPickerSheet";
import { cn } from "@/lib/utils";
import {
  COMMUNITY_PUBLISH_HINT_OFF,
  COMMUNITY_PUBLISH_HINT_ON,
} from "@/lib/communityFeedVisibility";
import { Zap, Dumbbell, ArrowUp, CheckCircle2, Flame, ListPlus, Trophy, MapPin } from "lucide-react";
import type { XPBreakdown } from "@/hooks/useGamification";
import type { LogroRow } from "@/hooks/useLogros";
import { LogroMedal } from "@/components/logros/LogroMedal";
import type { WorkoutRoutineSnapshot } from "@/lib/workoutToRoutine";
import { workoutSnapshotToRoutineFormSnapshot } from "@/lib/workoutToRoutine";
import { RoutineForm } from "@/components/routine/RoutineForm";
import { supabase } from "@/integrations/supabase/client";
import { GIMNASIOS_QUERY_KEY, persistActividadGimnasio } from "@/hooks/useGimnasios";
import type { SelectedGimnasio } from "@/types/gimnasio";

/** Encima del AlertDialog (z-50) para que el picker y el mapa no queden detrás. */
const PICKER_OVERLAY_CLASS = "z-[120]";
const PICKER_CONTENT_CLASS = "z-[125]";
const NESTED_OVERLAY_CLASS = "z-[130]";
const NESTED_CONTENT_CLASS = "z-[135]";

interface PostWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  breakdown: XPBreakdown | null;
  routineSnapshot?: WorkoutRoutineSnapshot | null;
  nuevosLogros?: LogroRow[];
  /** Actividad recién finalizada; permite publicar desde este modal. */
  workoutId?: string | null;
  /** Gimnasio asociado al finalizar (p. ej. el prefill del perfil). */
  initialGimnasio?: SelectedGimnasio | null;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

function useCountUp(target: number, active: boolean, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}

function playCompletionHaptic(leveledUp: boolean, unlockedLogros: boolean) {
  if ("vibrate" in navigator) {
    navigator.vibrate(
      unlockedLogros ? [100, 40, 100, 40, 100, 40, 160] : leveledUp ? [80, 40, 80, 40, 120] : [60, 30, 60],
    );
  }
}

export function PostWorkoutModal({
  open,
  onClose,
  breakdown,
  routineSnapshot = null,
  nuevosLogros = [],
  workoutId = null,
  initialGimnasio = null,
}: PostWorkoutModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [routineFormOpen, setRoutineFormOpen] = useState(false);
  const [esPublica, setEsPublica] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [gimnasio, setGimnasio] = useState<SelectedGimnasio | null>(null);
  const [gymPickerOpen, setGymPickerOpen] = useState(false);
  const [savingGym, setSavingGym] = useState(false);
  const canPersistWorkout = !!workoutId && workoutId !== "manual";

  useEffect(() => {
    if (open && breakdown) {
      playCompletionHaptic(breakdown.leveledUp, nuevosLogros.length > 0);
    }
  }, [open, breakdown, nuevosLogros.length]);

  useEffect(() => {
    if (!open) {
      setRoutineFormOpen(false);
      setEsPublica(false);
      setPublishing(false);
      setGimnasio(null);
      setGymPickerOpen(false);
      setSavingGym(false);
      return;
    }
    setGimnasio(initialGimnasio ?? null);
    // Solo al abrir: el drawer del entreno resetea el gym al cerrarse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const persistPublicacion = async (value: boolean) => {
    if (!workoutId || workoutId === "manual") return;
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("actividad")
        .update({ es_publica: value })
        .eq("id", workoutId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["communityFeed"] });
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
      queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    } catch {
      setEsPublica(!value);
    } finally {
      setPublishing(false);
    }
  };

  const persistGimnasio = async (gym: SelectedGimnasio | null) => {
    const previous = gimnasio;
    setGimnasio(gym);
    if (!workoutId || workoutId === "manual") return;
    setSavingGym(true);
    try {
      await persistActividadGimnasio(workoutId, gym);
      void queryClient.invalidateQueries({ queryKey: GIMNASIOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
      queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    } catch {
      setGimnasio(previous);
    } finally {
      setSavingGym(false);
    }
  };

  const onPublicarChange = (value: boolean) => {
    setEsPublica(value);
    void persistPublicacion(value);
  };

  const routinePrefill = useMemo(
    () => (routineSnapshot ? workoutSnapshotToRoutineFormSnapshot(routineSnapshot) : null),
    [routineSnapshot],
  );

  const canSaveAsRoutine = !!routinePrefill?.ejercicios.length;

  const logrosXpTotal = nuevosLogros.reduce((acc, l) => acc + l.xp_recompensa, 0);

  const baseXp = useCountUp(breakdown?.base ?? 0, open && !!breakdown, 500);
  const seriesXp = useCountUp(breakdown?.series ?? 0, open && !!breakdown, 600);
  const streakXp = useCountUp(breakdown?.streakBonus ?? 0, open && !!breakdown, 650);
  const logrosXp = useCountUp(logrosXpTotal, open && !!breakdown, 700);
  const totalXp = useCountUp((breakdown?.total ?? 0) + logrosXpTotal, open && !!breakdown, 800);

  if (!breakdown) return null;

  const rows = [
    {
      key: "base",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      label: "Base",
      value: baseXp,
      className: "",
    },
    {
      key: "series",
      icon: <Dumbbell className="h-4 w-4 text-primary" />,
      label: "Volumen",
      value: seriesXp,
      className: "",
    },
    ...(breakdown.streakBonus > 0
      ? [
          {
            key: "streak",
            icon: <Flame className="h-4 w-4 text-orange-500" />,
            label: `Racha (+${breakdown.newStreak} ${breakdown.newStreak === 1 ? "semana" : "semanas"})`,
            value: streakXp,
            className: "text-orange-500",
          },
        ]
      : []),
    ...(logrosXpTotal > 0
      ? [
          {
            key: "logros",
            icon: <Trophy className="h-4 w-4 text-amber-500" />,
            label: `Logros (${nuevosLogros.length})`,
            value: logrosXp,
            className: "text-amber-500",
          },
        ]
      : []),
  ];

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent
          className="text-center overflow-hidden"
          onFocusOutside={(e) => {
            if (gymPickerOpen) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (gymPickerOpen) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (gymPickerOpen) e.preventDefault();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="mx-auto mb-1 max-w-[11.5rem] text-center text-2xl font-extrabold leading-tight">
                ¡Entrenamiento Completado!
              </AlertDialogTitle>
            </AlertDialogHeader>

            {nuevosLogros.length > 0 && (
              <div className="mt-3 space-y-2">
                {nuevosLogros.map((logro, index) => (
                  <motion.div
                    key={logro.id}
                    initial={{ opacity: 0, scale: 0.85, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.15, type: "spring", stiffness: 260, damping: 20 }}
                    className="flex items-center gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5 text-left"
                  >
                    <motion.div
                      initial={{ rotate: -12, scale: 0.6 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.25 + index * 0.15, type: "spring", stiffness: 220, damping: 14 }}
                    >
                      <LogroMedal nivel={logro.nivel} icono={logro.icono} size={56} />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        ¡Logro desbloqueado!
                      </p>
                      <p className="truncate text-sm font-bold">{logro.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{logro.descripcion}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-amber-500">
                      +{logro.xp_recompensa}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="space-y-3 py-2">
              {rows.map((row, index) => (
                <motion.div
                  key={row.key}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.15 + index * 0.08, duration: 0.35, ease: easeOut },
                    },
                  }}
                  className="flex items-center justify-between text-sm px-2"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {row.icon}
                    {row.label}
                  </span>
                  <span className={cn("font-semibold tabular-nums", row.className)}>+{row.value} XP</span>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.35, ease: easeOut }}
                className="border-t pt-3 flex items-center justify-between px-2"
              >
                <span className="flex items-center gap-2 font-bold">
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ delay: 0.7, duration: 0.45, ease: easeOut }}
                  >
                    <Zap className="h-5 w-5 text-amber-500" />
                  </motion.span>
                  Total
                </span>
                <motion.span
                  className="text-xl font-extrabold text-primary tabular-nums"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ delay: 0.75, duration: 0.4, ease: easeOut }}
                >
                  +{totalXp} XP
                </motion.span>
              </motion.div>

              {breakdown.leveledUp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: [0.92, 1.03, 1] }}
                  transition={{ delay: 0.5, duration: 0.55, ease: easeOut }}
                  className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <div className="flex items-center justify-center gap-2 text-primary font-bold">
                    <ArrowUp className="h-5 w-5" />
                    ¡Nivel {breakdown.newLevel}!
                  </div>
                </motion.div>
              )}
            </div>

            {canPersistWorkout && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.35, ease: easeOut }}
                  className="my-2 space-y-1.5 text-left"
                >
                  <Label htmlFor="post-workout-gimnasio">Gimnasio</Label>
                  <button
                    type="button"
                    id="post-workout-gimnasio"
                    disabled={savingGym}
                    onClick={() => setGymPickerOpen(true)}
                    className={cn(
                      "flex h-12 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-base md:text-sm",
                      "focus-visible:border-emerald-500/30 focus-visible:outline-none",
                      savingGym && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={cn("min-w-0 flex-1 truncate", !gimnasio && "text-muted-foreground")}>
                      {gimnasio?.nombre ?? "Dónde has entrenado (opcional)"}
                    </span>
                  </button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.35, ease: easeOut }}
                  className="my-2 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 text-left"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">Publicar en comunidad</p>
                    <p className="text-[12px] text-muted-foreground">
                      {esPublica ? COMMUNITY_PUBLISH_HINT_ON : COMMUNITY_PUBLISH_HINT_OFF}
                    </p>
                  </div>
                  <Switch
                    checked={esPublica}
                    onCheckedChange={onPublicarChange}
                    disabled={publishing}
                    aria-label="Publicar en comunidad"
                  />
                </motion.div>
              </>
            )}

            <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center sm:space-x-0">
              {canSaveAsRoutine && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => setRoutineFormOpen(true)}
                >
                  <ListPlus className="h-4 w-4" />
                  Guardar como rutina
                </Button>
              )}
              <AlertDialogAction
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                className={cn(buttonVariants({ variant: "default" }), "w-full mt-2")}
              >
                Ir al inicio
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      <GymPickerSheet
        open={gymPickerOpen}
        onOpenChange={setGymPickerOpen}
        selected={gimnasio}
        onSelect={(gym) => void persistGimnasio(gym)}
        overlayClassName={PICKER_OVERLAY_CLASS}
        contentClassName={PICKER_CONTENT_CLASS}
        nestedOverlayClassName={NESTED_OVERLAY_CLASS}
        nestedContentClassName={NESTED_CONTENT_CLASS}
      />

      <RoutineForm
        open={routineFormOpen}
        onOpenChange={setRoutineFormOpen}
        prefillSnapshot={routinePrefill}
      />
    </>
  );
}
