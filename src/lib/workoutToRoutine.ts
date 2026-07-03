import type { RoutineExerciseFormData, RoutineFormSnapshot } from "@/types/routine";
import type { ExerciseFormData } from "@/types/workout";
import { normalizeRegistroSeries, serieCountsAsRecorded } from "@/types/workout";
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

function parseRepRange(repRange?: string): { min: number; max: number } | null {
  if (!repRange) return null;
  const match = repRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min: Math.max(1, min), max: Math.max(min, max) };
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

export function exercisesToRoutineExercises(exercises: ExerciseFormData[]): RoutineExerciseFormData[] {
  return exercises
    .map((ex) => {
      const recordedSets = ex.sets.filter(serieCountsAsRecorded);
      if (!recordedSets.length) return null;

      const registro_series = normalizeRegistroSeries(ex.registro_series);
      const parsed = parseRepRange(ex.repRange);
      const reps =
        registro_series === "peso_reps" ? (parsed ?? repsFromSets(recordedSets)) : { min: 8, max: 12 };

      return {
        tipo_ejercicio_id: ex.tipo_ejercicio_id,
        usuario_ejercicio_id: ex.usuario_ejercicio_id,
        nombre: ex.nombre,
        series_objetivo: recordedSets.length,
        repes_min: reps.min,
        repes_max: reps.max,
        rir: ex.targetRir ?? 1,
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
      } satisfies RoutineExerciseFormData;
    })
    .filter((ej): ej is RoutineExerciseFormData => ej !== null)
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
