import { describe, expect, it } from "vitest";
import {
  formatMonthAbbrev,
  formatTrainingLoadXTick,
  getTrainingLoadXTicks,
  getTrainingLoadYScale,
} from "@/components/dashboard/training-load/format";

function buildDates(start: string, count: number): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  for (let i = 0; i < count; i += 1) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

describe("formatMonthAbbrev", () => {
  it("capitaliza la abreviatura de mes en español", () => {
    expect(formatMonthAbbrev(new Date("2026-08-03T12:00:00"))).toBe("Ago");
  });
});

describe("formatTrainingLoadXTick", () => {
  it("usa día y mes en rangos cortos", () => {
    expect(formatTrainingLoadXTick("2026-06-05", 30)).toBe("5 jun");
    expect(formatTrainingLoadXTick("2026-06-10", 60)).toBe("10 jun");
  });

  it("usa solo el mes en rangos largos", () => {
    expect(formatTrainingLoadXTick("2026-06-05", 180)).toBe("Jun");
    expect(formatTrainingLoadXTick("2026-08-01", 365)).toBe("Ago");
  });
});

describe("getTrainingLoadXTicks", () => {
  it("en 1 mes toma ~3 ticks cada 12 días, con el último día incluido", () => {
    const dates = buildDates("2026-06-01", 30);
    expect(getTrainingLoadXTicks(dates, 30)).toEqual([
      "2026-06-06",
      "2026-06-18",
      "2026-06-30",
    ]);
  });

  it("en 2 meses toma ~5 ticks cada 12 días, con el último día incluido", () => {
    const dates = buildDates("2026-05-01", 60);
    expect(getTrainingLoadXTicks(dates, 60)).toEqual([
      "2026-05-12",
      "2026-05-24",
      "2026-06-05",
      "2026-06-17",
      "2026-06-29",
    ]);
  });

  it("en 6 meses toma un tick por mes (hasta 6)", () => {
    const dates = buildDates("2026-01-15", 180);
    expect(getTrainingLoadXTicks(dates, 180)).toEqual([
      "2026-02-01",
      "2026-03-01",
      "2026-04-01",
      "2026-05-01",
      "2026-06-01",
      "2026-07-01",
    ]);
  });

  it("en 1 año toma un tick cada dos meses (hasta 6)", () => {
    const dates = buildDates("2025-08-01", 365);
    expect(getTrainingLoadXTicks(dates, 365)).toEqual([
      "2025-08-01",
      "2025-10-01",
      "2025-12-01",
      "2026-02-01",
      "2026-04-01",
      "2026-06-01",
    ]);
  });
});

describe("getTrainingLoadYScale", () => {
  it("siempre devuelve 5 ticks equiespaciados incluyendo el 0", () => {
    const { ticks, domain } = getTrainingLoadYScale(330);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(0);
    expect(ticks[4]).toBe(domain[1]);

    const step = ticks[1] - ticks[0];
    expect(step).toBeGreaterThan(0);
    for (let i = 1; i < ticks.length; i += 1) {
      expect(ticks[i] - ticks[i - 1]).toBe(step);
    }
  });

  it("sube el techo cuando los valores son altos", () => {
    const low = getTrainingLoadYScale(40);
    const high = getTrainingLoadYScale(330);
    expect(high.domain[1]).toBeGreaterThan(low.domain[1]);
    expect(high.domain[1]).toBeGreaterThanOrEqual(330);
    expect(low.ticks).toEqual([0, 15, 30, 45, 60]);
    expect(high.ticks).toEqual([0, 100, 200, 300, 400]);
  });

  it("por debajo de 70 usa 0–60 de 15 en 15 para acercar el zoom", () => {
    expect(getTrainingLoadYScale(0)).toEqual({ domain: [0, 60], ticks: [0, 15, 30, 45, 60] });
    expect(getTrainingLoadYScale(55)).toEqual({ domain: [0, 60], ticks: [0, 15, 30, 45, 60] });
    expect(getTrainingLoadYScale(69)).toEqual({ domain: [0, 60], ticks: [0, 15, 30, 45, 60] });
    expect(getTrainingLoadYScale(70).domain[1]).toBeGreaterThanOrEqual(70);
  });
});
