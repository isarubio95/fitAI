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
  catalunyaGymsFromRecords,
  cordobaGymsFromGeoJson,
  donostiaGymsFromGeoJson,
  euskadiGymsFromGeoJson,
  euskadiGymsFromJson,
  galiciaGymsFromArcGis,
  riojaGymsFromGml,
  madridGymsFromGraph,
  malagaGymsFromGeoJson,
  santaCruzGymsFromGeoJson,
  valenciaGymsFromArcGis,
  vigoGymsFromGeoJson,
  zaragozaGymsFromCategory,
} from "./lib/gymOpendata.mjs";
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

const UA = "TrackGym/0.1 (gimnasios-opendata; https://github.com/track-gym)";
const BATCH_SIZE = 200;
const PAGE_SIZE = 1000;
const DEDUP_METERS = 80;

const MADRID_URL = "https://datos.madrid.es/egob/catalogo/200186-0-polideportivos.json";
const BCN_RESOURCE_ID = "1e5279b3-5f66-4614-9138-671c32db17ce";
const BCN_DATASTORE = `https://opendata-ajuntament.barcelona.cat/data/api/3/action/datastore_search?resource_id=${BCN_RESOURCE_ID}`;
const EUSKADI_URLS = [
  "http://intranet.euskalkirola.com/Content/assets/open_data/instalaciones_open_es.json",
  "https://www.euskadi.eus/contenidos/ds_localizaciones/censo_instalaciones_deportivas/opendata/censo_instalaciones_deportivas.geojson",
];
const MALAGA_URL =
  "https://datosabiertos.malaga.eu/recursos/deportes/equipamientos/da_deportesCentrosDeportivos-4326.geojson";
const VIGO_URL = "https://datos.vigo.org/data/deportes/ins-gimnasios.geojson";
const DONOSTIA_URL =
  "https://www.donostia.eus/datosabiertos/dataset/c1e52b76-6af8-4a1b-b182-dd168f901511/resource/648e5a5a-b60d-4079-bd4d-9e4b8e1092f7/download/kirolekipamenduak.json";
const VALENCIA_LAYER =
  "https://geoportal.valencia.es/server/rest/services/OPENDATA/SociedadBienestar/MapServer/1/query";
const ZARAGOZA_URL = "https://www.zaragoza.es/sede/servicio/equipamiento/category/56.json";
const CORDOBA_URL =
  "https://datosabiertos.cordoba.es/ckan/dataset/8c732141-6689-4fb5-b61e-76f9ca10ea64/resource/eabfb7bd-a91f-4e42-880b-c4196f365943/download/centros-deportivos.geojson";
const SANTA_CRUZ_URL =
  "https://www.santacruzdetenerife.es/opendata/dataset/d5325ace-0ae0-4980-b17c-0200a51b3227/resource/b83f8b5a-8eb0-4f89-be2c-b3affbc952d1/download/inst_deportivas.geojson";
const CATALUNYA_CEEC_URL = "https://analisi.transparenciacatalunya.cat/resource/5zd6-bk6r.json";
const GALICIA_LAYER =
  "https://ideg.xunta.gal/meteogalicia/rest/services/PIMA/exposicion/MapServer/33/query";
