/**
 * Ajuste de tramos dibujados a caminos reales vía BRouter (público, sin API key).
 * Devuelve `null` ante cualquier fallo para que el llamante caiga en la línea recta.
 */

import { haversineM } from "@/lib/cardioGpsMotion";

export type SnapLatLng = { lat: number; lng: number };

export type SnappedPoint = {
  lat: number;
  lng: number;
  elevacion_m: number | null;
};

/** Perfiles de BRouter por tipo de actividad. */
const BROUTER_PROFILES = {
  foot: "hiking-beta",
  bike: "trekking",
} as const;

export type SnapProfile = keyof typeof BROUTER_PROFILES;

const BROUTER_URL = "https://brouter.de/brouter";
const REQUEST_TIMEOUT_MS = 12_000;
/** Por encima de esto el enrutado suele fallar o tardar demasiado: mejor recta. */
const MAX_LEG_DISTANCE_M = 80_000;

/** Disciplina de cardio → perfil de enrutado (null = sin caminos, p. ej. remo). */
export function snapProfileForDiscipline(codigo: string | null | undefined): SnapProfile | null {
  switch (codigo) {
    case "cycling":
      return "bike";
    case "running":
    case "walking":
      return "foot";
    case "rowing":
    case "swimming":
      return null;
    default:
      // Sin disciplina elegida asumimos ruta a pie, el caso más común.
      return codigo == null ? "foot" : null;
  }
}

type BRouterResponse = {
  features?: Array<{
    geometry?: { type?: string; coordinates?: number[][] };
  }>;
};

/**
 * Traza `from` → `to` siguiendo caminos. `null` si el servicio no responde,
 * no encuentra ruta o el tramo es demasiado largo.
 */
export async function snapRouteLeg(
  from: SnapLatLng,
  to: SnapLatLng,
  profile: SnapProfile,
  signal?: AbortSignal,
): Promise<SnappedPoint[] | null> {
  if (haversineM(from, to) > MAX_LEG_DISTANCE_M) return null;

  const url = new URL(BROUTER_URL);
  url.searchParams.set(
    "lonlats",
    `${from.lng.toFixed(6)},${from.lat.toFixed(6)}|${to.lng.toFixed(6)},${to.lat.toFixed(6)}`,
  );
  url.searchParams.set("profile", BROUTER_PROFILES[profile]);
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    // Ante un error de enrutado BRouter responde 200 con texto plano.
    const body = await res.text();
    let data: BRouterResponse;
    try {
      data = JSON.parse(body) as BRouterResponse;
    } catch {
      return null;
    }

    const coordinates = data.features?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

    const points: SnappedPoint[] = [];
    for (const position of coordinates) {
      const lng = Number(position?.[0]);
      const lat = Number(position?.[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const ele = Number(position?.[2]);
      points.push({ lat, lng, elevacion_m: Number.isFinite(ele) ? ele : null });
    }

    return points.length >= 2 ? points : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}
