/**
 * Importa toda la cadena Dreamfit desde su web.
 *
 * Fuente:
 * - Lista de centros: https://www.dreamfit.es/centros
 * - Cada centro: https://www.dreamfit.es/centros/<slug>
 *
 * Nota: la web no expone lat/lng “hardcodeados” en el HTML, así que geocodificamos
 * la dirección con Nominatim para obtener coordenadas.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { addressPatchFromIncoming, findNearbyDuplicate } from "./lib/gymDedup.mjs";

const UA = "TrackGym/0.1 (dreamfit-chain; nominatim geocode)";
const DREAMFIT_CENTERS_URL = "https://www.dreamfit.es/centros";
const PAGE_BASE = "https://www.dreamfit.es/centros";

const SUPABASE_URL_ENV = "SUPABASE_URL";
const SUPABASE_SERVICE_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_DELAY_MS = 1100; // respetar una req/s
const PAGE_SIZE = 1000;
const BATCH_SIZE = 200;

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

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function parseArgs(argv) {
  const args = { dryRun: false, help: false, brand: "dreamfit" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { Accept: "text/html", "User-Agent": UA } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} ${url}: ${body.slice(0, 300)}`);
  }
  return res.text();
}

async function nominatimSearch(query) {
  const q = cleanForNominatim(query);
  const url = new URL(NOMINATIM_SEARCH);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("q", q);
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Nominatim HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function cleanForNominatim(input) {
  return String(input ?? "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/Pza\./gi, "Plaza")
    .replace(/\bPza\b/gi, "Plaza")
    .replace(/PZA\./g, "Plaza")
    .replace(/Avda\./gi, "Avenida")
    .replace(/\bAv\./gi, "Avenida")
    .replace(/\bAvda\b/gi, "Avenida")
    .replace(/s\/n/gi, "sin numero")
    .replace(/\s+/g, " ")
    .replace(/\s*\.\s*$/, "")
    .trim();
}

async function geocodeDreamfit(parsed) {
  const candidates = [];
  if (parsed?.street && parsed?.cityLineFull) candidates.push(`${parsed.street}, ${parsed.cityLineFull}`);
  if (parsed?.street && parsed?.city) candidates.push(`${parsed.street}, ${parsed.city}`);
  if (parsed?.cityLineFull) candidates.push(parsed.cityLineFull);
  if (parsed?.city) candidates.push(parsed.city);

  for (let i = 0; i < candidates.length; i += 1) {
    const point = await nominatimSearch(candidates[i]);
    if (point) return point;
    if (i < candidates.length - 1) await sleep(300);
  }
  return null;
}

function stripHtml(text) {
  return String(text ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDreamfitCentersSlugs(html) {
  const slugs = [];
  for (const m of html.matchAll(/href=["']\/centros\/([^"'>\/?#]+)["']/gi)) {
    const slug = m[1];
    if (slug && slug.length > 1) slugs.push(slug);
  }
  return [...new Set(slugs)];
}

function parseCenterPage(html) {
  // Nombre: suele ser el h1 tipo "Gimnasio en Logroño"
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = stripHtml(h1);

  // Dirección: viene dentro de la sección "Cómo llegar" y suele incluir 3 <p>:
  // 1) un nombre de referencia, 2) calle/camino + s/n, 3) CP + ciudad + (provincia)
  const howToIdx = html.toLowerCase().indexOf("cómo llegar");
  if (howToIdx === -1) return null;
  const tail = html.slice(howToIdx);
  const googleIdx = tail.toLowerCase().indexOf("google maps");
  // Recortamos para no capturar horarios con números fuera de la sección de dirección.
  const section = googleIdx === -1 ? tail : tail.slice(0, googleIdx);

  // Dreamfit a veces pone la dirección en <p> (Logroño) y otras en <div> (Santiago).
  let lines = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((x) => stripHtml(x[1]));
  if (lines.length === 0) {
    lines = [...section.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)].map((x) => stripHtml(x[1]));
  }

  // Limpiamos ruido
  lines = lines
    .filter(Boolean)
    .map((l) => l.replace(/\.(?=\D)/g, "."))
    .filter((l) => !/horario|lunes|viernes|sábado|domingo|festivo/i.test(l));

  // Línea "CP + Ciudad + (provincia)" o "CP + Ciudad, Provincia"
  const cityLineFull = lines.find((l) => /\b\d{5}\b/.test(l)) || null;

  // Ciudad (para el catálogo) = parte entre CP y '(' o ','.
  let city = null;
  if (cityLineFull) {
    const m = cityLineFull.match(/\b\d{5}\b\s+(.+?)(?:\s*\(|,|$)/);
    city = m?.[1]?.trim() || null;
  }

  // Calle/camino
  const street =
    lines.find((p) => /s\/n/i.test(p)) ||
    lines.find((p) => {
      // Excluye típicos rangos horarios tipo "6:00 - 23:00"
      if (/\d{1,2}:\d{2}/.test(p)) return false;
      if (!/\d/.test(p)) return false;
      // Acepta cosas que parezcan dirección (contienen alfabeto + números)
      return /[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/.test(p);
    }) ||
    null;

  return {
    title,
    street,
    city,
    cityLineFull,
  };
}

async function fetchExistingCatalog(url, key) {
  const rows = [];
  let offset = 0;
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/gimnasio?select=id,nombre,lat,lng,direccion,ciudad&offset=${offset}&limit=${PAGE_SIZE}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) throw new Error(`Supabase list HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const chunk = await res.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return rows;
}

async function upsertDreamfit(url, key, rows) {
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
    throw new Error(`Supabase upsert HTTP ${res.status}: ${(await res.text()).slice(0, 600)}`);
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
    throw new Error(`Supabase patch HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Uso: node scripts/import-dreamfit-chain.mjs [--dry-run]`);
    return;
  }

  const supabaseUrl = env(SUPABASE_URL_ENV, "VITE_SUPABASE_URL");
  const serviceKey = env(SUPABASE_SERVICE_KEY_ENV);
  if (!supabaseUrl || !serviceKey) {
    if (!args.dryRun) throw new Error("Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  const url = (supabaseUrl ?? "").replace(/\/$/, "");

  console.log(`Descargando slugs de centros Dreamfit…`);
  const centersHtml = await fetchText(DREAMFIT_CENTERS_URL);
  const slugs = parseDreamfitCentersSlugs(centersHtml);
  console.log(`Found ${slugs.length} centros.`);

  const existing = args.dryRun ? [] : await fetchExistingCatalog(url, serviceKey);

  const incoming = [];
  for (let i = 0; i < slugs.length; i += 1) {
    const slug = slugs[i];
    console.log(`  ${i + 1}/${slugs.length} -> ${slug}`);
    const pageHtml = await fetchText(`${PAGE_BASE}/${slug}`);
    const parsed = parseCenterPage(pageHtml);
    if (!parsed?.street || !parsed?.city || !parsed?.cityLineFull) {
      console.warn(`    Sin dirección completa para ${slug}:`, parsed);
      continue;
    }

    // Geocoding con dirección + fallback si Nominatim falla
    if (i > 0) await sleep(NOMINATIM_DELAY_MS);
    const point = await geocodeDreamfit(parsed);
    if (!point) {
      console.warn(
        `    Nominatim no encontró coordenadas para: ${parsed.street}, ${
          parsed.cityLineFull ?? parsed.city
        }`,
      );
      continue;
    }

    // nombre: intenta algo consistente y legible
    const nombre = parsed.title
      ? stripHtml(parsed.title).replace(/^Gimnasio en\s+/i, "Dreamfit ")
      : `Dreamfit ${parsed.city}`;

    incoming.push({
      provider: args.brand,
      external_id: slug,
      nombre,
      lat: point.lat,
      lng: point.lng,
      direccion: parsed.street,
      ciudad: parsed.city,
      brand: null,
      source: "opendata",
      tipo: "private",
    });
  }

  let toInsert = incoming;
  const toPatch = [];
  if (!args.dryRun && existing.length) {
    toInsert = [];
    for (const row of incoming) {
      const duplicate = findNearbyDuplicate(row, existing, { maxMeters: 80 });
      if (duplicate) {
        const patch = addressPatchFromIncoming(duplicate, row);
        if (duplicate.id && Object.keys(patch).length > 0) toPatch.push({ id: duplicate.id, patch });
      } else {
        toInsert.push(row);
      }
    }
  }

  console.log(`Incoming ${incoming.length} -> insertar ${toInsert.length}, parchear ${toPatch.length}`);

  if (args.dryRun) {
    console.log("Dry-run: sin escribir en Supabase. Ejemplos:");
    for (const row of toInsert.slice(0, 10)) console.log(`  - ${row.nombre} (${row.ciudad})`);
    return;
  }

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    await upsertDreamfit(url, serviceKey, toInsert.slice(i, i + BATCH_SIZE));
    console.log(`Upsert ${Math.min(i + BATCH_SIZE, toInsert.length)}/${toInsert.length}`);
  }
  for (const item of toPatch) {
    await patchGym(url, serviceKey, item.id, item.patch);
  }

  console.log("Listo. Atribución: Dreamfit (direcciones) + Nominatim (geocoding).");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

