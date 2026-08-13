import { describe, expect, it } from "vitest";
import {
  bearingBetween,
  courseFromPoints,
  normalizeHeading,
  shortestAngleDelta,
  smoothHeading,
} from "@/lib/mapHeading";

const MADRID = { lat: 40.4168, lng: -3.7038 };

describe("normalizeHeading", () => {
  it("deja los rumbos en 0-360", () => {
    expect(normalizeHeading(0)).toBe(0);
    expect(normalizeHeading(360)).toBe(0);
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(450)).toBe(90);
  });

  it("cae a 0 con valores no finitos", () => {
    expect(normalizeHeading(Number.NaN)).toBe(0);
    expect(normalizeHeading(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("shortestAngleDelta", () => {
  it("cruza el 0/360 por el camino corto", () => {
    expect(shortestAngleDelta(350, 10)).toBe(20);
    expect(shortestAngleDelta(10, 350)).toBe(-20);
  });

  it("se queda en el rango (-180, 180]", () => {
    expect(shortestAngleDelta(0, 180)).toBe(180);
    expect(shortestAngleDelta(0, 181)).toBe(-179);
    expect(shortestAngleDelta(90, 90)).toBe(0);
  });
});

describe("bearingBetween", () => {
  it("calcula los cuatro rumbos cardinales", () => {
    expect(bearingBetween(MADRID, { lat: MADRID.lat + 0.01, lng: MADRID.lng })).toBeCloseTo(0, 1);
    expect(bearingBetween(MADRID, { lat: MADRID.lat, lng: MADRID.lng + 0.01 })).toBeCloseTo(90, 1);
    expect(bearingBetween(MADRID, { lat: MADRID.lat - 0.01, lng: MADRID.lng })).toBeCloseTo(180, 1);
    expect(bearingBetween(MADRID, { lat: MADRID.lat, lng: MADRID.lng - 0.01 })).toBeCloseTo(270, 1);
  });
});

describe("courseFromPoints", () => {
  it("devuelve null sin puntos suficientes", () => {
    expect(courseFromPoints([])).toBeNull();
    expect(courseFromPoints([MADRID])).toBeNull();
  });

  it("devuelve null si no se ha recorrido la distancia minima", () => {
    // ~1 m hacia el norte: por debajo del umbral, es ruido de GPS.
    expect(courseFromPoints([MADRID, { lat: MADRID.lat + 0.00001, lng: MADRID.lng }])).toBeNull();
  });

  it("devuelve el rumbo del tramo recorrido", () => {
    const course = courseFromPoints([MADRID, { lat: MADRID.lat, lng: MADRID.lng + 0.001 }]);
    expect(course).not.toBeNull();
    expect(course!).toBeCloseTo(90, 1);
  });

  it("agrega varios puntos cortos hasta cubrir la distancia minima", () => {
    const points = Array.from({ length: 6 }, (_, i) => ({
      lat: MADRID.lat + i * 0.00003,
      lng: MADRID.lng,
    }));
    const course = courseFromPoints(points);
    expect(course).not.toBeNull();
    expect(course!).toBeCloseTo(0, 1);
  });
});

describe("smoothHeading", () => {
  it("adopta el primer valor tal cual", () => {
    expect(smoothHeading(null, 120)).toBe(120);
  });

  it("se acerca al objetivo sin alcanzarlo", () => {
    expect(smoothHeading(0, 100, 0.25)).toBeCloseTo(25, 5);
  });

  it("interpola cruzando el 0/360 por el camino corto", () => {
    expect(smoothHeading(350, 10, 0.5)).toBeCloseTo(0, 5);
    expect(smoothHeading(10, 350, 0.5)).toBeCloseTo(0, 5);
  });
});
