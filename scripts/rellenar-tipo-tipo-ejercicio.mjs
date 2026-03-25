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

const fit = parseCsv(await readFile("sql/ejercicios.csv", "utf8"));
const tiposRows = parseCsv(await readFile("sql/tipos_ejercicios.csv", "utf8"));

const fitTipo = new Map();
const fitByNorm = new Map();

for (const r of fit) {
  const n = (r.nombre || "").trim();
  if (!n) continue;
  const tipoVal = (r.tipo_ejercicio || "").trim();
  if (!tipoVal) continue;
  fitTipo.set(n, tipoVal);
  fitByNorm.set(normName(n), { nombre: n, tipo: tipoVal });
}

function lookupTipo(nombre) {
  const direct = fitTipo.get(nombre);
  if (direct) return { tipo: direct, source: "csv" };
  const aliasTarget = NAME_ALIASES.get(normName(nombre));
  if (aliasTarget) {
    const t = fitTipo.get(aliasTarget);
    if (t) return { tipo: t, source: "csv (alias)" };
  }
  const byNorm = fitByNorm.get(normName(nombre));
  if (byNorm?.tipo) return { tipo: byNorm.tipo, source: "csv (normalizado)" };
  return { tipo: null, source: null };
}

const results = [];
for (const r of tiposRows) {
  const nombre = (r.nombre || "").trim();
  if (!nombre) continue;
  const { tipo, source } = lookupTipo(nombre);
  results.push({ nombre, tipo, source });
}

const withTipo = results.filter((x) => x.tipo);
const noTipo = results.filter((x) => !x.tipo);

console.log("Filas en ejercicios.csv con tipo_ejercicio no vacío:", fitTipo.size);
console.log("Tipos con valor desde CSV:", withTipo.length);
console.log("Tipos sin tipo en CSV / no match:", noTipo.length);
if (noTipo.length) {
  console.log("\n--- Sin tipo en CSV o no enlazado ---");
  for (const x of noTipo) console.log(x.nombre);
}

const sql = [];
sql.push("-- Rellenar tipo (text) en tipo_ejercicio solo donde esté vacío");
sql.push("-- Fuente: sql/ejercicios.csv columna tipo_ejercicio");
sql.push("-- Condición: tipo NULL o cadena vacía (tras trim)");
sql.push("begin;");
for (const { nombre, tipo, source } of withTipo) {
  const safeNombre = sqlQuote(nombre);
  const safeTipo = sqlQuote(tipo);
  sql.push(
    `-- ${source}: ${safeNombre.slice(0, 70)}`,
    `update public.tipo_ejercicio set tipo = '${safeTipo}' where nombre = '${safeNombre}' and (tipo is null or trim(tipo) = '');`,
  );
}
sql.push("commit;");

await writeFile("sql/rellenar_tipo_tipo_ejercicio.sql", sql.join("\n") + "\n", "utf8");
console.log("\nGenerado: sql/rellenar_tipo_tipo_ejercicio.sql");
