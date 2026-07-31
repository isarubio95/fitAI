import { describe, expect, it } from "vitest";
import {
  deriveExerciseMetric,
  estimateSetProgress,
  pickBestSetOfDay,
} from "@/hooks/useExerciseProgress";

describe("estimateSetProgress", () => {
  it("calcula 1RM Epley con carga externa", () => {
    const result = estimateSetProgress(80, 8);
    expect(result).not.toBeNull();
    expect(result!.metric).toBe("1rm");
    expect(result!.value).toBeCloseTo(80 * (1 + 0.0333 * 8), 5);
  });

  it("usa max reps a peso corporal (0 kg)", () => {
    const result = estimateSetProgress(0, 12);
    expect(result).toEqual({ value: 12, metric: "reps" });
  });

  it("ignora series sin reps", () => {
    expect(estimateSetProgress(80, 0)).toBeNull();
    expect(estimateSetProgress(0, 0)).toBeNull();
  });
});

describe("pickBestSetOfDay", () => {
  it("elige el mayor 1RM entre series con peso", () => {
    const best = pickBestSetOfDay([
      { weight: 60, reps: 10 },
      { weight: 80, reps: 5 },
    ]);
    expect(best).not.toBeNull();
    expect(best!.weight).toBe(80);
    expect(best!.reps).toBe(5);
    expect(best!.oneRepMax).toBeCloseTo(80 * (1 + 0.0333 * 5), 5);
  });

  it("elige el máximo de reps a peso corporal", () => {
    const best = pickBestSetOfDay([
      { weight: 0, reps: 8 },
      { weight: 0, reps: 12 },
      { weight: 0, reps: 10 },
    ]);
    expect(best).toEqual({
      date: "",
      oneRepMax: 12,
      weight: 0,
      reps: 12,
    });
  });

  it("prioriza series con carga frente a peso corporal el mismo día", () => {
    const best = pickBestSetOfDay([
      { weight: 0, reps: 15 },
      { weight: 60, reps: 5 },
    ]);
    expect(best).not.toBeNull();
    expect(best!.weight).toBe(60);
    expect(best!.reps).toBe(5);
    expect(best!.oneRepMax).toBeCloseTo(60 * (1 + 0.0333 * 5), 5);
  });
});

describe("deriveExerciseMetric", () => {
  it("devuelve reps si todo el historial es a 0 kg", () => {
    expect(deriveExerciseMetric([{ weight: 0 }, { weight: 0 }])).toBe("reps");
  });

  it("devuelve 1rm si hay alguna serie con carga", () => {
    expect(deriveExerciseMetric([{ weight: 0 }, { weight: 40 }])).toBe("1rm");
  });

  it("devuelve 1rm con historial vacío", () => {
    expect(deriveExerciseMetric([])).toBe("1rm");
  });
});
