import { describe, expect, it } from "vitest";
import {
  banisterSeries,
  cardioBlockImpulse,
  combineStrengthSessionLoad,
  distributeLocalMuscleImpulse,
  edwardsTrimpFromAvgHr,
  estimatedDaysToBaseline,
  getFormLabel,
  intensityFromRir,
  localMuscleFatigueSeries,
  strengthSetMechanicalImpulse,
} from "@/lib/trainingLoad";

describe("intensityFromRir", () => {
  it("usa 1.0 sin RIR", () => {
    expect(intensityFromRir(null)).toBe(1);
    expect(intensityFromRir(undefined)).toBe(1);
  });

  it("sube con RIR bajo (cerca del fallo)", () => {
    expect(intensityFromRir(0)).toBeGreaterThan(intensityFromRir(3));
    expect(intensityFromRir(3)).toBeGreaterThan(intensityFromRir(8));
  });
});

describe("strengthSetMechanicalImpulse", () => {
  it("calcula tonelaje con peso y reps", () => {
    const load = strengthSetMechanicalImpulse({ repeticiones: 10, peso_kg: 100, rir: 2 });
    expect(load).toBeGreaterThan(0);
    expect(load).toBeCloseTo((10 * 100 * intensityFromRir(2)) / 50, 5);
  });

  it("usa peso corporal cuando no hay kg", () => {
    const withBw = strengthSetMechanicalImpulse({ repeticiones: 10, peso_kg: 0 }, 80);
    const fallback = strengthSetMechanicalImpulse({ repeticiones: 10, peso_kg: 0 });
    // bodyweight path: 10*80/50 = 16; fallback flat load = 20
    expect(withBw).toBeCloseTo(16, 5);
    expect(fallback).toBe(20);
  });
});

describe("combineStrengthSessionLoad", () => {
  it("mezcla mecánica y TRIMP", () => {
    expect(combineStrengthSessionLoad(100, 100)).toBeCloseTo(65 + 35, 5);
    expect(combineStrengthSessionLoad(50, 0)).toBe(50);
    expect(combineStrengthSessionLoad(0, 40)).toBe(40);
  });
});

describe("cardioBlockImpulse", () => {
  it("usa Edwards con fc_media", () => {
    const load = cardioBlockImpulse(
      { duracion_seg: 3600, fc_media: 150 },
      { maxHr: 190 },
    );
    expect(load).toBe(edwardsTrimpFromAvgHr(3600, 150, 190));
    expect(load).toBeGreaterThan(0);
  });

  it("cae a minutos × 8 sin FC", () => {
    expect(cardioBlockImpulse({ duracion_seg: 600 }, { maxHr: 190 })).toBe(80);
  });

  it("usa TSS con potencia y FTP", () => {
    const load = cardioBlockImpulse(
      { duracion_seg: 3600 },
      {
        maxHr: 190,
        ftpW: 250,
        cycling: { potencia_normalizada_w: 250, duracion_seg: 3600 },
      },
    );
    expect(load).toBeCloseTo(100, 5);
  });
});

describe("banisterSeries", () => {
  it("eleva fatiga más rápido que fitness con carga alta", () => {
    const loads = Array.from({ length: 14 }, () => 100);
    const series = banisterSeries(loads);
    const last = series[series.length - 1];
    expect(last.fatigue).toBeGreaterThan(last.fitness);
    expect(last.form).toBeLessThan(0);
    expect(getFormLabel(last.form)).toMatch(/Cargado|Muy fatigado/);
  });

  it("recupera forma al descansar", () => {
    const loads = [...Array.from({ length: 10 }, () => 80), ...Array.from({ length: 10 }, () => 0)];
    const series = banisterSeries(loads);
    const mid = series[9];
    const end = series[series.length - 1];
    expect(end.form).toBeGreaterThan(mid.form);
  });
});

describe("localMuscleFatigue", () => {
  it("reparte impulso primario y secundario", () => {
    const dist = distributeLocalMuscleImpulse(10, {
      grupo_muscular: "Pecho",
      musculos_involucrados: ["Pectoral Medio", "Tríceps Largo"],
    });
    expect(dist.Pecho).toBe(10);
    expect(dist.Tríceps).toBe(5);
  });

  it("estima días a baseline", () => {
    const series = localMuscleFatigueSeries([40, 0, 0, 0, 0, 0, 0, 0]);
    expect(series[0]).toBeGreaterThan(0);
    expect(estimatedDaysToBaseline(series[0])).toBeGreaterThan(0);
  });
});
