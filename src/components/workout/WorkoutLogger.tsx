import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo, type ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutById } from "@/hooks/useWorkouts";
import { useActiveWorkout, type ActiveWorkoutSummary } from "@/hooks/useActiveWorkout";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { fetchUnfinishedWorkoutId } from "@/lib/activeWorkoutGuard";
import {
  PILL_CIRCLE_DURATION_MS,
  pillCircleTransitionAttr,
  pillCircleTransitionStyleForBottomSheet,
  type PillCirclePhase,
} from "@/lib/pillCircleTransition";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Flag, Check } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { HeartRatePanel } from "@/components/cardio/live/HeartRatePanel";
import { useToast } from "@/hooks/use-toast";
import { useHeartRateMonitor } from "@/hooks/useHeartRateMonitor";
import { persistActividadHeartRate } from "@/lib/persistActividadHeartRate";
import { parseSessionRpe } from "@/lib/trainingLoad/sessionLoad";
import { summarizeHeartRate } from "@/lib/heartRateMetrics";
import { RoutineForm } from "@/components/routine/RoutineForm";
import { buildWorkoutRoutineSnapshot, workoutSnapshotToRoutineFormSnapshot } from "@/lib/workoutToRoutine";
import { PostWorkoutModal } from "./PostWorkoutModal";
import { GymLiveSummaryView } from "./GymLiveSummaryView";
import { useRestTimerContext } from "./RestTimerProvider";
import { cn } from "@/lib/utils";
import {
  markWorkoutStartedFromRoutine,
  clearWorkoutStartedFromRoutine,
  wasWorkoutStartedFromRoutine,
} from "./workout-logger/fromRoutineStorage";
import { serializeWorkoutFormSnapshot } from "./workout-logger/serializeWorkoutFormSnapshot";
import { WorkoutExerciseList } from "./workout-logger/WorkoutExerciseList";
import { WorkoutEmptyExerciseState } from "./workout-logger/WorkoutEmptyExerciseState";
import { SWIPE_DISMISS_WINDOW_MS } from "./workout-logger/constants";
import { ElapsedTime } from "./workout-logger/ElapsedTime";
import { RestProgressBar } from "./workout-logger/RestProgressBar";
import { WorkoutSessionOptions } from "./workout-logger/WorkoutSessionOptions";
import { WorkoutFloatingActionBar } from "./workout-logger/WorkoutFloatingActionBar";
import { WorkoutDeleteDialog } from "./workout-logger/WorkoutDeleteDialog";
import { WorkoutMetaForm } from "./workout-logger/WorkoutMetaForm";
import { useCalculateAndAwardXP, useRemoveWorkoutXP, type XPBreakdown } from "@/hooks/useGamification";
import { checkAndAwardLogros, type LogroRow } from "@/hooks/useLogros";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import {
  DEFAULT_ROUTINE_ICON_KEY,
  resolveRoutineIconKey,
  type RoutineIconKey,
} from "@/lib/routineIcons";
import { persistActividadGimnasio, fetchPrefillGimnasioForUser, GIMNASIOS_QUERY_KEY } from "@/hooks/useGimnasios";
import { mergeCalendarDatePreservingTime } from "@/lib/mergeCalendarDate";
import type { SelectedGimnasio } from "@/types/gimnasio";
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
  type ActividadWithDetails,
  normalizeRegistroSeries,
  defaultSetForMode,
  initialSetCountForRegistro,
  setHasWork,
  serieCountsAsRecorded,
  countRecordedSets,
  serieFieldsForRegistro,
  serieTargetFields,
  serieTargetsFromRow,
  setIsUnlogged,
  setCanApplyOverloadPatch,
} from "@/types/workout";
import { restForSet } from "@/lib/seriesPlan";
import { DEFAULT_TIPO_SERIE, isWorkingSet } from "@/lib/setTypes";

