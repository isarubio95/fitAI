const EARTH_RADIUS_KM = 6371;

const NAME_STOPWORDS = new Set([
  "el",
  "la",
  "los",
  "las",
  "de",
  "del",
  "i",
  "y",
  "the",
  "polideportivo",
  "poliesportiu",
  "pabellon",
  "pavello",
  "centro",
  "centre",
  "deportivo",
  "esportiu",
  "municipal",
  "gimnasio",
  "gimnas",
  "gym",
  "club",
  "cdm",
  "cem",
  "instalaciones",
  "instalacions",
  "complejo",
  "complex",
]);

/**
 * @param {string} value
 */
export function normalizeGymName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * @param {string} value
 * @returns {string[]}
 */
export function distinctiveNameTokens(value) {
  const normalized = normalizeGymName(value);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((token) => token.length > 1 && !NAME_STOPWORDS.has(token));
}

/**
 * @param {string} a
 * @param {string} b
 */
export function namesLookSimilar(a, b) {
  const na = normalizeGymName(a);
  const nb = normalizeGymName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  const ta = distinctiveNameTokens(a);
  const tb = distinctiveNameTokens(b);
  if (ta.length === 0 || tb.length === 0) return false;

  const setB = new Set(tb);
  const overlap = ta.filter((token) => setB.has(token)).length;
  const union = new Set([...ta, ...tb]).size;
  if (union === 0) return false;
  if (overlap === Math.min(ta.length, tb.length) && overlap >= 1) return true;
  return overlap / union >= 0.5;
}

/**
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 */
export function haversineMeters(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * 1000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * @typedef {{ id?: string, nombre: string, lat: number, lng: number, direccion?: string | null, ciudad?: string | null }} GymPoint
 */

/**
 * @param {GymPoint} candidate
 * @param {GymPoint[]} existing
 * @param {{ maxMeters?: number }} [options]
 * @returns {GymPoint | null}
 */
export function findNearbyDuplicate(candidate, existing, options = {}) {
  const maxMeters = options.maxMeters ?? 80;
  // Pre-filter by bounding box (1 degree lat ≈ 111 km, so maxMeters/111000 degrees)
  const latDelta = maxMeters / 111000;
  const lngDelta = maxMeters / (111000 * Math.cos((candidate.lat * Math.PI) / 180));
  const minLat = candidate.lat - latDelta;
  const maxLat = candidate.lat + latDelta;
  const minLng = candidate.lng - lngDelta;
  const maxLng = candidate.lng + lngDelta;
  let best = null;
  let bestDistance = Infinity;
  for (const gym of existing) {
    if (!Number.isFinite(gym.lat) || !Number.isFinite(gym.lng)) continue;
    // Cheap bbox reject before string comparison
    if (gym.lat < minLat || gym.lat > maxLat || gym.lng < minLng || gym.lng > maxLng) continue;
    if (!namesLookSimilar(candidate.nombre, gym.nombre)) continue;
    const meters = haversineMeters(candidate, gym);
    if (meters <= maxMeters && meters < bestDistance) {
      best = gym;
      bestDistance = meters;
    }
  }
  return best;
}

/**
 * @param {GymPoint} existing
 * @param {GymPoint} incoming
 */
export function addressPatchFromIncoming(existing, incoming) {
  const patch = {};
  if (!existing.direccion && incoming.direccion) patch.direccion = incoming.direccion;
  if (!existing.ciudad && incoming.ciudad) patch.ciudad = incoming.ciudad;
  return patch;
}
