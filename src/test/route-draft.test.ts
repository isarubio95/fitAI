import { describe, expect, it } from "vitest";
import {
  EMPTY_ROUTE_DRAFT,
  appendWaypoint,
  draftDistanceM,
  draftPolyline,
  draftStorablePoints,
  legsTouchingWaypoint,
  loopClosingPoint,
  moveWaypoint,
  removeLastWaypoint,
  setLegPoints,
  unsnapAllLegs,
  type RouteDraft,
} from "@/lib/routeDraft";

const A = { lat: 40.4, lng: -3.7 };
const B = { lat: 40.41, lng: -3.71 };
const C = { lat: 40.42, lng: -3.72 };

function draftWith(...points: Array<{ lat: number; lng: number }>): RouteDraft {
  return points.reduce((draft, point) => appendWaypoint(draft, point), EMPTY_ROUTE_DRAFT);
}

describe("appendWaypoint", () => {
  it("el primer punto no crea tramo", () => {
    const draft = draftWith(A);
    expect(draft.waypoints).toEqual([A]);
    expect(draft.legs).toEqual([]);
    expect(draftPolyline(draft)).toEqual([A]);
  });

  it("cada punto nuevo añade un tramo recto con id único", () => {
    const draft = draftWith(A, B, C);
    expect(draft.legs).toHaveLength(2);
    expect(draft.legs.map((l) => l.snapped)).toEqual([false, false]);
    expect(new Set(draft.legs.map((l) => l.id)).size).toBe(2);
  });
});

describe("draftPolyline", () => {
  it("no duplica los puntos de unión entre tramos", () => {
    expect(draftPolyline(draftWith(A, B, C))).toEqual([A, B, C]);
  });

  it("incluye los puntos intermedios de un tramo ajustado", () => {
    const draft = draftWith(A, B);
    const middle = { lat: 40.405, lng: -3.705, elevacion_m: 650 };
    const snapped = setLegPoints(draft, draft.legs[0].id, [A, middle, B]);
    expect(draftPolyline(snapped)).toEqual([A, middle, B]);
  });
});

describe("setLegPoints", () => {
  it("descarta respuestas de tramos que ya no existen", () => {
    const draft = draftWith(A, B);
    const stale = draft.legs[0].id;
    const undone = removeLastWaypoint(draft);
    expect(setLegPoints(undone, stale, [A, C, B])).toBe(undone);
  });

  it("pega los waypoints de los extremos al camino ajustado", () => {
    const draft = draftWith(A, B);
    const onRoad = { lat: 40.4001, lng: -3.7001 };
    const onRoadEnd = { lat: 40.4101, lng: -3.7101 };
    const snapped = setLegPoints(draft, draft.legs[0].id, [onRoad, onRoadEnd]);
    expect(snapped.waypoints).toEqual([onRoad, onRoadEnd]);
    expect(snapped.legs[0].snapped).toBe(true);
  });
});

describe("moveWaypoint", () => {
  it("recrea con id nuevo los tramos que tocan al waypoint movido", () => {
    const draft = draftWith(A, B, C);
    const previousIds = draft.legs.map((l) => l.id);
    const moved = moveWaypoint(draft, 1, { lat: 40.5, lng: -3.8 });

    expect(moved.waypoints[1]).toEqual({ lat: 40.5, lng: -3.8 });
    expect(moved.legs.map((l) => l.id)).not.toEqual(previousIds);
    expect(moved.legs[0].to).toEqual({ lat: 40.5, lng: -3.8 });
    expect(moved.legs[1].from).toEqual({ lat: 40.5, lng: -3.8 });
  });

  it("mover un extremo solo afecta a su tramo", () => {
    const draft = draftWith(A, B, C);
    const moved = moveWaypoint(draft, 0, { lat: 40.3, lng: -3.6 });
    expect(moved.legs[1].id).toBe(draft.legs[1].id);
    expect(legsTouchingWaypoint(moved, 0)).toHaveLength(1);
  });

  it("índice fuera de rango es no-op", () => {
    const draft = draftWith(A, B);
    expect(moveWaypoint(draft, 5, C)).toBe(draft);
  });
});

describe("removeLastWaypoint", () => {
  it("quita el punto y su tramo", () => {
    const draft = removeLastWaypoint(draftWith(A, B, C));
    expect(draft.waypoints).toEqual([A, B]);
    expect(draft.legs).toHaveLength(1);
  });

  it("draft vacío es no-op", () => {
    expect(removeLastWaypoint(EMPTY_ROUTE_DRAFT)).toBe(EMPTY_ROUTE_DRAFT);
  });
});

describe("unsnapAllLegs", () => {
  it("vuelve a rectas entre waypoints", () => {
    const draft = draftWith(A, B);
    const snapped = setLegPoints(draft, draft.legs[0].id, [A, C, B]);
    const straight = unsnapAllLegs(snapped);
    expect(straight.legs[0].snapped).toBe(false);
    expect(draftPolyline(straight)).toEqual([A, B]);
  });

  it("no toca un draft que ya es recto", () => {
    const draft = draftWith(A, B);
    expect(unsnapAllLegs(draft)).toBe(draft);
  });
});

describe("loopClosingPoint", () => {
  it("necesita al menos 3 puntos", () => {
    expect(loopClosingPoint(draftWith(A, B))).toBeNull();
    expect(loopClosingPoint(draftWith(A, B, C))).toEqual(A);
  });

  it("null si ya está cerrado", () => {
    expect(loopClosingPoint(draftWith(A, B, C, A))).toBeNull();
  });
});

describe("draftDistanceM y draftStorablePoints", () => {
  it("mide la polilínea completa", () => {
    expect(draftDistanceM(draftWith(A))).toBe(0);
    expect(draftDistanceM(draftWith(A, B))).toBeGreaterThan(1000);
  });

  it("elimina coordenadas repetidas consecutivas", () => {
    const draft = draftWith(A, A, B);
    expect(draftStorablePoints(draft)).toEqual([A, B]);
  });
});
