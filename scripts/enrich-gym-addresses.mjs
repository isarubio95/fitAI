/**
 * Completa `direccion` y `ciudad` de gimnasios OSM vía Nominatim lookup (por osm_id).
 *
 * Uso:
 *   node scripts/enrich-gym-addresses.mjs
 *   node scripts/enrich-gym-addresses.mjs --dry-run
 *   node scripts/enrich-gym-addresses.mjs --from-cache
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_URL (o SUPABASE_URL).
 * Respeta 1 req/s de Nominatim.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const NOMINATIM_LOOKUP = "https://nominatim.openstreetmap.org/lookup";
const UA = "TrackGym/0.1 (gimnasios-espana; address-enrich)";
const LOOKUP_BATCH = 40;
const NOMINATIM_DELAY_MS = 1100;
const PATCH_CONCURRENCY = 12;
const CACHE_PATH = fileURLToPath(new URL("./.gym-address-enrich.json", import.meta.url));

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function parseArgs(argv) {
  const args = { dryRun: false, fromCache: false, help: false };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--from-cache") args.fromCache = true;
    if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function osmLookupId(osmType, osmId) {
  const prefix = osmType === "way" ? "W" : osmType === "relation" ? "R" : "N";
  return `${prefix}${osmId}`;
}

function pickCity(address) {
  if (!address) return null;
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.city_district ||
    null
  );
}

function pickStreet(address) {
  if (!address) return null;
  const street = address.road || address.pedestrian || address.square || address.residential || null;
  const number = address.house_number || address.housenumber || null;
  if (street && number) return `${street} ${number}`;
  return street;
}

async function fetchGymsMissingAddress(url, key) {
  const rows = [];
  let offset = 0;
  const page = 1000;
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/gimnasio?select=id,osm_id,osm_type,nombre,direccion,ciudad&or=(direccion.is.null,ciudad.is.null)&osm_id=not.is.null&offset=${offset}&limit=${page}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) throw new Error(`Supabase list HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const chunk = await res.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    rows.push(...chunk);
    if (chunk.length < page) break;
    offset += page;
  }
  return rows;
}

async function nominatimLookup(ids) {
  const url = new URL(NOMINATIM_LOOKUP);
  url.searchParams.set("osm_ids", ids.join(","));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`Nominatim HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function patchGym(url, key, update) {
  const res = await fetch(`${url}/rest/v1/gimnasio?id=eq.${update.id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      direccion: update.direccion,
      ciudad: update.ciudad,
    }),
  });
  if (!res.ok) {
    throw new Error(`Supabase patch HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
}

async function patchGyms(url, key, updates) {
  for (let i = 0; i < updates.length; i += PATCH_CONCURRENCY) {
    const batch = updates.slice(i, i + PATCH_CONCURRENCY);
    await Promise.all(batch.map((row) => patchGym(url, key, row)));
    console.log(`Guardado ${Math.min(i + PATCH_CONCURRENCY, updates.length)}/${updates.length}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Uso: node scripts/enrich-gym-addresses.mjs [--dry-run] [--from-cache]`);
    return;
  }

  const supabaseUrl = (env("SUPABASE_URL", "VITE_SUPABASE_URL") ?? "").replace(/\/$/, "");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!args.dryRun && (!supabaseUrl || !serviceKey)) {
    throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Faltan credenciales incluso para dry-run (hace falta listar filas).");
  }

  let updates = [];
  let gyms = [];

  if (args.fromCache) {
    if (!existsSync(CACHE_PATH)) {
      throw new Error(`No hay caché en ${CACHE_PATH}. Ejecuta primero sin --from-cache.`);
    }
    updates = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    console.log(`Caché: ${updates.length} actualizaciones`);
  } else {
    gyms = await fetchGymsMissingAddress(supabaseUrl, serviceKey);
    console.log(`Gimnasios sin calle o ciudad: ${gyms.length}`);

    const byOsm = new Map();
    const lookupIds = [];
    for (const gym of gyms) {
      if (!gym.osm_id || !gym.osm_type) continue;
      const osmKey = osmLookupId(gym.osm_type, gym.osm_id);
      byOsm.set(osmKey, gym);
      lookupIds.push(osmKey);
    }

    for (let i = 0; i < lookupIds.length; i += LOOKUP_BATCH) {
      const batch = lookupIds.slice(i, i + LOOKUP_BATCH);
      const places = await nominatimLookup(batch);
      for (const place of places) {
        const prefix = place.osm_type === "way" ? "W" : place.osm_type === "relation" ? "R" : "N";
        const gym = byOsm.get(`${prefix}${place.osm_id}`);
        if (!gym) continue;
        const street = pickStreet(place.address);
        const city = pickCity(place.address);
        if (!street && !city) continue;
        if (gym.direccion && gym.ciudad) continue;
        updates.push({
          id: gym.id,
          direccion: gym.direccion || (street ? street.slice(0, 160) : null),
          ciudad: gym.ciudad || (city ? String(city).slice(0, 80) : null),
        });
      }
      console.log(`Nominatim ${Math.min(i + batch.length, lookupIds.length)}/${lookupIds.length} · ${updates.length} con dirección`);
      if (i + LOOKUP_BATCH < lookupIds.length) await sleep(NOMINATIM_DELAY_MS);
    }

    writeFileSync(CACHE_PATH, JSON.stringify(updates));
  }

  if (args.dryRun) {
    console.log("Dry-run: no se escribe. Ejemplos:");
    for (const row of updates.slice(0, 10)) {
      const gym = gyms.find((g) => g.id === row.id);
      console.log(`  - ${gym?.nombre ?? row.id}: ${row.direccion ?? "—"} / ${row.ciudad ?? "—"}`);
    }
    return;
  }

  await patchGyms(supabaseUrl, serviceKey, updates);
  console.log("Listo. Atribución: © OpenStreetMap contributors / Nominatim.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
