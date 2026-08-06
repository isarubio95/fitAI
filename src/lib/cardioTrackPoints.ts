import { haversineM } from "@/lib/cardioGpsMotion";

/** Tope de puntos al persistir en DB / upload. */
export const MAX_TRACK_POINTS_DB = 2000;
/** Tope de puntos en el draft de localStorage. */
export const MAX_TRACK_POINTS_DRAFT = 2500;
/** Espaciado mínimo entre puntos intermedios al adelgazar tracks densos. */
export const MIN_POINT_SPACING_M = 12;
/** Tamaño de lote al insertar `cardio_track_point`. */
export const TRACK_POINTS_INSERT_CHUNK = 500;

export type LatLngPoint = {
  lat: number;
  lng: number;
};

/**
 * Conserva primero y último; entre medias solo puntos a ≥ minSpacingM del último aceptado.
 */
export function thinByMinDistanceM<T extends LatLngPoint>(
  points: T[],
  minSpacingM = MIN_POINT_SPACING_M,
): T[] {
  if (points.length <= 2 || minSpacingM <= 0) return points;

  const out: T[] = [points[0]];
  let lastKept = points[0];

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    if (haversineM(lastKept, p) >= minSpacingM) {
      out.push(p);
      lastKept = p;
    }
  }

  const last = points[points.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/**
 * Muestreo uniforme por índice si supera maxPoints; siempre conserva primero y último.
 */
export function limitTrackPoints<T extends LatLngPoint>(points: T[], maxPoints: number): T[] {
  if (maxPoints < 2) {
    throw new Error("maxPoints must be >= 2");
  }
  if (points.length <= maxPoints) return points;

  const lastIdx = points.length - 1;
  const indices = new Set<number>([0, lastIdx]);
  const middleSlots = maxPoints - 2;

  for (let i = 1; i <= middleSlots; i++) {
    indices.add(Math.round((i * lastIdx) / (middleSlots + 1)));
  }

  // Colisiones de redondeo: rellenar huecos hasta llegar a maxPoints.
  for (let i = 1; i < lastIdx && indices.size < maxPoints; i++) {
    indices.add(i);
  }

  return [...indices].sort((a, b) => a - b).map((i) => points[i]);
}

type WithOptionalOrden = LatLngPoint & { orden?: number };

/**
 * Thin por distancia + tope duro. Si los puntos tienen `orden`, lo renumera 0..n-1.
 */
export function prepareTrackPointsForStorage<T extends WithOptionalOrden>(
  points: T[],
  maxPoints = MAX_TRACK_POINTS_DB,
  minSpacingM = MIN_POINT_SPACING_M,
): T[] {
  if (points.length === 0) return points;

  const thinned = thinByMinDistanceM(points, minSpacingM);
  const limited = limitTrackPoints(thinned, maxPoints);

  const shouldRenumber = points.some((p) => p.orden != null);
  if (!shouldRenumber) return limited;

  return limited.map((p, idx) => ({ ...p, orden: idx }));
}
