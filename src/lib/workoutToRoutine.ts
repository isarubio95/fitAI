import type {
  RoutineExerciseFormData,
  RoutineFormSnapshot,
  RoutineSetPlan,
} from "@/types/routine";
import type { ActividadWithDetails, ExerciseFormData, SetFormData } from "@/types/workout";
import {
  normalizeRegistroSeries,
  serieCountsAsRecorded,
  serieTargetsFromRow,
} from "@/types/workout";
import { parseRepTarget, summarizeSeriesPlan } from "@/lib/seriesPlan";
import { normalizeTipoSerie } from "@/lib/setTypes";
import {
  DEFAULT_ROUTINE_ICON_KEY,
  resolveRoutineIconKey,
  type RoutineIconKey,
} from "@/lib/routineIcons";

export interface WorkoutRoutineSnapshot {
  titulo: string;
  icono: RoutineIconKey;
  exercises: ExerciseFormData[];
}

function repsFromSets(sets: ExerciseFormData["sets"]): { min: number; max: number } {
  const reps = sets
    .filter(serieCountsAsRecorded)
    .map((s) => s.repeticiones)
    .filter((r) => r > 0);
  if (!reps.length) return { min: 8, max: 12 };
  return { min: Math.min(...reps), max: Math.max(...reps) };
}

function averageRecordedValue(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => v != null && v > 0);
  if (!nums.length) return null;
  return Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length);
}

/**
 * Plan por serie derivado de lo que realmente se hizo, pero solo cuando aporta
 * algo: si todas las series fueron equivalentes (mismo tipo, reps y peso) el
 * ejercicio se guarda en modo simple, como antes.
 *
 * Así, guardar como rutina un entreno piramidal conserva la pirámide — con los
 * pesos que levantaste como objetivo — en vez de aplanarlo a un rango único.
 */
function seriesPlanFromSets(
  sets: SetFormData[],
  fallbackRir: number,
): RoutineSetPlan[] | null {
  const homogeneous = sets.every(
    (s) =>
      normalizeTipoSerie(s.tipo_serie) === normalizeTipoSerie(sets[0].tipo_serie) &&
      s.repeticiones === sets[0].repeticiones &&
      s.peso_kg === sets[0].peso_kg,
  );
  if (homogeneous && normalizeTipoSerie(sets[0].tipo_serie) === "efectiva") return null;

  return sets.map((s, orden) => {
    const reps = Number(s.repeticiones) > 0 ? Math.round(Number(s.repeticiones)) : null;
    return {
      orden,
      tipo_serie: normalizeTipoSerie(s.tipo_serie),
      repes_min: s.objetivo_repes_min ?? reps,
      repes_max: s.objetivo_repes_max ?? reps,
      rir: s.rir ?? s.objetivo_rir ?? fallbackRir,
      peso_objetivo_kg: Number(s.peso_kg) > 0 ? Number(s.peso_kg) : (s.objetivo_peso_kg ?? null),
      descanso: s.descanso ?? null,
      duracion_objetivo_seg: s.duracion_seg ?? null,
      ritmo_objetivo_seg_km: s.ritmo_seg_km ?? null,
    };
  });
}

