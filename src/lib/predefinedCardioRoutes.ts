import { parseRouteFileContent } from "@/lib/routeFileImport";
import type { SelectedCardioRoute } from "@/types/cardio";

export type KomootSport =
  | "hike"
  | "jogging"
  | "mtb"
  | "racebike"
  | "touringbicycle";

export type PredefinedRouteSummary = {
  id: string;
  discoverId: string;
  name: string;
  sport: KomootSport | string;
  distanceM: number | null;
  elevationUpM: number | null;
  visitors: number;
  ratingScore: number | null;
  difficulty: string | null;
  gpx: string | null;
  popularityRank: number | null;
  url: string | null;
};

type PredefinedCatalog = {
  tours: PredefinedRouteSummary[];
};

const CATALOG_URL = "/predefined-routes/la-rioja/index.json";
const ASSET_BASE = "/predefined-routes/la-rioja";

/** Prefijo de id para no chocar con UUIDs de cardio_ruta. */
export const PREDEFINED_ROUTE_ID_PREFIX = "predefined:la-rioja:";

export function predefinedRouteId(komootId: string): string {
  return `${PREDEFINED_ROUTE_ID_PREFIX}${komootId}`;
}

export function isPredefinedRouteId(id: string | null | undefined): boolean {
  return !!id && id.startsWith(PREDEFINED_ROUTE_ID_PREFIX);
}

/**
 * Disciplina de la app → deportes Komoot del catálogo.
 * cycling incluye carretera, touring y MTB.
 */
export function komootSportsForDiscipline(codigo: string | null | undefined): KomootSport[] {
  switch (codigo) {
    case "running":
      return ["jogging"];
    case "walking":
      return ["hike"];
    case "cycling":
      return ["racebike", "touringbicycle", "mtb"];
    default:
      return [];
  }
}

let catalogPromise: Promise<PredefinedCatalog> | null = null;

export function loadPredefinedCatalog(): Promise<PredefinedCatalog> {
  if (!catalogPromise) {
    catalogPromise = fetch(CATALOG_URL)
      .then(async (res) => {
        if (!res.ok) throw new Error(`No se pudo cargar el catálogo (${res.status})`);
        return (await res.json()) as PredefinedCatalog;
      })
      .catch((err) => {
        catalogPromise = null;
        throw err;
      });
  }
  return catalogPromise;
}

export function filterPredefinedByDiscipline(
  tours: PredefinedRouteSummary[],
  disciplinaCodigo: string | null | undefined,
  limit?: number,
): PredefinedRouteSummary[] {
  const sports = new Set(komootSportsForDiscipline(disciplinaCodigo));
  if (sports.size === 0) return [];

  const filtered = tours
    .filter((t) => sports.has(t.sport as KomootSport) && t.gpx)
    .sort((a, b) => {
      const va = Number(a.visitors) || 0;
      const vb = Number(b.visitors) || 0;
      if (vb !== va) return vb - va;
      return (Number(b.ratingScore) || 0) - (Number(a.ratingScore) || 0);
    });

  return limit != null ? filtered.slice(0, limit) : filtered;
}

export async function loadPredefinedRouteAsSelected(
  tour: PredefinedRouteSummary,
): Promise<SelectedCardioRoute> {
  if (!tour.gpx) throw new Error("Esta ruta no tiene archivo GPX");
  const url = `${ASSET_BASE}/${tour.gpx.replace(/^\/+/, "")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar la ruta (${res.status})`);
  const text = await res.text();
  const fileName = tour.gpx.split("/").pop() ?? "route.gpx";
  const parsed = parseRouteFileContent(text, fileName);

  return {
    id: predefinedRouteId(tour.id),
    nombre: tour.name,
    distancia_total_m: tour.distanceM,
    elevacion_positiva_m: tour.elevationUpM,
    points: parsed.points.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      elevacion_m: p.elevacion_m ?? null,
    })),
  };
}
