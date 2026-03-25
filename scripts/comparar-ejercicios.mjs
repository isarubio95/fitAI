import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const DB_FILE = path.resolve(rootDir, "sql", "tipos_ejercicios.csv");
const LIST_FILE = path.resolve(rootDir, "sql", "ejercicios.csv");
const OUTPUT_FILE = path.resolve(rootDir, "sql", "ejercicios_no_coinciden.csv");
/** Sugerencias solo por similitud de texto; no pisar el CSV curado a mano. */
const OUTPUT_AUTO_SUGGESTIONS_FILE = path.resolve(
  rootDir,
  "sql",
  "ejercicios_sugerencias_por_string.csv",
);

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
  if (lines.length === 0) return [];

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

  return rows;
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function normalizeName(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toCsv(rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function tokenSet(text) {
  return new Set(
    text
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length > 1),
  );
}

function similarityScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }

  const union = new Set([...aTokens, ...bTokens]).size;
  const jaccard = union > 0 ? intersection / union : 0;
  const containsBonus = a.includes(b) || b.includes(a) ? 0.2 : 0;
  return Math.min(1, jaccard + containsBonus);
}

function getBestSuggestion(target, options) {
  let best = { nombre: "", score: 0 };
  for (const option of options) {
    const score = similarityScore(target, option.normalizado);
    if (score > best.score) {
      best = { nombre: option.nombre_original, score };
    }
  }
  return best;
}

async function main() {
  const [dbContent, listContent] = await Promise.all([
    readFile(DB_FILE, "utf8"),
    readFile(LIST_FILE, "utf8"),
  ]);

  const dbRows = parseCsv(dbContent);
  const listRows = parseCsv(listContent);
  const listEntries = listRows
    .map((row) => ({
      nombre_original: row.nombre ?? "",
      normalizado: normalizeName(row.nombre),
    }))
    .filter((entry) => entry.normalizado.length > 0);

  const listNamesNormalized = new Set(
    listEntries
      .map((row) => row.normalizado)
      .filter((name) => name.length > 0),
  );

  const missing = [];
  const missingWithSuggestions = [];
  for (const row of dbRows) {
    const rawName = row.nombre ?? "";
    const normalized = normalizeName(rawName);
    const matches = listNamesNormalized.has(normalized);

    if (!matches) {
      const suggestion = getBestSuggestion(normalized, listEntries);
      const confidence =
        suggestion.score >= 0.75
          ? "alta"
          : suggestion.score >= 0.45
            ? "media"
            : "baja";

      missing.push({
        id: row.id ?? "",
        nombre_bd: rawName,
        nombre_normalizado: normalized,
        coincide_en_ejercicios_csv: "no",
      });

      missingWithSuggestions.push({
        id: row.id ?? "",
        nombre_bd: rawName,
        nombre_normalizado: normalized,
        sugerencia_fitcron: suggestion.nombre,
        score_sugerencia: suggestion.score.toFixed(4),
        confianza_sugerencia: confidence,
        aplicar_rename: "",
      });
    }
  }

  const outputCsv = toCsv(missing, [
    "id",
    "nombre_bd",
    "nombre_normalizado",
    "coincide_en_ejercicios_csv",
  ]);
  await writeFile(OUTPUT_FILE, outputCsv, "utf8");

  const suggestionsCsv = toCsv(missingWithSuggestions, [
    "id",
    "nombre_bd",
    "nombre_normalizado",
    "sugerencia_fitcron",
    "score_sugerencia",
    "confianza_sugerencia",
    "aplicar_rename",
  ]);
  await writeFile(OUTPUT_AUTO_SUGGESTIONS_FILE, suggestionsCsv, "utf8");

  console.log(`Registros BD: ${dbRows.length}`);
  console.log(`Ejercicios referencia: ${listRows.length}`);
  console.log(`No coinciden: ${missing.length}`);
  console.log(`Archivo generado: ${OUTPUT_FILE}`);
  console.log(`Sugerencias automaticas (string): ${OUTPUT_AUTO_SUGGESTIONS_FILE}`);
}

main().catch((error) => {
  console.error("Error comparando ejercicios:", error.message);
  process.exitCode = 1;
});