export function WorkoutLogger() {
  const { state, setOpen, close, openActiveWorkout } = useGlobalWorkoutDrawer();
  const { open, workoutId, defaultDate, templateExercises, templateTitle, templateRoutineIcon, plannedId, pillOrigin, initialGimnasio } = state;

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
  const [gimnasio, setGimnasio] = useState<SelectedGimnasio | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);
  const [comentarios, setComentarios] = useState("");
  const [liveStep, setLiveStep] = useState<"recording" | "summary">("recording");
  const [routineFormOpen, setRoutineFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingActive, setCreatingActive] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pausedAccumMs, setPausedAccumMs] = useState(0);
  const isPaused = pausedAt !== null;
  /** ISO de arranque del cronómetro; null = visible a 0:00 hasta el primer ejercicio. */
  const [sessionClockStartedAt, setSessionClockStartedAtState] = useState<string | null>(null);
  const sessionClockStartedAtRef = useRef<string | null>(null);
  const liveWorkoutStartedRef = useRef(false);
  const setSessionClockStartedAt = useCallback((iso: string | null) => {
    sessionClockStartedAtRef.current = iso;
    setSessionClockStartedAtState(iso);
  }, []);
  const armSessionClock = useCallback((iso?: string) => {
    if (sessionClockStartedAtRef.current) return sessionClockStartedAtRef.current;
    const started = iso ?? new Date().toISOString();
    sessionClockStartedAtRef.current = started;
    setSessionClockStartedAtState(started);
    return started;
  }, []);
  const [postWorkoutData, setPostWorkoutData] = useState<XPBreakdown | null>(null);
  const [postWorkoutLogros, setPostWorkoutLogros] = useState<LogroRow[]>([]);
  const [showPostWorkout, setShowPostWorkout] = useState(false);
  const calculateAndAwardXP = useCalculateAndAwardXP();
  const removeXP = useRemoveWorkoutXP();
  const restTimer = useRestTimerContext();
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<
    ComponentProps<typeof ExerciseDetailSheet>["exercise"]
  >(null);
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
  /** Alta en blanco o desde rutina: no pintar un frame del formulario «Nuevo Entrenamiento» (sheets anidados / estado residual). */
  const isStartingLiveSession = open && !workoutId;
  const preparingLiveSession = isStartingLiveSession && !effectiveWorkoutId;
  const isActiveWorkout =
    !!activeWorkoutId ||
    isStartingLiveSession ||
    (!!existingWorkout && !existingWorkout.fecha_fin) ||
    (!!workoutId && serverActiveWorkout?.id === workoutId);
  const isEditingCompletedWorkout = isEdit && !isActiveWorkout && !loadingWorkout;
  const showFloatingActionBar = isActiveWorkout || isEditingCompletedWorkout;
  const showFinishButton = isActiveWorkout ? exercises.length > 0 : isEditingCompletedWorkout;
  const hrMonitor = useHeartRateMonitor({
    recording: open && isActiveWorkout && !isPaused,
    enabled: open && isActiveWorkout,
  });
  const hasRecordedWork = countRecordedSets(exercises) > 0;
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditingCompletedWorkout || editBaseline === null) return false;
    return serializeWorkoutFormSnapshot(titulo, fecha, exercises, workoutIcon, esPublica, gimnasio?.id ?? null, rpe, comentarios) !== editBaseline;
  }, [isEditingCompletedWorkout, editBaseline, titulo, fecha, exercises, workoutIcon, esPublica, gimnasio?.id, rpe, comentarios]);
  const canSubmitPrimaryAction = isEditingCompletedWorkout
    ? hasRecordedWork && hasUnsavedChanges
    : hasRecordedWork;
  const hideWorkoutDate = isActiveWorkout && (startedFromRoutine || !!(templateExercises && templateTitle));
  const hydratedWorkoutIdRef = useRef<string | null>(null);
  const persistInflightRef = useRef(new WeakSet<ExerciseFormData>());
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
        tipo_ejercicio_id: ej.tipo_ejercicio_id ?? undefined,
        usuario_ejercicio_id: ej.usuario_ejercicio_id ?? undefined,
        nombre: ej.tipo_ejercicio.nombre,
        id: ej.id,
        descanso: ej.descanso ?? undefined,
        repRange: ej.rep_range ?? undefined,
        targetRir: ej.rir_objetivo ?? undefined,
        registro_series: normalizeRegistroSeries(ej.registro_series),
        sets: ej.series
          .sort((a, b) => a.numero_serie - b.numero_serie)
          .map((s) => ({
            repeticiones: s.repeticiones,
            peso_kg: Number(s.peso_kg),
            duracion_seg: s.duracion_seg ?? null,
            ritmo_seg_km: s.ritmo_seg_km ?? null,
            id: s.id,
            completed: s.completed,
            descanso: s.descanso ?? undefined,
            // Sin esto, rehidratar una sesión perdería el plan por serie
            // (pirámide, calentamientos) y todas las filas parecerían iguales.
            ...serieTargetsFromRow(s),
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
      const hydratedGym: SelectedGimnasio | null =
        existingWorkout.gimnasio_id && existingWorkout.gimnasio_nombre
          ? { id: existingWorkout.gimnasio_id, nombre: existingWorkout.gimnasio_nombre }
          : null;
      setGimnasio(hydratedGym);
      const hydratedRpe = parseSessionRpe(existingWorkout.rpe);
      setRpe(hydratedRpe);
      setComentarios(existingWorkout.comentarios ?? "");
      setStartedFromRoutine(
        !existingWorkout.fecha_fin && wasWorkoutStartedFromRoutine(existingWorkout.id),
      );
      if (!existingWorkout.fecha_fin && hydratedExercises.length > 0) {
        armSessionClock(existingWorkout.fecha);
      }
      setEditBaseline(
        existingWorkout.fecha_fin
          ? serializeWorkoutFormSnapshot(
              hydratedTitulo,
              hydratedFecha,
              hydratedExercises,
              hydratedIcon,
              hydratedEsPublica,
              hydratedGym?.id ?? null,
              hydratedRpe,
              existingWorkout.comentarios ?? "",
            )
          : null,
      );
    }
  }, [isEdit, existingWorkout, open, templateExercises, routineIconsByTitle, armSessionClock]);

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

  // Antes del pintado: un alta nueva no debe mostrar el título/ejercicios del entreno anterior.
  useLayoutEffect(() => {
    if (!open || workoutId || activeWorkoutId) return;
    if (templateExercises && templateTitle) {
      setTitulo(templateTitle);
      setExercises(templateExercises);
      setWorkoutIcon(resolveRoutineIconKey(templateRoutineIcon ?? DEFAULT_ROUTINE_ICON_KEY));
      setFecha(defaultDate || new Date().toISOString().slice(0, 10));
      setStartedFromRoutine(true);
      setEsPublica(false);
      setGimnasio(initialGimnasio ?? null);
      setRpe(null);
      setComentarios("");
      setExercisePickerOpen(false);
      armSessionClock();
      return;
    }
    if (!templateExercises) {
      setTitulo(getDefaultWorkoutTitle());
      setExercises([]);
      setFecha(defaultDate || new Date().toISOString().slice(0, 10));
      setStartedFromRoutine(false);
      setEsPublica(false);
      setGimnasio(initialGimnasio ?? null);
      setRpe(null);
      setComentarios("");
      setExercisePickerOpen(false);
      setSessionClockStartedAt(null);
    }
  }, [open, workoutId, activeWorkoutId, defaultDate, templateExercises, templateTitle, templateRoutineIcon, initialGimnasio, setSessionClockStartedAt, armSessionClock]);

  // Reset al cerrar para que la próxima apertura no herede el formulario anterior.
  useEffect(() => {
    if (!open) {
      setActiveWorkoutId(null);
      setPausedAt(null);
      setPausedAccumMs(0);
      setEditBaseline(null);
      setWorkoutIcon(DEFAULT_ROUTINE_ICON_KEY);
      setEsPublica(false);
      setGimnasio(null);
      setRpe(null);
      setComentarios("");
      setLiveStep("recording");
      setRoutineFormOpen(false);
      setTitulo("");
      setExercises([]);
      setExercisePickerOpen(false);
      setSelectedExerciseDetail(null);
      setSessionClockStartedAt(null);
      liveWorkoutStartedRef.current = false;
    }
  }, [open, setSessionClockStartedAt]);

  const togglePause = useCallback(() => {
    if (!sessionClockStartedAtRef.current) return;
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
      if (!isActiveWorkout || !effectiveWorkoutId || !sessionClockStartedAt) return;
      const startedAtMs = new Date(sessionClockStartedAt).getTime();
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
      sessionClockStartedAt,
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
    if (!isActiveWorkout || !effectiveWorkoutId || !sessionClockStartedAt) return;
    const mode = liveWorkoutStartedRef.current ? "update" : "start";
    liveWorkoutStartedRef.current = true;
    pushLiveWorkoutNotification(mode);
  }, [
    isActiveWorkout,
    effectiveWorkoutId,
    sessionClockStartedAt,
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
      const gym = initialGimnasio ?? (await fetchPrefillGimnasioForUser(user.id));
      const { data: actividad, error: actError } = await supabase
        .from("actividad")
        .insert({
          titulo: templateTitle.trim(),
          fecha: new Date(startedAtMs).toISOString(),
          usuario_id: user.id,
          es_publica: false,
          icono: templateIcon,
          gimnasio_id: gym?.id ?? null,
          gimnasio_nombre: gym?.nombre ?? null,
        })
        .select("id")
        .single();
      if (actError) throw actError;

      const baseCreatedAt = Date.now();
      const ejercicioInserts = templateExercises.map((ex, i) => ({
        actividad_id: actividad.id,
        tipo_ejercicio_id: ex.tipo_ejercicio_id ?? null,
        usuario_ejercicio_id: ex.usuario_ejercicio_id ?? null,
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
            descanso: s.descanso ?? null,
            // El objetivo de cada serie viaja desde la rutina y se guarda aquí.
            ...serieTargetFields(s),
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
      setExercises((prev) => {
        if (prev.length === 0) return updatedExercises;
        const merged = updatedExercises.map((created, i) => {
          const current = prev[i];
          if (!current) return created;
          return {
            ...current,
            id: created.id,
            sets: current.sets.map((s, si) => ({
              ...s,
              id: created.sets[si]?.id ?? s.id,
            })),
          };
        });
        return [...merged, ...prev.slice(updatedExercises.length)];
      });
      setEsPublica(false);
      setGimnasio(gym);
      setStartedFromRoutine(true);
      markWorkoutStartedFromRoutine(actividad.id);
      invalidateActiveWorkoutQueries();
      liveWorkoutStartedRef.current = true;
      void startLiveWorkout({
        sessionId: actividad.id,
        title: templateTitle.trim() || "Entrenamiento",
        startedAtMs,
      });
    } catch (error: unknown) {
      toast({
        title: "Error al crear entrenamiento",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
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
      const defaultTitle = getDefaultWorkoutTitle(now);
      const gym = initialGimnasio ?? (await fetchPrefillGimnasioForUser(user.id));
      const { data: actividad, error: actError } = await supabase
        .from("actividad")
        .insert({
          titulo: defaultTitle,
          fecha: now.toISOString(),
          usuario_id: user.id,
          es_publica: false,
          icono: DEFAULT_ROUTINE_ICON_KEY,
          gimnasio_id: gym?.id ?? null,
          gimnasio_nombre: gym?.nombre ?? null,
        })
        .select("id")
        .single();
      if (actError) throw actError;

      setActiveWorkoutId(actividad.id);
      setTitulo(defaultTitle);
      setWorkoutIcon(DEFAULT_ROUTINE_ICON_KEY);
      setFecha(defaultDate || now.toISOString().slice(0, 10));
      setGimnasio(gym);
      setStartedFromRoutine(false);
      clearWorkoutStartedFromRoutine(actividad.id);
      invalidateActiveWorkoutQueries();
    } catch (error: unknown) {
      toast({
        title: "Error al crear entrenamiento",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setCreatingActive(false);
    }
  };

  const persistExerciseToWorkout = async (
    workoutId: string,
    ex: ExerciseFormData,
  ): Promise<ExerciseFormData> => {
    if (!user) throw new Error("No hay usuario");
    const registro_series = normalizeRegistroSeries(ex.registro_series);
    const firstSet = ex.sets[0] ?? defaultSetForMode(registro_series, null, null);
    const setsSource =
      ex.sets.length > 0
        ? ex.sets
        : Array.from({ length: initialSetCountForRegistro(registro_series) }, () => ({ ...firstSet }));
    const { data: ej, error } = await supabase
      .from("ejercicio")
      .insert({
        actividad_id: workoutId,
        tipo_ejercicio_id: ex.tipo_ejercicio_id ?? null,
        usuario_ejercicio_id: ex.usuario_ejercicio_id ?? null,
        usuario_id: user.id,
        registro_series,
        descanso: ex.descanso ?? null,
        rep_range: ex.repRange ?? null,
        rir_objetivo: ex.targetRir ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    const { data: series, error: seriesError } = await supabase
      .from("serie")
      .insert(
        setsSource.map((s, i) => {
          const serieFields = serieFieldsForRegistro(registro_series, s);
          return {
            ejercicio_id: ej.id,
            usuario_id: user.id,
            numero_serie: i + 1,
            repeticiones: s.repeticiones ?? 0,
            peso_kg: s.peso_kg ?? 0,
            ...serieFields,
            completed: s.completed ?? false,
            descanso: s.descanso ?? null,
            ...serieTargetFields(s),
          };
        }),
      )
      .select("id, numero_serie");
    if (seriesError) throw seriesError;
    const orderedSeries = [...(series ?? [])].sort((a, b) => a.numero_serie - b.numero_serie);
    return {
      ...ex,
      id: ej.id,
      registro_series,
      sets: setsSource.map((s, i) => ({
        ...s,
        id: orderedSeries[i]?.id,
        completed: s.completed ?? false,
      })),
    };
  };

  useEffect(() => {
    if (!open || !effectiveWorkoutId || !user || creatingActive) return;
    const pending = exercises.filter((ex) => !ex.id && !persistInflightRef.current.has(ex));
    if (pending.length === 0) return;
    pending.forEach((ex) => persistInflightRef.current.add(ex));
    void (async () => {
      const persisted: ExerciseFormData[] = [];
      for (const ex of pending) {
        try {
          persisted.push(await persistExerciseToWorkout(effectiveWorkoutId, ex));
        } catch (e: unknown) {
          toast({
            title: "Error",
            description: e instanceof Error ? e.message : "Error desconocido",
            variant: "destructive",
          });
          persisted.push(ex);
        }
      }
      setExercises((prev) =>
        prev.map((ex) => {
          const idx = pending.indexOf(ex);
          return idx === -1 ? ex : (persisted[idx] ?? ex);
        }),
      );
    })();
  }, [open, effectiveWorkoutId, user, creatingActive, exercises, toast]);

  useEffect(() => {
    if (!open || !effectiveWorkoutId || !sessionClockStartedAt || !user) return;
    if (existingWorkout?.fecha_fin) return;
    const startedIso = sessionClockStartedAt;
    if (existingWorkout?.fecha === startedIso) {
      queryClient.setQueryData<ActiveWorkoutSummary | null>(["activeWorkout", user.id], (old) =>
        old && old.id === effectiveWorkoutId ? { ...old, hasExercises: true, fecha: startedIso } : old,
      );
      return;
    }
    void supabase
      .from("actividad")
      .update({ fecha: startedIso })
      .eq("id", effectiveWorkoutId)
      .then(({ error }) => {
        if (error) return;
        queryClient.setQueryData<ActividadWithDetails | null>(["workout", effectiveWorkoutId], (old) =>
          old ? { ...old, fecha: startedIso } : old,
        );
        queryClient.setQueryData<ActiveWorkoutSummary | null>(["activeWorkout", user.id], (old) =>
          old && old.id === effectiveWorkoutId
            ? { ...old, fecha: startedIso, hasExercises: true }
            : old,
        );
      });
  }, [
    open,
    effectiveWorkoutId,
    sessionClockStartedAt,
    user,
    existingWorkout?.fecha_fin,
    existingWorkout?.fecha,
    queryClient,
  ]);

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
    const setCount = initialSetCountForRegistro(registro_series);
    const localExercise: ExerciseFormData = {
      tipo_ejercicio_id,
      usuario_ejercicio_id,
      nombre,
      registro_series,
      sets: Array.from({ length: setCount }, () => ({ ...firstSet })),
    };
    if (effectiveWorkoutId && user) {
      try {
        const persisted = await persistExerciseToWorkout(effectiveWorkoutId, localExercise);
        armSessionClock();
        setExercises((prev) => [...prev, persisted]);
      } catch (e: unknown) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error desconocido",
          variant: "destructive",
        });
      }
    } else {
      armSessionClock();
      setExercises((prev) => [...prev, localExercise]);
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
      } catch (e: unknown) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error desconocido",
          variant: "destructive",
        });
      }
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = async (exerciseIndex: number) => {
    const ex = exercises[exerciseIndex];
    const mode = normalizeRegistroSeries(ex.registro_series);
    // La serie añadida a mano hereda el objetivo de la última efectiva: si el
    // ejercicio es una pirámide, continuarla es más útil que empezar en blanco.
    const lastWorking = [...ex.sets].reverse().find((s) => isWorkingSet(s.tipo_serie));
    const blank: SetFormData = {
      ...defaultSetForMode(mode, null, null),
      tipo_serie: DEFAULT_TIPO_SERIE,
      objetivo_repes_min: lastWorking?.objetivo_repes_min ?? null,
      objetivo_repes_max: lastWorking?.objetivo_repes_max ?? null,
      objetivo_rir: lastWorking?.objetivo_rir ?? null,
      objetivo_peso_kg: lastWorking?.objetivo_peso_kg ?? null,
    };

    if (ex.id && effectiveWorkoutId && user) {
      try {
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
            ...serieTargetFields(blank),
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
      } catch (e: unknown) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error desconocido",
          variant: "destructive",
        });
      }
    }
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
      } catch (e: unknown) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error desconocido",
          variant: "destructive",
        });
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
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value, seededFromPrevious: false } : s,
              ),
            }
          : ex
      )
    );
    if (isActiveWorkout) scheduleAutoSave(exerciseIndex, setIndex);
  };

  const seedSetFromPrevious = useCallback(
    (exerciseIndex: number, setIndex: number, patch: Partial<SetFormData>) => {
      setExercises((prev) =>
        prev.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          const mode = normalizeRegistroSeries(ex.registro_series);
          return {
            ...ex,
            sets: ex.sets.map((s, si) => {
              if (si !== setIndex || !setIsUnlogged(s, mode)) return s;
              return { ...s, ...patch, seededFromPrevious: true };
            }),
          };
        }),
      );
    },
    [],
  );

  const applySuggestionToSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      patch: Partial<SetFormData>,
      options?: { revert?: boolean },
    ) => {
      setExercises((prev) =>
        prev.map((ex, i) => {
          if (i !== exerciseIndex) return ex;
          const mode = normalizeRegistroSeries(ex.registro_series);
          return {
            ...ex,
            sets: ex.sets.map((s, si) => {
              if (si !== setIndex || s.completed) return s;
              if (!options?.revert && !setCanApplyOverloadPatch(s, mode)) return s;
              return {
                ...s,
                ...patch,
                // Aplicar solo rellena el objetivo: no cuenta como serie hecha
                // hasta editar o marcar el check (igual que la precarga anterior).
                seededFromPrevious: options?.revert ? Boolean(patch.seededFromPrevious) : true,
              };
            }),
          };
        }),
      );
    },
    [],
  );

  /**
   * Mantiene la caché de React Query (["workout", id]) sincronizada con los
   * autosaves. Sin esto, al reabrir el entrenamiento activo la hidratación
   * lee una foto obsoleta y "desaparecen" las últimas series registradas.
   */
  const patchSetInWorkoutCache = useCallback(
    (setId: string, patch: Record<string, unknown>) => {
      if (!effectiveWorkoutId) return;
      queryClient.setQueryData<ActividadWithDetails | null>(["workout", effectiveWorkoutId], (old) => {
        if (!old?.ejercicios) return old;
        return {
          ...old,
          ejercicios: old.ejercicios.map((ej) => ({
            ...ej,
            series: (ej.series ?? []).map((s) =>
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
      ex.sets
        .map((set, setIndex) => ({ exerciseIndex, setIndex, set }))
        .filter(({ set }) => set.id && !set.seededFromPrevious),
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
            ? {
                ...e,
                sets: e.sets.map((s, si) =>
                  si === setIndex
                    ? { ...s, completed, ...(completed ? { seededFromPrevious: false } : {}) }
                    : s,
                ),
              }
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
        // Una serie con descanso propio (p. ej. el 0 de un dropset, o el
        // descanso largo de la serie pesada de una pirámide) manda sobre el
        // descanso base del ejercicio.
        const restSeconds = set ? restForSet(set, ex.descanso) : (ex.descanso ?? 120);
        const restEndAtMs = Date.now() + restSeconds * 1000;
        restTimer.start(`${exerciseIndex}-${setIndex}`, restSeconds, effectiveWorkoutId);
        if (isActiveWorkout && effectiveWorkoutId) {
          const startedAtMs = sessionClockStartedAt
            ? new Date(sessionClockStartedAt).getTime()
            : existingWorkout?.fecha
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
      sessionClockStartedAt,
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

  const handleGimnasioChange = useCallback(
    async (gym: SelectedGimnasio | null) => {
      setGimnasio(gym);
      if (effectiveWorkoutId) {
        try {
          await persistActividadGimnasio(effectiveWorkoutId, gym);
          void queryClient.invalidateQueries({ queryKey: GIMNASIOS_QUERY_KEY });
        } catch {
          // Se guardará al finalizar
        }
      }
    },
    [effectiveWorkoutId, queryClient],
  );

  // La ficha se abre solo con id + origen: `ExerciseDetailSheet` ya pide el
  // detalle completo por id. Buscar antes en el catálogo en memoria dejaba el
  // botón muerto para todo lo que cayera fuera del corte de 1000 filas de
  // PostgREST (el catálogo pasa de 2.000 ejercicios).
  const handleViewExerciseDetails = useCallback((exercise: ExerciseFormData) => {
    const source = exercise.tipo_ejercicio_id ? "catalogo" : "usuario";
    const catalogId = exercise.tipo_ejercicio_id ?? exercise.usuario_ejercicio_id;
    if (!catalogId) return;
    setSelectedExerciseDetail({
      id: catalogId,
      nombre: exercise.nombre,
      __source: source,
    });
  }, []);

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
    queryClient.invalidateQueries({ queryKey: ["muscleFatigue"] });
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
    queryClient.invalidateQueries({ queryKey: ["routineLastTrained"] });
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
    const isEmptyActiveWorkout = isActiveWorkout && exercises.length === 0;
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
          .select("id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km, tipo_serie")
          .in("ejercicio_id", oldIds);
        // Mismo criterio que al otorgarla, o la XP retirada no cuadraría.
        const seriesCompletadas = (series ?? []).filter(
          (s) => isWorkingSet(s.tipo_serie) && setHasWork(s),
        ).length;
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
      if (!isEmptyActiveWorkout) {
        toast({ title: "Entrenamiento eliminado correctamente" });
      }
      clearWorkoutStartedFromRoutine(targetId);
      setStartedFromRoutine(false);
      const deletedFecha = existingWorkout?.fecha ? new Date(existingWorkout.fecha).toISOString().slice(0, 10) : undefined;
      setConfirmDelete(false);
      setDeleting(false);
      window.setTimeout(() => {
        invalidateWorkoutQueries({ workoutId: targetId, fecha: deletedFecha, isDelete: true });
        close();
        navigate("/");
      }, 0);
    } catch (error: unknown) {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const requestDeleteWorkout = () => {
    if (isActiveWorkout && exercises.length === 0) {
      void handleDelete();
      return;
    }
    setConfirmDelete(true);
  };

  const enterSummary = () => {
    if (countRecordedSets(exercises) === 0) {
      toast({
        title: "Sin series registradas",
        description: "Registra al menos una serie con datos antes de finalizar.",
        variant: "destructive",
      });
      return;
    }
    restTimer.stop();
    setPausedAt((prev) => prev ?? Date.now());
    setLiveStep("summary");
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
          const endIso = new Date().toISOString();
          const startIso = sessionClockStartedAt
            ? mergeCalendarDatePreservingTime(fecha, sessionClockStartedAt)
            : existingWorkout?.fecha
              ? mergeCalendarDatePreservingTime(fecha, existingWorkout.fecha)
              : new Date().toISOString();
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: resolvedTitulo,
              fecha: startIso,
              fecha_fin: endIso,
              icono: workoutIcon,
              es_publica: esPublica,
              comentarios: comentarios.trim() || null,
              rpe,
              gimnasio_id: gimnasio?.id ?? null,
              gimnasio_nombre: gimnasio?.nombre ?? null,
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;

          try {
            await persistActividadHeartRate({
              actividadId: effectiveWorkoutId,
              bleSamples: hrMonitor.samples,
              startIso: sessionClockStartedAt ?? existingWorkout?.fecha ?? new Date(fecha).toISOString(),
              endIso,
            });
          } catch {
            // FC opcional: no bloquear el fin del entreno
          }
          void hrMonitor.disconnect();
          hrMonitor.clearSamples();

          await finalizeLinkedPlannedRoutine();

          // Calculate XP and show post-workout modal.
          // El calentamiento no da XP: si no cuenta como volumen, tampoco premia.
          const completedSets = exercises.reduce(
            (acc, ex) =>
              acc +
              ex.sets.filter((s) => isWorkingSet(s.tipo_serie) && serieCountsAsRecorded(s)).length,
            0
          );
          try {
            const breakdown = await calculateAndAwardXP(effectiveWorkoutId, completedSets, fecha);
            // Evaluar logros antes de abrir el modal para celebrarlos en él
            const logrosResult = await checkAndAwardLogros(user!.id).catch(() => ({ nuevos: [] as LogroRow[] }));
            queryClient.invalidateQueries({ queryKey: ["logros"] });
            queryClient.invalidateQueries({ queryKey: ["profileStats"] });
            setPostWorkoutLogros(logrosResult.nuevos);
            setPostWorkoutData(breakdown);
            setShowPostWorkout(true);
          } catch {
            // XP failed silently, still close
          }
          if (effectiveWorkoutId) clearWorkoutStartedFromRoutine(effectiveWorkoutId);
          setStartedFromRoutine(false);
          setLiveStep("recording");
          invalidateWorkoutQueries({ workoutId: effectiveWorkoutId, fecha });
          close();
        } else {
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: resolvedTitulo,
              fecha: existingWorkout?.fecha
                ? mergeCalendarDatePreservingTime(fecha, existingWorkout.fecha)
                : new Date(fecha).toISOString(),
              icono: workoutIcon,
              es_publica: esPublica,
              comentarios: comentarios.trim() || null,
              gimnasio_id: gimnasio?.id ?? null,
              gimnasio_nombre: gimnasio?.nombre ?? null,
              rpe,
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;
          toast({ title: "¡Entrenamiento actualizado!" });
          invalidateWorkoutQueries({ workoutId: effectiveWorkoutId, fecha });
          close();
        }
      } else {
        const createdId = await handleCreate(ejerciciosLimpios, resolvedTitulo);

        // Also award XP for manual workouts (sin contar calentamientos)
        const completedSets = ejerciciosLimpios.reduce(
          (acc, ex) => acc + ex.sets.filter((s) => isWorkingSet(s.tipo_serie)).length,
          0,
        );
        try {
          const breakdown = await calculateAndAwardXP("manual", completedSets, fecha);
          const logrosResult = await checkAndAwardLogros(user!.id).catch(() => ({ nuevos: [] as LogroRow[] }));
          queryClient.invalidateQueries({ queryKey: ["logros"] });
          queryClient.invalidateQueries({ queryKey: ["profileStats"] });
          setPostWorkoutLogros(logrosResult.nuevos);
          setPostWorkoutData(breakdown);
          setShowPostWorkout(true);
        } catch {
          // silent
        }
        invalidateWorkoutQueries({ fecha });
        close();
      }
    } catch (error: unknown) {
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (ejerciciosLimpios: ExerciseFormData[], workoutTitle: string) => {
    const endIso = new Date().toISOString();
    const startIso = new Date(fecha).toISOString();
    const { data: actividad, error: actError } = await supabase
      .from("actividad")
      .insert({
        titulo: workoutTitle,
        fecha: startIso,
        fecha_fin: endIso,
        usuario_id: user!.id,
        es_publica: esPublica,
        comentarios: comentarios.trim() || null,
        rpe,
        icono: workoutIcon,
        gimnasio_id: gimnasio?.id ?? null,
        gimnasio_nombre: gimnasio?.nombre ?? null,
      })
      .select("id")
      .single();
    if (actError) throw actError;

    try {
      await persistActividadHeartRate({
        actividadId: actividad.id,
        bleSamples: hrMonitor.samples,
        startIso,
        endIso,
      });
    } catch {
      // opcional
    }

    const baseCreatedAt = Date.now();
    const ejercicioInserts = ejerciciosLimpios.map((ex, i) => ({
      actividad_id: actividad.id,
      tipo_ejercicio_id: ex.tipo_ejercicio_id ?? null,
      usuario_ejercicio_id: ex.usuario_ejercicio_id ?? null,
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
          descanso: s.descanso ?? null,
          ...serieTargetFields(s),
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
              style: pillCircleTransitionStyleForBottomSheet(pillAnim.origin, 1, pillAnim.phase),
            }
          : { style: { clipPath: "none" } }),
      }
    : {};

  const sessionHasStarted = !!sessionClockStartedAt;
  const activeWorkoutHeading = sessionHasStarted
    ? "Entrenamiento activo"
    : "Comenzar entrenamiento";
  const showSummary = isActiveWorkout && liveStep === "summary";
  const summaryElapsedSec = sessionClockStartedAt
    ? Math.max(
        0,
        Math.floor(
          ((pausedAt ?? Date.now()) - new Date(sessionClockStartedAt).getTime() - pausedAccumMs) / 1000,
        ),
      )
    : 0;
  const summaryCompletedSets = exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.filter((s) => isWorkingSet(s.tipo_serie) && serieCountsAsRecorded(s)).length,
    0,
  );
  const summaryVolumeKg = exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((sum, s) => {
        if (!isWorkingSet(s.tipo_serie) || !serieCountsAsRecorded(s)) return sum;
        return sum + Number(s.peso_kg || 0) * Number(s.repeticiones || 0);
      }, 0)
    );
  }, 0);
  const summaryHr = summarizeHeartRate(hrMonitor.samples);
  const summaryRoutinePrefill = !startedFromRoutine
    ? workoutSnapshotToRoutineFormSnapshot(
        buildWorkoutRoutineSnapshot(titulo.trim() || getDefaultWorkoutTitle(), workoutIcon, exercises),
      )
    : null;

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={handleDrawerOpenChange}
        onDrag={handleDrawerDrag}
        shouldScaleBackground={false}
        // Solo el asidero mueve el sheet: reordenar, scroll y swipe-to-delete
        // son gestos verticales/horizontales que Vaul interpretaría como cierre.
        handleOnly
      >
        <DrawerContent
          className="inset-0 mt-0 h-dvh max-h-dvh min-h-0 overflow-hidden rounded-none p-0"
          {...pillCircleProps}
        >
          <div data-workout-drawer-surface className="relative isolate flex h-full min-h-0 flex-col overflow-hidden">
            {showSummary ? (
              <>
                <DrawerTitle className="sr-only">Resumen del entrenamiento</DrawerTitle>
                <GymLiveSummaryView
                  elapsedSec={summaryElapsedSec}
                  completedSets={summaryCompletedSets}
                  volumeKg={summaryVolumeKg}
                  fcMedia={summaryHr.fcMedia}
                  fcMax={summaryHr.fcMax}
                  titulo={titulo}
                  icono={workoutIcon}
                  allowEditTitleAndIcon={!startedFromRoutine}
                  comentarios={comentarios}
                  esPublica={esPublica}
                  rpe={rpe}
                  gimnasio={gimnasio}
                  saving={saving}
                  discarding={deleting}
                  canSaveAsRoutine={!!summaryRoutinePrefill?.ejercicios.length}
                  onTituloChange={setTitulo}
                  onIconoChange={(icon) => void handleWorkoutIconChange(icon)}
                  onComentariosChange={setComentarios}
                  onEsPublicaChange={setEsPublica}
                  onRpeChange={setRpe}
                  onGimnasioChange={(gym) => void handleGimnasioChange(gym)}
                  onSaveAsRoutine={() => setRoutineFormOpen(true)}
                  onSave={() => void handleSave()}
                  onDiscard={requestDeleteWorkout}
                  onBack={() => setLiveStep("recording")}
                />
              </>
            ) : (
            <>
            <DrawerHeader
              data-active-workout-sheet-header
              className="relative z-10 shrink-0 overflow-visible border-b border-border bg-card px-6 pt-[calc(1.25rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left"
            >
              {isActiveWorkout ? (
                <div className="flex flex-col">
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex h-8 min-w-0 flex-1 items-center">
                      {startedFromRoutine ? (
                        <>
                          <DrawerTitle className="sr-only">
                            {titulo.trim() || activeWorkoutHeading}
                          </DrawerTitle>
                          <label htmlFor="titulo" className="sr-only">
                            Título
                          </label>
                          <input
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Día de Pierna"
                            disabled={creatingActive || preparingLiveSession}
                            className="h-8 w-full min-w-0 truncate bg-transparent text-lg font-semibold leading-8 tracking-tight outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </>
                      ) : (
                        <>
                          <DrawerTitle className="h-8 min-w-0 truncate text-lg font-semibold leading-8 tracking-tight">
                            {activeWorkoutHeading}
                          </DrawerTitle>
                          <DrawerDescription className="sr-only">
                            {sessionHasStarted ? "Entrenamiento en curso" : "Aún no ha comenzado"}
                          </DrawerDescription>
                        </>
                      )}
                    </div>
                    <div className="flex h-8 shrink-0 items-center gap-1.5">
                      <WorkoutSessionOptions />
                      <ElapsedTime
                        since={sessionClockStartedAt}
                        running={!!sessionClockStartedAt}
                        pausedAccumMs={pausedAccumMs}
                        pausedAt={pausedAt}
                        paused={isPaused}
                      />
                    </div>
                  </div>
                  {startedFromRoutine ? (
                    <DrawerDescription>{activeWorkoutHeading}</DrawerDescription>
                  ) : null}
                  <RestProgressBar
                    open={!!restTimer.activeKey}
                    remaining={restTimer.remaining}
                    duration={restTimer.duration}
                    finished={restTimer.finished}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <DrawerTitle className="min-w-0 truncate text-lg">
                    {isEdit ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
                  </DrawerTitle>
                </div>
              )}
            </DrawerHeader>

            <div className="relative min-h-0 flex-1">
              <div className="min-h-0 h-full overflow-y-auto bg-background">
              <div className={cn("flex flex-col gap-1 bg-background", showFloatingActionBar ? "pb-32" : "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]")}>
                <WorkoutMetaForm
                  hideWorkoutDate={hideWorkoutDate}
                  titulo={titulo}
                  onTituloChange={setTitulo}
                  isActiveWorkout={isActiveWorkout}
                  workoutIcon={workoutIcon}
                  onWorkoutIconChange={isEditingCompletedWorkout ? setWorkoutIcon : handleWorkoutIconChange}
                  creatingActive={creatingActive || preparingLiveSession}
                  fecha={fecha}
                  onFechaChange={setFecha}
                  isEditingCompletedWorkout={isEditingCompletedWorkout}
                  esPublica={esPublica}
                  onEsPublicaChange={setEsPublica}
                  gimnasio={gimnasio}
                  onGimnasioChange={(gym) => void handleGimnasioChange(gym)}
                  gymDisabled={creatingActive || preparingLiveSession}
                  rpe={rpe}
                  onRpeChange={setRpe}
                  comentarios={comentarios}
                  onComentariosChange={setComentarios}
                >
                  {isActiveWorkout && hrMonitor.available ? (
                    <HeartRatePanel
                      className="border-0 bg-background"
                      bpm={hrMonitor.bpm}
                      connected={hrMonitor.connected}
                      connection={hrMonitor.connection}
                      deviceName={hrMonitor.deviceName}
                      zone={hrMonitor.zone}
                      connecting={hrMonitor.connecting}
                      error={hrMonitor.error}
                      onConnectClick={() => {
                        if (hrMonitor.connected) void hrMonitor.disconnect();
                        else if (hrMonitor.device) void hrMonitor.reconnect();
                        else void hrMonitor.connect();
                      }}
                    />
                  ) : null}
                </WorkoutMetaForm>

                <WorkoutExerciseList
                  exercises={exercises}
                  isActiveWorkout={isActiveWorkout}
                  onDragEnd={handleDragEnd}
                  getExerciseSortId={getExerciseSortId}
                  onRemoveExercise={removeExercise}
                  onAddSet={addSet}
                  onRemoveSet={removeSet}
                  onUpdateSet={updateSet}
                  onSeedSetFromPrevious={seedSetFromPrevious}
                  onApplySuggestionToSet={applySuggestionToSet}
                  onAutoSaveSet={handleAutoSaveSet}
                  onSetCompleted={handleSetCompleted}
                  onViewExerciseDetails={handleViewExerciseDetails}
                />

                {!showFloatingActionBar && (
                  <div className="flex justify-center p-6 py-4">
                    <ExerciseSelector
                      variant="drawer"
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

            {showFloatingActionBar && exercises.length === 0 ? (
              <WorkoutEmptyExerciseState
                open={exercisePickerOpen}
                onOpenChange={setExercisePickerOpen}
                onAddExercise={addExercise}
              />
            ) : null}

            {showFloatingActionBar && (
              <WorkoutFloatingActionBar
                isEditingCompletedWorkout={isEditingCompletedWorkout}
                isActiveWorkout={isActiveWorkout}
                deleting={deleting}
                creatingActive={creatingActive || preparingLiveSession}
                onClose={close}
                onRequestDelete={requestDeleteWorkout}
                isPaused={isPaused}
                onTogglePause={togglePause}
                canPause={!!sessionClockStartedAt}
                exercisePickerOpen={exercisePickerOpen}
                onExercisePickerOpenChange={setExercisePickerOpen}
                onAddExercise={addExercise}
                exerciseCount={exercises.length}
                showFinishButton={showFinishButton}
                onFinish={isActiveWorkout ? enterSummary : handleSave}
                saving={saving}
                canSubmitPrimaryAction={canSubmitPrimaryAction}
                saveButtonLabel={saveButtonLabel}
                primaryActionIcon={primaryActionIcon}
              />
            )}
            </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <WorkoutDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        deleting={deleting}
        onConfirmDelete={handleDelete}
      />

      <PostWorkoutModal
        open={showPostWorkout}
        onClose={() => {
          setShowPostWorkout(false);
          setPostWorkoutData(null);
          setPostWorkoutLogros([]);
        }}
        breakdown={postWorkoutData}
        nuevosLogros={postWorkoutLogros}
      />

      <RoutineForm
        open={routineFormOpen}
        onOpenChange={setRoutineFormOpen}
        prefillSnapshot={summaryRoutinePrefill}
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