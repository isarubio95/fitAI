/** Filtros compartidos del listado de rutas (predefinidas / mías). */

export type RouteDistanceBucket = "all" | "short" | "medium" | "long" | "xl";
export type RouteDifficultyFilter = "all" | "easy" | "moderate" | "difficult";
export type RouteSortId = "popular" | "distance_asc" | "distance_desc" | "elevation_desc";

export type RouteListFilters = {
  q: string;
  distance: RouteDistanceBucket;
  difficulty: RouteDifficultyFilter;
  sort: RouteSortId;
  /** Solo cycling: mtb | racebike | touringbicycle | all */
  sport: string;
};

export const DEFAULT_ROUTE_LIST_FILTERS: RouteListFilters = {
  q: "",
  distance: "all",
  difficulty: "all",
  sort: "popular",
  sport: "all",
};

export const ROUTE_DISTANCE_OPTIONS: Array<{ id: RouteDistanceBucket; label: string }> = [
  { id: "all", label: "Cualquiera" },
  { id: "short", label: "< 10 km" },
  { id: "medium", label: "10–25 km" },
  { id: "long", label: "25–50 km" },
  { id: "xl", label: "+50 km" },
];

export const ROUTE_DIFFICULTY_OPTIONS: Array<{ id: RouteDifficultyFilter; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "easy", label: "Fácil" },
  { id: "moderate", label: "Media" },
  { id: "difficult", label: "Difícil" },
];

export const ROUTE_SORT_OPTIONS: Array<{ id: RouteSortId; label: string }> = [
  { id: "popular", label: "Populares" },
  { id: "distance_asc", label: "Más cortas" },
  { id: "distance_desc", label: "Más largas" },
  { id: "elevation_desc", label: "Más desnivel" },
];

export const CYCLING_SPORT_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "racebike", label: "Carretera" },
  { id: "touringbicycle", label: "Touring" },
  { id: "mtb", label: "MTB" },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesDistanceBucket(
  distanceM: number | null | undefined,
  bucket: RouteDistanceBucket,
): boolean {
  if (bucket === "all") return true;
  if (distanceM == null || !(distanceM > 0)) return false;
  const km = distanceM / 1000;
  switch (bucket) {
    case "short":
      return km < 10;
    case "medium":
      return km >= 10 && km < 25;
    case "long":
      return km >= 25 && km < 50;
    case "xl":
      return km >= 50;
    default:
      return true;
  }
}

export function routeListFiltersActive(filters: RouteListFilters, opts?: { showSport?: boolean }): boolean {
  return (
    !!filters.q.trim() ||
    filters.distance !== "all" ||
    filters.difficulty !== "all" ||
    filters.sort !== "popular" ||
    (opts?.showSport && filters.sport !== "all")
  );
}

export type RouteFilterable = {
  name: string;
  distanceM: number | null | undefined;
  elevationUpM: number | null | undefined;
  difficulty?: string | null;
  sport?: string | null;
  visitors?: number | null;
  ratingScore?: number | null;
};

export function applyRouteListFilters<T extends RouteFilterable>(
  items: T[],
  filters: RouteListFilters,
  opts?: { useDifficulty?: boolean; useSport?: boolean; usePopularity?: boolean },
): T[] {
  const q = normalizeText(filters.q);
  const useDifficulty = opts?.useDifficulty ?? false;
  const useSport = opts?.useSport ?? false;
  const usePopularity = opts?.usePopularity ?? true;

  const filtered = items.filter((item) => {
    if (q) {
      const name = normalizeText(item.name);
      if (!name.includes(q)) return false;
    }
    if (!matchesDistanceBucket(item.distanceM, filters.distance)) return false;
    if (useDifficulty && filters.difficulty !== "all") {
      if ((item.difficulty ?? "").toLowerCase() !== filters.difficulty) return false;
    }
    if (useSport && filters.sport !== "all") {
      if (item.sport !== filters.sport) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case "distance_asc":
        return (a.distanceM ?? Number.POSITIVE_INFINITY) - (b.distanceM ?? Number.POSITIVE_INFINITY);
      case "distance_desc":
        return (b.distanceM ?? -1) - (a.distanceM ?? -1);
      case "elevation_desc":
        return (b.elevationUpM ?? -1) - (a.elevationUpM ?? -1);
      case "popular":
      default: {
        if (!usePopularity) {
          return (b.distanceM ?? -1) - (a.distanceM ?? -1);
        }
        const va = Number(a.visitors) || 0;
        const vb = Number(b.visitors) || 0;
        if (vb !== va) return vb - va;
        return (Number(b.ratingScore) || 0) - (Number(a.ratingScore) || 0);
      }
    }
  });

  return sorted;
}
