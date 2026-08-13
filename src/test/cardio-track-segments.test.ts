import { describe, expect, it } from "vitest";
import { splitTrackByTimeGaps, TRACK_GAP_MS } from "@/lib/cardioTrackSegments";

const T0 = Date.parse("2026-08-11T18:00:00.000Z");

function point(offsetMs: number, lat: number, lng: number) {
  return { lat, lng, timestamp_utc: new Date(T0 + offsetMs).toISOString() };
}

describe("splitTrackByTimeGaps", () => {
  it("devuelve un único tramo cuando el muestreo es continuo", () => {
    const segments = splitTrackByTimeGaps([
      point(0, 40.4168, -3.7038),
      point(2000, 40.4175, -3.703),
      point(4000, 40.4182, -3.7022),
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0]).toHaveLength(3);
    expect(segments[0][0]).toEqual([-3.7038, 40.4168]);
  });

  it("corta el tramo cuando el hueco temporal supera el umbral", () => {
    const segments = splitTrackByTimeGaps([
      point(0, 40.4168, -3.7038),
      point(2000, 40.4175, -3.703),
      point(2000 + TRACK_GAP_MS + 1, 40.43, -3.69),
      point(4000 + TRACK_GAP_MS + 1, 40.4305, -3.6895),
    ]);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveLength(2);
    expect(segments[1]).toHaveLength(2);
  });

  it("no corta justo en el umbral", () => {
    const segments = splitTrackByTimeGaps([
      point(0, 40.4168, -3.7038),
      point(TRACK_GAP_MS, 40.4175, -3.703),
    ]);

    expect(segments).toHaveLength(1);
  });

  it("acumula puntos sin timestamp en el tramo abierto", () => {
    const segments = splitTrackByTimeGaps([
      { lat: 40.4168, lng: -3.7038, timestamp_utc: null },
      { lat: 40.4175, lng: -3.703, timestamp_utc: "no-es-una-fecha" },
      point(1000, 40.4182, -3.7022),
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0]).toHaveLength(3);
  });

  it("no produce tramos con una lista vacía", () => {
    expect(splitTrackByTimeGaps([])).toEqual([]);
  });
});
