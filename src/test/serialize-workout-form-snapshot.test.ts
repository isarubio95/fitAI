import { describe, expect, it } from "vitest";
import { serializeWorkoutFormSnapshot } from "@/components/workout/workout-logger/serializeWorkoutFormSnapshot";
import type { ExerciseFormData } from "@/types/workout";

const baseExercise: ExerciseFormData = {
  id: "ej-1",
  nombre: "Press banca",
  registro_series: "peso_reps",
  descanso: 90,
  targetRir: 2,
  sets: [{ id: "s-1", repeticiones: 8, peso_kg: 60, completed: true }],
};

function snapshot(exercises: ExerciseFormData[]) {
  return serializeWorkoutFormSnapshot(
    "Pierna",
    "2026-09-09",
    exercises,
    "dumbbell",
    false,
    null,
    null,
    "",
  );
}

describe("serializeWorkoutFormSnapshot", () => {
  it("detecta cambios de descanso y RIR al editar un entreno guardado", () => {
    const original = snapshot([baseExercise]);
    expect(snapshot([{ ...baseExercise, descanso: 120 }])).not.toBe(original);
    expect(snapshot([{ ...baseExercise, targetRir: 3 }])).not.toBe(original);
    expect(snapshot([{ ...baseExercise }])).toBe(original);
  });
});
