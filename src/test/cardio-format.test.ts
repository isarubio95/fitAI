import { describe, expect, it } from "vitest";
import {
  avgPaceSecPer500m,
  avgPaceSecPerKm,
  avgSpeedMps,
  formatPaceSec500m,
  formatPaceSecKm,
  formatSpeedKmh,
  paceSecPer500mFromSpeed,
  paceSecPerKmFromSpeed,
} from "@/lib/cardioFormat";

describe("pace / speed helpers", () => {
  it("avgPaceSecPerKm calcula s/km", () => {
    // 5 min en 1 km → 300 s/km
    expect(avgPaceSecPerKm(300, 1000)).toBe(300);
    expect(avgPaceSecPerKm(0, 1000)).toBeNull();
    expect(avgPaceSecPerKm(300, 0)).toBeNull();
  });

  it("paceSecPerKmFromSpeed desde m/s", () => {
    // 3.333… m/s ≈ 5:00/km
    expect(paceSecPerKmFromSpeed(1000 / 300)).toBeCloseTo(300, 5);
    expect(paceSecPerKmFromSpeed(0)).toBeNull();
    expect(paceSecPerKmFromSpeed(null)).toBeNull();
  });

  it("avgSpeedMps y formatSpeedKmh", () => {
    expect(avgSpeedMps(3600, 10000)).toBeCloseTo(10000 / 3600, 5);
    expect(formatSpeedKmh(10)).toBe("36.0 km/h");
    expect(formatSpeedKmh(null)).toBe("—");
  });

  it("ritmo /500m para remo", () => {
    // 2 min en 500 m → 120 s/500m
    expect(avgPaceSecPer500m(120, 500)).toBe(120);
    expect(paceSecPer500mFromSpeed(500 / 120)).toBeCloseTo(120, 5);
  });

  it("formatea ritmo con sufijos", () => {
    expect(formatPaceSecKm(300)).toBe("5:00/km");
    expect(formatPaceSec500m(120)).toBe("2:00/500m");
    expect(formatPaceSecKm(null)).toBe("—");
  });
});
