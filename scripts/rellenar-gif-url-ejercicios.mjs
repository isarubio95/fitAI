/**
 * Añade o actualiza la columna gif_url en sql/ejercicios.csv usando solo el listado
 * público (sin volver a descargar cada ficha). Útil si ya tienes instrucciones y
 * solo faltan los enlaces a los GIF de wp-content/uploads.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://fitcron.com/exercises/";
const FETCH_TIMEOUT_MS = 25_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, "..", "sql", "ejercicios.csv");

function decodeHtmlEntities(text) {
  const named = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
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

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function splitCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return { headers, rows };
}

function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function fetchListingHtml() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; gym-log-scraper/1.1)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Listado HTTP ${response.status}`);
  return response.text();
}

/** url ficha -> gif absoluto */
function buildGifUrlByExerciseUrl(html) {
  const map = new Map();
  const items = html
    .split('<div class="view-item')
    .slice(1)
    .map((part) => `<div class="view-item${part}`);

  for (const itemHtml of items) {
    const hrefMatch = itemHtml.match(
      /href="(https:\/\/fitcron\.com\/exercise\/[^"]+\/)"/i,
    );
    const gifMatch = itemHtml.match(
      /\bsrc="(https:\/\/fitcron\.com\/wp-content\/uploads\/[^"]+)"/i,
    );
    const url = hrefMatch?.[1]?.trim() ?? "";
    const gif = normalizeWhitespace(
      decodeHtmlEntities(gifMatch?.[1] ?? ""),
    );
    if (url && gif) map.set(url, gif);
  }
  return map;
}

async function main() {
  console.log(`Descargando ${SOURCE_URL}…`);
  const html = await fetchListingHtml();
  const gifByUrl = buildGifUrlByExerciseUrl(html);
  console.log(`GIFs enlazados desde el listado: ${gifByUrl.size}`);

  const content = await readFile(csvPath, "utf8");
  let { headers, rows } = parseCsv(content);

  if (!headers.includes("url")) {
    throw new Error("El CSV debe tener columna url.");
  }

  if (!headers.includes("gif_url")) {
    const urlIdx = headers.indexOf("url");
    headers.splice(urlIdx + 1, 0, "gif_url");
    for (const row of rows) {
      row.gif_url = "";
    }
  }

  let matched = 0;
  for (const row of rows) {
    const u = String(row.url ?? "").trim();
    const g = gifByUrl.get(u) ?? "";
    row.gif_url = g;
    if (g) matched += 1;
  }

  await writeFile(csvPath, toCsv(headers, rows), "utf8");
  console.log(`Filas: ${rows.length}. Filas con gif_url: ${matched}`);
  console.log(`Actualizado: ${csvPath}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
