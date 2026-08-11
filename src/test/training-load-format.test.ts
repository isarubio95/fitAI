import { describe, expect, it } from "vitest";
import {
  formatMonthAbbrev,
  formatTrainingLoadXTick,
  getTrainingLoadXTicks,
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
  it("en 1 mes toma ~5 ticks cada 6 días", () => {
    const dates = buildDates("2026-06-01", 30);
    expect(getTrainingLoadXTicks(dates, 30)).toEqual([
      "2026-06-01",
      "2026-06-07",
      "2026-06-13",
      "2026-06-19",
      "2026-06-25",
    ]);
  });

  it("en 2 meses toma ~5 ticks cada 12 días", () => {
    const dates = buildDates("2026-05-01", 60);
    expect(getTrainingLoadXTicks(dates, 60)).toEqual([
      "2026-05-01",
      "2026-05-13",
      "2026-05-25",
      "2026-06-06",
      "2026-06-18",
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
