import type { GimnasioCatalogItem } from "@/types/gimnasio";

const EARTH_RADIUS_KM = 6371;

export type GeoPoint = { lat: number; lng: number };

export type RankedGimnasio = GimnasioCatalogItem & {
  distanceKm: number | null;
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatGymDistance(km: number | null): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function gymMatchesQuery(gym: GimnasioCatalogItem, query: string): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const haystack = normalizeSearchText(
    [gym.nombre, gym.ciudad, gym.brand, gym.direccion].filter(Boolean).join(" "),
  );
  return haystack.includes(q);
}

/** Nombres que aparecen más de una vez (p. ej. Basic-Fit en varias calles). */
export function duplicateGymNames(gyms: Array<{ nombre: string }>): Set<string> {
  const counts = new Map<string, number>();
  for (const gym of gyms) {
    const key = normalizeSearchText(gym.nombre);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const duplicates = new Set<string>();
  for (const [key, count] of counts) {
    if (count > 1) duplicates.add(key);
  }
  return duplicates;
}

/**
 * Título de listado: «Basic-Fit (Calle Mayor 12)».
 * Si no hay calle, usa la ciudad cuando el nombre se repite o hay marca.
 */
export function formatGimnasioListTitle(
  gym: Pick<GimnasioCatalogItem, "nombre" | "direccion" | "ciudad" | "brand">,
  duplicateNames?: Set<string>,
): string {
  const nombre = gym.nombre.trim();
  const street = gym.direccion?.trim() || null;
  const city = gym.ciudad?.trim() || null;
  const isFranchise =
    Boolean(gym.brand?.trim()) ||
    (duplicateNames?.has(normalizeSearchText(nombre)) ?? false);
  const qualifier = street || (isFranchise ? city : null);
  if (!qualifier) return nombre;
  if (normalizeSearchText(nombre).includes(normalizeSearchText(qualifier))) return nombre;
  return `${nombre} (${qualifier})`;
}

export function rankGimnasios(
  gyms: GimnasioCatalogItem[],
  options: {
    query?: string;
    origin?: GeoPoint | null;
    recentId?: string | null;
    limit?: number;
  } = {},
): RankedGimnasio[] {
  const query = options.query?.trim() ?? "";
  const origin = options.origin ?? null;
  const recentId = options.recentId ?? null;
  const limit = options.limit ?? 40;

  const matched = gyms.filter((gym) => gymMatchesQuery(gym, query)).map((gym) => ({
    ...gym,
    distanceKm: origin ? haversineKm(origin, { lat: gym.lat, lng: gym.lng }) : null,
  }));

  matched.sort((a, b) => {
    if (recentId) {
      if (a.id === recentId && b.id !== recentId) return -1;
      if (b.id === recentId && a.id !== recentId) return 1;
    }
    if (origin) {
      return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
    }
    return a.nombre.localeCompare(b.nombre, "es");
  });

  return matched.slice(0, limit);
}
