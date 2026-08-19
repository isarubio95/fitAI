/**
 * Importa gimnasios de España desde OpenStreetMap (Overpass) → tabla `gimnasio`.
 *
 * Uso:
 *   node scripts/import-spain-gyms.mjs
 *   node scripts/import-spain-gyms.mjs --capitals
 *   node scripts/import-spain-gyms.mjs --capitals --city sevilla
 *   node scripts/import-spain-gyms.mjs --dry-run
 *
 * Variables:
 *   VITE_SUPABASE_URL o SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (obligatoria: el upsert salta RLS)
 *   OVERPASS_URL (opcional)
 */

import { SPAIN_CCAA, SPAIN_PROVINCIAL_CAPITALS, capitalOverpassQuery, ccaaOverpassQuery } from "./lib/gymOsm.mjs";
import { rowFromOsmElement } from "./lib/gymOsmMap.mjs";
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile();

const DEFAULT_OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const UA = "TrackGym/0.1 (gimnasios-espana; https://github.com/track-gym)";
const BATCH_SIZE = 400;
const CCAA_GAP_MS = 1500;
const CAPITAL_GAP_MS = 4000;

function overpassUrls() {
  if (process.env.OVERPASS_URL) return [process.env.OVERPASS_URL];
  return DEFAULT_OVERPASS_URLS;
}

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function parseArgs(argv) {
  const args = { dryRun: false, help: false, ccaa: null, capitals: false, city: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--help" || arg === "-h") args.help = true;
    if (arg === "--capitals") args.capitals = true;
    if (arg === "--ccaa") {
      args.ccaa = argv[i + 1] ? argv[i + 1].toUpperCase() : null;
      i += 1;
    }
    if (arg === "--city") {
      args.city = argv[i + 1] ? argv[i + 1].toLowerCase() : null;
      i += 1;
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    await sleep(waitMs);
    return fetchOverpass(query, attempt + 1);
  }
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

function collectRows(elements, seen, ciudadFallback) {
  const rows = [];
  for (const el of elements) {
    const row = rowFromOsmElement(el, { ciudad: ciudadFallback });
    if (!row) continue;
    const key = `${row.osm_type}:${row.osm_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    const capitalIds = SPAIN_PROVINCIAL_CAPITALS.map((c) => c.id).join("|");
    console.log(`Uso: node scripts/import-spain-gyms.mjs [--dry-run] [--ccaa ES-MD]
       node scripts/import-spain-gyms.mjs --capitals [--city ${capitalIds}] [--dry-run]

Requiere SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_URL (o SUPABASE_URL).
Sin --capitals consulta Overpass por comunidad autónoma.
Con --capitals recorre las 50 capitales de provincia + Ceuta y Melilla (más fiable que un CCAA enorme).
`);
    return;
  }

  const supabaseUrl = env("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!args.dryRun && (!supabaseUrl || !serviceKey)) {
    throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  const seen = new Set();
  const allRows = [];

  if (args.capitals) {
    const capitals = args.city
      ? SPAIN_PROVINCIAL_CAPITALS.filter((c) => c.id === args.city)
      : SPAIN_PROVINCIAL_CAPITALS;
    if (args.city && capitals.length === 0) {
      throw new Error(
        `Capital desconocida: ${args.city}. Usa p. ej. sevilla, zaragoza, palma.`,
      );
    }
    for (let i = 0; i < capitals.length; i += 1) {
      const capital = capitals[i];
      console.log(`Consultando Overpass (${capital.name} ${capital.wikidata})…`);
      try {
        const payload = await fetchOverpass(capitalOverpassQuery(capital));
        const elements = Array.isArray(payload.elements) ? payload.elements : [];
        const rows = collectRows(elements, seen, capital.name);
        allRows.push(...rows);
        console.log(
          `  ${elements.length} elementos → ${rows.length} nuevos (${allRows.length} acumulados)`,
        );
      } catch (err) {
        console.warn(
          `  Falló ${capital.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
      if (i < capitals.length - 1) await sleep(CAPITAL_GAP_MS);
    }
  } else {
    const ccaaList = args.ccaa
      ? SPAIN_CCAA.filter(([code]) => code === args.ccaa)
      : SPAIN_CCAA;
    if (args.ccaa && ccaaList.length === 0) {
      throw new Error(`CCAA desconocida: ${args.ccaa}. Usa p. ej. ES-MD, ES-CT, ES-AN.`);
    }

    for (let i = 0; i < ccaaList.length; i += 1) {
      const [code, label] = ccaaList[i];
      console.log(`Consultando Overpass (${code} ${label})…`);
      const payload = await fetchOverpass(ccaaOverpassQuery(code));
      const elements = Array.isArray(payload.elements) ? payload.elements : [];
      const rows = collectRows(elements, seen);
      allRows.push(...rows);
      console.log(`  ${elements.length} elementos → ${rows.length} nuevos (${allRows.length} acumulados)`);
      if (i < ccaaList.length - 1) await sleep(CCAA_GAP_MS);
    }
  }

  console.log(`OSM: ${allRows.length} gimnasios únicos`);
  if (args.dryRun) {
    console.log("Dry-run: no se escribe en Supabase. Ejemplos:");
    for (const row of allRows.slice(0, 8)) {
      console.log(`  - ${row.nombre} [${row.tipo}] (${row.ciudad ?? "sin ciudad"})`);
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
