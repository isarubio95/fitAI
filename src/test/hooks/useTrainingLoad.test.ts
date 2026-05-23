import { describe, expect, it } from "vitest";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";

const LOOKBACK_DAYS = 400;
const FATIGUE_DECAY_FACTOR = 0.94;
const FATIGUE_DAILY_GAIN = 16;
const FATIGUE_MAX_DAILY_RATIO = 2.5;

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.max(0, Math.min(1, p));
  const idx = (sorted.length - 1) * clamped;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const weight = idx - lo;
  return sorted[lo] * (1 - weight) + sorted[hi] * weight;
}

function buildFatigueSeries(loadByDay: Record<string, number>, bounds: { start: Date; end: Date }) {
  const dayKeys = eachDayOfInterval({ start: bounds.start, end: bounds.end }).map((d) => format(d, "yyyy-MM-dd"));
  const loads = dayKeys.map((k) => loadByDay[k] ?? 0);
  const activeLoads = loads.filter((value) => value > 0);
  const normalizationLoad = Math.max(percentile(activeLoads, 0.6), 1);

  const fatigueRaw: number[] = [];
  for (let i = 0; i < loads.length; i++) {
    const normalized = Math.min(loads[i] / normalizationLoad, FATIGUE_MAX_DAILY_RATIO);
    const dailyImpulse = normalized * FATIGUE_DAILY_GAIN;
    const prev = i === 0 ? 0 : fatigueRaw[i - 1];
    fatigueRaw.push(Math.max(0, prev * FATIGUE_DECAY_FACTOR + dailyImpulse));
  }

  return dayKeys.map((date, idx) => ({
    date,
    load: loads[idx],
    fatigueScore: fatigueRaw[idx] ?? 0,
  }));
}

describe("training load aggregation", () => {
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

    const points = buildFatigueSeries(loadByDay, { start, end });
    const recent = points.slice(-3);

    expect(recent.map((p) => p.date)).toEqual(["2026-05-21", "2026-05-22", "2026-05-23"]);
    expect(recent.every((p) => p.load > 0)).toBe(true);
    expect(recent[2].fatigueScore).toBeGreaterThan(recent[0].fatigueScore);
  });
});
