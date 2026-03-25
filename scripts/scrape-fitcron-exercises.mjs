import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  instructionStepsToJsonCell,
  instructionTextToStepArray,
} from "./instrucciones-a-pasos.mjs";

const SOURCE_URL = "https://fitcron.com/exercises/";
const OUTPUT_RELATIVE = path.join("sql", "ejercicios.csv");
const FETCH_TIMEOUT_MS = 25_000;
const DEFAULT_CONCURRENCY = 6;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, "..", OUTPUT_RELATIVE);

function parseArgs() {
  const argv = process.argv.slice(2);
  let concurrency = DEFAULT_CONCURRENCY;
  const ci = argv.indexOf("--concurrency");
  if (ci >= 0 && argv[ci + 1]) {
    const n = Number.parseInt(argv[ci + 1], 10);
    if (Number.isFinite(n) && n >= 1) concurrency = Math.min(n, 24);
  }
  return {
    skipDetails: argv.includes("--skip-details"),
    concurrency,
  };
}

function decodeHtmlEntities(text) {
  const named = {
    nbsp: " ",
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    hellip: "…",
  };

  return text
    .replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (_, entity) => {
      if (entity.startsWith("#x") || entity.startsWith("#X")) {
        const code = Number.parseInt(entity.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : _;
      }
      if (entity.startsWith("#")) {
        const code = Number.parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : _;
      }
      return named[entity] ?? _;
    })
    .replace(/\u00a0/g, " ");
}

