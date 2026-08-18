import { useState, useEffect, useCallback, useRef, useMemo, type ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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
import { Flag, Check } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { HeartRatePanel } from "@/components/cardio/live/HeartRatePanel";
import { useToast } from "@/hooks/use-toast";
import { useHeartRateMonitor } from "@/hooks/useHeartRateMonitor";
import { persistActividadHeartRate } from "@/lib/persistActividadHeartRate";
import { PostWorkoutModal } from "./PostWorkoutModal";
import { useRestTimerContext } from "./RestTimerProvider";
import { cn } from "@/lib/utils";
import {
  markWorkoutStartedFromRoutine,
  clearWorkoutStartedFromRoutine,
  wasWorkoutStartedFromRoutine,
} from "./workout-logger/fromRoutineStorage";
import { serializeWorkoutFormSnapshot } from "./workout-logger/serializeWorkoutFormSnapshot";
import { WorkoutExerciseList } from "./workout-logger/WorkoutExerciseList";
import { SWIPE_DISMISS_WINDOW_MS } from "./workout-logger/constants";
import { ElapsedTime } from "./workout-logger/ElapsedTime";
import { RestProgressBar } from "./workout-logger/RestProgressBar";
import { WorkoutFloatingActionBar } from "./workout-logger/WorkoutFloatingActionBar";
import { WorkoutDeleteDialog } from "./workout-logger/WorkoutDeleteDialog";
import { WorkoutMetaForm } from "./workout-logger/WorkoutMetaForm";
import { useCalculateAndAwardXP, useRemoveWorkoutXP, type XPBreakdown } from "@/hooks/useGamification";
import { checkAndAwardLogros, type LogroRow } from "@/hooks/useLogros";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import {
  DEFAULT_ROUTINE_ICON_KEY,
  resolveRoutineIconKey,
  type RoutineIconKey,
} from "@/lib/routineIcons";
import { buildWorkoutRoutineSnapshot, type WorkoutRoutineSnapshot } from "@/lib/workoutToRoutine";
import { persistActividadGimnasio, fetchPrefillGimnasioForUser, GIMNASIOS_QUERY_KEY } from "@/hooks/useGimnasios";
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
  setHasWork,
  serieCountsAsRecorded,
  countRecordedSets,
  serieFieldsForRegistro,
} from "@/types/workout";

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
  const [postWorkoutGimnasio, setPostWorkoutGimnasio] = useState<SelectedGimnasio | null>(null);
  const [showPostWorkout, setShowPostWorkout] = useState(false);
  const calculateAndAwardXP = useCalculateAndAwardXP();
  const removeXP = useRemoveWorkoutXP();
  const restTimer = useRestTimerContext();
  const { data: exerciseCatalog } = useExerciseCatalog();
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
  const isActiveWorkout =
    !!activeWorkoutId ||
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
    return serializeWorkoutFormSnapshot(titulo, fecha, exercises, workoutIcon, esPublica, gimnasio?.id ?? null) !== editBaseline;
  }, [isEditingCompletedWorkout, editBaseline, titulo, fecha, exercises, workoutIcon, esPublica, gimnasio?.id]);
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
              hydratedGym?.id ?? null,
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
      setGimnasio(initialGimnasio ?? null);
    }
  }, [open, workoutId, activeWorkoutId, defaultDate, templateExercises, initialGimnasio]);

  // Reset activeWorkoutId when drawer closes
  useEffect(() => {
    if (!open) {
      setActiveWorkoutId(null);
      setPausedAt(null);
      setPausedAccumMs(0);
      setEditBaseline(null);
      setWorkoutIcon(DEFAULT_ROUTINE_ICON_KEY);
      setEsPublica(false);
      setGimnasio(null);
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
      setGimnasio(gym);
      setStartedFromRoutine(true);
      markWorkoutStartedFromRoutine(actividad.id);
      invalidateActiveWorkoutQueries();
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
      const startedAtMs = now.getTime();
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
      setExercises([]);
      setWorkoutIcon(DEFAULT_ROUTINE_ICON_KEY);
      setFecha(defaultDate || now.toISOString().slice(0, 10));
      setGimnasio(gym);
      setStartedFromRoutine(false);
      clearWorkoutStartedFromRoutine(actividad.id);
      invalidateActiveWorkoutQueries();
      void startLiveWorkout({
        sessionId: actividad.id,
        title: defaultTitle,
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
          })
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
      } catch (e: unknown) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error desconocido",
          variant: "destructive",
        });
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
      } catch (e: unknown) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error desconocido",
          variant: "destructive",
        });
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

  const handleViewExerciseDetails = useCallback(
    (exercise: ExerciseFormData) => {
      const catalogId = exercise.tipo_ejercicio_id ?? exercise.usuario_ejercicio_id;
      if (!catalogId || !exerciseCatalog) return;
      const found = exerciseCatalog.find((t) => t.id === catalogId);
      if (!found) return;
      setSelectedExerciseDetail(found as ComponentProps<typeof ExerciseDetailSheet>["exercise"]);
    },
    [exerciseCatalog]
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
        const seriesCompletadas = (series ?? []).filter((s) => setHasWork(s)).length;
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
    } catch (error: unknown) {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
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
          const endIso = new Date().toISOString();
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: resolvedTitulo,
              fecha: new Date(fecha).toISOString(),
              fecha_fin: endIso,
              icono: workoutIcon,
              es_publica: false,
              gimnasio_id: gimnasio?.id ?? null,
              gimnasio_nombre: gimnasio?.nombre ?? null,
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;

          try {
            await persistActividadHeartRate({
              actividadId: effectiveWorkoutId,
              bleSamples: hrMonitor.samples,
              startIso: existingWorkout?.fecha ?? new Date(fecha).toISOString(),
              endIso,
            });
          } catch {
            // FC opcional: no bloquear el fin del entreno
          }
          void hrMonitor.disconnect();
          hrMonitor.clearSamples();

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
            setPostWorkoutGimnasio(gimnasio);
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
              gimnasio_id: gimnasio?.id ?? null,
              gimnasio_nombre: gimnasio?.nombre ?? null,
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
          setPostWorkoutGimnasio(gimnasio);
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
        es_publica: false,
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

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={handleDrawerOpenChange}
        onDrag={handleDrawerDrag}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className="mt-0 h-lvh max-h-lvh min-h-0 overflow-hidden rounded-none p-0"
          {...pillCircleProps}
        >
          <div data-workout-drawer-surface className="relative isolate flex h-full min-h-0 flex-col overflow-hidden">
            <DrawerHeader
              data-active-workout-sheet-header
              className="relative z-10 shrink-0 border-b border-border bg-card px-6 pt-[calc(1.25rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left"
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
              <div className="min-h-0 h-full overflow-y-auto bg-background">
              <div className={cn("flex flex-col gap-1 bg-background", showFloatingActionBar ? "pb-32" : "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]")}>
                <WorkoutMetaForm
                  hideWorkoutDate={hideWorkoutDate}
                  titulo={titulo}
                  onTituloChange={setTitulo}
                  isActiveWorkout={isActiveWorkout}
                  workoutIcon={workoutIcon}
                  onWorkoutIconChange={isEditingCompletedWorkout ? setWorkoutIcon : handleWorkoutIconChange}
                  creatingActive={creatingActive}
                  fecha={fecha}
                  onFechaChange={setFecha}
                  isEditingCompletedWorkout={isEditingCompletedWorkout}
                  esPublica={esPublica}
                  onEsPublicaChange={setEsPublica}
                  gimnasio={gimnasio}
                  onGimnasioChange={(gym) => void handleGimnasioChange(gym)}
                  gymDisabled={creatingActive}
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
                  creatingActive={creatingActive}
                  isActiveWorkout={isActiveWorkout}
                  onDragEnd={handleDragEnd}
                  getExerciseSortId={getExerciseSortId}
                  onRemoveExercise={removeExercise}
                  onAddSet={addSet}
                  onRemoveSet={removeSet}
                  onUpdateSet={updateSet}
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

            {showFloatingActionBar && (
              <WorkoutFloatingActionBar
                isEditingCompletedWorkout={isEditingCompletedWorkout}
                isActiveWorkout={isActiveWorkout}
                deleting={deleting}
                creatingActive={creatingActive}
                onClose={close}
                onRequestDelete={() => setConfirmDelete(true)}
                isPaused={isPaused}
                onTogglePause={togglePause}
                exercisePickerOpen={exercisePickerOpen}
                onExercisePickerOpenChange={setExercisePickerOpen}
                onAddExercise={addExercise}
                exerciseCount={exercises.length}
                showFinishButton={showFinishButton}
                onFinish={handleSave}
                saving={saving}
                canSubmitPrimaryAction={canSubmitPrimaryAction}
                saveButtonLabel={saveButtonLabel}
                primaryActionIcon={primaryActionIcon}
              />
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
          setPostWorkoutRoutineSnapshot(null);
          setPostWorkoutLogros([]);
          setPostWorkoutId(null);
          setPostWorkoutGimnasio(null);
        }}
        breakdown={postWorkoutData}
        routineSnapshot={postWorkoutRoutineSnapshot}
        nuevosLogros={postWorkoutLogros}
        workoutId={postWorkoutId}
        initialGimnasio={postWorkoutGimnasio}
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