const RIOJA_WFS_TYPE = "instalaciones_deportivas";
const RIOJA_WFS_URL = "https://ogc.larioja.org/wfs/request.php";

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

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/xml", "User-Agent": UA },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} ${url}: ${body.slice(0, 400)}`);
  }

  // Decodificamos manualmente para evitar que el charset de la respuesta (a veces mal
  // definido) cause mojibake/reemplazos `�` al usar `res.text()`.
  const ab = await res.arrayBuffer();
  const bytes = Buffer.from(ab);

  const headAscii = bytes.slice(0, 1024).toString("ascii");
  const xmlEncoding = headAscii.match(/<\?xml[^>]*encoding=["']([^"']+)["']/i)?.[1];

  const contentType = res.headers.get("content-type") ?? "";
  const headerCharset = contentType.match(/charset=([^;]+)/i)?.[1];

  const rawEncoding = xmlEncoding ?? headerCharset;
  const encoding = (() => {
    if (!rawEncoding) return "utf-8";
    const e = String(rawEncoding).trim().toLowerCase();
    if (e === "utf-8" || e === "utf8") return "utf-8";
    if (e === "iso-8859-1" || e === "iso8859-1" || e === "latin1" || e === "latin-1") return "windows-1252";
    if (e === "windows-1252" || e === "cp1252") return "windows-1252";
    return rawEncoding;
  })();

  try {
    return new TextDecoder(encoding).decode(ab);
  } catch {
    return new TextDecoder("utf-8").decode(ab);
  }
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
  let lastError = null;
  for (const url of EUSKADI_URLS) {
    try {
      const payload = await fetchJson(url);
      if (Array.isArray(payload)) return euskadiGymsFromJson(payload);
      if (payload?.features) return euskadiGymsFromGeoJson(payload);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("No se pudo descargar el censo de Euskadi");
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

async function fetchZaragozaGyms() {
  return zaragozaGymsFromCategory(await fetchJson(ZARAGOZA_URL));
}

async function fetchCordobaGyms() {
  return cordobaGymsFromGeoJson(await fetchJson(CORDOBA_URL));
}

async function fetchSantaCruzGyms() {
  return santaCruzGymsFromGeoJson(await fetchJson(SANTA_CRUZ_URL));
}

async function fetchCatalunyaGyms() {
  const records = [];
  let offset = 0;
  // Filtramos instalaciones con sala de actividades (sal>0) o pabellón (pav>0)
  const where = encodeURIComponent("sal>0 OR pav>0");
  while (true) {
    const url = `${CATALUNYA_CEEC_URL}?%24limit=${PAGE_SIZE}&%24offset=${offset}&%24where=${where}`;
    const chunk = await fetchJson(url);
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    records.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return catalunyaGymsFromRecords(records);
}

async function fetchGaliciaGyms() {
  const features = [];
  let offset = 0;
  const pageSize = 2000;
  while (true) {
    const url = `${GALICIA_LAYER}?where=1%3D1&outFields=OBJECTID,nombre,provincia&outSR=4326&f=json&resultRecordCount=${pageSize}&resultOffset=${offset}`;
    const payload = await fetchJson(url);
    const chunk = payload?.features;
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    features.push(...chunk);
    if (chunk.length < pageSize || !payload.exceededTransferLimit) break;
    offset += pageSize;
  }
  return galiciaGymsFromArcGis({ features });
}

async function fetchRiojaGyms() {
  const rows = [];
  let startIndex = 0;
  while (true) {
    const url = `${RIOJA_WFS_URL}?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=${encodeURIComponent(
      RIOJA_WFS_TYPE,
    )}&MAXFEATURES=${PAGE_SIZE}&STARTINDEX=${startIndex}`;
    const text = await fetchText(url);
    const chunk = riojaGymsFromGml(text);
    if (!chunk.length) break;
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
    startIndex += chunk.length;
  }
  return rows;
}

const SOURCES = [
  { id: "madrid", label: "Madrid (polideportivos municipales)", fetch: fetchMadridGyms },
  { id: "barcelona", label: "Barcelona (CEM municipales)", fetch: fetchBarcelonaGyms },
  { id: "euskadi", label: "Euskadi (censo autonómico, todos los municipios)", fetch: fetchEuskadiGyms },
  { id: "malaga", label: "Málaga (centros deportivos)", fetch: fetchMalagaGyms },
  { id: "valencia", label: "Valencia (instalaciones deportivas)", fetch: fetchValenciaGyms },
  { id: "zaragoza", label: "Zaragoza (centros deportivos municipales)", fetch: fetchZaragozaGyms },
  { id: "cordoba", label: "Córdoba (centros deportivos municipales)", fetch: fetchCordobaGyms },
  { id: "santacruz", label: "Santa Cruz de Tenerife (instalaciones deportivas)", fetch: fetchSantaCruzGyms },
  { id: "vigo", label: "Vigo (gimnasios municipales)", fetch: fetchVigoGyms },
  { id: "donostia", label: "Donostia / San Sebastián (equipamientos)", fetch: fetchDonostiaGyms },
  { id: "catalunya", label: "Catalunya (CEEC – censo autonómico, todos los municipios)", fetch: fetchCatalunyaGyms },
  { id: "galicia", label: "Galicia (IDEG – instalaciones deportivas, todas las provincias)", fetch: fetchGaliciaGyms },
  { id: "rioja", label: "La Rioja (IDErioja – instalaciones deportivas)", fetch: fetchRiojaGyms },
];

const SOURCE_IDS = SOURCES.map((s) => s.id);

async function fetchExistingCatalog(url, key) {
  const rows = [];
  let offset = 0;
  const page = 1000;
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/gimnasio?select=id,nombre,lat,lng,direccion,ciudad,provider,external_id&offset=${offset}&limit=${page}`,
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
Fuentes con coordenadas (CC BY / ODC-BY). El censo autonómico de Andalucía no trae lat/lng y se omite;
las capitales andaluzas cubiertas aquí son Málaga y Córdoba (más OSM por municipio).
Catalunya usa el CEEC de la Generalitat (~20K instalaciones con lat/lng, filtradas por sala o pabellón).
Galicia usa la capa IDEG de la Xunta (~2K puntos).
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

  const existingByProviderExternalId = new Map(
    existing.map((g) => [`${g.provider}:${g.external_id}`, g]),
  );

  const toInsert = [];
  const toPatch = [];
  let skipped = 0;
  for (const row of incoming) {
    // Si es el mismo gym (provider+external_id), forzamos upsert para que se actualice el nombre/ciudad.
    // El dedupe por cercanía puede devolver un "duplicate" y en ese caso solo parchaba dirección.
    const exactKey = `${row.provider}:${row.external_id}`;
    if (existingByProviderExternalId.has(exactKey)) {
      toInsert.push(row);
      existingByProviderExternalId.set(exactKey, row);
      continue;
    }

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
  console.log("Listo. Atribución: portales municipales y Open Data Euskadi, además de CEEC (Cataluña), IDEG (Galicia) e IDErioja (La Rioja) (CC BY / ODC-BY).");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
