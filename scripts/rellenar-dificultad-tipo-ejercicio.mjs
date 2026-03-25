import { readFile, writeFile } from "node:fs/promises";

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
      continue;
    }
    if (ch === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const h = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const v = splitCsvLine(lines[i]);
    const o = {};
    for (let j = 0; j < h.length; j++) o[h[j]] = v[j] ?? "";
    rows.push(o);
  }
  return rows;
}

function normName(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** nombre en BD / export -> nombre exacto en ejercicios.csv */
const NAME_ALIASES = new Map([
  [normName("Fondos entre Bancos"), "Fondos entre bancos"],
  [normName("Hiperextensiones (Lumbares)"), "Hiperextensiones"],
  [normName("Air Bike (Assault Bike)"), "Air Bike"],
  [normName("Aperturas con Mancuernas (Flyes)"), "Aperturas con Mancuernas"],
  [normName("Cruce de Poleas (Alto a Bajo)"), "Cruce de Poleas"],
  [normName("Cruce de Poleas (Bajo a Alto)"), "Cruce de Poleas"],
  [normName("Flexiones (Push-ups)"), "Flexiones"],
  [normName("Fondos en Paralelas (Dips)"), "Fondos en Paralelas"],
  [normName("Press Militar con Barra (Overhead)"), "Press Militar con Barra"],
]);

function sqlQuote(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

/** "3/3" al estilo descripcion antigua; UI usa parseInt → nivel actual (1–3) */
function parseDificultadPair(row) {
  const da = String(row.dificultad_actual ?? "").trim();
  const dm = String(row.dificultad_maxima ?? "").trim();
  if (!da || !dm) return null;
  const a = Number.parseInt(da, 10);
  const m = Number.parseInt(dm, 10);
  if (!Number.isFinite(a) || !Number.isFinite(m)) return null;
  if (a < 1 || m < 1 || a > 3 || m > 3) return null;
  return `${a}/${m}`;
}

const fit = parseCsv(await readFile("sql/ejercicios.csv", "utf8"));
const tiposRows = parseCsv(await readFile("sql/tipos_ejercicios.csv", "utf8"));

const fitDif = new Map();
const fitByNorm = new Map();

for (const r of fit) {
  const n = (r.nombre || "").trim();
  if (!n) continue;
  const dif = parseDificultadPair(r);
  if (!dif) continue;
  fitDif.set(n, dif);
  fitByNorm.set(normName(n), { nombre: n, dificultad: dif });
}

function lookupDificultad(nombre) {
  const direct = fitDif.get(nombre);
  if (direct) return { dificultad: direct, source: "csv" };
  const aliasTarget = NAME_ALIASES.get(normName(nombre));
  if (aliasTarget) {
    const d = fitDif.get(aliasTarget);
    if (d) return { dificultad: d, source: "csv (alias)" };
  }
  const byNorm = fitByNorm.get(normName(nombre));
  if (byNorm?.dificultad) return { dificultad: byNorm.dificultad, source: "csv (normalizado)" };
  return { dificultad: null, source: null };
}

const results = [];
for (const r of tiposRows) {
  const nombre = (r.nombre || "").trim();
  if (!nombre) continue;
  const { dificultad, source } = lookupDificultad(nombre);
  results.push({ nombre, dificultad, source });
}

const withDif = results.filter((x) => x.dificultad);
const noDif = results.filter((x) => !x.dificultad);

console.log("Filas en ejercicios.csv con par dificultad 1–3 válido:", fitDif.size);
console.log("Tipos con valor desde CSV:", withDif.length);
console.log("Tipos sin dificultad en CSV / no match:", noDif.length);
if (noDif.length) {
  console.log("\n--- Sin dificultad en CSV o no enlazado ---");
  for (const x of noDif) console.log(x.nombre);
}

const sql = [];
sql.push("-- Rellenar dificultad (text) en tipo_ejercicio solo donde esté vacío");
sql.push("-- Fuente: sql/ejercicios.csv dificultad_actual / dificultad_maxima → texto \"A/B\"");
sql.push("-- Condición: dificultad NULL o cadena vacía (tras trim)");
sql.push("begin;");
for (const { nombre, dificultad, source } of withDif) {
  const safeNombre = sqlQuote(nombre);
  const safeDif = sqlQuote(dificultad);
  sql.push(
    `-- ${source}: ${safeNombre.slice(0, 70)}`,
    `update public.tipo_ejercicio set dificultad = '${safeDif}' where nombre = '${safeNombre}' and (dificultad is null or trim(dificultad) = '');`,
  );
}
sql.push("commit;");

await writeFile("sql/rellenar_dificultad_tipo_ejercicio.sql", sql.join("\n") + "\n", "utf8");
console.log("\nGenerado: sql/rellenar_dificultad_tipo_ejercicio.sql");
