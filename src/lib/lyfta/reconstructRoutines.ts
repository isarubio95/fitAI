import { normalizeExerciseName } from "@/lib/matchExerciseByName";
import type { MappedLyftaRoutine, MappedLyftaWorkout } from "@/lib/lyfta/mapLyftaWorkout";

/** Un rutina por título, usando el workout más reciente de ese nombre. */
export function reconstructRoutinesFromWorkouts(workouts: MappedLyftaWorkout[]): MappedLyftaRoutine[] {
  const latestByTitle = new Map<string, MappedLyftaWorkout>();
  const sorted = [...workouts].sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const w of sorted) {
    const key = normalizeExerciseName(w.titulo) || w.origenExternoId;
    latestByTitle.set(key, w);
  }

  return [...latestByTitle.values()].map((w) => ({
    origenExternoId: `title:${normalizeExerciseName(w.titulo) || w.origenExternoId}`,
    nombre: w.titulo,
    descripcion: "Importada desde Lyfta",
    exercises: w.exercises,
  }));
}
