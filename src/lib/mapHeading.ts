import { haversineM } from "@/lib/cardioGpsMotion";

/** Orientación del mapa: seguir la dirección del móvil o dejar el norte arriba. */
export type MapOrientationMode = "heading" | "north";

/** Preferencia de orientación del mapa (localStorage). Ausente = seguir dirección. */
export const CARDIO_MAP_ORIENTATION_STORAGE_KEY = "gym-log-cardioMapOrientation";

export function readCardioMapOrientation(): MapOrientationMode {
  try {
    return localStorage.getItem(CARDIO_MAP_ORIENTATION_STORAGE_KEY) === "north"
      ? "north"
      : "heading";
  } catch {
    return "heading";
  }
}

export function writeCardioMapOrientation(mode: MapOrientationMode): void {
  try {
    localStorage.setItem(CARDIO_MAP_ORIENTATION_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

type LatLng = { lat: number; lng: number };

/** Grados 0-360, con 0 = norte. */
export function normalizeHeading(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return ((deg % 360) + 360) % 360;
}

/** Diferencia angular en el rango (-180, 180]: el camino corto entre dos rumbos. */
export function shortestAngleDelta(from: number, to: number): number {
  const delta = normalizeHeading(to) - normalizeHeading(from);
  if (delta > 180) return delta - 360;
  if (delta <= -180) return delta + 360;
  return delta;
}

/** Rumbo inicial (0-360) del trayecto de `a` a `b`. */
export function bearingBetween(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return normalizeHeading((Math.atan2(y, x) * 180) / Math.PI);
}

/**
 * Rumbo del movimiento a partir del track: retrocede desde el último punto hasta acumular
 * `minDistanceM` para que el ruido del GPS no marque la dirección. null si no hay recorrido
 * suficiente (p. ej. parado).
 */
export function courseFromPoints(points: LatLng[], minDistanceM = 8): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  let accumulated = 0;
  for (let i = points.length - 2; i >= 0; i--) {
    accumulated += haversineM(points[i], points[i + 1]);
    if (accumulated >= minDistanceM) return bearingBetween(points[i], last);
  }
  return null;
}

/** Filtro paso bajo circular: acerca `prev` a `next` por el camino corto. */
export function smoothHeading(prev: number | null, next: number, factor = 0.25): number {
  const target = normalizeHeading(next);
  if (prev == null) return target;
  return normalizeHeading(normalizeHeading(prev) + shortestAngleDelta(prev, target) * factor);
}
