import { type RoutineIconKey } from "@/lib/routineIcons";
import { type ExerciseFormData } from "@/types/workout";

export function serializeWorkoutFormSnapshot(
  titulo: string,
  fecha: string,
  exercises: ExerciseFormData[],
  icono: RoutineIconKey,
  esPublica: boolean,
  gimnasioId: string | null = null,
): string {
  return JSON.stringify({
    titulo: titulo.trim(),
    fecha,
    icono,
    esPublica,
    gimnasioId,
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
