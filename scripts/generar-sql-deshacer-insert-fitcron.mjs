import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const CSV_FILE = path.resolve(rootDir, "sql", "ejercicios.csv");
const OUTPUT_FILE = path.resolve(rootDir, "sql", "deshacer_insertar_ejercicios_fitcron.sql");

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
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
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

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function sqlStringLiteral(value) {
  return `'${sqlEscape(value)}'`;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  // Ejemplo: --interval "4 hours"
  const i = argv.indexOf("--interval");
  const interval = i >= 0 && argv[i + 1] ? argv[i + 1] : "2 hours";
  return { interval };
}

async function main() {
  const { interval } = parseArgs();

  const content = await readFile(CSV_FILE, "utf8");
  const { headers, rows } = parseCsv(content);

  if (!headers.includes("nombre")) {
    throw new Error('No se encontró columna "nombre" en sql/ejercicios.csv');
  }

  const nombres = rows
    .map((r) => String(r.nombre ?? "").trim())
    .filter(Boolean);

  // Dedupe para evitar IN enorme duplicado
  const unique = Array.from(new Set(nombres));

  // Nota: esto BORRA SOLO catálogo (usuario_id is null) y SOLO lo creado "recientemente".
  // Si no tienes backup y el rango temporal no coincide, hay riesgo de borrar más de lo deseado.
  const nombresSql = unique.map((n) => sqlStringLiteral(n)).join(",\n  ");

  const lines = [];
  lines.push("-- deshacer_insertar_ejercicios_fitcron.sql");
  lines.push("-- Borrado best-effort de lo insertado recientemente por insertar_ejercicios_fitcron.sql.");
  lines.push("-- NOTA: usa un filtro por created_at reciente para aproximar el rollback.");
  lines.push(`-- intervalo creado: created_at >= (now() - interval '${interval}')`);
  lines.push("-- Candidatos: public.tipo_ejercicio (catálogo) con usuario_id is null y nombre en la lista del CSV.");
  lines.push("-- Orden: serie -> ejercicio -> rutina_ejercicio -> tipo_ejercicio (respeta FKs).");
  lines.push("");
  lines.push("begin;");
  lines.push("");
  lines.push("-- 0) Determinar ids objetivo en una tabla temporal (CTE no persiste entre sentencias).");
  lines.push("create temporary table target_ids (");
  lines.push("  id uuid primary key");
  lines.push(") on commit drop;");
  lines.push("");
  lines.push("insert into target_ids(id)");
  lines.push("select te.id");
  lines.push("from public.tipo_ejercicio te");
  lines.push("where te.usuario_id is null");
  lines.push(`  and te.created_at >= (now() - interval '${interval}')`);
  lines.push("  and te.nombre in (");
  lines.push(`  ${nombresSql}`);
  lines.push("  );");
  lines.push("");
  lines.push("-- 1) Previsualizar cuántos tipos se borrarán:");
  lines.push("select count(*) as tipos_a_borrar from target_ids;");
  lines.push("");
  lines.push("-- 2) Borrado real:");
  lines.push("delete from public.serie");
  lines.push("where ejercicio_id in (");
  lines.push("  select e.id");
  lines.push("  from public.ejercicio e");
  lines.push("  where e.tipo_ejercicio_id in (select id from target_ids)");
  lines.push(");");
  lines.push("");
  lines.push("delete from public.ejercicio");
  lines.push("where tipo_ejercicio_id in (select id from target_ids);");
  lines.push("");
  lines.push("delete from public.rutina_ejercicio");
  lines.push("where tipo_ejercicio_id in (select id from target_ids);");
  lines.push("");
  lines.push("delete from public.tipo_ejercicio");
  lines.push("where id in (select id from target_ids);");
  lines.push("");
  lines.push("commit;");

  await writeFile(OUTPUT_FILE, `${lines.join("\n")}\n`, "utf8");
  console.log(`Generado: ${OUTPUT_FILE}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});

