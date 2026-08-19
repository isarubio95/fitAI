import { normalizeGymName } from "./gymDedup.mjs";

const MUNICIPAL_RE =
  /\b(centro\s+deportivo\s+municipal|centre\s+esportiu\s+municipal|polideportivo\s+municipal|poliesportiu\s+municipal|gimnasio\s+municipal|gimnas\s+municipal|cem|cdm)\b/;

const MUNICIPAL_WORD_RE = /\bmunicipal\b/;
const SPORT_SITE_RE =
  /\b(deportiv|esportiv|polideportiv|poliesportiv|gimnas|ximnasi|fitness|musculaci|kiroldeg|pabellon|pavello)\w*\b/;
const GYM_CORE_RE =
  /\b(polideportiv|poliesportiv|gimnas|ximnasi|fitness|musculaci|kiroldegi|centro deportivo|centre esportiu|complex esportiu|pabellon|pavello|cem|cdm)/;
const PITCH_ONLY_RE = /\b(campo de futbol|camp de futbol|pista de tenis|fronton|pilotaleku)\b/;
const PRIVATE_ORG_RE = /\b(club|federacio|federacion|penya|pena|associacio|asociacion)\b/;

/**
 * @param  {...(string | null | undefined)} parts
 */
export function isGymLikeFacilityName(...parts) {
  const text = normalizeGymName(parts.filter(Boolean).join(" "));
  if (!text) return false;
  if (GYM_CORE_RE.test(text) || isMunicipalFacilityName(text)) return true;
  if (PITCH_ONLY_RE.test(text)) return false;
  return false;
}

/**
 * @param {unknown} owner
 */
export function isPublicLocalOwner(owner) {
  const text = normalizeGymName(Array.isArray(owner) ? owner.join(" ") : String(owner ?? ""));
  return /\b(ayuntamiento|udala|administracion local|concello|ajuntament)\b/.test(text);
}

/**
 * @param {{
 *   provider: string,
 *   externalId: string | number,
 *   nombre: string,
 *   lat: number,
 *   lng: number,
 *   direccion?: string | null,
 *   ciudad?: string | null,
 * }} input
 */
export function opendataRow(input) {
  const nombre = String(input.nombre ?? "").trim();
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  const externalId = String(input.externalId ?? "").trim();
  if (!nombre || !externalId) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return {
    provider: input.provider.slice(0, 40),
    external_id: externalId.slice(0, 80),
    nombre: nombre.slice(0, 120),
    lat,
    lng,
    direccion: input.direccion?.trim() || null,
    ciudad: (input.ciudad?.trim() || null)?.slice(0, 80) ?? null,
    brand: null,
    source: "opendata",
    tipo: "municipal",
  };
}

/**
 * @param {unknown} geom
 * @returns {{ lat: number, lng: number } | null}
 */
