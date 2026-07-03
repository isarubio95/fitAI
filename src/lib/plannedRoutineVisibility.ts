import { format } from "date-fns";
import type { PlannedRoutine } from "@/hooks/useWorkoutPlan";
import type { ActividadWithDetails } from "@/types/workout";

export type PlannedRoutineForCleanup = {
  id: string;
  fecha_programada: string;
  actividad_id: string | null;
  rutina_nombre: string | null;
};

export type CompletedWorkoutForCleanup = {
  titulo: string;
  fecha: string;
  fecha_fin: string | null;
};

function workoutDateYmd(fecha: string): string {
  return format(new Date(fecha), "yyyy-MM-dd");
}

/** True si la programación ya se cumplió (vinculada o entrenamiento equivalente el mismo día). */
export function isPlannedRoutineFulfilled(
  planned: PlannedRoutine,
  dayWorkouts: ActividadWithDetails[],
): boolean {
  if (planned.actividad_id) return true;
  const rutinaName = planned.rutina?.nombre?.trim();
  if (!rutinaName) return false;
  return dayWorkouts.some(
    (w) => w.titulo.trim() === rutinaName && !!w.fecha_fin,
  );
}

export function pendingPlannedForDay(
  dayPlanned: PlannedRoutine[],
  dayWorkouts: ActividadWithDetails[],
): PlannedRoutine[] {
  return dayPlanned.filter((p) => !isPlannedRoutineFulfilled(p, dayWorkouts));
}

/** IDs de rutina_programada que ya no deben mostrarse (cumplidas o vinculadas). */
export function findFulfilledPlannedRoutineIds(
  planned: PlannedRoutineForCleanup[],
  workouts: CompletedWorkoutForCleanup[],
): string[] {
  const workoutsByDay = new Map<string, CompletedWorkoutForCleanup[]>();
  for (const workout of workouts) {
    const key = workoutDateYmd(workout.fecha);
    const bucket = workoutsByDay.get(key);
    if (bucket) bucket.push(workout);
    else workoutsByDay.set(key, [workout]);
  }

  return planned
    .filter((item) => {
      if (item.actividad_id) return true;
      const rutinaName = item.rutina_nombre?.trim();
      if (!rutinaName) return false;
      const dayWorkouts = workoutsByDay.get(item.fecha_programada.slice(0, 10)) ?? [];
      return dayWorkouts.some(
        (workout) => workout.titulo.trim() === rutinaName && !!workout.fecha_fin,
      );
    })
    .map((item) => item.id);
}
