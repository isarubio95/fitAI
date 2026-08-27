import { describe, expect, it } from "vitest";
import {
  computeReadiness,
  roundToWeightIncrement,
  shouldDeload,
  suggestProgressiveOverload,
} from "@/lib/progressiveOverload";

const baseTarget = { repesMin: 8, repesMax: 12, targetRir: 2 };

describe("computeReadiness", () => {
  it("reduce readiness con fatiga y forma negativa", () => {
    expect(computeReadiness(0, 0)).toBe(1);
    expect(computeReadiness(1, 0)).toBeLessThan(1);
    expect(computeReadiness(0, -30)).toBeLessThan(1);
  });

  it("no baja de 0.3", () => {
    expect(computeReadiness(1, -50)).toBeGreaterThanOrEqual(0.3);
  });
});

describe("shouldDeload", () => {
  it("detecta fatiga alta o forma muy negativa", () => {
    expect(shouldDeload(0.85, 0)).toBe(true);
    expect(shouldDeload(0.2, -30)).toBe(true);
    expect(shouldDeload(0.2, 5)).toBe(false);
  });
});

describe("suggestProgressiveOverload", () => {
  it("sugiere subir reps cuando no se alcanza el máximo del rango", () => {
    const result = suggestProgressiveOverload({
      lastSets: [
        { peso_kg: 80, repeticiones: 10, rir: 2 },
        { peso_kg: 80, repeticiones: 9, rir: 2 },
      ],
      target: baseTarget,
    });

    expect(result?.action).toBe("increase_reps");
    expect(result?.suggestedWeight).toBe(80);
    expect(result?.suggestedReps).toBe(11);
  });

  it("sugiere subir peso al cumplir el máximo de reps", () => {
    const result = suggestProgressiveOverload({
      lastSets: [
        { peso_kg: 80, repeticiones: 12, rir: 2 },
        { peso_kg: 80, repeticiones: 12, rir: 1 },
      ],
      target: baseTarget,
      muscleFatigueNorm: 0.1,
      trainingForm: 5,
    });

    expect(result?.action).toBe("increase_weight");
    expect(result?.suggestedWeight).toBeGreaterThan(80);
    expect(result?.suggestedReps).toBe(8);
  });

  it("sugiere descarga con fatiga alta", () => {
    const result = suggestProgressiveOverload({
      lastSets: [{ peso_kg: 100, repeticiones: 10, rir: 2 }],
      target: baseTarget,
      muscleFatigueNorm: 0.9,
    });

    expect(result?.action).toBe("deload");
    expect(result?.suggestedWeight).toBe(90);
  });

  it("mantiene carga si no se alcanza el mínimo de reps", () => {
    const result = suggestProgressiveOverload({
      lastSets: [{ peso_kg: 80, repeticiones: 6, rir: 3 }],
      target: baseTarget,
    });

    expect(result?.action).toBe("maintain");
    expect(result?.suggestedWeight).toBe(80);
  });

  it("devuelve null sin series de trabajo", () => {
    expect(
      suggestProgressiveOverload({
        lastSets: [{ peso_kg: 0, repeticiones: 0 }],
        target: baseTarget,
      }),
    ).toBeNull();
  });

  it("ignora los calentamientos al medir el rendimiento", () => {
    // Sin filtrar, el calentamiento ligero hundiría la media de peso y de reps
    // y la sugerencia sería mantener en vez de subir.
    const result = suggestProgressiveOverload({
      lastSets: [
        { peso_kg: 40, repeticiones: 15, rir: 5, tipo_serie: "calentamiento" },
        { peso_kg: 80, repeticiones: 12, rir: 2 },
        { peso_kg: 80, repeticiones: 12, rir: 1 },
      ],
      target: baseTarget,
      muscleFatigueNorm: 0.1,
      trainingForm: 5,
    });

    expect(result?.action).toBe("increase_weight");
    expect(result?.suggestedWeight).toBeGreaterThan(80);
  });

  it("devuelve null si solo hubo calentamiento", () => {
    expect(
      suggestProgressiveOverload({
        lastSets: [{ peso_kg: 40, repeticiones: 15, tipo_serie: "calentamiento" }],
        target: baseTarget,
      }),
    ).toBeNull();
  });
});

describe("roundToWeightIncrement", () => {
  it("redondea al incremento del gimnasio", () => {
    expect(roundToWeightIncrement(82.3, 2.5)).toBe(82.5);
    expect(roundToWeightIncrement(81.1, 2.5)).toBe(80);
  });
});
