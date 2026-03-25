import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  instructionStepsToJsonCell,
  instructionTextToStepArray,
} from "./instrucciones-a-pasos.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, "..", "sql", "ejercicios.csv");

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

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
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
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function stepsFromCell(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return [];
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed
          .map((x) => String(x ?? "").replace(/\s+/g, " ").trim())
          .filter(Boolean);
      }
    } catch {
      /* continuar como texto */
    }
  }
  return instructionTextToStepArray(s);
}

async function main() {
  const content = await readFile(csvPath, "utf8");
  const { headers, rows } = parseCsv(content);

  if (!headers.includes("instrucciones")) {
    throw new Error("No se encontró la columna instrucciones.");
  }

  let totalSteps = 0;
  for (const row of rows) {
    const steps = stepsFromCell(row.instrucciones);
    totalSteps += steps.length;
    row.instrucciones = instructionStepsToJsonCell(steps);
  }

  await writeFile(csvPath, toCsv(headers, rows), "utf8");

  console.log(`Filas: ${rows.length}`);
  console.log(`Pasos totales (suma de longitudes de arrays): ${totalSteps}`);
  console.log(`Actualizado: ${csvPath}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
