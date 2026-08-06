import { type ExerciseFormData } from "@/types/workout";

/** Agrupa ejercicios consecutivos con el mismo superset_id para mostrar el bloque superserie. */
export function groupExercisesBySuperset(exercises: ExerciseFormData[]): { supersetId: string | null; items: { exercise: ExerciseFormData; originalIndex: number }[] }[] {
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