export function exercisesToRoutineExercises(exercises: ExerciseFormData[]): RoutineExerciseFormData[] {
  return exercises
    .map((ex) => {
      const recordedSets = ex.sets.filter(serieCountsAsRecorded);
      if (!recordedSets.length) return null;

      const registro_series = normalizeRegistroSeries(ex.registro_series);
      const parsed = parseRepTarget(ex.repRange);
      const reps =
        registro_series === "peso_reps"
          ? (parsed ? { min: parsed.min, max: parsed.max ?? parsed.min } : repsFromSets(recordedSets))
          : { min: 8, max: 12 };
      const rir = ex.targetRir ?? 1;

      const base = {
        tipo_ejercicio_id: ex.tipo_ejercicio_id,
        usuario_ejercicio_id: ex.usuario_ejercicio_id,
        nombre: ex.nombre,
        series_objetivo: recordedSets.length,
        repes_min: reps.min,
        repes_max: reps.max,
        rir,
        orden: 0,
        superset_id: ex.superset_id ?? null,
        descanso: ex.descanso ?? 120,
        registro_series,
        duracion_objetivo_seg:
          registro_series === "duracion" || registro_series === "duracion_ritmo"
            ? averageRecordedValue(recordedSets.map((s) => s.duracion_seg)) ??
              (registro_series === "duracion_ritmo" ? 600 : 45)
            : null,
        ritmo_objetivo_seg_km:
          registro_series === "duracion_ritmo"
            ? averageRecordedValue(recordedSets.map((s) => s.ritmo_seg_km)) ?? 300
            : null,
        series_plan: null,
      } satisfies RoutineExerciseFormData;

      const plan = registro_series === "peso_reps" ? seriesPlanFromSets(recordedSets, rir) : null;
      if (!plan) return base;

      // Los escalares pasan a ser el resumen del plan.
      return { ...base, ...summarizeSeriesPlan(plan, base), series_plan: plan };
    })
    .filter((ej): ej is NonNullable<typeof ej> => ej !== null)
    .map((ej, index) => ({ ...ej, orden: index }));
}

export function buildWorkoutRoutineSnapshot(
  titulo: string,
  icono: string | undefined,
  exercises: ExerciseFormData[],
): WorkoutRoutineSnapshot | null {
  const routineExercises = exercisesToRoutineExercises(exercises);
  if (!routineExercises.length) return null;

  return {
    titulo: titulo.trim() || "Mi rutina",
    icono: resolveRoutineIconKey(icono ?? DEFAULT_ROUTINE_ICON_KEY),
    exercises: exercises.filter((ex) => ex.sets.some(serieCountsAsRecorded)),
  };
}

export function workoutSnapshotToRoutineFormSnapshot(
  snapshot: WorkoutRoutineSnapshot,
): RoutineFormSnapshot {
  return {
    nombre: snapshot.titulo,
    descripcion: "",
    icono: snapshot.icono,
    ejercicios: exercisesToRoutineExercises(snapshot.exercises),
  };
}

/**
 * Convierte una actividad (p. ej. del feed) a ejercicios de formulario.
 * Solo incluye ejercicios del catálogo (`tipo_ejercicio_id`): los personalizados
 * ajenos no se pueden referenciar por FK en la rutina del usuario actual.
 */
export function actividadToExerciseFormData(actividad: ActividadWithDetails): ExerciseFormData[] {
  return actividad.ejercicios
    .filter((ej) => !!ej.tipo_ejercicio_id)
    .map((ej) => ({
      tipo_ejercicio_id: ej.tipo_ejercicio_id!,
      nombre: ej.tipo_ejercicio?.nombre ?? "Ejercicio",
      registro_series: normalizeRegistroSeries(ej.registro_series),
      repRange: ej.rep_range ?? undefined,
      targetRir: ej.rir_objetivo,
      descanso: ej.descanso ?? 120,
      superset_id: ej.superset_id,
      sets: (ej.series ?? []).map((s) => ({
        repeticiones: Number(s.repeticiones) || 0,
        peso_kg: Number(s.peso_kg) || 0,
        duracion_seg: s.duracion_seg,
        ritmo_seg_km: s.ritmo_seg_km,
        rir: s.rir,
        completed: true,
        ...serieTargetsFromRow(s),
      })),
    }));
}

/** Prefill del formulario de rutina a partir de un entrenamiento público ajeno. */
export function actividadToRoutineFormSnapshot(
  actividad: ActividadWithDetails,
  options?: { savedFromUsername?: string | null },
): RoutineFormSnapshot | null {
  const snapshot = buildWorkoutRoutineSnapshot(
    actividad.titulo,
    actividad.icono ?? undefined,
    actividadToExerciseFormData(actividad),
  );
  if (!snapshot) return null;

  const form = workoutSnapshotToRoutineFormSnapshot(snapshot);
  const username = options?.savedFromUsername?.trim().replace(/^@/, "");
  if (username) {
    form.descripcion = `Guardada de @${username}`;
  }
  return form;
}
