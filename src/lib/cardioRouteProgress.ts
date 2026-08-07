import { haversineM } from "@/lib/cardioGpsMotion";

export type RouteLatLng = { lat: number; lng: number };

export type CardioRouteProgress = {
  /** Longitud total de la polilínea (m). */
  totalM: number;
  /** Distancia a lo largo de la ruta hasta el punto más cercano (m). */
  alongM: number;
  /** Metros restantes hasta el final. */
  remainingM: number;
  /** 0–100. */
  percent: number;
  /** Distancia perpendicular al tramo más cercano (m). */
  offRouteM: number;
};

function clamp01(n: number): number {
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

/** Longitud acumulada de la polilínea (haversine). */
export function polylineLengthM(points: RouteLatLng[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineM(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Proyecta `position` sobre la polilínea y calcula progreso a lo largo de la ruta.
 */
export function computeRouteProgress(
  routePoints: RouteLatLng[],
  position: RouteLatLng | null | undefined,
): CardioRouteProgress | null {
  if (!routePoints.length || routePoints.length < 2) return null;

  const totalM = polylineLengthM(routePoints);
  if (totalM <= 0) {
    return { totalM: 0, alongM: 0, remainingM: 0, percent: 0, offRouteM: 0 };
  }

  if (!position) {
    return { totalM, alongM: 0, remainingM: totalM, percent: 0, offRouteM: 0 };
  }

  let bestDist = Infinity;
  let bestAlong = 0;
  let cum = 0;

  for (let i = 1; i < routePoints.length; i++) {
    const a = routePoints[i - 1];
    const b = routePoints[i];
    const segLen = haversineM(a, b);
    if (segLen <= 0) continue;

    // Proyección aproximada en el tramo (interpolación lineal en lat/lng).
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const len2 = dx * dx + dy * dy;
    const t =
      len2 > 0 ? clamp01(((position.lng - a.lng) * dx + (position.lat - a.lat) * dy) / len2) : 0;
    const proj = { lat: a.lat + dy * t, lng: a.lng + dx * t };
    const dist = haversineM(position, proj);

    if (dist < bestDist) {
      bestDist = dist;
      bestAlong = cum + segLen * t;
    }
    cum += segLen;
  }

  const alongM = Math.min(totalM, Math.max(0, bestAlong));
  const remainingM = Math.max(0, totalM - alongM);
  const percent = Math.round((alongM / totalM) * 1000) / 10;

  return {
    totalM,
    alongM,
    remainingM,
    percent,
    offRouteM: Number.isFinite(bestDist) ? bestDist : 0,
  };
}
