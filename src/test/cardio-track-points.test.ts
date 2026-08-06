import { describe, expect, it } from "vitest";
import {
  limitTrackPoints,
  prepareTrackPointsForStorage,
  thinByMinDistanceM,
} from "@/lib/cardioTrackPoints";

function linePoints(n: number, stepLat = 0.0002): { lat: number; lng: number; orden: number }[] {
  // ~22 m por stepLat 0.0002
  return Array.from({ length: n }, (_, i) => ({
    lat: 40.4 + i * stepLat,
    lng: -3.7,
    orden: i,
  }));
}

describe("thinByMinDistanceM", () => {
  it("no-op con 0–2 puntos", () => {
    expect(thinByMinDistanceM([])).toEqual([]);
    const one = [{ lat: 1, lng: 2 }];
    expect(thinByMinDistanceM(one)).toEqual(one);
    const two = [
      { lat: 1, lng: 2 },
      { lat: 1.1, lng: 2.1 },
    ];
    expect(thinByMinDistanceM(two)).toEqual(two);
  });

  it("conserva extremos y reduce densidad", () => {
    // Pasos ~2.2 m (muy densos) con minSpacing 12 m
    const dense = linePoints(50, 0.00002);
    const thinned = thinByMinDistanceM(dense, 12);
    expect(thinned.length).toBeLessThan(dense.length);
    expect(thinned[0]).toEqual(dense[0]);
    expect(thinned[thinned.length - 1]).toEqual(dense[dense.length - 1]);
  });
});

describe("limitTrackPoints", () => {
  it("no-op bajo el tope", () => {
    const pts = linePoints(10);
    expect(limitTrackPoints(pts, 20)).toBe(pts);
  });

  it("respeta max y conserva extremos", () => {
    const pts = linePoints(100);
    const limited = limitTrackPoints(pts, 11);
    expect(limited.length).toBeLessThanOrEqual(11);
    expect(limited.length).toBeGreaterThanOrEqual(2);
    expect(limited[0]).toEqual(pts[0]);
    expect(limited[limited.length - 1]).toEqual(pts[pts.length - 1]);
  });

  it("exige maxPoints >= 2", () => {
    expect(() => limitTrackPoints(linePoints(5), 1)).toThrow();
  });
});

describe("prepareTrackPointsForStorage", () => {
  it("vacío", () => {
    expect(prepareTrackPointsForStorage([])).toEqual([]);
  });

  it("renumera orden tras downsample", () => {
    const dense = linePoints(500, 0.00002);
    const prepared = prepareTrackPointsForStorage(dense, 50, 12);
    expect(prepared.length).toBeLessThanOrEqual(50);
    expect(prepared[0].orden).toBe(0);
    expect(prepared[prepared.length - 1].orden).toBe(prepared.length - 1);
    prepared.forEach((p, i) => expect(p.orden).toBe(i));
  });

  it("no inventa orden si los puntos no lo traían", () => {
    const pts = Array.from({ length: 20 }, (_, i) => ({
      lat: 40.4 + i * 0.00002,
      lng: -3.7,
    }));
    const prepared = prepareTrackPointsForStorage(pts, 10, 12);
    expect(prepared.every((p) => !("orden" in p) || (p as { orden?: number }).orden == null)).toBe(
      true,
    );
    expect(prepared[0]).toEqual(pts[0]);
    expect(prepared[prepared.length - 1]).toEqual(pts[pts.length - 1]);
  });
});
