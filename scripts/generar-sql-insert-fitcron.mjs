import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const CSV_FILE = path.resolve(rootDir, "sql", "ejercicios.csv");
const OUTPUT_FILE = path.resolve(rootDir, "sql", "insertar_ejercicios_fitcron.sql");

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

function sqlStringLiteral(value) {
  return `'${sqlEscape(value)}'`;
}

/** PostgreSQL text[] literal para usar en SQL generado. */
function pgTextArray(elements) {
  const list = (elements ?? [])
    .map((s) => String(s ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (list.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${list.map((s) => sqlStringLiteral(s)).join(", ")}]::text[]`;
}

function splitMuscles(csvValue) {
  return String(csvValue ?? "")
    .split(",")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseInstructionsJson(cell) {
  const raw = String(cell ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((x) => String(x ?? "").replace(/\s+/g, " ").trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function buildDescripcion(row) {
  const tipo = String(row.tipo_ejercicio ?? "").trim();
  const grupo = String(row.grupo_muscular ?? "").trim();
  const musc = String(row.musculos_involucrados ?? "").trim();
  const da = String(row.dificultad_actual ?? "").trim();
  const dm = String(row.dificultad_maxima ?? "").trim();
  const parts = [];
  if (tipo) parts.push(`Tipo: ${tipo}.`);
  if (grupo) parts.push(`Grupo muscular: ${grupo}.`);
  if (musc) parts.push(`Músculos: ${musc}.`);
  if (da && dm) parts.push(`Dificultad: ${da}/${dm}.`);
  parts.push("Catálogo FitCron.");
  return parts.join(" ");
}

function buildDificultad(row) {
  const da = String(row.dificultad_actual ?? "").trim();
  const dm = String(row.dificultad_maxima ?? "").trim();
  if (da && dm) return `${da}/${dm}`;
  if (da) return da;
  return "";
}

async function main() {
  const content = await readFile(CSV_FILE, "utf8");
  const rows = parseCsv(content);

  const lines = [];
  lines.push("-- insertar_ejercicios_fitcron.sql");
  lines.push("-- Generado por scripts/generar-sql-insert-fitcron.mjs desde sql/ejercicios.csv");
  lines.push("--");
  lines.push("-- Orden recomendado respecto al resto de migración FitCron:");
  lines.push("--   0) sql/gym_normalize_tipo_nombre.sql  (función; una vez por BD)");
  lines.push("--   1) sql/renombrar_ejercicios_fitcron.sql");
  lines.push("--   2) sql/borrar_tipos_ejercicio_fitcron.sql");
  lines.push("--   3) este archivo");
  lines.push("--");
  lines.push("-- Solo inserta si gym_normalize_tipo_nombre(nombre) no coincide con ningún");
  lines.push("-- tipo_ejercicio existente (misma normalización que comparar-ejercicios.mjs).");
  lines.push("-- usuario_id NULL = ejercicio de catálogo (como en tipos_ejercicios export).");
  lines.push("");
  lines.push("begin;");
  lines.push("");

  let inserts = 0;
  for (const row of rows) {
    const nombre = String(row.nombre ?? "").trim();
    if (!nombre) continue;

    let bodyParts = splitMuscles(row.musculos_involucrados);
    if (bodyParts.length === 0) {
      const g = String(row.grupo_muscular ?? "").trim();
      if (g) bodyParts = [g];
    }

    const instructions = parseInstructionsJson(row.instrucciones);
    const descripcion = buildDescripcion(row);
    const gifUrl = String(row.gif_url ?? "").trim();
    const equipment = String(row.equipamiento ?? "").trim();
    const tipoEjercicio = String(row.tipo_ejercicio ?? "").trim();
    const grupoMuscular = String(row.grupo_muscular ?? "").trim();
    const dificultad = buildDificultad(row);

    lines.push(`-- ${nombre}`);
    lines.push(
      "insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)",
    );
    lines.push("select");
    lines.push(`  ${sqlStringLiteral(nombre)}::text as nombre,`);
    lines.push(`  ${sqlStringLiteral(descripcion)}::text as descripcion,`);
    lines.push(`  ${tipoEjercicio ? sqlStringLiteral(tipoEjercicio) : "null"}::text as tipo,`);
    lines.push(`  ${grupoMuscular ? sqlStringLiteral(grupoMuscular) : "null"}::text as grupo_muscular,`);
    lines.push(`  ${dificultad ? sqlStringLiteral(dificultad) : "null"}::text as dificultad,`);
    lines.push(`  null::uuid as usuario_id,`);
    lines.push(`  ${sqlStringLiteral(gifUrl)}::text as gif_url,`);
    lines.push(`  ${pgTextArray(bodyParts)} as musculos_involucrados,`);
    lines.push(`  ${sqlStringLiteral(equipment)}::text as equipment,`);
    lines.push(`  ${pgTextArray(instructions)} as instructions`);
    lines.push("where not exists (");
    lines.push(
      "  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre(" +
        sqlStringLiteral(nombre) +
        ")",
    );
    lines.push(");");
    lines.push("");
    inserts += 1;
  }

  lines.push("commit;");
  lines.push("");

  await writeFile(OUTPUT_FILE, lines.join("\n"), "utf8");

  console.log(`Filas en CSV: ${rows.length}`);
  console.log(`Sentencias insert preparadas: ${inserts}`);
  console.log(`SQL generado: ${OUTPUT_FILE}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