export function pointFromGeoJson(geom) {
  if (!geom || typeof geom !== "object") return null;
  const type = geom.type;
  const coords = geom.coordinates;
  if (type === "Point" && Array.isArray(coords) && coords.length >= 2) {
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

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

/**
 * Censo autonómico de Euskadi (todas las localidades vascas).
 * @param {unknown} payload
 */
export function euskadiGymsFromJson(payload) {
  if (!Array.isArray(payload)) return [];
  const rows = [];
  const seen = new Set();
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const nombre = String(item.Nombre || "").trim();
    const ciudad = String(item.Municipio || "").trim();
    if (!isGymLikeFacilityName(nombre)) continue;

    const xy = item.Geoposición_XY && typeof item.Geoposición_XY === "object" ? item.Geoposición_XY : {};
    const lat = Number(xy.X);
    const lng = Number(xy.Y);
    const id = item.Codigo == null ? "" : String(item.Codigo);
    if (seen.has(id)) continue;
    const row = opendataRow({
      provider: "euskadi",
      externalId: id,
      nombre,
      lat,
      lng,
      direccion: String(item.Direccion || "").trim() || null,
      ciudad,
    });
    if (!row) continue;
    seen.add(id);
    rows.push(row);
  }
  return rows;
}

/**
 * GeoJSON oficial del censo (todas las localidades de Euskadi).
 * @param {unknown} geojson
 */
export function euskadiGymsFromGeoJson(geojson) {
  const features = geojson?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  const seen = new Set();
  for (const feature of features) {
    const props = feature?.properties && typeof feature.properties === "object" ? feature.properties : {};
    const nombre = String(props.nombre || props.nombrelugar || "").trim();
    if (!isGymLikeFacilityName(nombre, props.espaciodeportivo)) continue;
    const point = pointFromGeoJson(feature.geometry);
    if (!point) continue;
    const url = String(props.urlamigable || props.urlfisica || "");
    const fromUrl = url.match(/\/(\d{5,})(?:\/|$)/)?.[1];
    const id = String(feature.id ?? fromUrl ?? nombre);
    if (seen.has(id)) continue;
    const row = opendataRow({
      provider: "euskadi",
      externalId: id,
      nombre,
      lat: point.lat,
      lng: point.lng,
      direccion: String(props.direccion || "").trim() || null,
      ciudad: String(props.municipio || "").trim() || null,
    });
    if (!row) continue;
    seen.add(id);
    rows.push(row);
  }
  return rows;
}

/**
 * @param {unknown} geojson
 */
export function malagaGymsFromGeoJson(geojson) {
  const features = geojson?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  for (const feature of features) {
    const props = feature?.properties && typeof feature.properties === "object" ? feature.properties : {};
    const point = pointFromGeoJson(feature.geometry);
    if (!point) continue;
    const nombre = String(props.NOMBRE || "").trim();
    const row = opendataRow({
      provider: "malaga",
      externalId: props.ID ?? props.FID ?? nombre,
      nombre,
      lat: point.lat,
      lng: point.lng,
      direccion: String(props.DIRECCION || "").trim() || null,
      ciudad: "Málaga",
    });
    if (row) rows.push(row);
  }
  return rows;
}

/**
 * @param {unknown} geojson
 */
export function vigoGymsFromGeoJson(geojson) {
  const features = geojson?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  for (const feature of features) {
    const props = feature?.properties && typeof feature.properties === "object" ? feature.properties : {};
    const point = pointFromGeoJson(feature.geometry);
    if (!point) continue;
    const nombre = String(props.nombre || "").trim();
    const row = opendataRow({
      provider: "vigo",
      externalId: props.id ?? nombre,
      nombre,
      lat: Number(props.lat) || point.lat,
      lng: Number(props.lon) || point.lng,
      direccion: String(props.calle || "").trim() || null,
      ciudad: "Vigo",
    });
    if (row) rows.push(row);
  }
  return rows;
}

/**
 * @param {unknown} payload ArcGIS FeatureSet (outSR=4326)
 */
export function valenciaGymsFromArcGis(payload) {
  const features = payload?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  const seen = new Set();
  for (const feature of features) {
    const attrs = feature?.attributes && typeof feature.attributes === "object" ? feature.attributes : {};
    const geom = feature?.geometry && typeof feature.geometry === "object" ? feature.geometry : {};
    const nombre = String(attrs.equipamien || "").trim();
    const clase = String(attrs.clase || "");
    if (!/deport/i.test(clase) && !isGymLikeFacilityName(nombre)) continue;
    if (!isGymLikeFacilityName(nombre) && !/complejo|complex|instalaci/i.test(nombre)) continue;
    const id = String(attrs.identifica || attrs.objectid || "").trim();
    if (!id || seen.has(id)) continue;
    const row = opendataRow({
      provider: "valencia",
      externalId: id,
      nombre,
      lat: Number(geom.y),
      lng: Number(geom.x),
      direccion: null,
      ciudad: "Valencia",
    });
    if (!row) continue;
    seen.add(id);
    rows.push(row);
  }
  return rows;
}

/**
 * @param {unknown} geojson
 */
export function donostiaGymsFromGeoJson(geojson) {
  const features = geojson?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  for (const feature of features) {
    const props = feature?.properties && typeof feature.properties === "object" ? feature.properties : {};
    const point = pointFromGeoJson(feature.geometry);
    if (!point) continue;
    const nombre = String(props.NomEdifici || props.IzenEraiki || "").trim();
    const subtipo = String(props.Subtipo || props.AzpiMota || "");
    if (!isGymLikeFacilityName(nombre, subtipo)) continue;
    const row = opendataRow({
      provider: "donostia",
      externalId: props.Indizea ?? nombre,
      nombre,
      lat: point.lat,
      lng: point.lng,
      direccion: String(props.NomCalle || props.IzenKalea || "").trim() || null,
      ciudad: "Donostia / San Sebastián",
    });
    if (row) rows.push(row);
  }
  return rows;
}
