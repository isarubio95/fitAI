import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutById } from "@/hooks/useWorkouts";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { fetchUnfinishedWorkoutId } from "@/lib/activeWorkoutGuard";
import {
  PILL_CIRCLE_DURATION_MS,
  pillCircleTransitionAttr,
  pillCircleTransitionStyleForBottomSheet,
  type PillCirclePhase,
} from "@/lib/pillCircleTransition";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Timer, Pause, Play, Plus, X, Flag, Check, LogOut } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { useToast } from "@/hooks/use-toast";
import { SortableExerciseCard } from "./SortableExerciseCard";
import { PostWorkoutModal } from "./PostWorkoutModal";
import { useRestTimerContext } from "./RestTimerProvider";
import { formatMSS } from "@/hooks/useRestTimer";
import { cn } from "@/lib/utils";
import { useCalculateAndAwardXP, useRemoveWorkoutXP, type XPBreakdown } from "@/hooks/useGamification";
import { checkAndAwardLogros, type LogroRow } from "@/hooks/useLogros";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import { WorkoutLeadingRoutineIcon } from "@/components/dashboard/WorkoutDetailsSheet";
import { RoutineIconPicker, WorkoutIconPickerTrigger } from "@/components/routine/RoutineIconPicker";
import {
  DEFAULT_ROUTINE_ICON_KEY,
  resolveRoutineIconKey,
  type RoutineIconKey,
} from "@/lib/routineIcons";
import { buildWorkoutRoutineSnapshot, type WorkoutRoutineSnapshot } from "@/lib/workoutToRoutine";
import { getDefaultWorkoutTitle } from "@/lib/defaultWorkoutTitle";
import { completePlannedRoutine } from "@/hooks/useWorkoutPlan";
import { startOfMonth } from "date-fns";
import {
  formatSetLabel,
  startLiveWorkout,
  stopLiveWorkout,
  updateLiveWorkout,
} from "@/lib/liveSessionNotifications";
import {
  type ExerciseFormData,
  type SetFormData,
  type RegistroSeries,
  normalizeRegistroSeries,
  defaultSetForMode,
  setHasWork,
  serieCountsAsRecorded,
  countRecordedSets,
  serieFieldsForRegistro,
} from "@/types/workout";

const fromRoutineStorageKey = (workoutId: string) => `fitai:workout-from-routine:${workoutId}`;

function markWorkoutStartedFromRoutine(workoutId: string) {
  try {
    sessionStorage.setItem(fromRoutineStorageKey(workoutId), "1");
  } catch {
    /* ignore quota / private mode */
  }
}

function clearWorkoutStartedFromRoutine(workoutId: string) {
  try {
    sessionStorage.removeItem(fromRoutineStorageKey(workoutId));
  } catch {
    /* ignore */
  }
}

function wasWorkoutStartedFromRoutine(workoutId: string) {
  try {
    return sessionStorage.getItem(fromRoutineStorageKey(workoutId)) === "1";
  } catch {
    return false;
  }
}

/** Agrupa ejercicios consecutivos con el mismo superset_id para mostrar el bloque superserie. */
function groupExercisesBySuperset(exercises: ExerciseFormData[]): { supersetId: string | null; items: { exercise: ExerciseFormData; originalIndex: number }[] }[] {
  const groups: { supersetId: string | null; items: { exercise: ExerciseFormData; originalIndex: number }[] }[] = [];
  exercises.forEach((ex, i) => {
    const sid = ex.superset_id ?? null;
    const last = groups[groups.length - 1];
    if (sid && last?.supersetId === sid) {
      last.items.push({ exercise: ex, originalIndex: i });
    } else {
      groups.push({ supersetId: sid, items: [{ exercise: ex, originalIndex: i }] });
    }
  });
  return groups;
}

function serializeWorkoutFormSnapshot(
  titulo: string,
  fecha: string,
  exercises: ExerciseFormData[],
  icono: RoutineIconKey,
  esPublica: boolean,
): string {
  return JSON.stringify({
    titulo: titulo.trim(),
    fecha,
    icono,
    esPublica,
    exercises: exercises.map((ex) => ({
      id: ex.id ?? null,
      tipo_ejercicio_id: ex.tipo_ejercicio_id ?? null,
      usuario_ejercicio_id: ex.usuario_ejercicio_id ?? null,
      superset_id: ex.superset_id ?? null,
      sets: ex.sets.map((s) => ({
        id: s.id ?? null,
        repeticiones: Number(s.repeticiones),
        peso_kg: Number(s.peso_kg),
        duracion_seg: s.duracion_seg ?? null,
        ritmo_seg_km: s.ritmo_seg_km ?? null,
        completed: !!s.completed,
      })),
    })),
  });
}

/**
 * Margen tras el último `onDrag` de Vaul dentro del cual un cierre se considera
 * provocado por el swipe hacia abajo (el `pointerup` llega inmediatamente después).
 */
const SWIPE_DISMISS_WINDOW_MS = 250;

/** Mismo acabado glass que header móvil y BottomNav */
const ACTIVE_WORKOUT_FLOATING_SHELL =
  "rounded-[28px] border border-black/10 bg-white/70 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[hsl(222_47%_12%/0.88)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] dark:ring-1 dark:ring-white/5";

