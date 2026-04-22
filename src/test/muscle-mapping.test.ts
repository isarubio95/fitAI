import { describe, expect, it } from "vitest";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";

describe("resolveMainMuscleGroup", () => {
  it("resuelve alias comunes", () => {
    expect(resolveMainMuscleGroup("pecho")).toBe("Pecho");
    expect(resolveMainMuscleGroup("espalda")).toBe("Espalda");
    expect(resolveMainMuscleGroup("gemelos")).toBe("Pantorrilla");
  });

  it("tolera mayusculas, acentos y espacios", () => {
    expect(resolveMainMuscleGroup("  Bíceps ")).toBe("Bíceps");
    expect(resolveMainMuscleGroup("  CUADRÍCEPS")).toBe("Cuádriceps");
    expect(resolveMainMuscleGroup("gluteo")).toBe("Glúteo");
  });

  it("devuelve null cuando no encuentra grupo", () => {
    expect(resolveMainMuscleGroup("musculo inventado")).toBeNull();
    expect(resolveMainMuscleGroup("")).toBeNull();
    expect(resolveMainMuscleGroup(null)).toBeNull();
  });
});

