import { MAP_COLORS } from "@/lib/stravaDarkMapStyle";

export type RouteThumbPoint = { lat: number; lng: number };

/** Reduce puntos para un SVG de miniatura sin perder la forma del recorrido. */
export function downsampleRoutePoints(
  points: RouteThumbPoint[],
  maxPoints = 80,
): RouteThumbPoint[] {
  if (points.length <= maxPoints) return points;
  const out: RouteThumbPoint[] = [];
  const last = points.length - 1;
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round((i / (maxPoints - 1)) * last);
    out.push(points[idx]);
  }
  return out;
}

export type RouteThumbGeometry = {
  viewBox: string;
  pathD: string;
  start: { x: number; y: number } | null;
  end: { x: number; y: number } | null;
};

/**
 * Proyecta lat/lng a un viewBox SVG con padding. Y invertida (norte arriba).
 */
export function buildRouteThumbGeometry(
  points: RouteThumbPoint[],
  opts?: { width?: number; height?: number; padding?: number },
): RouteThumbGeometry | null {
  if (points.length < 2) return null;

  const width = opts?.width ?? 320;
  const height = opts?.height ?? 160;
  const padding = opts?.padding ?? 18;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  const latSpan = Math.max(maxLat - minLat, 1e-5);
  const lngSpan = Math.max(maxLng - minLng, 1e-5);
  const midLat = (minLat + maxLat) / 2;
  // Compensa la contracción longitudinal cerca de los polos.
  const lngScale = Math.cos((midLat * Math.PI) / 180);
  const aspect = width / height;
  const dataAspect = (lngSpan * lngScale) / latSpan;

  let usedLngSpan = lngSpan;
  let usedLatSpan = latSpan;
  if (dataAspect > aspect) {
    usedLatSpan = (lngSpan * lngScale) / aspect;
  } else {
    usedLngSpan = (latSpan * aspect) / lngScale;
  }

  const padLng = (usedLngSpan - lngSpan) / 2;
  const padLat = (usedLatSpan - latSpan) / 2;
  const x0 = minLng - padLng;
  const y0 = minLat - padLat;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const project = (p: RouteThumbPoint) => {
    const x = padding + ((p.lng - x0) / usedLngSpan) * innerW;
    const y = padding + (1 - (p.lat - y0) / usedLatSpan) * innerH;
    return { x, y };
  };

  const projected = points.map(project);
  const pathD = projected
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");

  return {
    viewBox: `0 0 ${width} ${height}`,
    pathD,
    start: projected[0] ?? null,
    end: projected[projected.length - 1] ?? null,
  };
}

export const ROUTE_THUMB_COLORS = {
  land: MAP_COLORS.land,
  landSoft: "#2a3134",
  green: MAP_COLORS.greenSoft,
  route: MAP_COLORS.route,
  routeCasing: "rgba(0,0,0,0.55)",
  start: MAP_COLORS.start,
  end: MAP_COLORS.route,
} as const;
