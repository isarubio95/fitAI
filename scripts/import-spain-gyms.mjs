/**
 * Importa gimnasios de España desde OpenStreetMap (Overpass) → tabla `gimnasio`.
 *
 * Uso:
 *   node scripts/import-spain-gyms.mjs
 *
 * Variables:
 *   VITE_SUPABASE_URL o SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (obligatoria: el upsert salta RLS)
 *   OVERPASS_URL (opcional)
 */

const OVERPASS_URL = process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";
const UA = "TrackGym/0.1 (gimnasios-espana; https://github.com/track-gym)";
const BATCH_SIZE = 400;

const SPAIN_QUERY = `[out:json][timeout:240];
area["ISO3166-1"="ES"]["admin_level"="2"]->.es;
(
  nwr["leisure"="fitness_centre"](area.es);
  nwr["amenity"="gym"](area.es);
);
out center tags;
`;

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function parseArgs(argv) {
  const args = { dryRun: false, help: false };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

function tagText(tags, ...keys) {
  if (!tags) return null;
  for (const key of keys) {
    const value = tags[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function rowFromElement(el) {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (el.type !== "node" && el.type !== "way" && el.type !== "relation") return null;

  const nombre = tagText(tags, "name", "brand") ?? "Gimnasio";
  const street = tagText(tags, "addr:street");
  const number = tagText(tags, "addr:housenumber");
  const direccion =
    tagText(tags, "addr:full") ??
    (street && number ? `${street} ${number}` : street);

  return {
    osm_id: el.id,
    osm_type: el.type,
    nombre: nombre.slice(0, 120),
    lat,
    lng,
    direccion: direccion ?? null,
    ciudad: tagText(tags, "addr:city", "addr:town", "addr:municipality"),
    brand: tagText(tags, "brand"),
    source: "osm",
  };
}

async function fetchOverpass() {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json",
      "User-Agent": UA,
    },
    body: new URLSearchParams({ data: SPAIN_QUERY }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Overpass HTTP ${res.status}: ${body.slice(0, 400)}`);
  }
  return res.json();
}

async function upsertBatch(url, key, rows) {
  const res = await fetch(`${url}/rest/v1/gimnasio?on_conflict=osm_type,osm_id`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase upsert HTTP ${res.status}: ${body.slice(0, 600)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Uso: node scripts/import-spain-gyms.mjs [--dry-run]

Requiere SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_URL (o SUPABASE_URL).
`);
    return;
  }

  const supabaseUrl = env("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!args.dryRun && (!supabaseUrl || !serviceKey)) {
    throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  console.log("Consultando Overpass (gimnasios de España)…");
  const payload = await fetchOverpass();
  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const seen = new Set();
  const rows = [];
  for (const el of elements) {
    const row = rowFromElement(el);
    if (!row) continue;
    const key = `${row.osm_type}:${row.osm_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }

  console.log(`OSM: ${elements.length} elementos → ${rows.length} gimnasios únicos`);
  if (args.dryRun) {
    console.log("Dry-run: no se escribe en Supabase. Ejemplos:");
    for (const row of rows.slice(0, 8)) {
      console.log(`  - ${row.nombre} (${row.ciudad ?? "sin ciudad"}) ${row.lat.toFixed(4)},${row.lng.toFixed(4)}`);
    }
    return;
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    await upsertBatch(supabaseUrl.replace(/\/$/, ""), serviceKey, chunk);
    console.log(`Upsert ${Math.min(i + chunk.length, rows.length)}/${rows.length}`);
  }
  console.log("Listo. Atribución: © OpenStreetMap contributors (ODbL).");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
