/**
 * Importa centros municipales desde datos abiertos → `gimnasio`.
 *
 * Uso:
 *   node scripts/import-opendata-gyms.mjs
 *   node scripts/import-opendata-gyms.mjs --city euskadi
 *   node scripts/import-opendata-gyms.mjs --dry-run
 *
 * No hay un censo nacional geolocalizado: cada fuente cubre su territorio
 * (ciudad o CCAA). `--city all` recorre todas las fuentes con coordenadas.
 *
 * Variables:
 *   VITE_SUPABASE_URL o SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { addressPatchFromIncoming, findNearbyDuplicate } from "./lib/gymDedup.mjs";
import {
  barcelonaGymsFromRecords,
  donostiaGymsFromGeoJson,
  euskadiGymsFromJson,
  madridGymsFromGraph,
  malagaGymsFromGeoJson,
  valenciaGymsFromArcGis,
  vigoGymsFromGeoJson,
} from "./lib/gymOpendata.mjs";

const UA = "TrackGym/0.1 (gimnasios-opendata; https://github.com/track-gym)";
const BATCH_SIZE = 200;
const PAGE_SIZE = 1000;
const DEDUP_METERS = 80;

const MADRID_URL = "https://datos.madrid.es/egob/catalogo/200186-0-polideportivos.json";
const BCN_RESOURCE_ID = "1e5279b3-5f66-4614-9138-671c32db17ce";
const BCN_DATASTORE = `https://opendata-ajuntament.barcelona.cat/data/api/3/action/datastore_search?resource_id=${BCN_RESOURCE_ID}`;
const EUSKADI_URL = "https://intranet.euskalkirola.com/Content/assets/open_data/instalaciones_open_es.json";
const MALAGA_URL =
  "https://datosabiertos.malaga.eu/recursos/deportes/equipamientos/da_deportesCentrosDeportivos-4326.geojson";
const VIGO_URL = "https://datos.vigo.org/data/deportes/ins-gimnasios.geojson";
const DONOSTIA_URL =
  "https://www.donostia.eus/datosabiertos/dataset/c1e52b76-6af8-4a1b-b182-dd168f901511/resource/648e5a5a-b60d-4079-bd4d-9e4b8e1092f7/download/kirolekipamenduak.json";
const VALENCIA_LAYER =
  "https://geoportal.valencia.es/server/rest/services/OPENDATA/SociedadBienestar/MapServer/1/query";

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function parseArgs(argv) {
  const args = { dryRun: false, help: false, city: "all" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--help" || arg === "-h") args.help = true;
    if (arg === "--city") {
      args.city = (argv[i + 1] || "all").toLowerCase();
      i += 1;
    }
  }
  return args;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} ${url}: ${body.slice(0, 400)}`);
  }
  return res.json();
}

async function fetchMadridGyms() {
  const payload = await fetchJson(MADRID_URL);
  return madridGymsFromGraph(payload["@graph"]);
}

async function fetchBarcelonaGyms() {
  const records = [];
  let offset = 0;
  while (true) {
    const payload = await fetchJson(`${BCN_DATASTORE}&limit=${PAGE_SIZE}&offset=${offset}`);
    const chunk = payload?.result?.records;
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    records.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return barcelonaGymsFromRecords(records);
}

async function fetchEuskadiGyms() {
  return euskadiGymsFromJson(await fetchJson(EUSKADI_URL));
}

async function fetchMalagaGyms() {
  return malagaGymsFromGeoJson(await fetchJson(MALAGA_URL));
}

async function fetchVigoGyms() {
  return vigoGymsFromGeoJson(await fetchJson(VIGO_URL));
}

async function fetchDonostiaGyms() {
  return donostiaGymsFromGeoJson(await fetchJson(DONOSTIA_URL));
}

async function fetchValenciaGyms() {
  const features = [];
  let offset = 0;
  const where = encodeURIComponent("UPPER(clase) LIKE '%DEPORT%'");
  while (true) {
    const url = `${VALENCIA_LAYER}?where=${where}&outFields=equipamien,identifica,clase,objectid&outSR=4326&f=json&resultRecordCount=${PAGE_SIZE}&resultOffset=${offset}`;
    const payload = await fetchJson(url);
    const chunk = payload?.features;
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    features.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return valenciaGymsFromArcGis({ features });
}

const SOURCES = [
  { id: "madrid", label: "Madrid (polideportivos municipales)", fetch: fetchMadridGyms },
  { id: "barcelona", label: "Barcelona (CEM municipales)", fetch: fetchBarcelonaGyms },
  { id: "euskadi", label: "Euskadi (censo autonómico, todos los municipios)", fetch: fetchEuskadiGyms },
  { id: "malaga", label: "Málaga (centros deportivos)", fetch: fetchMalagaGyms },
  { id: "valencia", label: "Valencia (instalaciones deportivas)", fetch: fetchValenciaGyms },
  { id: "vigo", label: "Vigo (gimnasios municipales)", fetch: fetchVigoGyms },
  { id: "donostia", label: "Donostia / San Sebastián (equipamientos)", fetch: fetchDonostiaGyms },
];

const SOURCE_IDS = SOURCES.map((s) => s.id);

async function fetchExistingCatalog(url, key) {
  const rows = [];
  let offset = 0;
  const page = 1000;
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/gimnasio?select=id,nombre,lat,lng,direccion,ciudad&offset=${offset}&limit=${page}`,
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

async function upsertOpendata(url, key, rows) {
  const res = await fetch(`${url}/rest/v1/gimnasio?on_conflict=provider,external_id`, {
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

async function patchGym(url, key, id, patch) {
  const res = await fetch(`${url}/rest/v1/gimnasio?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase patch HTTP ${res.status}: ${body.slice(0, 400)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const idsHelp = SOURCE_IDS.join("|");
  if (args.help) {
    console.log(`Uso: node scripts/import-opendata-gyms.mjs [--dry-run] [--city ${idsHelp}|all]

Requiere SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_URL (o SUPABASE_URL).
Fuentes con coordenadas (CC BY / ODC-BY). El censo de Andalucía no trae lat/lng y se omite.
`);
    return;
  }

  if (args.city !== "all" && !SOURCE_IDS.includes(args.city)) {
    throw new Error(`Usa --city ${idsHelp} o all`);
  }

  const supabaseUrl = env("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!args.dryRun && (!supabaseUrl || !serviceKey)) {
    throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  const selected = args.city === "all" ? SOURCES : SOURCES.filter((s) => s.id === args.city);
  const incoming = [];
  for (const source of selected) {
    console.log(`Descargando ${source.label}…`);
    try {
      const rows = await source.fetch();
      console.log(`  ${rows.length} centros`);
      incoming.push(...rows);
    } catch (err) {
      console.warn(`  Falló ${source.id}: ${err instanceof Error ? err.message : err}`);
    }
  }

  let existing = [];
  if (supabaseUrl && serviceKey) {
    existing = await fetchExistingCatalog(supabaseUrl.replace(/\/$/, ""), serviceKey);
  }

  const toInsert = [];
  const toPatch = [];
  let skipped = 0;
  for (const row of incoming) {
    const duplicate = findNearbyDuplicate(row, existing, { maxMeters: DEDUP_METERS });
    if (duplicate) {
      skipped += 1;
      const patch = addressPatchFromIncoming(duplicate, row);
      if (duplicate.id && Object.keys(patch).length > 0) {
        toPatch.push({ id: duplicate.id, patch });
      }
      continue;
    }
    toInsert.push(row);
    existing.push(row);
  }

  console.log(
    `Candidatos ${incoming.length} → insertar ${toInsert.length}, parchear dirección ${toPatch.length}, duplicados ${skipped}`,
  );

  if (args.dryRun) {
    console.log("Dry-run: no se escribe en Supabase. Ejemplos:");
    for (const row of toInsert.slice(0, 8)) {
      console.log(`  - ${row.nombre} (${row.ciudad}) [${row.provider}]`);
    }
    return;
  }

  const url = supabaseUrl.replace(/\/$/, "");
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const chunk = toInsert.slice(i, i + BATCH_SIZE);
    await upsertOpendata(url, serviceKey, chunk);
    console.log(`Upsert ${Math.min(i + chunk.length, toInsert.length)}/${toInsert.length}`);
  }
  for (const item of toPatch) {
    await patchGym(url, serviceKey, item.id, item.patch);
  }
  console.log("Listo. Atribución: portales municipales y Open Data Euskadi (CC BY / ODC-BY).");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
