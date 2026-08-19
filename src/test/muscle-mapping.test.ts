import { describe, expect, it } from "vitest";
import { aggregateRoutineMuscleSets, resolveMainMuscleGroup } from "@/lib/muscleMapping";

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

describe("aggregateRoutineMuscleSets", () => {
  it("suma series_objetivo a cada grupo tocado por el ejercicio", () => {
    const result = aggregateRoutineMuscleSets([
      {
        series_objetivo: 4,
        tipo_ejercicio: { musculos_involucrados: ["Pectoral Medio", "Tríceps Lateral"] },
      },
      {
        series_objetivo: 3,
        tipo_ejercicio: { musculos_involucrados: ["Pectoral Superior"] },
      },
      {
        series_objetivo: 3,
        tipo_ejercicio: { grupo_muscular: "Hombro" },
      },
    ]);

    expect(result.groupSets.Pecho).toBe(7);
    expect(result.groupSets.Tríceps).toBe(4);
    expect(result.groupSets.Hombro).toBe(3);
    expect(result.maxSets).toBe(7);
  });

  it("no duplica series si varios músculos específicos caen en el mismo grupo", () => {
    const result = aggregateRoutineMuscleSets([
      {
        series_objetivo: 4,
        tipo_ejercicio: {
          musculos_involucrados: ["Pectoral Superior", "Pectoral Medio", "Pectoral Inferior"],
        },
      },
    ]);

    expect(result.groupSets.Pecho).toBe(4);
    expect(result.maxSets).toBe(4);
  });

  it("usa grupo_muscular solo cuando no hay musculos_involucrados resolubles", () => {
    const result = aggregateRoutineMuscleSets([
      {
        series_objetivo: 5,
        tipo_ejercicio: {
          musculos_involucrados: ["Pectoral Medio"],
          grupo_muscular: "Espalda",
        },
      },
    ]);

    expect(result.groupSets.Pecho).toBe(5);
    expect(result.groupSets.Espalda).toBeUndefined();
  });

  it("ignora ejercicios sin series o sin músculos mapeables", () => {
    const result = aggregateRoutineMuscleSets([
      { series_objetivo: 0, tipo_ejercicio: { musculos_involucrados: ["Pectoral Medio"] } },
      { series_objetivo: 3, tipo_ejercicio: { musculos_involucrados: ["cardio"] } },
      { series_objetivo: 2, tipo_ejercicio: null },
    ]);

    expect(result.groupSets).toEqual({});
    expect(result.maxSets).toBe(0);
  });
});

