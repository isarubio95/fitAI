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
const OUTPUT_FILE = path.resolve(
  rootDir,
  "sql",
  "borrar_tipos_ejercicio_fitcron.sql",
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

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function shouldDelete(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return v === "1" || v === "si" || v === "sí" || v === "true" || v === "x";
}

function shouldApplyRename(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return v === "1" || v === "si" || v === "sí" || v === "true" || v === "x";
}

async function main() {
  const content = await readFile(SOURCE_FILE, "utf8");
  const rows = parseCsv(content);

  const toDelete = [];
  for (const row of rows) {
    if (!shouldDelete(row.borrar)) continue;
    const id = String(row.id ?? "").trim();
    if (!id) continue;
    toDelete.push({
      id,
      nombreBd: String(row.nombre_bd ?? "").trim(),
      alsoHadRename: shouldApplyRename(row.aplicar_rename),
    });
  }

  const idsSql = toDelete.map((d) => `'${sqlEscape(d.id)}'`).join(",\n  ");

  const lines = [];
  lines.push("-- Generado automaticamente por scripts/generar-sql-borrar-tipos-ejercicio.mjs");
  lines.push(
    "-- Filas con borrar = si / 1 / true / x (sin excepción: también si tienen aplicar_rename).",
  );
  lines.push("-- Fuente: sql/ejercicios_no_coinciden_con_sugerencia.csv");
  lines.push("-- Orden: serie -> ejercicio -> rutina_ejercicio -> tipo_ejercicio");
  lines.push("");
  lines.push("begin;");
  lines.push("");

  for (const item of toDelete) {
    const note = item.alsoHadRename ? " [borrar manda sobre renombre]" : "";
    lines.push(`-- borrar tipo_ejercicio: ${item.nombreBd} (${item.id})${note}`);
  }
  if (toDelete.length > 0) lines.push("");

  if (toDelete.length === 0) {
    lines.push("-- Nada que borrar segun el CSV.");
  } else {
    lines.push("delete from public.serie");
    lines.push("where ejercicio_id in (");
    lines.push("  select id from public.ejercicio");
    lines.push("  where tipo_ejercicio_id in (");
    lines.push(`    ${idsSql}`);
    lines.push("  )");
    lines.push(");");
    lines.push("");
    lines.push("delete from public.ejercicio");
    lines.push("where tipo_ejercicio_id in (");
    lines.push(`  ${idsSql}`);
    lines.push(");");
    lines.push("");
    lines.push("delete from public.rutina_ejercicio");
    lines.push("where tipo_ejercicio_id in (");
    lines.push(`  ${idsSql}`);
    lines.push(");");
    lines.push("");
    lines.push("delete from public.tipo_ejercicio");
    lines.push("where id in (");
    lines.push(`  ${idsSql}`);
    lines.push(");");
  }

  lines.push("");
  lines.push("commit;");
  lines.push("");

  await writeFile(OUTPUT_FILE, `${lines.join("\n")}\n`, "utf8");

  console.log(`Filas revisadas: ${rows.length}`);
  console.log(`Tipos marcados para borrar: ${toDelete.length}`);
  console.log(`SQL generado: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error("Error generando SQL de borrado:", error.message);
  process.exitCode = 1;
});
