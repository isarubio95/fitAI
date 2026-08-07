import { describe, expect, it } from "vitest";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import { banisterSeries } from "@/lib/trainingLoad";

const LOOKBACK_DAYS = 400;

function buildBanisterPoints(loadByDay: Record<string, number>, bounds: { start: Date; end: Date }) {
  const dayKeys = eachDayOfInterval({ start: bounds.start, end: bounds.end }).map((d) =>
    format(d, "yyyy-MM-dd"),
  );
  const loads = dayKeys.map((k) => loadByDay[k] ?? 0);
  const series = banisterSeries(loads);
  return dayKeys.map((date, idx) => ({
    date,
    load: loads[idx],
    fitness: series[idx]?.fitness ?? 0,
    fatigue: series[idx]?.fatigue ?? 0,
    form: series[idx]?.form ?? 0,
  }));
}

describe("training load aggregation (banister)", () => {
  it("registra carga en días recientes aunque haya mucho histórico", () => {
    const end = endOfDay(new Date("2026-05-23T15:00:00.000Z"));
    const start = startOfDay(subDays(end, LOOKBACK_DAYS - 1));
    const loadByDay: Record<string, number> = {};

    for (let i = 0; i < LOOKBACK_DAYS; i++) {
      const date = format(subDays(end, i), "yyyy-MM-dd");
      loadByDay[date] = 100;
    }
    loadByDay["2026-05-21"] = 500;
    loadByDay["2026-05-22"] = 600;
    loadByDay["2026-05-23"] = 700;

    const points = buildBanisterPoints(loadByDay, { start, end });
    const recent = points.slice(-3);

    expect(recent.map((p) => p.date)).toEqual(["2026-05-21", "2026-05-22", "2026-05-23"]);
    expect(recent.every((p) => p.load > 0)).toBe(true);
    expect(recent[2].fatigue).toBeGreaterThan(recent[0].fatigue);
  });
});
