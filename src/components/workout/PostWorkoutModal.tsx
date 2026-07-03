import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { Zap, Dumbbell, ArrowUp, CheckCircle2, Flame, ListPlus } from "lucide-react";
import type { XPBreakdown } from "@/hooks/useGamification";
import type { WorkoutRoutineSnapshot } from "@/lib/workoutToRoutine";
import { workoutSnapshotToRoutineFormSnapshot } from "@/lib/workoutToRoutine";
import { RoutineForm } from "@/components/routine/RoutineForm";

interface PostWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  breakdown: XPBreakdown | null;
  routineSnapshot?: WorkoutRoutineSnapshot | null;
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

function playCompletionHaptic(leveledUp: boolean) {
  if ("vibrate" in navigator) {
    navigator.vibrate(leveledUp ? [80, 40, 80, 40, 120] : [60, 30, 60]);
  }
}

export function PostWorkoutModal({
  open,
  onClose,
  breakdown,
  routineSnapshot = null,
}: PostWorkoutModalProps) {
  const navigate = useNavigate();
  const [routineFormOpen, setRoutineFormOpen] = useState(false);

  useEffect(() => {
    if (open && breakdown) {
      playCompletionHaptic(breakdown.leveledUp);
    }
  }, [open, breakdown]);

  useEffect(() => {
    if (!open) setRoutineFormOpen(false);
  }, [open]);

  const routinePrefill = useMemo(
    () => (routineSnapshot ? workoutSnapshotToRoutineFormSnapshot(routineSnapshot) : null),
    [routineSnapshot],
  );

  const canSaveAsRoutine = !!routinePrefill?.ejercicios.length;

  const baseXp = useCountUp(breakdown?.base ?? 0, open && !!breakdown, 500);
  const seriesXp = useCountUp(breakdown?.series ?? 0, open && !!breakdown, 600);
  const streakXp = useCountUp(breakdown?.streakBonus ?? 0, open && !!breakdown, 650);
  const totalXp = useCountUp(breakdown?.total ?? 0, open && !!breakdown, 800);

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
  ];

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-sm text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-extrabold flex items-center justify-center gap-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 18 }}
                >
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </motion.span>
                ¡Entrenamiento Completado!
              </AlertDialogTitle>
            </AlertDialogHeader>

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
                Ir al Dashboard
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      <RoutineForm
        open={routineFormOpen}
        onOpenChange={setRoutineFormOpen}
        prefillSnapshot={routinePrefill}
      />
    </>
  );
}