function stripHtml(text) {
  return decodeHtmlEntities(text.replace(/<[^>]*>/g, " "));
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeCommaList(value) {
  return String(value ?? "")
    .split(",")
    .map((part) => normalizeWhitespace(decodeHtmlEntities(part)))
    .filter(Boolean)
    .join(", ");
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function attr(html, name) {
  const re = new RegExp(`${name}="([^"]*)"`, "i");
  return html.match(re)?.[1] ?? "";
}

function parseDifficultyFromItem(itemHtml) {
  const textMatch = itemHtml.match(/Dificultad:\s*(\d+)\s*\/\s*(\d+)/i);
  if (textMatch) {
    return {
      actual: Number.parseInt(textMatch[1], 10),
      maxima: Number.parseInt(textMatch[2], 10),
    };
  }
  const d = attr(itemHtml, "data-difficulty");
  if (d) {
    const n = Number.parseInt(d, 10);
    if (Number.isFinite(n)) return { actual: n, maxima: 3 };
  }
  return null;
}

function parseExercisesFromListing(rawHtml) {
  const exercises = [];
  const items = rawHtml
    .split('<div class="view-item')
    .slice(1)
    .map((part) => `<div class="view-item${part}`);

  for (const itemHtml of items) {
    const nombre = normalizeWhitespace(decodeHtmlEntities(attr(itemHtml, "data-name")));
    const tipoEjercicio = normalizeWhitespace(decodeHtmlEntities(attr(itemHtml, "data-exercise-type")));
    const grupoMuscular = normalizeWhitespace(decodeHtmlEntities(attr(itemHtml, "data-main-muscle")));
    const musculosRaw = attr(itemHtml, "data-involved-muscles");
    const equipamientoRaw = attr(itemHtml, "data-equipment");
    const hrefMatch = itemHtml.match(
      /href="(https:\/\/fitcron\.com\/exercise\/[^"]+\/)"/i,
    );
    const url = hrefMatch?.[1] ?? "";

    const gifSrcMatch = itemHtml.match(
      /\bsrc="(https:\/\/fitcron\.com\/wp-content\/uploads\/[^"]+)"/i,
    );
    const gif_url = normalizeWhitespace(
      decodeHtmlEntities(gifSrcMatch?.[1] ?? ""),
    );

    const diff = parseDifficultyFromItem(itemHtml);
    if (!nombre || !tipoEjercicio || !grupoMuscular || !diff || !url) {
      continue;
    }

    exercises.push({
      nombre,
      url,
      gif_url,
      tipo_ejercicio: tipoEjercicio,
      grupo_muscular: grupoMuscular,
      musculos_involucrados: normalizeCommaList(musculosRaw),
      equipamiento: normalizeCommaList(equipamientoRaw),
      dificultad_actual: diff.actual,
      dificultad_maxima: diff.maxima,
    });
  }

  const uniqueMap = new Map();
  for (const ex of exercises) {
    const key = `${ex.nombre}|${ex.url}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, ex);
  }

  return Array.from(uniqueMap.values());
}

function looksLikeCookieBanner(text) {
  const t = text.toLowerCase();
  return (
    (t.includes("cookie") && t.includes("consentimiento")) ||
    t.includes("gestionar cookies") ||
    t.startsWith("para ofrecer las mejores experiencias") ||
    t.includes("almacenamiento o acceso técnico es necesario para la finalidad legítima")
  );
}

/** Párrafo principal de la ficha (el banner GDPR suele ser un <p> más largo que el del ejercicio). */
function extractOgDescription(html) {
  const m = html.match(/property="og:description"\s+content="([^"]*)"/i);
  if (!m?.[1]) return "";
  return normalizeWhitespace(decodeHtmlEntities(m[1])).replace(/\[&hellip;\]\s*$/i, "").trim();
}

function extractInstructions(html) {
  let best = "";
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = normalizeWhitespace(stripHtml(m[1]));
    if (text.length < 50 || looksLikeCookieBanner(text)) continue;
    if (text.length > best.length) best = text;
  }
  if (best.length >= 50) return best;
  const fromMeta = extractOgDescription(html);
  return fromMeta.length >= 40 ? fromMeta : "";
}

async function fetchText(url, { retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; gym-log-scraper/1.1)",
          accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

async function mapPool(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex;
      nextIndex += 1;
      if (i >= items.length) break;
      results[i] = await mapper(items[i], i);
    }
  }

  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function toCsv(rows) {
  const headers = [
    "nombre",
    "url",
    "tipo_ejercicio",
    "grupo_muscular",
    "musculos_involucrados",
    "equipamiento",
    "dificultad_actual",
    "dificultad_maxima",
    "instrucciones",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const { skipDetails, concurrency } = parseArgs();

  console.log(`Descargando listado desde ${SOURCE_URL}...`);
  const html = await fetchText(SOURCE_URL, { retries: 3 });
  let exercises = parseExercisesFromListing(html);

  if (exercises.length === 0) {
    throw new Error("No se encontraron ejercicios. Puede que el HTML del listado haya cambiado.");
  }

  exercises.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  if (skipDetails) {
    for (const ex of exercises) {
      ex.instrucciones = instructionStepsToJsonCell([]);
    }
    console.log("--skip-details: no se descargan fichas.");
  } else {
    console.log(
      `Descargando instrucciones (${exercises.length} fichas, concurrencia ${concurrency})...`,
    );
    let done = 0;
    await mapPool(exercises, concurrency, async (ex) => {
      try {
        const page = await fetchText(ex.url, { retries: 2 });
        const raw = extractInstructions(page);
        ex.instrucciones = instructionStepsToJsonCell(
          instructionTextToStepArray(raw),
        );
      } catch {
        ex.instrucciones = instructionStepsToJsonCell([]);
      }
      done += 1;
      if (done % 50 === 0 || done === exercises.length) {
        console.log(`  … ${done}/${exercises.length}`);
      }
    });
  }

  const csv = toCsv(exercises);
  await writeFile(outputPath, csv, "utf8");

  const conInstr = exercises.filter((e) => {
    if (!e.instrucciones || e.instrucciones === "[]") return false;
    try {
      const a = JSON.parse(e.instrucciones);
      return Array.isArray(a) && a.length > 0;
    } catch {
      return false;
    }
  }).length;
  console.log(`Guardados ${exercises.length} ejercicios en: ${outputPath}`);
  console.log(`Con pasos de instrucción: ${conInstr}${skipDetails ? " (vacíos)" : ""}`);
}

main().catch((error) => {
  console.error("Error al generar ejercicios.csv:", error.message);
  process.exitCode = 1;
});
