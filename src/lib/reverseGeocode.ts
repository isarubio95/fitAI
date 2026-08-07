/** Reverse geocoding (Photon / Komoot) → «Ciudad, Región». */

export type CityRegionLabel = {
  city: string;
  region: string | null;
  /** P. ej. `Logroño, La Rioja` */
  label: string;
};

const PHOTON_URL = "https://photon.komoot.io/reverse";

type PhotonProps = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  locality?: string;
  district?: string;
  county?: string;
  state?: string;
  region?: string;
  name?: string;
};

function pickCity(p: PhotonProps): string | null {
  return p.city || p.town || p.village || p.municipality || p.locality || p.district || p.name || null;
}

function pickRegion(p: PhotonProps): string | null {
  return p.state || p.region || p.county || null;
}

export function formatCityRegionLabel(city: string, region: string | null): string {
  if (!region || region === city) return city;
  return `${city}, ${region}`;
}

/**
 * Reverse geocode lat/lng vía Photon (CORS ok en cliente).
 * Cachea en el caller (react-query).
 */
export async function reverseGeocodeCityRegion(
  lat: number,
  lng: number,
): Promise<CityRegionLabel | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const url = new URL(PHOTON_URL);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("lang", "es");

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    features?: Array<{ properties?: PhotonProps }>;
  };
  const props = data.features?.[0]?.properties;
  if (!props) return null;

  const city = pickCity(props);
  if (!city) return null;
  const region = pickRegion(props);

  return {
    city,
    region,
    label: formatCityRegionLabel(city, region),
  };
}

/** Redondeo para clave de cache (~110 m). */
export function geocodeCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}
