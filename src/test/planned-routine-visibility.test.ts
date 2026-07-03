import { describe, expect, it } from "vitest";
import { isPlannedRoutineFulfilled, pendingPlannedForDay } from "@/lib/plannedRoutineVisibility";
import type { PlannedRoutine } from "@/hooks/useWorkoutPlan";
import type { ActividadWithDetails } from "@/types/workout";

function planned(overrides: Partial<PlannedRoutine> = {}): PlannedRoutine {
  return {
    id: "plan-1",
    usuario_id: "user-1",
    rutina_id: "rutina-1",
    fecha_programada: "2026-07-03",
    actividad_id: null,
    created_at: "2026-07-01T00:00:00Z",
    rutina: { nombre: "Piernas", icono: null } as PlannedRoutine["rutina"],
    ...overrides,
  };
}

function workout(overrides: Partial<ActividadWithDetails> = {}): ActividadWithDetails {
  return {
    id: "act-1",
    titulo: "Piernas",
    fecha: "2026-07-03T10:00:00Z",
    fecha_fin: "2026-07-03T11:00:00Z",
    ejercicios: [],
    ...overrides,
  } as ActividadWithDetails;
}

describe("plannedRoutineVisibility", () => {
  it("oculta programaciones vinculadas por actividad_id", () => {
    const item = planned({ actividad_id: "act-1" });
    expect(isPlannedRoutineFulfilled(item, [])).toBe(true);
    expect(pendingPlannedForDay([item], [])).toEqual([]);
  });

  it("oculta programaciones cumplidas por entrenamiento equivalente el mismo día", () => {
    const item = planned();
    const dayWorkouts = [workout()];
    expect(isPlannedRoutineFulfilled(item, dayWorkouts)).toBe(true);
    expect(pendingPlannedForDay([item], dayWorkouts)).toEqual([]);
  });

  it("mantiene programaciones pendientes sin entrenamiento equivalente", () => {
    const item = planned();
    const dayWorkouts = [workout({ titulo: "Espalda" })];
    expect(isPlannedRoutineFulfilled(item, dayWorkouts)).toBe(false);
    expect(pendingPlannedForDay([item], dayWorkouts)).toEqual([item]);
  });
});
