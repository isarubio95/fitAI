import { inferGymTipo, shouldImportOsmTags, tagString } from "./gymOsm.mjs";

/**
 * @param {Record<string, unknown> | null | undefined} tags
 * @param  {...string} keys
 */
export function tagText(tags, ...keys) {
  if (!tags) return null;
  for (const key of keys) {
    const value = tagString(/** @type {string | undefined} */ (tags[key]));
    if (value) return value;
  }
  return null;
}

/**
 * @param {{ type?: string, id?: number, lat?: number, lon?: number, center?: { lat?: number, lon?: number }, tags?: Record<string, string> }} el
 * @param {{ ciudad?: string | null }} [opts]
 */
export function rowFromOsmElement(el, opts = {}) {
  const tags = el.tags ?? {};
  if (!shouldImportOsmTags(tags)) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (el.type !== "node" && el.type !== "way" && el.type !== "relation") return null;

  const nombre = tagText(tags, "name", "brand") ?? "Gimnasio";
  const street = tagText(tags, "addr:street");
  const number = tagText(tags, "addr:housenumber");
  const direccion =
    tagText(tags, "addr:full") ?? (street && number ? `${street} ${number}` : street);

  return {
    osm_id: el.id,
    osm_type: el.type,
    nombre: nombre.slice(0, 120),
    lat,
    lng,
    direccion: direccion ?? null,
    ciudad: tagText(tags, "addr:city", "addr:town", "addr:municipality") ?? opts.ciudad ?? null,
    brand: tagText(tags, "brand"),
    source: "osm",
    tipo: inferGymTipo({
      name: nombre,
      brand: tagText(tags, "brand"),
      operatorType: tagText(tags, "operator:type"),
    }),
  };
}

/**
 * Variante para importaciones dirigidas por marca/cadena.
 * No exige `leisure/amenity` “de gimnasio”, solo que el nombre/marca/operador coincida con `brandRegex`.
 *
 * @param {{ type?: string, id?: number, lat?: number, lon?: number, center?: { lat?: number, lon?: number }, tags?: Record<string, string> }} el
 * @param {{ brandRegex: RegExp, ciudad?: string | null }} opts
 */
export function rowFromOsmElementByBrand(el, opts) {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (el.type !== "node" && el.type !== "way" && el.type !== "relation") return null;

  const brand = tagText(tags, "brand", "operator", "operator_name") ?? "";
  const nombreRaw = tagText(tags, "name", "brand", "operator") ?? "Gimnasio";

  if (!opts.brandRegex.test(nombreRaw) && !opts.brandRegex.test(brand)) return null;

  const street = tagText(tags, "addr:street");
  const number = tagText(tags, "addr:housenumber");
  const direccion =
    tagText(tags, "addr:full") ?? (street && number ? `${street} ${number}` : street);

  return {
    osm_id: el.id,
    osm_type: el.type,
    nombre: nombreRaw.slice(0, 120),
    lat,
    lng,
    direccion: direccion ?? null,
    ciudad: tagText(tags, "addr:city", "addr:town", "addr:municipality") ?? opts.ciudad ?? null,
    brand: tagText(tags, "brand"),
    source: "osm",
    tipo: inferGymTipo({
      name: nombreRaw,
      brand: tagText(tags, "brand"),
      operatorType: tagText(tags, "operator:type"),
    }),
  };
}
