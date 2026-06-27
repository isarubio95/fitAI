import { describe, expect, it } from "vitest";
import {
  computeStreakStats,
  streakOnWeek,
  weekStartKeyFromDayStr,
  workoutDaysToWeeks,
} from "@/lib/streakWeeks";

describe("streakWeeks", () => {
  it("agrupa días en semanas que empiezan en lunes", () => {
    expect(weekStartKeyFromDayStr("2026-06-23")).toBe("2026-06-22"); // martes → lunes 22
    expect(weekStartKeyFromDayStr("2026-06-27")).toBe("2026-06-22"); // sábado → misma semana
    expect(weekStartKeyFromDayStr("2026-06-29")).toBe("2026-06-29"); // lunes
  });

  it("cuenta semanas consecutivas con entreno", () => {
    const weeks = workoutDaysToWeeks(["2026-06-23", "2026-06-25", "2026-06-30", "2026-07-02"]);
    expect(weeks.size).toBe(2);
    expect(streakOnWeek("2026-06-29", weeks)).toBe(2);
  });

  it("rompe la racha si falta una semana", () => {
    const days = ["2026-06-09", "2026-06-23"]; // semanas 9 y 23 de junio
    const stats = computeStreakStats(days);
    expect(stats.actual).toBe(1);
    expect(stats.maxima).toBe(1);
  });

  it("calcula racha actual y máxima", () => {
    const days = [
      "2026-05-26",
      "2026-06-02",
      "2026-06-09",
      "2026-06-16",
      "2026-06-23",
      "2026-06-30",
    ];
    const stats = computeStreakStats(days);
    expect(stats.actual).toBe(6);
    expect(stats.maxima).toBe(6);
  });
});
