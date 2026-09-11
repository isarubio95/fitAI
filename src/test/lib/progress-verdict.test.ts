import { describe, expect, it } from "vitest";
import { buildProgressVerdict, volumeDeltaCopy } from "@/lib/progressVerdict";

describe("buildProgressVerdict", () => {
  it("vacío en el periodo", () => {
    const v = buildProgressVerdict({
      period: "4w",
      sessionsCurr: 0,
      sessionsPrev: 3,
      gymCurr: 0,
      cardioCurr: 0,
      volumeCurr: 0,
      volumePrev: 1000,
    });
    expect(v.headline).toBe("Aún no hay sesiones en estas 4 semanas.");
    expect(v.detail).toMatch(/gym y ruta/);
  });

  it("primera ventana con sesiones", () => {
    const v = buildProgressVerdict({
      period: "7d",
      sessionsCurr: 3,
      sessionsPrev: 0,
      gymCurr: 2,
      cardioCurr: 1,
      volumeCurr: 4000,
      volumePrev: 0,
    });
    expect(v.headline).toBe("En estos 7 días: 3 sesiones.");
    expect(v.detail).toBe("3 sesiones · 2 gym · 1 cardio");
  });

  it("más sesiones que el periodo anterior", () => {
    const v = buildProgressVerdict({
      period: "4w",
      sessionsCurr: 8,
      sessionsPrev: 5,
      gymCurr: 5,
      cardioCurr: 3,
      volumeCurr: 2000,
      volumePrev: 3000,
    });
    expect(v.headline).toBe("En estas 4 semanas entrenaste más que en las 4 anteriores.");
  });

  it("mismas sesiones y más volumen", () => {
    const v = buildProgressVerdict({
      period: "3m",
      sessionsCurr: 20,
      sessionsPrev: 20,
      gymCurr: 12,
      cardioCurr: 8,
      volumeCurr: 9000,
      volumePrev: 6000,
    });
    expect(v.headline).toBe("En estos 3 meses el volumen de fuerza subió.");
  });
});

describe("volumeDeltaCopy", () => {
  it("no inventa +100% si no hay baseline", () => {
    expect(volumeDeltaCopy(2400, 0)).toBeNull();
  });

  it("compara solo con periodo previo real", () => {
    expect(volumeDeltaCopy(2400, 1000)).toBe("más que el periodo anterior");
    expect(volumeDeltaCopy(800, 1000)).toBe("menos que el periodo anterior");
    expect(volumeDeltaCopy(1000, 1000)).toBe("igual que el periodo anterior");
  });
});
