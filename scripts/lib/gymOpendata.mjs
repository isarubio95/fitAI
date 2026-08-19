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
  if (type === "MultiPoint" && Array.isArray(coords?.[0]) && coords[0].length >= 2) {
    const lng = Number(coords[0][0]);
    const lat = Number(coords[0][1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  if (type === "Polygon" && Array.isArray(coords?.[0])) {
    return ringCentroid(coords[0]);
  }
  if (type === "MultiPolygon" && Array.isArray(coords?.[0]?.[0])) {
    return ringCentroid(coords[0][0]);
  }
  return null;
}

/**
 * @param {unknown[]} ring
 */
function ringCentroid(ring) {
  if (!Array.isArray(ring) || ring.length === 0) return null;
  let latSum = 0;
  let lngSum = 0;
  let n = 0;
  for (const pair of ring) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const lng = Number(pair[0]);
    const lat = Number(pair[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    latSum += lat;
    lngSum += lng;
    n += 1;
  }
  if (n === 0) return null;
  return { lat: latSum / n, lng: lngSum / n };
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

/**
 * UTM zona 30N (ETRS89/WGS84) → lat/lng. Usado por Zaragoza y otros catálogos municipales.
 * @param {number} easting
 * @param {number} northing
 */
export function utmZone30ToWgs84(easting, northing) {
  const x = easting - 500000;
  const a = 6378137;
  const e = 0.081819191;
  const k0 = 0.9996;
  const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
  const m = northing / k0;
  const mu =
    m / (a * (1 - (e * e) / 4 - (3 * e ** 4) / 64 - (5 * e ** 6) / 256));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);
  const n1 = a / Math.sqrt(1 - e * e * Math.sin(phi1) ** 2);
  const t1 = Math.tan(phi1) ** 2;
  const c1 = (e * e * Math.cos(phi1) ** 2) / (1 - e * e);
  const r1 = (a * (1 - e * e)) / (1 - e * e * Math.sin(phi1) ** 2) ** 1.5;
  const d = x / (n1 * k0);
  const lat =
    phi1 -
    ((n1 * Math.tan(phi1)) / r1) *
      (d ** 2 / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * c1 * t1) * d ** 4) / 24 +
        ((61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * (e * e) / (1 - e * e) - 3 * c1 ** 2) *
          d ** 6) /
          720);
  const lon =
    (d -
      ((1 + 2 * t1 + c1) * d ** 3) / 6 +
      ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * (e * e) / (1 - e * e) + 24 * t1 ** 2) *
        d ** 5) /
        120) /
    Math.cos(phi1);
  const lon0 = ((30 - 1) * 6 - 180 + 3) * (Math.PI / 180);
  return { lat: (lat * 180) / Math.PI, lng: ((lon0 + lon) * 180) / Math.PI };
}

/**
 * @param {number} x
 * @param {number} y
 */
export function projectedOrLonLat(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (Math.abs(y) <= 90 && Math.abs(x) <= 180) return { lat: y, lng: x };
  return utmZone30ToWgs84(x, y);
}

function propText(props, ...keys) {
  if (!props || typeof props !== "object") return "";
  for (const key of keys) {
    const value = props[key];
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

const OFFICE_RE = /\b(oficinas?|administrativ)\b/;

/**
 * API REST Zaragoza (categoría 56: centros deportivos). Geometría en UTM30.
 * @param {unknown} payload
 */
export function zaragozaGymsFromCategory(payload) {
  const items = payload?.equipamiento;
  if (!Array.isArray(items)) return [];
  const rows = [];
  const seen = new Set();
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const nombre = String(item.title || "").trim();
    if (!nombre || OFFICE_RE.test(normalizeGymName(nombre))) continue;
    if (!isGymLikeFacilityName(nombre) && !/^(cdm|centro deportivo|pabellon)/i.test(nombre)) {
      continue;
    }
    const geom = item.geometry && typeof item.geometry === "object" ? item.geometry : {};
    const coords = Array.isArray(geom.coordinates) ? geom.coordinates : [];
    const point = projectedOrLonLat(Number(coords[0]), Number(coords[1]));
    if (!point) continue;
    const id = String(item.id ?? "").trim();
    if (!id || seen.has(id)) continue;
    const row = opendataRow({
      provider: "zaragoza",
      externalId: id,
      nombre,
      lat: point.lat,
      lng: point.lng,
      direccion: String(item.calle || "").trim() || null,
      ciudad: "Zaragoza",
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
export function cordobaGymsFromGeoJson(geojson) {
  const features = geojson?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  for (const feature of features) {
    const props = feature?.properties && typeof feature.properties === "object" ? feature.properties : {};
    const point = pointFromGeoJson(feature.geometry);
    if (!point) continue;
    const nombre = propText(props, "name", "NOMBRE", "Nombre");
    if (!nombre || OFFICE_RE.test(normalizeGymName(nombre))) continue;
    const tipo = propText(props, "Tipo de Equipamiento");
    if (
      !isGymLikeFacilityName(nombre) &&
      !/\bcd\b/.test(normalizeGymName(nombre)) &&
      !/instalacion deportiva/i.test(tipo)
    ) {
      continue;
    }
    const row = opendataRow({
      provider: "cordoba",
      externalId: propText(props, "ID", "id") || nombre,
      nombre,
      lat: point.lat,
      lng: point.lng,
      direccion: propText(props, "Dirección", "DIRECCION", "direccion") || null,
      ciudad: "Córdoba",
    });
    if (row) rows.push(row);
  }
  return rows;
}

/**
 * @param {unknown} geojson
 */
export function santaCruzGymsFromGeoJson(geojson) {
  const features = geojson?.features;
  if (!Array.isArray(features)) return [];
  const rows = [];
  for (const feature of features) {
    const props = feature?.properties && typeof feature.properties === "object" ? feature.properties : {};
    const point = pointFromGeoJson(feature.geometry);
    if (!point) continue;
    const nombre = propText(props, "NOMBRE", "nombre", "name");
    if (!isGymLikeFacilityName(nombre)) continue;
    const row = opendataRow({
      provider: "santacruz",
      externalId: propText(props, "GEOCODIGO", "id") || nombre,
      nombre,
      lat: Number(props.GRAD_Y) || point.lat,
      lng: Number(props.GRAD_X) || point.lng,
      direccion: null,
      ciudad: "Santa Cruz de Tenerife",
    });
    if (row) rows.push(row);
  }
  return rows;
}
