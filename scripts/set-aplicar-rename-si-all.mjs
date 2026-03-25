import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SOURCE_FILE = path.resolve(
  rootDir,
  "sql",
  "ejercicios_no_coinciden_con_sugerencia.csv",
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

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
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

async function main() {
  const content = await readFile(SOURCE_FILE, "utf8");
  const { headers, rows } = parseCsv(content);

  if (!headers.includes("aplicar_rename")) {
    throw new Error(
      `No existe la columna "aplicar_rename" en ${SOURCE_FILE}.`,
    );
  }

  for (const row of rows) {
    row.aplicar_rename = "si";
  }

  const outLines = [headers.join(",")];
  for (const row of rows) {
    outLines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }

  await writeFile(SOURCE_FILE, `${outLines.join("\n")}\n`, "utf8");
  console.log(`Actualizado: ${SOURCE_FILE}`);
  console.log(`Filas: ${rows.length}. aplicar_rename=si en todas.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});

