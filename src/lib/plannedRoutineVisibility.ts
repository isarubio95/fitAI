import type { PlannedRoutine } from "@/hooks/useWorkoutPlan";
import type { ActividadWithDetails } from "@/types/workout";

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
