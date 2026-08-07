import { describe, expect, it } from "vitest";
import { computeRouteProgress, polylineLengthM } from "@/lib/cardioRouteProgress";

describe("cardioRouteProgress", () => {
  const route = [
    { lat: 40.0, lng: -3.0 },
    { lat: 40.001, lng: -3.0 },
    { lat: 40.002, lng: -3.0 },
  ];

  it("calcula longitud de polilínea", () => {
    const len = polylineLengthM(route);
    expect(len).toBeGreaterThan(200);
    expect(len).toBeLessThan(250);
  });

  it("progreso 0 sin posición", () => {
    const p = computeRouteProgress(route, null);
    expect(p).not.toBeNull();
    expect(p!.percent).toBe(0);
    expect(p!.remainingM).toBeCloseTo(p!.totalM, 0);
  });

  it("progreso cerca del final", () => {
    const p = computeRouteProgress(route, { lat: 40.002, lng: -3.0 });
    expect(p).not.toBeNull();
    expect(p!.percent).toBeGreaterThan(90);
    expect(p!.remainingM).toBeLessThan(20);
  });

  it("progreso a mitad del primer tramo", () => {
    const mid = { lat: 40.0005, lng: -3.0 };
    const p = computeRouteProgress(route, mid);
    expect(p).not.toBeNull();
    expect(p!.percent).toBeGreaterThan(10);
    expect(p!.percent).toBeLessThan(40);
  });
});
