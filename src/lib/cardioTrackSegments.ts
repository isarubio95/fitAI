/**
 * Un salto temporal grande entre puntos consecutivos significa que no hubo señal (túnel,
 * permiso revocado, GPS caído): unirlos con una recta inventa un recorrido que no ocurrió.
 */
export const TRACK_GAP_MS = 30_000;

type TimedPoint = {
  lat: number;
  lng: number;
  timestamp_utc?: string | null;
};

export type LngLat = [number, number];

/**
 * Parte el recorrido en tramos [lng, lat] cortando donde el hueco temporal supera maxGapMs.
 * Los puntos sin timestamp no cortan: se acumulan en el tramo abierto.
 */
export function splitTrackByTimeGaps(points: TimedPoint[], maxGapMs = TRACK_GAP_MS): LngLat[][] {
  const segments: LngLat[][] = [];
  let current: LngLat[] = [];
  let prevT: number | null = null;

  for (const p of points) {
    const parsed = p.timestamp_utc ? Date.parse(p.timestamp_utc) : NaN;
    const t = Number.isFinite(parsed) ? parsed : null;

    if (prevT != null && t != null && t - prevT > maxGapMs && current.length > 0) {
      segments.push(current);
      current = [];
    }

    current.push([p.lng, p.lat]);
    if (t != null) prevT = t;
  }

  if (current.length > 0) segments.push(current);
  return segments;
}
