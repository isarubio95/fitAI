import { normalizeGymName } from "./gymDedup.mjs";

const MUNICIPAL_RE =
  /\b(centro\s+deportivo\s+municipal|centre\s+esportiu\s+municipal|polideportivo\s+municipal|poliesportiu\s+municipal|gimnasio\s+municipal|gimnas\s+municipal|cem|cdm)\b/;

const MUNICIPAL_WORD_RE = /\bmunicipal\b/;
const SPORT_SITE_RE = /\b(deportiv|esportiv|polideportiv|poliesportiv|gimnas|fitness|musculaci)\w*\b/;
const PRIVATE_ORG_RE = /\b(club|federacio|federacion|penya|pena|associacio|asociacion)\b/;

/**
 * @param  {...(string | null | undefined)} parts
 */
export function isMunicipalFacilityName(...parts) {
  const text = normalizeGymName(parts.filter(Boolean).join(" "));
  if (!text) return false;
  if (MUNICIPAL_RE.test(text)) return true;
  if (MUNICIPAL_WORD_RE.test(text) && SPORT_SITE_RE.test(text)) return true;
  return false;
}

/**
 * @param {{ name?: string | null, institutionName?: string | null }} row
 */
export function isBarcelonaMunicipalFacility(row) {
  const institution = row.institutionName ?? "";
  const name = row.name ?? "";
  if (isMunicipalFacilityName(institution, name)) return true;
  const combined = normalizeGymName(`${institution} ${name}`);
  if (PRIVATE_ORG_RE.test(combined) && !MUNICIPAL_WORD_RE.test(combined)) return false;
  return false;
}

/**
 * @param {unknown} graph
 */
export function madridGymsFromGraph(graph) {
  if (!Array.isArray(graph)) return [];
  const seen = new Set();
  const rows = [];
  for (const item of graph) {
    if (!item || typeof item !== "object") continue;
    const rawId = item.id ?? item["@id"];
    const id = rawId == null ? "" : String(rawId).trim();
    if (!id || seen.has(id)) continue;

    const location = item.location && typeof item.location === "object" ? item.location : {};
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const address = item.address && typeof item.address === "object" ? item.address : {};
    const org = item.organization && typeof item.organization === "object" ? item.organization : {};
    const nombre = String(item.title || org["organization-name"] || "").trim();
    if (!nombre) continue;

    seen.add(id);
    const street = String(address["street-address"] || "").trim() || null;
    const locality = String(address.locality || "Madrid").trim() || "Madrid";

    rows.push({
      provider: "madrid",
      external_id: id.slice(0, 80),
      nombre: nombre.slice(0, 120),
      lat,
      lng,
      direccion: street,
      ciudad: locality.slice(0, 80),
      brand: null,
      source: "opendata",
      tipo: "municipal",
    });
  }
  return rows;
}

/**
 * @param {unknown} records
 */
export function barcelonaGymsFromRecords(records) {
  if (!Array.isArray(records)) return [];
  const byInstitution = new Map();
  for (const item of records) {
    if (!item || typeof item !== "object") continue;
    const institutionName = String(item.institution_name || "").trim();
    const name = String(item.name || "").trim();
    if (!isBarcelonaMunicipalFacility({ name, institutionName })) continue;

    const lat = Number(item.geo_epgs_4326_lat);
    const lng = Number(item.geo_epgs_4326_lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const registerId = String(item.register_id || "")
      .replace(/^\uFEFF/, "")
      .trim();
    const institutionId = item.institution_id == null ? "" : String(item.institution_id).trim();
    const key = institutionId || registerId;
    if (!key) continue;

    const nombre = (institutionName || name).slice(0, 120);
    if (!nombre) continue;

    const streetName = String(item.addresses_road_name || "").trim();
    const streetNumber = item.addresses_start_street_number;
    const direccion = streetName
      ? `${streetName}${streetNumber != null && String(streetNumber).trim() ? ` ${streetNumber}` : ""}`.trim()
      : null;
    const ciudad = String(item.addresses_town || "Barcelona").trim() || "Barcelona";

    if (!byInstitution.has(key)) {
      byInstitution.set(key, {
        provider: "barcelona",
        external_id: key.slice(0, 80),
        nombre,
        lat,
        lng,
        direccion,
        ciudad: ciudad.slice(0, 80),
        brand: null,
        source: "opendata",
        tipo: "municipal",
      });
    }
  }
  return [...byInstitution.values()];
}
