import { describe, expect, it } from "vitest";
import {
  banisterSeries,
  cardioBlockImpulse,
  combineStrengthSessionLoad,
  distributeLocalMuscleImpulse,
  edwardsTrimpFromAvgHr,
  estimatedDaysToBaseline,
  estimatedStrengthDurationSec,
  fosterSessionLoad,
  formatRecoveryDays,
  getFormLabel,
  getRecoveryZoneDef,
  intensityFromRir,
  pickMuscleRecoveryBottleneck,
  projectFatigue,
  rankGroupsByRecovery,
  localMuscleFatigueSeries,
  LOCAL_MUSCLE_TIME_CONSTANT_DAYS,
  MAX_STRENGTH_CLOCK_SEC,
  resolveSessionDurationSec,
  resolveSessionRpe,
  strengthSetMechanicalImpulse,
  unifiedSessionLoad,
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
    expect(getFormLabel(last.form)).toMatch(/Fatigado|Agotado/);
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

describe("muscle recovery bottleneck", () => {
  it("elige el grupo con más días a baseline", () => {
    const snapshot = pickMuscleRecoveryBottleneck(
      { Pecho: 3, Espalda: 1, Core: 0 },
      { Pecho: 12, Espalda: 40, Core: 2 },
    );
    expect(snapshot).toEqual({ group: "Pecho", days: 3, fatigue: 12 });
  });

  it("en empate de días usa la fatiga, y si no el nombre", () => {
    expect(
      pickMuscleRecoveryBottleneck({ Pecho: 2, Espalda: 2 }, { Pecho: 8, Espalda: 11 }).group,
    ).toBe("Espalda");
    expect(
      pickMuscleRecoveryBottleneck({ Pecho: 2, Espalda: 2 }, { Pecho: 10, Espalda: 10 }).group,
    ).toBe("Espalda");
  });

  it("sin fatiga residual no hay cuello de botella", () => {
    expect(pickMuscleRecoveryBottleneck({}, {})).toEqual({ group: null, days: 0, fatigue: 0 });
    expect(pickMuscleRecoveryBottleneck({ Pecho: 0, Core: 0 }, { Pecho: 4, Core: 1 })).toEqual({
      group: null,
      days: 0,
      fatigue: 4,
    });
  });

  it("clasifica días en las zonas del anillo", () => {
    expect(getRecoveryZoneDef(0).key).toBe("listo");
    expect(getRecoveryZoneDef(1).key).toBe("casi");
    expect(getRecoveryZoneDef(2).key).toBe("recuperando");
    expect(getRecoveryZoneDef(3).key).toBe("recuperando");
    expect(getRecoveryZoneDef(4).key).toBe("cargado");
    expect(getRecoveryZoneDef(12).key).toBe("cargado");
    expect(formatRecoveryDays(3)).toBe("3d");
  });
});

describe("getFormLabel", () => {
  it("usa las mismas zonas Coggan que la escala del gráfico", () => {
    expect(getFormLabel(-40)).toBe("Agotado");
    expect(getFormLabel(-20)).toBe("Fatigado");
    expect(getFormLabel(-8)).toBe("Óptimo");
    expect(getFormLabel(10)).toBe("Fresco");
    expect(getFormLabel(30)).toBe("Inactivo");
  });
});

describe("fosterSessionLoad", () => {
  it("escala minutos × RPE a unidades tipo TSS (/10)", () => {
    expect(fosterSessionLoad(3600, 7)).toBe(42);
    expect(fosterSessionLoad(0, 7)).toBe(0);
  });

  it("prioriza el RPE de sesión sobre pulso o RIR", () => {
    expect(
      resolveSessionRpe({
        sessionRpe: 8,
        fcMedia: 120,
        maxHr: 190,
        setRirs: [3],
        fallbackRpe: 5,
      }),
    ).toBe(8);
  });

  it("unifica gym y cardio en Foster cuando hay duración", () => {
    const gym = unifiedSessionLoad({ durationSec: 3600, rpe: 7, fallbackLoad: 200 });
    const cardio = unifiedSessionLoad({ durationSec: 3600, rpe: 7, fallbackLoad: 80 });
    expect(gym).toBe(42);
    expect(cardio).toBe(42);
  });

  it("ignora un reloj de gym desde medianoche y usa la estimación por series", () => {
    const twelveHours = 12 * 3600;
    const durationSec = resolveSessionDurationSec({
      clockSec: twelveHours,
      estimatedSec: estimatedStrengthDurationSec(20),
      maxClockSec: MAX_STRENGTH_CLOCK_SEC,
    });
    expect(durationSec).toBe(20 * 180);
    expect(fosterSessionLoad(twelveHours, 7)).toBeGreaterThan(500);
    expect(unifiedSessionLoad({ durationSec, rpe: 7, fallbackLoad: 999 })).toBe(fosterSessionLoad(durationSec, 7));
  });
});

