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

const fitGrupo = new Map();
const fitByNorm = new Map();

for (const r of fit) {
  const n = (r.nombre || "").trim();
  if (!n) continue;
  const grupoVal = (r.grupo_muscular || "").trim();
  if (!grupoVal) continue;
  fitGrupo.set(n, grupoVal);
  fitByNorm.set(normName(n), { nombre: n, grupo: grupoVal });
}

function lookupGrupo(nombre) {
  const direct = fitGrupo.get(nombre);
  if (direct) return { grupo: direct, source: "csv" };
  const aliasTarget = NAME_ALIASES.get(normName(nombre));
  if (aliasTarget) {
    const g = fitGrupo.get(aliasTarget);
    if (g) return { grupo: g, source: "csv (alias)" };
  }
  const byNorm = fitByNorm.get(normName(nombre));
  if (byNorm?.grupo) return { grupo: byNorm.grupo, source: "csv (normalizado)" };
  return { grupo: null, source: null };
}

const results = [];
for (const r of tiposRows) {
  const nombre = (r.nombre || "").trim();
  if (!nombre) continue;
  const { grupo, source } = lookupGrupo(nombre);
  results.push({ nombre, grupo, source });
}

const withGrupo = results.filter((x) => x.grupo);
const noGrupo = results.filter((x) => !x.grupo);

console.log("Filas en ejercicios.csv con grupo_muscular no vacío:", fitGrupo.size);
console.log("Tipos con valor desde CSV:", withGrupo.length);
console.log("Tipos sin grupo en CSV / no match:", noGrupo.length);
if (noGrupo.length) {
  console.log("\n--- Sin grupo_muscular en CSV o no enlazado ---");
  for (const x of noGrupo) console.log(x.nombre);
}

const sql = [];
sql.push("-- Rellenar grupo_muscular (text) en tipo_ejercicio solo donde esté vacío");
sql.push("-- Fuente: sql/ejercicios.csv columna grupo_muscular");
sql.push("-- Condición: grupo_muscular NULL o cadena vacía (tras trim)");
sql.push("begin;");
for (const { nombre, grupo, source } of withGrupo) {
  const safeNombre = sqlQuote(nombre);
  const safeGrupo = sqlQuote(grupo);
  sql.push(
    `-- ${source}: ${safeNombre.slice(0, 70)}`,
    `update public.tipo_ejercicio set grupo_muscular = '${safeGrupo}' where nombre = '${safeNombre}' and (grupo_muscular is null or trim(grupo_muscular) = '');`,
  );
}
sql.push("commit;");

await writeFile("sql/rellenar_grupo_muscular_tipo_ejercicio.sql", sql.join("\n") + "\n", "utf8");
console.log("\nGenerado: sql/rellenar_grupo_muscular_tipo_ejercicio.sql");
