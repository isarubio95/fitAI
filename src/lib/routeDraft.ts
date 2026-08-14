/**
 * Estado del trazado manual de una ruta: waypoints que toca el usuario y el tramo
 * (`leg`) que une cada par. Un tramo es recto o el camino real devuelto por el enrutador.
 */

import { elevationGainM } from "@/lib/cardioFormat";
import { polylineLengthM } from "@/lib/cardioRouteProgress";

export type DraftPoint = {
  lat: number;
  lng: number;
  elevacion_m?: number | null;
};

export type RouteLeg = {
  /** Estable entre renders: el enrutado es asíncrono y los índices se mueven. */
  id: number;
  from: DraftPoint;
  to: DraftPoint;
  /** Incluye `from` y `to` como primer y último punto. */
  points: DraftPoint[];
  snapped: boolean;
};

export type RouteDraft = {
  waypoints: DraftPoint[];
  /** Siempre `waypoints.length - 1` tramos (0 si hay menos de 2 waypoints). */
  legs: RouteLeg[];
};

export const EMPTY_ROUTE_DRAFT: RouteDraft = { waypoints: [], legs: [] };

function nextLegId(draft: RouteDraft): number {
  return draft.legs.reduce((max, leg) => Math.max(max, leg.id), 0) + 1;
}

function straightLeg(id: number, from: DraftPoint, to: DraftPoint): RouteLeg {
  return { id, from, to, points: [from, to], snapped: false };
}

function samePoint(a: DraftPoint, b: DraftPoint): boolean {
  return a.lat === b.lat && a.lng === b.lng;
}

/** Polilínea completa; los puntos de unión entre tramos no se duplican. */
export function draftPolyline(draft: RouteDraft): DraftPoint[] {
  if (draft.legs.length === 0) return draft.waypoints.slice(0, 1);

  const out: DraftPoint[] = [];
  for (const leg of draft.legs) {
    const points = out.length === 0 ? leg.points : leg.points.slice(1);
    out.push(...points);
  }
  return out;
}

export function draftDistanceM(draft: RouteDraft): number {
  return polylineLengthM(draftPolyline(draft));
}

export function draftElevationGainM(draft: RouteDraft): number {
  return elevationGainM(draftPolyline(draft));
}

/** Añade un waypoint al final y crea su tramo recto (a la espera del enrutado). */
export function appendWaypoint(draft: RouteDraft, point: DraftPoint): RouteDraft {
  const previous = draft.waypoints[draft.waypoints.length - 1];
  const waypoints = [...draft.waypoints, point];
  if (!previous) return { waypoints, legs: [] };
  return {
    waypoints,
    legs: [...draft.legs, straightLeg(nextLegId(draft), previous, point)],
  };
}

export function removeLastWaypoint(draft: RouteDraft): RouteDraft {
  if (draft.waypoints.length === 0) return draft;
  return {
    waypoints: draft.waypoints.slice(0, -1),
    legs: draft.legs.slice(0, -1),
  };
}

/**
 * Quita un waypoint por índice. Si era intermedio, une a los vecinos con un
 * tramo recto nuevo (id fresco) para invalidar snaps en vuelo.
 */
export function removeWaypoint(draft: RouteDraft, index: number): RouteDraft {
  if (index < 0 || index >= draft.waypoints.length) return draft;

  const waypoints = [...draft.waypoints.slice(0, index), ...draft.waypoints.slice(index + 1)];
  if (waypoints.length < 2) {
    return { waypoints, legs: [] };
  }

  // Extremo inicial: se descarta solo el primer tramo.
  if (index === 0) {
    return { waypoints, legs: draft.legs.slice(1) };
  }

  // Extremo final: equivalente a removeLastWaypoint.
  if (index === draft.waypoints.length - 1) {
    return { waypoints, legs: draft.legs.slice(0, -1) };
  }

  // Intermedio: quitar legs index-1 e index; insertar tramo recto entre vecinos.
  const bridged = straightLeg(nextLegId(draft), waypoints[index - 1], waypoints[index]);
  const legs = [
    ...draft.legs.slice(0, index - 1),
    bridged,
    ...draft.legs.slice(index + 1),
  ];
  return { waypoints, legs };
}

/** Mueve un waypoint; los tramos que lo tocan vuelven a recto hasta re-enrutarse. */
export function moveWaypoint(draft: RouteDraft, index: number, point: DraftPoint): RouteDraft {
  if (index < 0 || index >= draft.waypoints.length) return draft;

  const waypoints = draft.waypoints.map((wp, i) => (i === index ? point : wp));
  let id = nextLegId(draft);
  const legs = draft.legs.map((leg, i) => {
    if (i !== index - 1 && i !== index) return leg;
    // Id nuevo: invalida cualquier enrutado en vuelo de la posición anterior.
    return straightLeg(id++, waypoints[i], waypoints[i + 1]);
  });

  return { waypoints, legs };
}

/**
 * Aplica el camino enrutado a un tramo. Si el tramo ya no existe (el usuario deshizo
 * o movió el waypoint) devuelve el draft intacto, descartando la respuesta obsoleta.
 * Los waypoints de los extremos se pegan al camino para que no floten fuera de la línea.
 */
export function setLegPoints(draft: RouteDraft, legId: number, points: DraftPoint[]): RouteDraft {
  const index = draft.legs.findIndex((leg) => leg.id === legId);
  if (index < 0 || points.length < 2) return draft;

  const from = points[0];
  const to = points[points.length - 1];

  const legs = [...draft.legs];
  legs[index] = { ...legs[index], from, to, points, snapped: true };

  const waypoints = [...draft.waypoints];
  waypoints[index] = from;
  waypoints[index + 1] = to;

  return { waypoints, legs };
}

/** Devuelve todos los tramos a la línea recta entre waypoints (al desactivar el ajuste). */
export function unsnapAllLegs(draft: RouteDraft): RouteDraft {
  if (!draft.legs.some((leg) => leg.snapped)) return draft;
  let id = nextLegId(draft);
  return {
    ...draft,
    legs: draft.waypoints
      .slice(1)
      .map((to, i) => straightLeg(id++, draft.waypoints[i], to)),
  };
}

/** Índices de tramos afectados al mover el waypoint `index`. */
export function legsTouchingWaypoint(draft: RouteDraft, index: number): RouteLeg[] {
  return draft.legs.filter((_, i) => i === index - 1 || i === index);
}

/**
 * Punto que cierra el circuito (vuelta al inicio), o null si no aplica:
 * hacen falta 3 waypoints y que el último no esté ya en el inicio.
 */
export function loopClosingPoint(draft: RouteDraft): DraftPoint | null {
  if (draft.waypoints.length < 3) return null;
  const first = draft.waypoints[0];
  const last = draft.waypoints[draft.waypoints.length - 1];
  if (samePoint(first, last)) return null;
  return first;
}

/** Puntos listos para persistir: sin coordenadas repetidas consecutivas. */
export function draftStorablePoints(draft: RouteDraft): DraftPoint[] {
  const polyline = draftPolyline(draft);
  return polyline.filter((point, i) => i === 0 || !samePoint(point, polyline[i - 1]));
}
