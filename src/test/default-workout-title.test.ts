import { describe, expect, it } from "vitest";
import { getDefaultCardioTitle, getDefaultWorkoutTitle, workoutTimeOfDay } from "@/lib/defaultWorkoutTitle";

describe("defaultWorkoutTitle", () => {
  it("clasifica las franjas horarias", () => {
    expect(workoutTimeOfDay(0)).toBe("madrugada");
    expect(workoutTimeOfDay(5)).toBe("madrugada");
    expect(workoutTimeOfDay(6)).toBe("manana");
    expect(workoutTimeOfDay(11)).toBe("manana");
    expect(workoutTimeOfDay(12)).toBe("mediodia");
    expect(workoutTimeOfDay(14)).toBe("mediodia");
    expect(workoutTimeOfDay(15)).toBe("tarde");
    expect(workoutTimeOfDay(20)).toBe("tarde");
    expect(workoutTimeOfDay(21)).toBe("noche");
    expect(workoutTimeOfDay(23)).toBe("noche");
  });

  it("devuelve títulos en español", () => {
    expect(getDefaultWorkoutTitle(new Date(2026, 6, 3, 7, 30))).toBe("Entrenamiento de mañana");
    expect(getDefaultWorkoutTitle(new Date(2026, 6, 3, 13, 0))).toBe("Entrenamiento al mediodía");
    expect(getDefaultWorkoutTitle(new Date(2026, 6, 3, 18, 45))).toBe("Entrenamiento de tarde");
    expect(getDefaultWorkoutTitle(new Date(2026, 6, 3, 22, 10))).toBe("Entrenamiento de noche");
    expect(getDefaultWorkoutTitle(new Date(2026, 6, 3, 4, 0))).toBe("Entrenamiento de madrugada");
  });

  it("devuelve títulos de cardio con disciplina", () => {
    expect(getDefaultCardioTitle("Ciclismo", new Date(2026, 6, 3, 18, 45))).toBe("Ciclismo de tarde");
    expect(getDefaultCardioTitle("Carrera", new Date(2026, 6, 3, 7, 30))).toBe("Carrera de mañana");
    expect(getDefaultCardioTitle(null, new Date(2026, 6, 3, 13, 0))).toBe("Cardio al mediodía");
  });
});