// Elapsed time display component (admite pausa: pausedAt congela el contador y pausedAccumMs descuenta lo ya pausado)
function ElapsedTime({
  since,
  pausedAccumMs = 0,
  pausedAt = null,
  paused = false,
}: {
  since: string;
  pausedAccumMs?: number;
  pausedAt?: number | null;
  paused?: boolean;
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const now = pausedAt ?? Date.now();
      const diff = Math.max(0, Math.floor((now - new Date(since).getTime() - pausedAccumMs) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setText(h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`);
    };
    update();
    if (pausedAt !== null) return;
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [since, pausedAccumMs, pausedAt]);
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono tabular-nums transition-colors",
        paused
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border/60 bg-muted/60 text-foreground",
      )}
    >
      <Timer className="h-3.5 w-3.5" />
      {text}
      {paused && <span className="text-[10px] font-semibold uppercase tracking-wide">Pausa</span>}
    </span>
  );
}

// Barra de progreso de descanso a todo el ancho: el relleno se vacía y el color
// se desplaza sutilmente de azul (lleno) a ámbar (casi vacío); verde al terminar.
function RestProgressBar({
  remaining,
  duration,
  finished,
}: {
  remaining: number;
  duration: number;
  finished: boolean;
}) {
  const ratio = duration > 0 ? Math.min(1, Math.max(0, remaining / duration)) : 0;
  const pct = finished ? 100 : ratio * 100;
  // Interpolación de tono: 212 (azul, lleno) → 28 (ámbar, casi vacío). Verde (152) al terminar.
  const hue = finished ? 152 : Math.round(28 + ratio * (212 - 28));
  const fill = `hsl(${hue} 88% 56%)`;
  const fillSoft = `hsl(${hue} 92% 64%)`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          Descanso
        </span>
        <span
          className="font-mono text-xs font-semibold tabular-nums transition-colors duration-700"
          style={{ color: finished ? "hsl(152 70% 42%)" : fill }}
        >
          {finished ? "¡Listo!" : formatMSS(remaining)}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-border/50 bg-muted/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${fill}, ${fillSoft})`,
            boxShadow: `0 0 8px ${fill}80`,
          }}
        />
      </div>
    </div>
  );
}

export function WorkoutLogger() {
  const { state, setOpen, close, openActiveWorkout } = useGlobalWorkoutDrawer();
  const { open, workoutId, defaultDate, templateExercises, templateTitle, templateRoutineIcon, plannedId, pillOrigin } = state;

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const effectiveWorkoutId = workoutId || activeWorkoutId;

  const { data: existingWorkout, isLoading: loadingWorkout } = useWorkoutById(effectiveWorkoutId ?? null);
  const { data: serverActiveWorkout, isLoading: loadingServerActiveWorkout } = useActiveWorkout();

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [esPublica, setEsPublica] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingActive, setCreatingActive] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pausedAccumMs, setPausedAccumMs] = useState(0);
  const isPaused = pausedAt !== null;
  const [postWorkoutData, setPostWorkoutData] = useState<XPBreakdown | null>(null);
  const [postWorkoutRoutineSnapshot, setPostWorkoutRoutineSnapshot] = useState<WorkoutRoutineSnapshot | null>(null);
  const [postWorkoutLogros, setPostWorkoutLogros] = useState<LogroRow[]>([]);
  const [postWorkoutId, setPostWorkoutId] = useState<string | null>(null);
  const [showPostWorkout, setShowPostWorkout] = useState(false);
  const calculateAndAwardXP = useCalculateAndAwardXP();
  const removeXP = useRemoveWorkoutXP();
  const restTimer = useRestTimerContext();
  const { data: exerciseCatalog } = useExerciseCatalog();
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<any | null>(null);
  const [editBaseline, setEditBaseline] = useState<string | null>(null);
  const [workoutIcon, setWorkoutIcon] = useState<RoutineIconKey>(DEFAULT_ROUTINE_ICON_KEY);
  /** Entrenamiento iniciado desde una rutina (biblioteca o planificada): sin fecha editable ni "guardar como rutina". */
  const [startedFromRoutine, setStartedFromRoutine] = useState(false);

  const { data: routineIconsByTitle = {} } = useQuery({
    queryKey: ["workout-logger-routine-icons", user?.id],
    enabled: open && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rutina")
        .select("nombre, icono")
        .eq("usuario_id", user!.id)
        .not("es_plantilla", "eq", true);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) {
        if (!map[row.nombre]) map[row.nombre] = row.icono;
      }
      return map;
    },
  });

  const isEdit = !!effectiveWorkoutId;
  const isActiveWorkout =
    !!activeWorkoutId ||
    (!!existingWorkout && !existingWorkout.fecha_fin) ||
    (!!workoutId && serverActiveWorkout?.id === workoutId);
  const isEditingCompletedWorkout = isEdit && !isActiveWorkout && !loadingWorkout;
  const showFloatingActionBar = isActiveWorkout || isEditingCompletedWorkout;
  const showFinishButton = isActiveWorkout ? exercises.length > 0 : isEditingCompletedWorkout;
  const hasRecordedWork = countRecordedSets(exercises) > 0;
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditingCompletedWorkout || editBaseline === null) return false;
    return serializeWorkoutFormSnapshot(titulo, fecha, exercises, workoutIcon, esPublica) !== editBaseline;
  }, [isEditingCompletedWorkout, editBaseline, titulo, fecha, exercises, workoutIcon, esPublica]);
  const canSubmitPrimaryAction = isEditingCompletedWorkout
    ? hasRecordedWork && hasUnsavedChanges
    : hasRecordedWork;
  const hideWorkoutDate = isActiveWorkout && (startedFromRoutine || !!(templateExercises && templateTitle));
  const hydratedWorkoutIdRef = useRef<string | null>(null);
  const linkedPlannedIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (open && plannedId) linkedPlannedIdRef.current = plannedId;
    if (!open) linkedPlannedIdRef.current = undefined;
  }, [open, plannedId]);

  useEffect(() => {
    if (open && templateExercises && templateTitle) {
      setStartedFromRoutine(true);
    }
  }, [open, templateExercises, templateTitle]);

  // Pre-fill form when editing existing workout (no hacerlo si abrimos desde plantilla: createActiveWorkout ya puso exercises con superset_id)
  useEffect(() => {
    if (!open) {
      hydratedWorkoutIdRef.current = null;
      return;
    }
    if (isEdit && existingWorkout && !templateExercises) {
      if (hydratedWorkoutIdRef.current === existingWorkout.id) return;
      hydratedWorkoutIdRef.current = existingWorkout.id;
      const hydratedTitulo = existingWorkout.titulo;
      const hydratedFecha = new Date(existingWorkout.fecha).toISOString().slice(0, 10);
      const hydratedExercises: ExerciseFormData[] = existingWorkout.ejercicios.map((ej) => ({
        tipo_ejercicio_id: (ej as any).tipo_ejercicio_id ?? undefined,
        usuario_ejercicio_id: (ej as any).usuario_ejercicio_id ?? undefined,
        nombre: ej.tipo_ejercicio.nombre,
        id: ej.id,
        descanso: ej.descanso ?? undefined,
        repRange: ej.rep_range ?? undefined,
        targetRir: ej.rir_objetivo ?? undefined,
        registro_series: normalizeRegistroSeries((ej as any).registro_series),
        sets: ej.series
          .sort((a, b) => a.numero_serie - b.numero_serie)
          .map((s) => ({
            repeticiones: s.repeticiones,
            peso_kg: Number(s.peso_kg),
            duracion_seg: s.duracion_seg ?? null,
            ritmo_seg_km: s.ritmo_seg_km ?? null,
            id: s.id,
            completed: s.completed,
          })),
      }));
      setTitulo(hydratedTitulo);
      setFecha(hydratedFecha);
      setExercises(hydratedExercises);
      const hydratedIcon = resolveRoutineIconKey(
        existingWorkout.icono ?? routineIconsByTitle[hydratedTitulo] ?? DEFAULT_ROUTINE_ICON_KEY,
      );
      setWorkoutIcon(hydratedIcon);
      const hydratedEsPublica = !!(existingWorkout as { es_publica?: boolean }).es_publica;
      setEsPublica(hydratedEsPublica);
      setStartedFromRoutine(
        !existingWorkout.fecha_fin && wasWorkoutStartedFromRoutine(existingWorkout.id),
      );
      setEditBaseline(
        existingWorkout.fecha_fin
          ? serializeWorkoutFormSnapshot(
              hydratedTitulo,
              hydratedFecha,
              hydratedExercises,
              hydratedIcon,
              hydratedEsPublica,
            )
          : null,
      );
    }
  }, [isEdit, existingWorkout, open, templateExercises, routineIconsByTitle]);

  // Crear sesión activa al abrir (desde rutina/plan o entreno en blanco)
  useEffect(() => {
    if (!open || workoutId || activeWorkoutId || creatingActive || !user || loadingServerActiveWorkout) return;

    if (serverActiveWorkout) {
      openActiveWorkout(serverActiveWorkout.id);
      return;
    }

    if (templateExercises && templateTitle) {
      createActiveWorkout();
      return;
    }

    if (!templateExercises) {
      createBlankActiveWorkout();
    }
  }, [
    open,
    workoutId,
    templateExercises,
    templateTitle,
    activeWorkoutId,
    creatingActive,
    user,
    defaultDate,
    loadingServerActiveWorkout,
    serverActiveWorkout,
    openActiveWorkout,
  ]);

  // Reset form when opening for new workout (no template, no edit) — antes de crear la sesión activa
  useEffect(() => {
    if (open && !workoutId && !activeWorkoutId && !templateExercises) {
      setTitulo(getDefaultWorkoutTitle());
      setExercises([]);
      setFecha(defaultDate || new Date().toISOString().slice(0, 10));
      setStartedFromRoutine(false);
      setEsPublica(false);
    }
  }, [open, workoutId, activeWorkoutId, defaultDate, templateExercises]);

  // Reset activeWorkoutId when drawer closes
  useEffect(() => {
    if (!open) {
      setActiveWorkoutId(null);
      setPausedAt(null);
      setPausedAccumMs(0);
      setEditBaseline(null);
      setWorkoutIcon(DEFAULT_ROUTINE_ICON_KEY);
      setEsPublica(false);
    }
  }, [open]);

  const togglePause = useCallback(() => {
    setPausedAt((prev) => {
      if (prev === null) return Date.now();
      setPausedAccumMs((acc) => acc + (Date.now() - prev));
      return null;
    });
  }, []);

  const resolveLiveExerciseFields = useCallback(() => {
    let exerciseName = "";
    let setLabel = "";
    if (restTimer.activeKey) {
      const [eiRaw, siRaw] = restTimer.activeKey.split("-");
      const ei = Number(eiRaw);
      const si = Number(siRaw);
      if (Number.isFinite(ei) && exercises[ei]) {
        exerciseName = exercises[ei].nombre || "";
        if (Number.isFinite(si)) setLabel = formatSetLabel(si);
      }
    } else {
      for (let i = exercises.length - 1; i >= 0; i--) {
        const sets = exercises[i].sets;
        for (let si = sets.length - 1; si >= 0; si--) {
          if (sets[si].completed) {
            exerciseName = exercises[i].nombre || "";
            setLabel = formatSetLabel(si);
            return { exerciseName, setLabel };
          }
        }
      }
    }
    return { exerciseName, setLabel };
  }, [exercises, restTimer.activeKey]);

  const pushLiveWorkoutNotification = useCallback(
    (mode: "start" | "update" = "update") => {
      if (!isActiveWorkout || !effectiveWorkoutId) return;
      const startedAtMs = existingWorkout?.fecha
        ? new Date(existingWorkout.fecha).getTime()
        : Date.now();
      const { exerciseName, setLabel } = resolveLiveExerciseFields();
      const restFinished = !!restTimer.activeKey && restTimer.finished;
      const resting = restTimer.isRunning;
      const showRest = resting || restFinished;
      const pauseExtra =
        pausedAccumMs + (pausedAt != null ? Math.max(0, Date.now() - pausedAt) : 0);
      const restEndAtMs =
        resting && restTimer.endTime != null
          ? restTimer.endTime
          : resting
            ? Date.now() + Math.max(0, restTimer.remaining) * 1000
            : 0;
      const payload = {
        sessionId: effectiveWorkoutId,
        title: (titulo || existingWorkout?.titulo || "Entrenamiento").trim() || "Entrenamiento",
        exerciseName,
        setLabel,
        paused: isPaused,
        resting,
        restFinished,
        restEndAtMs,
        restDurationSec: showRest ? Math.max(0, restTimer.duration) : 0,
        startedAtMs,
        pausedAccumMs: pauseExtra,
      };
      if (mode === "start") void startLiveWorkout(payload);
      else void updateLiveWorkout(payload);
    },
    [
      isActiveWorkout,
      effectiveWorkoutId,
      existingWorkout?.fecha,
      existingWorkout?.titulo,
      resolveLiveExerciseFields,
      restTimer.activeKey,
      restTimer.isRunning,
      restTimer.finished,
      restTimer.endTime,
      restTimer.remaining,
      restTimer.duration,
      pausedAccumMs,
      pausedAt,
      isPaused,
      titulo,
    ],
  );

  // Keep Android Live Update in sync while an active workout is open in the logger
  useEffect(() => {
    if (!isActiveWorkout || !effectiveWorkoutId) return;
    pushLiveWorkoutNotification("update");
  }, [
    isActiveWorkout,
    effectiveWorkoutId,
    exercises,
    isPaused,
    pausedAccumMs,
    restTimer.activeKey,
    restTimer.isRunning,
    restTimer.finished,
    titulo,
    pushLiveWorkoutNotification,
  ]);

  const createActiveWorkout = async () => {
    if (!user || !templateExercises || !templateTitle) return;
    setCreatingActive(true);
    try {
      const unfinishedId = await fetchUnfinishedWorkoutId(user.id);
      if (unfinishedId) {
        openActiveWorkout(unfinishedId);
        return;
      }

      const templateIcon = resolveRoutineIconKey(templateRoutineIcon ?? DEFAULT_ROUTINE_ICON_KEY);
      const plannedDate = defaultDate?.slice(0, 10);
      // La fecha de la actividad activa debe ser el instante REAL de inicio para
      // que el cronómetro cuente bien (antes se fijaba a las 12:00 del día
      // planificado, lo que dejaba el contador a 0:00 al entrenar por la mañana).
      // La fecha "de calendario" se conserva en el estado y se guarda al finalizar.
      const startedAtMs = Date.now();
      const { data: actividad, error: actError } = await supabase
        .from("actividad")
        .insert({
          titulo: templateTitle.trim(),
          fecha: new Date(startedAtMs).toISOString(),
          usuario_id: user.id,
          es_publica: false,
          icono: templateIcon,
        })
        .select("id")
        .single();
      if (actError) throw actError;

      const baseCreatedAt = Date.now();
      const ejercicioInserts = templateExercises.map((ex, i) => ({
        actividad_id: actividad.id,
        tipo_ejercicio_id: (ex as any).tipo_ejercicio_id ?? null,
        usuario_ejercicio_id: (ex as any).usuario_ejercicio_id ?? null,
        usuario_id: user.id,
        descanso: ex.descanso ?? null,
        rep_range: ex.repRange ?? null,
        rir_objetivo: ex.targetRir ?? null,
        registro_series: normalizeRegistroSeries(ex.registro_series),
        // Escalonar created_at para conservar el orden de ejecución al listar después.
        created_at: new Date(baseCreatedAt + i).toISOString(),
      }));
      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .insert(ejercicioInserts)
        .select("id");
      if (ejError) throw ejError;

      const serieInserts = templateExercises.flatMap((ex, i) => {
        const mode = normalizeRegistroSeries(ex.registro_series);
        return ex.sets.map((s, si) => {
          const durRit = serieFieldsForRegistro(mode, s);
          return {
            ejercicio_id: ejercicios![i].id,
            usuario_id: user.id,
            numero_serie: si + 1,
            repeticiones: 0,
            peso_kg: 0,
            duracion_seg:
              durRit.duracion_seg != null ? durRit.duracion_seg : mode !== "peso_reps" ? 0 : null,
            ritmo_seg_km: durRit.ritmo_seg_km,
            completed: false,
          };
        });
      });
      const { data: series, error: sError } = await supabase
        .from("serie")
        .insert(serieInserts)
        .select("id");
      if (sError) throw sError;

      let idx = 0;
      const updatedExercises: ExerciseFormData[] = templateExercises.map((ex, i) => ({
        ...ex,
        id: ejercicios![i].id,
        sets: ex.sets.map((s) => ({
          ...s,
          id: series![idx++].id,
          completed: false,
        })),
      }));

      setActiveWorkoutId(actividad.id);
      setTitulo(templateTitle);
      setWorkoutIcon(templateIcon);
      setFecha(plannedDate || new Date().toISOString().slice(0, 10));
      setExercises(updatedExercises);
      setEsPublica(false);
      setStartedFromRoutine(true);
      markWorkoutStartedFromRoutine(actividad.id);
      invalidateActiveWorkoutQueries();
      void startLiveWorkout({
        sessionId: actividad.id,
        title: templateTitle.trim() || "Entrenamiento",
        startedAtMs,
      });
    } catch (error: any) {
      toast({ title: "Error al crear entrenamiento", description: error.message, variant: "destructive" });
    } finally {
      setCreatingActive(false);
    }
  };

  const createBlankActiveWorkout = async () => {
    if (!user) return;
    setCreatingActive(true);
    try {
      const unfinishedId = await fetchUnfinishedWorkoutId(user.id);
      if (unfinishedId) {
        openActiveWorkout(unfinishedId);
        return;
      }

      const now = new Date();
      const startedAtMs = now.getTime();
      const defaultTitle = getDefaultWorkoutTitle(now);
      const { data: actividad, error: actError } = await supabase
        .from("actividad")
        .insert({
          titulo: defaultTitle,
          fecha: now.toISOString(),
          usuario_id: user.id,
          es_publica: false,
          icono: DEFAULT_ROUTINE_ICON_KEY,
        })
        .select("id")
        .single();
      if (actError) throw actError;

      setActiveWorkoutId(actividad.id);
      setTitulo(defaultTitle);
      setExercises([]);
      setWorkoutIcon(DEFAULT_ROUTINE_ICON_KEY);
      setFecha(defaultDate || now.toISOString().slice(0, 10));
      setStartedFromRoutine(false);
      clearWorkoutStartedFromRoutine(actividad.id);
      invalidateActiveWorkoutQueries();
      void startLiveWorkout({
        sessionId: actividad.id,
        title: defaultTitle,
        startedAtMs,
      });
    } catch (error: any) {
      toast({ title: "Error al crear entrenamiento", description: error.message, variant: "destructive" });
    } finally {
      setCreatingActive(false);
    }
  };

  const addExercise = async (
    catalogRef: {
      tipo_ejercicio_id?: string;
      usuario_ejercicio_id?: string;
      registro_series?: RegistroSeries;
    },
    nombre: string
  ) => {
    const { tipo_ejercicio_id, usuario_ejercicio_id, registro_series: rs } = catalogRef;
    const registro_series = normalizeRegistroSeries(rs);
    const firstSet = defaultSetForMode(registro_series, null, null);
    if (effectiveWorkoutId && user) {
      try {
        const { data: ej, error } = await supabase
          .from("ejercicio")
          .insert({
            actividad_id: effectiveWorkoutId,
            tipo_ejercicio_id: tipo_ejercicio_id ?? null,
            usuario_ejercicio_id: usuario_ejercicio_id ?? null,
            usuario_id: user.id,
            registro_series,
          } as any)
          .select("id")
          .single();
        if (error) throw error;
        const modeNs = normalizeRegistroSeries(registro_series);
        const { data: serie } = await supabase
          .from("serie")
          .insert({
            ejercicio_id: ej.id,
            usuario_id: user.id,
            numero_serie: 1,
            repeticiones: 0,
            peso_kg: 0,
            ...serieFieldsForRegistro(modeNs, firstSet),
            completed: false,
          })
          .select("id")
          .single();
        setExercises((prev) => [
          ...prev,
          {
            tipo_ejercicio_id,
            usuario_ejercicio_id,
            nombre,
            id: ej.id,
            registro_series,
            sets: [{ ...firstSet, id: serie?.id, completed: false }],
          },
        ]);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    } else {
      setExercises((prev) => [
        ...prev,
        {
          tipo_ejercicio_id,
          usuario_ejercicio_id,
          nombre,
          registro_series,
          sets: [{ ...firstSet }],
        },
      ]);
    }
    setExercisePickerOpen(false);
  };

  const removeExercise = async (index: number) => {
    const ex = exercises[index];
    if (ex.id && effectiveWorkoutId) {
      try {
        const setIds = ex.sets.filter((s) => s.id).map((s) => s.id!);
        if (setIds.length) await supabase.from("serie").delete().in("id", setIds);
        await supabase.from("ejercicio").delete().eq("id", ex.id);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = async (exerciseIndex: number) => {
    const ex = exercises[exerciseIndex];
    if (ex.id && effectiveWorkoutId && user) {
      try {
        const mode = normalizeRegistroSeries(ex.registro_series);
        const blank = defaultSetForMode(mode, null, null);
        const ins = serieFieldsForRegistro(mode, blank);
        const { data, error } = await supabase
          .from("serie")
          .insert({
            ejercicio_id: ex.id,
            usuario_id: user.id,
            numero_serie: ex.sets.length + 1,
            repeticiones: 0,
            peso_kg: 0,
            duracion_seg: ins.duracion_seg != null ? ins.duracion_seg : mode !== "peso_reps" ? 0 : null,
            ritmo_seg_km: ins.ritmo_seg_km,
            completed: false,
          })
          .select("id")
          .single();
        if (error) throw error;
        setExercises((prev) =>
          prev.map((e, i) =>
            i === exerciseIndex
              ? { ...e, sets: [...e.sets, { ...blank, id: data.id, completed: false }] }
              : e
          )
        );
        return;
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
    const mode = normalizeRegistroSeries(ex.registro_series);
    const blank = defaultSetForMode(mode, null, null);
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: [...e.sets, { ...blank }] }
          : e
      )
    );
  };

  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex]?.sets[setIndex];
    if (set?.id) {
      try {
        await supabase.from("serie").delete().eq("id", set.id);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: e.sets.filter((_, si) => si !== setIndex) }
          : e
      )
    );
  };

  const autoSaveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const persistSetRef = useRef<((ei: number, si: number) => Promise<void>) | null>(null);

  /**
   * Autoguardado con debounce: red de seguridad para que reps/peso se persistan
   * aunque el onBlur del input no llegue a dispararse (frecuente en móvil al
   * tocar el checkbox "Hecho" o al minimizar el drawer mientras se escribe).
   */
  const scheduleAutoSave = useCallback((exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}`;
    const timers = autoSaveTimersRef.current;
    if (timers[key]) clearTimeout(timers[key]);
    timers[key] = setTimeout(() => {
      delete timers[key];
      void persistSetRef.current?.(exerciseIndex, setIndex);
    }, 600);
  }, []);

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetFormData,
    value: number | null
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
    if (isActiveWorkout) scheduleAutoSave(exerciseIndex, setIndex);
  };

  /**
   * Mantiene la caché de React Query (["workout", id]) sincronizada con los
   * autosaves. Sin esto, al reabrir el entrenamiento activo la hidratación
   * lee una foto obsoleta y "desaparecen" las últimas series registradas.
   */
  const patchSetInWorkoutCache = useCallback(
    (setId: string, patch: Record<string, unknown>) => {
      if (!effectiveWorkoutId) return;
      queryClient.setQueryData(["workout", effectiveWorkoutId], (old: any) => {
        if (!old?.ejercicios) return old;
        return {
          ...old,
          ejercicios: old.ejercicios.map((ej: any) => ({
            ...ej,
            series: (ej.series ?? []).map((s: any) =>
              s.id === setId ? { ...s, ...patch } : s,
            ),
          })),
        };
      });
    },
    [effectiveWorkoutId, queryClient],
  );

  const persistSetToDb = useCallback(async (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex]?.sets[setIndex];
    if (!set?.id) return;
    const exMode = normalizeRegistroSeries(exercises[exerciseIndex]?.registro_series);
    const dr = serieFieldsForRegistro(exMode, set);
    const payload = {
      repeticiones: set.repeticiones,
      peso_kg: set.peso_kg,
      duracion_seg: dr.duracion_seg,
      ritmo_seg_km: dr.ritmo_seg_km,
      completed: !!set.completed,
    };
    await supabase.from("serie").update(payload).eq("id", set.id);
    patchSetInWorkoutCache(set.id, payload);
  }, [exercises, patchSetInWorkoutCache]);

  const handleAutoSaveSet = useCallback(
    async (exerciseIndex: number, setIndex: number) => {
      try {
        await persistSetToDb(exerciseIndex, setIndex);
      } catch {
        // Silent fail for auto-save
      }
    },
    [persistSetToDb]
  );

  useEffect(() => {
    persistSetRef.current = handleAutoSaveSet;
  }, [handleAutoSaveSet]);

  const flushAllSetsToDb = useCallback(async () => {
    Object.values(autoSaveTimersRef.current).forEach((t) => clearTimeout(t));
    autoSaveTimersRef.current = {};
    if (!effectiveWorkoutId) return;
    const pending = exercises.flatMap((ex, exerciseIndex) =>
      ex.sets.map((set, setIndex) => ({ exerciseIndex, setIndex, set })).filter(({ set }) => set.id),
    );
    await Promise.all(pending.map(({ exerciseIndex, setIndex }) => persistSetToDb(exerciseIndex, setIndex)));
  }, [effectiveWorkoutId, exercises, persistSetToDb]);

  const handleSetCompleted = useCallback(
    async (exerciseIndex: number, setIndex: number, completed: boolean) => {
      const ex = exercises[exerciseIndex];
      const set = ex?.sets[setIndex];
      if (!ex) return;

      setExercises((prev) =>
        prev.map((e, i) =>
          i === exerciseIndex
            ? { ...e, sets: e.sets.map((s, si) => (si === setIndex ? { ...s, completed } : s)) }
            : e
        )
      );

      if (set?.id && effectiveWorkoutId) {
        // Persistimos la fila COMPLETA (no solo `completed`): al marcar "Hecho"
        // en móvil el onBlur del input de reps/peso puede no dispararse, así que
        // guardamos también esos valores para no perder lo recién escrito.
        const exMode = normalizeRegistroSeries(ex.registro_series);
        const dr = serieFieldsForRegistro(exMode, set);
        const payload = {
          repeticiones: set.repeticiones,
          peso_kg: set.peso_kg,
          duracion_seg: dr.duracion_seg,
          ritmo_seg_km: dr.ritmo_seg_km,
          completed,
        };
        try {
          await supabase.from("serie").update(payload).eq("id", set.id);
          patchSetInWorkoutCache(set.id, payload);
        } catch {
          // Silent fail
        }
      }

      if (completed) {
        const restSeconds = ex.descanso ?? 120;
        const restEndAtMs = Date.now() + restSeconds * 1000;
        restTimer.start(`${exerciseIndex}-${setIndex}`, restSeconds, effectiveWorkoutId);
        if (isActiveWorkout && effectiveWorkoutId) {
          const startedAtMs = existingWorkout?.fecha
            ? new Date(existingWorkout.fecha).getTime()
            : Date.now();
          const pauseExtra =
            pausedAccumMs + (pausedAt != null ? Math.max(0, Date.now() - pausedAt) : 0);
          void updateLiveWorkout({
            sessionId: effectiveWorkoutId,
            title: (titulo || existingWorkout?.titulo || "Entrenamiento").trim() || "Entrenamiento",
            exerciseName: ex.nombre || "",
            setLabel: formatSetLabel(setIndex),
            paused: isPaused,
            resting: true,
            restFinished: false,
            restEndAtMs,
            restDurationSec: restSeconds,
            startedAtMs,
            pausedAccumMs: pauseExtra,
          });
        }
      }
    },
    [
      exercises,
      effectiveWorkoutId,
      restTimer,
      patchSetInWorkoutCache,
      isActiveWorkout,
      existingWorkout?.fecha,
      existingWorkout?.titulo,
      pausedAccumMs,
      pausedAt,
      isPaused,
      titulo,
    ]
  );

  const handleWorkoutIconChange = useCallback(
    async (icon: RoutineIconKey) => {
      setWorkoutIcon(icon);
      if (effectiveWorkoutId) {
        try {
          await supabase.from("actividad").update({ icono: icon }).eq("id", effectiveWorkoutId);
        } catch {
          // Silent fail; el icono se guardará al finalizar
        }
      }
    },
    [effectiveWorkoutId],
  );

  const handleViewExerciseDetails = useCallback(
    (exercise: ExerciseFormData) => {
      const catalogId = (exercise as any).tipo_ejercicio_id ?? (exercise as any).usuario_ejercicio_id;
      if (!catalogId || !exerciseCatalog) return;
      const found = exerciseCatalog.find((t) => t.id === catalogId);
      if (!found) return;
      setSelectedExerciseDetail(found);
    },
    [exerciseCatalog]
  );

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setExercises((prev) => {
      const oldIndex = prev.findIndex((e) => (e.id || String(prev.indexOf(e))) === active.id);
      const newIndex = prev.findIndex((e) => (e.id || String(prev.indexOf(e))) === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const getExerciseSortId = (ex: ExerciseFormData, index: number) => ex.id || String(index);
  /** Solo sesión activa: no tocar estadísticas hasta finalizar. */
  const invalidateActiveWorkoutQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
    queryClient.invalidateQueries({ queryKey: ["activeWorkout"] });
  };

  /** Invalida queries afectadas al guardar, finalizar o borrar un entrenamiento. */
  const invalidateWorkoutQueries = (opts: { workoutId?: string; fecha?: string; isDelete?: boolean }) => {
    const { workoutId, fecha } = opts;
    invalidateActiveWorkoutQueries();
    queryClient.invalidateQueries({ queryKey: ["exercise-with-history"] });
    queryClient.invalidateQueries({ queryKey: ["exercise-history"] });
    queryClient.invalidateQueries({ queryKey: ["trainingLoad"] });
    queryClient.invalidateQueries({ queryKey: ["muscleVolume"] });
    queryClient.invalidateQueries({ queryKey: ["muscleStatistics"] });
    if (workoutId) queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    if (fecha) {
      queryClient.invalidateQueries({ queryKey: ["workoutsForDate", user?.id, fecha] });
      const from = startOfMonth(new Date(fecha + "T12:00:00.000Z")).toISOString();
      queryClient.invalidateQueries({ queryKey: ["monthWorkoutDates", user?.id, from] });
      queryClient.invalidateQueries({ queryKey: ["monthWorkouts", user?.id, from] });
    }
    queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    queryClient.invalidateQueries({ queryKey: ["communityFeed"] });
    queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
  };

  const finalizeLinkedPlannedRoutine = async () => {
    const linkedPlannedId = linkedPlannedIdRef.current ?? plannedId;
    if (!linkedPlannedId) return;
    await completePlannedRoutine(linkedPlannedId);
    linkedPlannedIdRef.current = undefined;
    queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
  };

  const handleDelete = async () => {
    const targetId = effectiveWorkoutId;
    if (!targetId) return;
    if (isActiveWorkout) {
      restTimer.stop();
      void stopLiveWorkout();
    }
    setDeleting(true);
    try {
      const { data: oldEjercicios } = await supabase
        .from("ejercicio")
        .select("id")
        .eq("actividad_id", targetId);
      const oldIds = oldEjercicios?.length ? oldEjercicios.map((e) => e.id) : [];
      // Solo restar XP si el entreno estaba completado (la XP se otorga al finalizar, no al empezar)
      const wasCompleted = !!existingWorkout?.fecha_fin && !isActiveWorkout;
      if (wasCompleted && oldIds.length) {
        const { data: series } = await supabase
          .from("serie")
          .select("id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km")
          .in("ejercicio_id", oldIds);
        const seriesCompletadas = (series ?? []).filter((s) => setHasWork(s as any)).length;
        if (seriesCompletadas > 0) {
          await removeXP(targetId, seriesCompletadas);
        }
      }
      if (oldIds.length) {
        await supabase.from("serie").delete().in("ejercicio_id", oldIds);
        await supabase.from("ejercicio").delete().eq("actividad_id", targetId);
      }
      const { error } = await supabase.from("actividad").delete().eq("id", targetId);
      if (error) throw error;
      toast({ title: "Entrenamiento eliminado correctamente" });
      clearWorkoutStartedFromRoutine(targetId);
      setStartedFromRoutine(false);
      const deletedFecha = existingWorkout?.fecha ? new Date(existingWorkout.fecha).toISOString().slice(0, 10) : undefined;
      invalidateWorkoutQueries({ workoutId: targetId, fecha: deletedFecha, isDelete: true });
      close();
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const resolvedTitulo = titulo.trim() || getDefaultWorkoutTitle();

    // 1. Limpiamos los datos en memoria filtrando series vacías
    const ejerciciosLimpios = exercises
      .map((ex) => {
        const seriesValidas = ex.sets.filter((s) => serieCountsAsRecorded(s));
        return { ...ex, sets: seriesValidas };
      })
      .filter((ex) => ex.sets.length > 0);

    if (countRecordedSets(exercises) === 0) {
      toast({
        title: "Sin series registradas",
        description: isActiveWorkout
          ? "Registra al menos una serie con datos antes de finalizar."
          : "Añade al menos una serie con datos antes de guardar el entrenamiento.",
        variant: "destructive",
      });
      return;
    }

    if (isActiveWorkout) {
      restTimer.stop();
      void stopLiveWorkout();
    }

    setSaving(true);
    try {
      if (isEdit && effectiveWorkoutId) {
        await flushAllSetsToDb();

        // 2. LIMPIEZA EN BASE DE DATOS (Para entrenamientos activos o en edición)
        for (const ex of exercises) {
          const emptySets = ex.sets.filter((s) => !serieCountsAsRecorded(s));
          const validSets = ex.sets.filter((s) => serieCountsAsRecorded(s));
          
          // Borrar las series a 0 de Supabase
          if (emptySets.length > 0) {
            const emptySetIds = emptySets.map((s) => s.id).filter(Boolean) as string[];
            if (emptySetIds.length > 0) {
              await supabase.from("serie").delete().in("id", emptySetIds);
            }
          }

          // Si el ejercicio se queda sin series válidas y tiene ID, lo borramos también de Supabase
          if (validSets.length === 0 && ex.id) {
            await supabase.from("ejercicio").delete().eq("id", ex.id);
          }
        }

        if (isActiveWorkout) {
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: resolvedTitulo,
              fecha: new Date(fecha).toISOString(),
              fecha_fin: new Date().toISOString(),
              icono: workoutIcon,
              es_publica: false,
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;

          await finalizeLinkedPlannedRoutine();

          // Calculate XP and show post-workout modal
          const completedSets = exercises.reduce(
            (acc, ex) => acc + ex.sets.filter((s) => s.completed || setHasWork(s)).length,
            0
          );
          try {
            const breakdown = await calculateAndAwardXP(effectiveWorkoutId, completedSets, fecha);
            // Evaluar logros antes de abrir el modal para celebrarlos en él
            const logrosResult = await checkAndAwardLogros(user!.id).catch(() => ({ nuevos: [] as LogroRow[] }));
            queryClient.invalidateQueries({ queryKey: ["logros"] });
            queryClient.invalidateQueries({ queryKey: ["profileStats"] });
            setPostWorkoutRoutineSnapshot(
              startedFromRoutine
                ? null
                : buildWorkoutRoutineSnapshot(resolvedTitulo, workoutIcon, ejerciciosLimpios),
            );
            setPostWorkoutLogros(logrosResult.nuevos);
            setPostWorkoutData(breakdown);
            setPostWorkoutId(effectiveWorkoutId);
            setShowPostWorkout(true);
          } catch {
            // XP failed silently, still close
          }
          if (effectiveWorkoutId) clearWorkoutStartedFromRoutine(effectiveWorkoutId);
          setStartedFromRoutine(false);
          invalidateWorkoutQueries({ workoutId: effectiveWorkoutId, fecha });
          close();
        } else {
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: resolvedTitulo,
              fecha: new Date(fecha).toISOString(),
              icono: workoutIcon,
              es_publica: esPublica,
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;
          toast({ title: "¡Entrenamiento actualizado!" });
          invalidateWorkoutQueries({ workoutId: effectiveWorkoutId, fecha });
          close();
        }
      } else {
        const createdId = await handleCreate(ejerciciosLimpios, resolvedTitulo);

        // Also award XP for manual workouts
        const completedSets = ejerciciosLimpios.reduce((acc, ex) => acc + ex.sets.length, 0);
        try {
          const breakdown = await calculateAndAwardXP("manual", completedSets, fecha);
          const logrosResult = await checkAndAwardLogros(user!.id).catch(() => ({ nuevos: [] as LogroRow[] }));
          queryClient.invalidateQueries({ queryKey: ["logros"] });
          queryClient.invalidateQueries({ queryKey: ["profileStats"] });
          setPostWorkoutRoutineSnapshot(
            buildWorkoutRoutineSnapshot(resolvedTitulo, workoutIcon, ejerciciosLimpios),
          );
          setPostWorkoutLogros(logrosResult.nuevos);
          setPostWorkoutData(breakdown);
          setPostWorkoutId(createdId);
          setShowPostWorkout(true);
        } catch {
          // silent
        }
        invalidateWorkoutQueries({ fecha });
        close();
      }
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (ejerciciosLimpios: ExerciseFormData[], workoutTitle: string) => {
    const { data: actividad, error: actError } = await supabase
      .from("actividad")
      .insert({
        titulo: workoutTitle,
        fecha: new Date(fecha).toISOString(),
        fecha_fin: new Date().toISOString(),
        usuario_id: user!.id,
        es_publica: false,
        icono: workoutIcon,
      })
      .select("id")
      .single();
    if (actError) throw actError;

    const baseCreatedAt = Date.now();
    const ejercicioInserts = ejerciciosLimpios.map((ex, i) => ({
      actividad_id: actividad.id,
      tipo_ejercicio_id: (ex as any).tipo_ejercicio_id ?? null,
      usuario_ejercicio_id: (ex as any).usuario_ejercicio_id ?? null,
      usuario_id: user!.id,
      registro_series: normalizeRegistroSeries(ex.registro_series),
      created_at: new Date(baseCreatedAt + i).toISOString(),
    }));

    const { data: ejerciciosDB, error: ejError } = await supabase
      .from("ejercicio")
      .insert(ejercicioInserts)
      .select("id");
    if (ejError) throw ejError;

    const serieInserts = ejerciciosLimpios.flatMap((ex, i) => {
      const mode = normalizeRegistroSeries(ex.registro_series);
      return ex.sets.map((s, si) => {
        const dr = serieFieldsForRegistro(mode, s);
        return {
          ejercicio_id: ejerciciosDB![i].id,
          usuario_id: user!.id,
          numero_serie: si + 1,
          repeticiones: s.repeticiones,
          peso_kg: s.peso_kg,
          duracion_seg: dr.duracion_seg,
          ritmo_seg_km: dr.ritmo_seg_km,
          completed: true,
        };
      });
    });

    if (serieInserts.length > 0) {
      const { error: sError } = await supabase.from("serie").insert(serieInserts);
      if (sError) throw sError;
    }

    return actividad.id as string;
  };

  /**
   * Al minimizar/cerrar el drawer nos aseguramos de persistir en BD las
   * series pendientes (p. ej. un input que se cierra sin disparar onBlur).
   * El flush corre con los valores capturados en el closure aunque el estado
   * del drawer se resetee justo después.
   *
   * pillAnim es estado local: sobrevive a setOpen(false) (que borra pillOrigin
   * del contexto) para que data-open-from-pill siga en el DOM mientras Vaul
   * pasa a data-state=closed y así no se dispare slideToBottom.
   */
  const [pillAnim, setPillAnim] = useState<{
    origin: NonNullable<typeof pillOrigin>;
    phase: PillCirclePhase;
  } | null>(null);
  const pillCloseTimerRef = useRef<number | null>(null);
  const pillCleanupTimerRef = useRef<number | null>(null);
  const lastDragAtRef = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    if (open && pillOrigin) {
      setPillAnim({ origin: pillOrigin, phase: "in" });
    } else if (open && !pillOrigin) {
      setPillAnim(null);
    }
  }, [open, pillOrigin]);

  // Quitar clip-path residual tras el in (evita que desaparezca el border-b del header).
  useEffect(() => {
    if (pillAnim?.phase !== "in") return;
    const t = window.setTimeout(() => {
      setPillAnim((prev) => (prev?.phase === "in" ? { ...prev, phase: "settled" } : prev));
    }, PILL_CIRCLE_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [pillAnim?.phase]);

  useEffect(() => {
    return () => {
      if (pillCloseTimerRef.current != null) window.clearTimeout(pillCloseTimerRef.current);
      if (pillCleanupTimerRef.current != null) window.clearTimeout(pillCleanupTimerRef.current);
    };
  }, []);

  const commitDrawerClose = useCallback(() => {
    void flushAllSetsToDb();
    setOpen(false);
    // Mantener data-open-from-pill un frame más allá del unmount animado de Vaul.
    if (pillCleanupTimerRef.current != null) window.clearTimeout(pillCleanupTimerRef.current);
    pillCleanupTimerRef.current = window.setTimeout(() => {
      setPillAnim(null);
      pillCleanupTimerRef.current = null;
    }, 100);
  }, [flushAllSetsToDb, setOpen]);

  const handleDrawerDrag = useCallback(() => {
    lastDragAtRef.current = performance.now();
  }, []);

  const handleDrawerOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        if (pillAnim?.phase === "out") return;
        /**
         * Cierre por swipe: el círculo hacia la pill anula el `transform` del
         * arrastre, así que el panel saltaría a su sitio antes de animarse.
         * Quitamos la animación de pill y dejamos que Vaul continúe el
         * deslizamiento desde donde se soltó el dedo.
         */
        const fromSwipe = performance.now() - lastDragAtRef.current < SWIPE_DISMISS_WINDOW_MS;
        if (pillAnim && !fromSwipe) {
          setPillAnim({ origin: pillAnim.origin, phase: "out" });
          if (pillCloseTimerRef.current != null) window.clearTimeout(pillCloseTimerRef.current);
          pillCloseTimerRef.current = window.setTimeout(() => {
            pillCloseTimerRef.current = null;
            commitDrawerClose();
          }, PILL_CIRCLE_DURATION_MS);
          return;
        }
        if (pillAnim) setPillAnim(null);
        commitDrawerClose();
        return;
      }
      lastDragAtRef.current = Number.NEGATIVE_INFINITY;
      setOpen(true);
    },
    [pillAnim, commitDrawerClose, setOpen],
  );

  const saveButtonLabel = isActiveWorkout ? "Finalizar" : isEdit ? "Actualizar" : "Guardar";
  const primaryActionIcon = isActiveWorkout ? (
    <Flag className="h-4 w-4" />
  ) : (
    <Check className="h-4 w-4" />
  );

  // Evita que Radix deje algún elemento con foco visible al abrir el drawer
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const pillCircleProps = pillAnim
    ? {
        "data-open-from-pill": true as const,
        "data-pill-circle": pillAnim.phase,
        ...(pillAnim.phase !== "settled"
          ? {
              "transition-style": pillCircleTransitionAttr(pillAnim.phase),
              style: pillCircleTransitionStyleForBottomSheet(pillAnim.origin, 0.92, pillAnim.phase),
            }
          : { style: { clipPath: "none" } }),
      }
    : {};

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={handleDrawerOpenChange}
        onDrag={handleDrawerDrag}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className="h-[92lvh] max-h-[92lvh] min-h-0 overflow-hidden rounded-t-[20px] p-0"
          {...pillCircleProps}
        >
          <div data-workout-drawer-surface className="relative isolate flex h-full min-h-0 flex-col overflow-hidden">
            <DrawerHeader
              data-active-workout-sheet-header
              className="relative z-10 shrink-0 border-b border-border bg-card px-6 text-left"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <DrawerTitle className="min-w-0 truncate text-lg">
                    {isActiveWorkout ? "Entrenamiento Activo" : isEdit ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
                  </DrawerTitle>
                  {isActiveWorkout && existingWorkout && (
                    <div className="shrink-0">
                      <ElapsedTime
                        since={existingWorkout.fecha}
                        pausedAccumMs={pausedAccumMs}
                        pausedAt={pausedAt}
                        paused={isPaused}
                      />
                    </div>
                  )}
                </div>
                {isActiveWorkout && restTimer.activeKey && (
                  <RestProgressBar
                    remaining={restTimer.remaining}
                    duration={restTimer.duration}
                    finished={restTimer.finished}
                  />
                )}
              </div>
            </DrawerHeader>

            <div className="relative min-h-0 flex-1">
              {exercisePickerOpen && (
                <div
                  aria-hidden
                  className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[3px] transition-opacity duration-300"
                  onClick={() => setExercisePickerOpen(false)}
                />
              )}
              <div className="min-h-0 h-full overflow-y-auto bg-background">
              <div className={cn("flex flex-col gap-1 bg-background", showFloatingActionBar ? "pb-32" : "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]")}>
                <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                  <CardContent className="space-y-3 px-6 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={cn(
                          "space-y-1.5",
                          hideWorkoutDate ? "col-span-2" : "col-span-2 sm:col-span-1",
                        )}
                      >
                        <Label htmlFor="titulo">Título</Label>
                        <div className="flex items-center gap-3">
                          {isActiveWorkout ? (
                            <WorkoutIconPickerTrigger
                              value={workoutIcon}
                              onChange={handleWorkoutIconChange}
                              disabled={creatingActive}
                            />
                          ) : (
                            <WorkoutLeadingRoutineIcon iconKey={workoutIcon} />
                          )}
                          <Input
                            id="titulo"
                            placeholder="Ej: Día de Pierna"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="h-12 min-w-0 flex-1"
                          />
                        </div>
                      </div>
                      {!hideWorkoutDate && (
                        <div className="col-span-2 space-y-1.5 sm:col-span-1">
                          <Label htmlFor="fecha">Fecha</Label>
                          <Input
                            id="fecha"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="h-12"
                          />
                        </div>
                      )}
                    </div>
                    {isEditingCompletedWorkout && (
                      <>
                        <RoutineIconPicker
                          value={workoutIcon}
                          onChange={setWorkoutIcon}
                          label="Icono del entrenamiento"
                        />
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5">
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-medium">Publicar en comunidad</p>
                            <p className="text-[12px] text-muted-foreground">
                              {esPublica
                                ? "Este entreno se verá en el feed público."
                                : "Este entreno se mantendrá privado."}
                            </p>
                          </div>
                          <Switch
                            checked={esPublica}
                            onCheckedChange={setEsPublica}
                            aria-label="Publicar en comunidad"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {creatingActive && (
                  <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                    <CardContent className="flex items-center justify-center px-6 py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Preparando entrenamiento…</span>
                    </CardContent>
                  </Card>
                )}

                <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between gap-3 px-6 pt-4">
                      <div className="font-semibold">Ejercicios</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {exercises.length} ejercicio{exercises.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={exercises.map((ex, i) => getExerciseSortId(ex, i))} strategy={verticalListSortingStrategy}>
                        {exercises.length > 0 ? (
                          <div className="flex flex-col gap-1 bg-background">
                            {groupExercisesBySuperset(exercises).map((group) => {
                              const isSuperset = !!group.supersetId && group.items.length > 1;
                              if (isSuperset) {
                                return (
                                  <div key={group.supersetId} className="flex flex-col gap-1 bg-background">
                                    <div className="bg-primary/5 px-6 pt-2 pb-1">
                                      <span className="text-xs font-medium text-primary">🔗 Superserie</span>
                                    </div>
                                    <div className="flex flex-col gap-1 bg-background">
                                      {group.items.map(({ exercise: ex, originalIndex: ei }) => (
                                        <SortableExerciseCard
                                          key={getExerciseSortId(ex, ei)}
                                          id={getExerciseSortId(ex, ei)}
                                          exercise={ex}
                                          exerciseIndex={ei}
                                          isInSuperset
                                          onRemoveExercise={() => removeExercise(ei)}
                                          onAddSet={() => addSet(ei)}
                                          onRemoveSet={(si) => removeSet(ei, si)}
                                          onUpdateSet={(si, field, value) => updateSet(ei, si, field, value)}
                                          onAutoSaveSet={(si) => handleAutoSaveSet(ei, si)}
                                          onSetCompleted={isActiveWorkout ? (si, completed) => handleSetCompleted(ei, si, completed) : undefined}
                                          onViewExerciseDetails={handleViewExerciseDetails}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              const { exercise: ex, originalIndex: ei } = group.items[0];
                              return (
                                <SortableExerciseCard
                                  key={getExerciseSortId(ex, ei)}
                                  id={getExerciseSortId(ex, ei)}
                                  exercise={ex}
                                  exerciseIndex={ei}
                                  onRemoveExercise={() => removeExercise(ei)}
                                  onAddSet={() => addSet(ei)}
                                  onRemoveSet={(si) => removeSet(ei, si)}
                                  onUpdateSet={(si, field, value) => updateSet(ei, si, field, value)}
                                  onAutoSaveSet={(si) => handleAutoSaveSet(ei, si)}
                                  onSetCompleted={isActiveWorkout ? (si, completed) => handleSetCompleted(ei, si, completed) : undefined}
                                  onViewExerciseDetails={handleViewExerciseDetails}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <p className="px-6 pb-4 text-sm text-muted-foreground">
                            Añade ejercicios para registrar tu entrenamiento.
                          </p>
                        )}
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>

                {!showFloatingActionBar && (
                  <div className="flex justify-center p-6 py-4">
                    <ExerciseSelector
                      variant="floating"
                      open={exercisePickerOpen}
                      onOpenChange={setExercisePickerOpen}
                      onSelect={addExercise}
                    />
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Oscurecido inferior para destacar la barra flotante */}
            {showFloatingActionBar && !exercisePickerOpen && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-35 h-[120px] bg-linear-to-t from-black/40 via-black/14 to-transparent dark:from-black/55 dark:via-black/24"
              />
            )}

            {/* Barra flotante de acciones (entreno activo o edición) */}
            {showFloatingActionBar && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0))]">
                <div
                  data-vaul-no-drag
                  className={cn("pointer-events-auto flex items-center gap-1.5", ACTIVE_WORKOUT_FLOATING_SHELL)}
                >
                  {isEditingCompletedWorkout ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-foreground hover:bg-muted/60 hover:text-foreground"
                      onClick={close}
                      disabled={deleting || creatingActive}
                      aria-label="Salir de la edición"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                      disabled={deleting || creatingActive}
                      aria-label="Cancelar entrenamiento"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                  {isActiveWorkout ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-full",
                        isPaused && "bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400",
                      )}
                      onClick={togglePause}
                      aria-label={isPaused ? "Reanudar tiempo" : "Pausar tiempo"}
                    >
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                      disabled={deleting || creatingActive}
                      aria-label="Borrar entrenamiento"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                  <ExerciseSelector
                    variant="floating"
                    open={exercisePickerOpen}
                    onOpenChange={setExercisePickerOpen}
                    onSelect={addExercise}
                    trigger={
                      <Button
                        variant={isActiveWorkout && exercises.length > 0 ? "secondary" : "default"}
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-md"
                        aria-label="Agregar ejercicio"
                      >
                        <Plus className="h-5 w-5 stroke-[2px]" />
                      </Button>
                    }
                  />
                </div>
                {showFinishButton && (
                  <div
                    data-vaul-no-drag
                    className={cn("pointer-events-auto flex items-center", ACTIVE_WORKOUT_FLOATING_SHELL)}
                  >
                    <Button
                      variant="default"
                      className="h-12 gap-1.5 rounded-full px-5 font-semibold"
                      onClick={handleSave}
                      disabled={saving || creatingActive || !canSubmitPrimaryAction}
                    >
                      {saving || creatingActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        primaryActionIcon
                      )}
                      {saveButtonLabel}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirm delete workout */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este entrenamiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro de esta sesión. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PostWorkoutModal
        open={showPostWorkout}
        onClose={() => {
          setShowPostWorkout(false);
          setPostWorkoutData(null);
          setPostWorkoutRoutineSnapshot(null);
          setPostWorkoutLogros([]);
          setPostWorkoutId(null);
        }}
        breakdown={postWorkoutData}
        routineSnapshot={postWorkoutRoutineSnapshot}
        nuevosLogros={postWorkoutLogros}
        workoutId={postWorkoutId}
      />

      <ExerciseDetailSheet
        exercise={selectedExerciseDetail}
        open={!!selectedExerciseDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedExerciseDetail(null);
        }}
        currentUserId={user?.id}
      />
    </>
  );
}