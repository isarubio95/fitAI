import type { RouteThumbPoint } from "@/lib/routeMapThumb";

const snapshotCache = new Map<string, string>();
const listeners = new Set<() => void>();

/** Clave estable para cachear la captura del mapa (no hace falta hashear todos los puntos). */
export function routeThumbCacheKey(points: RouteThumbPoint[]): string {
  if (points.length < 2) return "empty";
  const a = points[0];
  const b = points[Math.floor(points.length / 2)];
  const c = points[points.length - 1];
  return [
    points.length,
    a.lat.toFixed(5),
    a.lng.toFixed(5),
    b.lat.toFixed(5),
    b.lng.toFixed(5),
    c.lat.toFixed(5),
    c.lng.toFixed(5),
  ].join(":");
}

export function getRouteThumbSnapshot(key: string): string | undefined {
  return snapshotCache.get(key);
}

export function setRouteThumbSnapshot(key: string, dataUrl: string): void {
  snapshotCache.set(key, dataUrl);
  listeners.forEach((listener) => listener());
}

/** Notifica cuando entra una captura nueva (p. ej. prefetch en background). */
export function subscribeRouteThumbCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
