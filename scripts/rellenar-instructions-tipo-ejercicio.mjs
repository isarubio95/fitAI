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

/** Parse instrucciones cell: JSON array de strings */
function parseInstructionSteps(cell) {
  const raw = String(cell ?? "").trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const steps = parsed
      .map((x) => (typeof x === "string" ? x.trim() : String(x ?? "").trim()))
      .filter(Boolean);
    return steps.length ? steps : null;
  } catch {
    return null;
  }
}

/** Literal PostgreSQL text[] para columna instructions */
function toPgTextArray(steps) {
  const parts = steps.map((s) => `'${sqlQuote(s)}'`);
  return `ARRAY[${parts.join(", ")}]::text[]`;
}

const fit = parseCsv(await readFile("sql/ejercicios.csv", "utf8"));
const tiposRows = parseCsv(await readFile("sql/tipos_ejercicios.csv", "utf8"));

const fitInstructions = new Map();
const fitByNorm = new Map();

for (const r of fit) {
  const n = (r.nombre || "").trim();
  if (!n) continue;
  const steps = parseInstructionSteps(r.instrucciones);
  fitInstructions.set(n, steps);
  fitByNorm.set(normName(n), { nombre: n, steps });
}

function lookupSteps(nombre) {
  const direct = fitInstructions.get(nombre);
  if (direct?.length) return { steps: direct, source: "csv" };
  const aliasTarget = NAME_ALIASES.get(normName(nombre));
  if (aliasTarget) {
    const s = fitInstructions.get(aliasTarget);
    if (s?.length) return { steps: s, source: "csv (alias)" };
  }
  const byNorm = fitByNorm.get(normName(nombre));
  if (byNorm?.steps?.length) return { steps: byNorm.steps, source: "csv (normalizado)" };
  return { steps: null, source: null };
}

const results = [];
for (const r of tiposRows) {
  const nombre = (r.nombre || "").trim();
  if (!nombre) continue;
  const { steps, source } = lookupSteps(nombre);
  results.push({ nombre, steps, source });
}

const withSteps = results.filter((x) => x.steps?.length);
const noSteps = results.filter((x) => !x.steps?.length);

console.log("Filas en ejercicios.csv con instrucciones parseables:", [...fitInstructions.values()].filter(Boolean).length);
console.log("Tipos con pasos desde CSV:", withSteps.length);
console.log("Tipos sin pasos (revisar):", noSteps.length);
if (noSteps.length) {
  console.log("\n--- Sin instrucciones en CSV / no parseable ---");
  for (const x of noSteps) console.log(x.nombre);
}

const sql = [];
sql.push("-- Rellenar instructions (text[]) en tipo_ejercicio solo donde esté vacío");
sql.push("-- Fuente: sql/ejercicios.csv columna instrucciones (JSON array)");
sql.push("-- Condición: instructions NULL o array vacío");
sql.push("begin;");
for (const { nombre, steps, source } of withSteps) {
  const safeNombre = sqlQuote(nombre);
  const arr = toPgTextArray(steps);
  sql.push(
    `-- ${source}: ${safeNombre.slice(0, 70)}`,
    `update public.tipo_ejercicio set instructions = ${arr} where nombre = '${safeNombre}' and (instructions is null or coalesce(cardinality(instructions), 0) = 0);`,
  );
}
sql.push("commit;");

await writeFile("sql/rellenar_instructions_tipo_ejercicio.sql", sql.join("\n") + "\n", "utf8");
console.log("\nGenerado: sql/rellenar_instructions_tipo_ejercicio.sql");
