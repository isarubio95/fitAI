/**
 * Importa una cadena de gimnasios (p.ej. Dreamfit) desde OpenStreetMap (Overpass) → `gimnasio`.
 *
 * En vez de depender de `leisure/amenity`, filtra por nombre/marca/operador coincidente con un patrón.
 *
 * Uso:
 *   node scripts/import-chain-gyms.mjs --brand dreamfit
 *   node scripts/import-chain-gyms.mjs --brand dreamfit --dry-run
 *
 * Variables:
 *   VITE_SUPABASE_URL o SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { SPAIN_CCAA } from "./lib/gymOsm.mjs";
import { catalogRowForUpsert, rowFromOsmElementByBrand } from "./lib/gymOsmMap.mjs";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadEnvFile() {
  const envPath = path.resolve(".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2] ?? "";
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvFile();

const UA = "TrackGym/0.1 (import-chain-gyms; https://github.com/track-gym)";
const BATCH_SIZE = 400;
const CCAA_GAP_MS = 1500;

const BRAND_PATTERNS = {
  // Dreamfit (Dream Fit, con o sin espacio).
  dreamfit: "dream\\\\s*fit",
};

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function parseArgs(argv) {
  const args = { dryRun: false, help: false, brand: "dreamfit", ccaa: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--help" || arg === "-h") args.help = true;
    if (arg === "--brand") {
      args.brand = (argv[i + 1] || "dreamfit").toLowerCase();
      i += 1;
    }
    if (arg === "--ccaa") {
      args.ccaa = (argv[i + 1] || "").toUpperCase();
      i += 1;
    }
  }
  return args;
}

function overpassUrls() {
  if (process.env.OVERPASS_URL) return [process.env.OVERPASS_URL];
  return [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
}

async function fetchOverpass(query, attempt = 1) {
  const urls = overpassUrls();
  const url = urls[(attempt - 1) % urls.length];
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json",
      "User-Agent": UA,
    },
    body: new URLSearchParams({ data: query }),
  });
  if ((res.status === 429 || res.status === 504 || res.status >= 500) && attempt < 5) {
    const waitMs = Math.min(attempt * 6000, 20000);
    console.warn(`Overpass HTTP ${res.status} (${url}), reintento ${attempt + 1} en ${waitMs}ms…`);
    await new Promise((r) => setTimeout(r, waitMs));
    return fetchOverpass(query, attempt + 1);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Overpass HTTP ${res.status}: ${body.slice(0, 400)}`);
  }
  return res.json();
}

function ccaaBrandOverpassQuery(iso3166_2, brandPattern) {
  // brandPattern ya incluye escapes tipo \s.
  return `[out:json][timeout:120];
area["ISO3166-2"="${iso3166_2}"]["admin_level"="4"]->.a;
(
  nwr["brand"~"${brandPattern}",i](area.a);
  nwr["operator"~"${brandPattern}",i](area.a);
  nwr["name"~"${brandPattern}",i](area.a);
);
out center tags;`;
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
    body: JSON.stringify(rows.map(catalogRowForUpsert)),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase upsert HTTP ${res.status}: ${body.slice(0, 600)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      `Uso: node scripts/import-chain-gyms.mjs [--brand dreamfit] [--ccaa ES-RI] [--dry-run]\n\n` +
        `Requiere SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_URL (o SUPABASE_URL).`,
    );
    return;
  }

  const supabaseUrl = env("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!args.dryRun && (!supabaseUrl || !serviceKey)) {
    throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  const pattern = BRAND_PATTERNS[args.brand];
  if (!pattern) throw new Error(`Marca desconocida: ${args.brand}. Opciones: ${Object.keys(BRAND_PATTERNS).join(", ")}`);

  const brandRegex = new RegExp(pattern, "i");
  const ccaaList = args.ccaa
    ? SPAIN_CCAA.filter(([code]) => code === args.ccaa)
    : SPAIN_CCAA;

  const seen = new Set();
  const allRows = [];

  for (let i = 0; i < ccaaList.length; i += 1) {
    const [code, label] = ccaaList[i];
    console.log(`Consultando Overpass (${label})…`);

    const query = ccaaBrandOverpassQuery(code, pattern);
    const payload = await fetchOverpass(query);
    const elements = Array.isArray(payload.elements) ? payload.elements : [];

    let added = 0;
    for (const el of elements) {
      const row = rowFromOsmElementByBrand(el, { brandRegex, ciudad: null });
      if (!row) continue;
      const key = `${row.osm_type}:${row.osm_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      allRows.push(row);
      added += 1;
    }

    console.log(`  ${elements.length} elementos → ${added} filas nuevas (${allRows.length} acumuladas)`);
    if (i < ccaaList.length - 1) await new Promise((r) => setTimeout(r, CCAA_GAP_MS));
  }

  console.log(`${args.brand}: OSM ${allRows.length} gimnasios/sedes encontrados.`);

  if (args.dryRun) {
    console.log("Dry-run: no se escribe en Supabase. Ejemplos:");
    for (const row of allRows.slice(0, 10)) {
      console.log(`  - ${row.nombre} (${row.ciudad ?? "sin ciudad"}) [${row.brand ?? "sin brand"}]`);
    }
    return;
  }

  const url = supabaseUrl.replace(/\/$/, "");
  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const chunk = allRows.slice(i, i + BATCH_SIZE);
    await upsertBatch(url, serviceKey, chunk);
    console.log(`Upsert ${Math.min(i + chunk.length, allRows.length)}/${allRows.length}`);
  }
  console.log("Listo. Atribución: © OpenStreetMap contributors (ODbL).");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

