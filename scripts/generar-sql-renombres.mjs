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
const OUTPUT_FILE = path.resolve(rootDir, "sql", "renombrar_ejercicios_fitcron.sql");

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

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function shouldApply(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return v === "1" || v === "si" || v === "sí" || v === "true" || v === "x";
}

async function main() {
  const content = await readFile(SOURCE_FILE, "utf8");
  const rows = parseCsv(content);

  const updates = [];
  for (const row of rows) {
    if (!shouldApply(row.aplicar_rename)) continue;
    if (shouldApply(row.borrar)) continue;

    const id = String(row.id ?? "").trim();
    const nombreFinal = String(row.nombre_final ?? "").trim();
    const sugerencia = String(row.sugerencia_fitcron ?? "").trim();
    const nuevoNombre = nombreFinal || sugerencia;

    if (!id || !nuevoNombre) continue;
    updates.push({ id, nuevoNombre, nombreAnterior: row.nombre_bd ?? "" });
  }

  const lines = [];
  lines.push("-- Generado automaticamente por scripts/generar-sql-renombres.mjs");
  lines.push("-- Marca aplicar_rename = si / 1 / true / x en el CSV");
  lines.push("-- Si existe columna nombre_final, tiene prioridad sobre sugerencia_fitcron");
  lines.push("-- REGLA: borrar = si tiene PRIORIDAD ABSOLUTA. Esas filas NO generan UPDATE");
  lines.push("-- aunque también tengan aplicar_rename o nombre_final (se borran en borrar_tipos...).");
  lines.push("");
  lines.push("begin;");
  lines.push("");

  for (const item of updates) {
    lines.push(`-- ${item.nombreAnterior} -> ${item.nuevoNombre}`);
    lines.push(
      `update public.tipo_ejercicio set nombre = '${sqlEscape(item.nuevoNombre)}' where id = '${sqlEscape(item.id)}';`,
    );
    lines.push("");
  }

  lines.push("-- Validacion rapida");
  lines.push("select id, nombre from public.tipo_ejercicio where id in (");
  lines.push(
    updates.length > 0
      ? updates.map((u) => `  '${sqlEscape(u.id)}'`).join(",\n")
      : "  '00000000-0000-0000-0000-000000000000'",
  );
  lines.push(");");
  lines.push("");
  lines.push("commit;");
  lines.push("");

  await writeFile(OUTPUT_FILE, `${lines.join("\n")}\n`, "utf8");

  console.log(`Filas revisadas: ${rows.length}`);
  console.log(`Renombres marcados: ${updates.length}`);
  console.log(`SQL generado: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error("Error generando SQL:", error.message);
  process.exitCode = 1;
});
