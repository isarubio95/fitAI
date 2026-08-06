import { describe, expect, it } from "vitest";
import { parseHeartRate } from "@/lib/bleHeartRate";
import {
  estimateMaxHeartRate,
  heartRateZone,
  mergeHeartRateSamples,
  nearestHeartRate,
  sampleHeartRateSeries,
  summarizeHeartRate,
  type HeartRateSample,
} from "@/lib/heartRateMetrics";

describe("parseHeartRate", () => {
  it("parses 8-bit heart rate", () => {
    const buf = new Uint8Array([0x00, 142]);
    expect(parseHeartRate(new DataView(buf.buffer))).toBe(142);
  });

  it("parses 16-bit heart rate little-endian", () => {
    const buf = new Uint8Array([0x01, 0x2c, 0x01]); // flag + 300
    expect(parseHeartRate(new DataView(buf.buffer))).toBe(300);
  });
});

describe("heartRateMetrics", () => {
  const samples: HeartRateSample[] = [
    { t: 1000, bpm: 120 },
    { t: 5000, bpm: 140 },
    { t: 9000, bpm: 160 },
  ];

  it("summarizes media and max", () => {
    expect(summarizeHeartRate(samples)).toEqual({ fcMedia: 140, fcMax: 160 });
    expect(summarizeHeartRate([])).toEqual({ fcMedia: null, fcMax: null });
  });

  it("finds nearest sample within delta", () => {
    expect(nearestHeartRate(samples, 5100)).toBe(140);
    expect(nearestHeartRate(samples, 50_000, 15_000)).toBeNull();
  });

  it("samples series at intervals", () => {
    const series = sampleHeartRateSeries(samples, 1000, 9000, 4000);
    expect(series.length).toBeGreaterThanOrEqual(2);
    expect(series[0].bpm).toBe(120);
  });

  it("estimates zones and max HR", () => {
    expect(estimateMaxHeartRate(30)).toBe(Math.round(208 - 0.7 * 30));
    expect(estimateMaxHeartRate(null)).toBe(190);
    expect(heartRateZone(95, 190)).toBe(1);
    expect(heartRateZone(162, 190)).toBe(4);
  });

  it("merges Health Connect samples where BLE is missing", () => {
    const ble: HeartRateSample[] = [
      { t: 1000, bpm: 120 },
      { t: 5000, bpm: 140 },
    ];
    const hc: HeartRateSample[] = [
      { t: 1100, bpm: 999 }, // cerca de BLE → se descarta
      { t: 25_000, bpm: 155 },
    ];
    const merged = mergeHeartRateSamples(ble, hc);
    expect(merged).toEqual([
      { t: 1000, bpm: 120 },
      { t: 5000, bpm: 140 },
      { t: 25_000, bpm: 155 },
    ]);
  });

  it("returns only Health Connect when BLE is empty", () => {
    const hc: HeartRateSample[] = [{ t: 3000, bpm: 130 }];
    expect(mergeHeartRateSamples([], hc)).toEqual(hc);
  });
});
