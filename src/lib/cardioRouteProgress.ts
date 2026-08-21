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

export type ComputeRouteProgressOptions = {
  /** Progreso previo (m). Si existe, limita la búsqueda a una ventana y evita saltos atrás. */
  previousAlongM?: number | null;
};

/** Margen lateral típico GPS + desfase mapa/senda. */
export const ON_ROUTE_MAX_M = 40;
/** Ventana hacia delante desde el progreso previo. */
export const LOOK_AHEAD_M = 600;
/** Ventana hacia atrás para absorber jitter GPS. */
export const LOOK_BEHIND_M = 80;
/** Retroceso máximo permitido respecto al progreso previo. */
export const MAX_BACKTRACK_M = 25;

/** Metros por grado de latitud (aprox. WGS84). */
const M_PER_DEG_LAT = 111_320;

function clamp01(n: number): number {
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

function toLocalXY(p: RouteLatLng, lat0Rad: number): { x: number; y: number } {
  const cosLat = Math.cos(lat0Rad);
  return {
    x: p.lng * M_PER_DEG_LAT * cosLat,
    y: p.lat * M_PER_DEG_LAT,
  };
}

/**
 * Proyecta `position` sobre el segmento [a,b] en métrica equirectangular local.
 * Devuelve parámetro t ∈ [0,1] y distancia perpendicular en metros.
 */
export function projectOntoSegment(
  a: RouteLatLng,
  b: RouteLatLng,
  position: RouteLatLng,
): { t: number; distM: number } {
  const lat0Rad = (((a.lat + b.lat) / 2) * Math.PI) / 180;
  const pa = toLocalXY(a, lat0Rad);
  const pb = toLocalXY(b, lat0Rad);
  const pp = toLocalXY(position, lat0Rad);
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? clamp01(((pp.x - pa.x) * dx + (pp.y - pa.y) * dy) / len2) : 0;
  const projX = pa.x + dx * t;
  const projY = pa.y + dy * t;
  const distM = Math.hypot(pp.x - projX, pp.y - projY);
  return { t, distM };
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
 * Distancia a persistir: el contador en vivo (nativo) si es > 0, si no la polilínea.
 * Evita guardar 0 cuando el GPS sí dejó puntos (p. ej. nativo en 0 tras bloquear pantalla).
 */
export function resolveRecordedDistanceM(
  liveM: number | null | undefined,
  points: RouteLatLng[],
): number {
  const live = liveM != null && Number.isFinite(liveM) && liveM > 0 ? liveM : 0;
  return Math.max(live, polylineLengthM(points));
}

function finishProgress(totalM: number, alongM: number, offRouteM: number): CardioRouteProgress {
  const clampedAlong = Math.min(totalM, Math.max(0, alongM));
  const remainingM = Math.max(0, totalM - clampedAlong);
  const percent = totalM > 0 ? Math.round((clampedAlong / totalM) * 1000) / 10 : 0;
  return {
    totalM,
    alongM: clampedAlong,
    remainingM,
    percent,
    offRouteM: Number.isFinite(offRouteM) ? offRouteM : 0,
  };
}

type MatchHit = { alongM: number; distM: number };

/** Penalización (m de “coste” por m de Δalong) para no saltar a tramos paralelos. */
const ALONG_CONTINUITY_WEIGHT = 0.05;

/**
 * Busca el mejor segmento. Si `window` está definido, solo considera segmentos
 * cuyo intervalo [cum, cum+segLen] intersecta [window.minM, window.maxM].
 * Con `preferAlongM`, prioriza continuidad frente a un tramo paralelo más cercano.
 */
function nearestAlongRoute(
  routePoints: RouteLatLng[],
  position: RouteLatLng,
  opts?: { window?: { minM: number; maxM: number }; preferAlongM?: number },
): MatchHit | null {
  let bestScore = Infinity;
  let bestDist = Infinity;
  let bestAlong = 0;
  let found = false;
  let cum = 0;
  const alongWeight = opts?.preferAlongM != null ? ALONG_CONTINUITY_WEIGHT : 0;

  for (let i = 1; i < routePoints.length; i++) {
    const a = routePoints[i - 1];
    const b = routePoints[i];
    const segLen = haversineM(a, b);
    if (segLen <= 0) continue;

    const segStart = cum;
    const segEnd = cum + segLen;
    cum = segEnd;

    if (opts?.window) {
      if (segEnd < opts.window.minM || segStart > opts.window.maxM) continue;
    }

    const { t, distM } = projectOntoSegment(a, b, position);
    const alongM = segStart + segLen * t;
    const alongDelta =
      opts?.preferAlongM != null ? Math.abs(alongM - opts.preferAlongM) : 0;
    const score = distM + alongWeight * alongDelta;
    if (score < bestScore) {
      bestScore = score;
      bestDist = distM;
      bestAlong = alongM;
      found = true;
    }
  }

  if (!found) return null;
  return { alongM: bestAlong, distM: bestDist };
}

/**
 * Proyecta `position` sobre la polilínea y calcula progreso a lo largo de la ruta.
 * Con `previousAlongM`, limita la búsqueda a una ventana y evita saltos atrás / a tramos paralelos.
 */
export function computeRouteProgress(
  routePoints: RouteLatLng[],
  position: RouteLatLng | null | undefined,
  options?: ComputeRouteProgressOptions,
): CardioRouteProgress | null {
  if (!routePoints.length || routePoints.length < 2) return null;

  const totalM = polylineLengthM(routePoints);
  if (totalM <= 0) {
    return { totalM: 0, alongM: 0, remainingM: 0, percent: 0, offRouteM: 0 };
  }

  const prev =
    options?.previousAlongM != null && Number.isFinite(options.previousAlongM)
      ? Math.min(totalM, Math.max(0, options.previousAlongM))
      : null;

  if (!position) {
    if (prev != null) {
      return finishProgress(totalM, prev, 0);
    }
    return { totalM, alongM: 0, remainingM: totalM, percent: 0, offRouteM: 0 };
  }

  // Bootstrap: matching global (primer fix o sin estado).
  if (prev == null) {
    const hit = nearestAlongRoute(routePoints, position);
    if (!hit) {
      return finishProgress(totalM, 0, 0);
    }
    return finishProgress(totalM, hit.alongM, hit.distM);
  }

  const window = {
    minM: Math.max(0, prev - LOOK_BEHIND_M),
    maxM: Math.min(totalM, prev + LOOK_AHEAD_M),
  };

  const hit = nearestAlongRoute(routePoints, position, {
    window,
    preferAlongM: prev,
  });

  // Off-route o sin candidato en ventana → congelar progreso.
  if (!hit || hit.distM > ON_ROUTE_MAX_M) {
    return finishProgress(totalM, prev, hit?.distM ?? ON_ROUTE_MAX_M + 1);
  }

  const minAlong = Math.max(0, prev - MAX_BACKTRACK_M);
  const alongM = Math.max(minAlong, hit.alongM);
  return finishProgress(totalM, alongM, hit.distM);
}
