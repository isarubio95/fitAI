import { inferGymTipo, shouldImportOsmTags, tagString } from "./gymOsm.mjs";
import { fixMojibake } from "./fixMojibake.mjs";

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

  const nombreRaw = tagText(tags, "name", "brand") ?? "Gimnasio";
  const nombre = fixMojibake(nombreRaw);
  const streetRaw = tagText(tags, "addr:street");
  const street = streetRaw ? fixMojibake(streetRaw) : null;
  const number = tagText(tags, "addr:housenumber");
  const ciudadRaw = tagText(tags, "addr:city", "addr:town", "addr:municipality") ?? opts.ciudad ?? null;
  const ciudad = ciudadRaw == null ? null : fixMojibake(ciudadRaw);
  const brandRaw = tagText(tags, "brand");
  const brand = brandRaw == null ? null : fixMojibake(brandRaw);
  const direccion =
    (tagText(tags, "addr:full") ? fixMojibake(tagText(tags, "addr:full")) : null) ??
    (street && number ? `${street} ${number}` : street);

  return {
    osm_id: el.id,
    osm_type: el.type,
    nombre: nombre.slice(0, 120),
    lat,
    lng,
    direccion: direccion ?? null,
    ciudad,
    brand,
    source: "osm",
    tipo: inferGymTipo({
      name: nombre,
      brand,
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
  const nombre = fixMojibake(nombreRaw);
  const brandFixed = fixMojibake(brand);

  if (!opts.brandRegex.test(nombre) && !opts.brandRegex.test(brandFixed)) return null;

  const street = tagText(tags, "addr:street");
  const number = tagText(tags, "addr:housenumber");
  const direccion =
    tagText(tags, "addr:full") ?? (street && number ? `${street} ${number}` : street);
  const ciudadRaw = tagText(tags, "addr:city", "addr:town", "addr:municipality") ?? opts.ciudad ?? null;
  const ciudad = ciudadRaw == null ? null : fixMojibake(ciudadRaw);
  const brandReturnRaw = tagText(tags, "brand");
  const brandReturn = brandReturnRaw == null ? null : fixMojibake(brandReturnRaw);

  return {
    osm_id: el.id,
    osm_type: el.type,
    nombre: nombre.slice(0, 120),
    lat,
    lng,
    direccion: direccion ?? null,
    ciudad,
    brand: brandReturn,
    source: "osm",
    tipo: inferGymTipo({
      name: nombre,
      brand: brandReturn,
      operatorType: tagText(tags, "operator:type"),
    }),
  };
}
