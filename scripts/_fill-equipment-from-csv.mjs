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

/** Inferencia por palabras en el nombre (coherente con estilo del CSV español) */
function inferEquipment(nombre) {
  const n = nombre.toLowerCase();
  if (/smith|multipower/i.test(n)) return "Smith";
  if (/kettlebell|pesa rusa/i.test(n)) return "Kettlebell";
  if (/trx|suspensi[oó]n/i.test(n)) return "TRX";
  if (/trx/i.test(n)) return "TRX";
  if (/banda el[aá]stica|banda\b/i.test(n)) return "Bandas";
  if (/bal[oó]n medicinal|medicine ball/i.test(n)) return "Balón medicinal";
  if (/mancuerna/i.test(n)) return "Mancuernas";
  if (/barra\b|peso muerto|press banca|sentadilla con barra|good morning/i.test(n)) return "Barra";
  if (/polea|cable/i.test(n)) return "Polea";
  if (/m[aá]quina|lever\b|smith/i.test(n)) return "Máquina";
  if (/banco scott/i.test(n)) return "Banco Scott";
  if (/suelo|peso corporal|sin peso|flexi[oó]n|fondos en paralelas|dominada|^burpee$/i.test(n))
    return "Peso corporal";
  if (/cinta|el[ií]ptica|bicicleta est[aá]tica|assault bike|rowing|remo est[aá]tico/i.test(n))
    return "Cardio";
  if (/colchoneta|abdominal|crunch|plancha|vacuum/i.test(n) && !/mancuerna|barra|polea/i.test(n))
    return "Colchoneta";
  return null;
}

const fit = parseCsv(await readFile("sql/ejercicios.csv", "utf8"));
const tiposRows = parseCsv(await readFile("sql/tipos_ejercicios.csv", "utf8"));

function normName(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Alias: nombre en BD -> nombre exacto en ejercicios.csv */
const NAME_ALIASES = new Map([
  [normName("Fondos entre Bancos"), "Fondos entre bancos"],
  [normName("Hiperextensiones (Lumbares)"), "Hiperextensiones"],
]);

const fitMap = new Map();
const fitByNorm = new Map();
for (const r of fit) {
  const n = (r.nombre || "").trim();
  const e = (r.equipamiento || "").trim();
  if (n) {
    fitMap.set(n, e);
    fitByNorm.set(normName(n), { nombre: n, equipamiento: e });
  }
}

const uniqEquip = [...new Set([...fitMap.values()].filter(Boolean))].sort();
console.log("Valores equipamiento en ejercicios.csv:", uniqEquip.join(" | "));

function lookupFit(nombre) {
  const direct = fitMap.get(nombre);
  if (direct) return { equipment: direct, source: "csv" };
  const aliasTarget = NAME_ALIASES.get(normName(nombre));
  if (aliasTarget) {
    const e = fitMap.get(aliasTarget);
    if (e) return { equipment: e, source: "csv (alias)" };
  }
  const byNorm = fitByNorm.get(normName(nombre));
  if (byNorm?.equipamiento) return { equipment: byNorm.equipamiento, source: "csv (normalizado)" };
  const inferred = inferExerciseEquipment(nombre);
  if (inferred) return { equipment: inferred, source: "inferido" };
  return { equipment: null, source: null };
}

function inferExerciseEquipment(nombre) {
  return inferEquipment(nombre);
}

const results = [];
for (const r of tiposRows) {
  const nombre = (r.nombre || "").trim();
  if (!nombre) continue;
  const { equipment, source } = lookupFit(nombre);
  results.push({ nombre, equipment, source });
}

const noValue = results.filter((x) => !x.equipment);
const withValue = results.filter((x) => x.equipment);

console.log("\nCon valor (csv o inferido):", withValue.length);
console.log("Sin valor (revisión manual):", noValue.length);
if (noValue.length) {
  console.log("\n--- Pendientes ---");
  for (const x of noValue) console.log(x.nombre);
}

const sql = [];
sql.push("-- Rellenar equipment en tipo_ejercicio solo donde esté vacío");
sql.push("-- Ejecutar tras revisar. Fuente: sql/ejercicios.csv + inferencia por nombre.");
sql.push("begin;");
for (const { nombre, equipment, source } of withValue) {
  const safe = (s) => String(s).replace(/'/g, "''");
  sql.push(
    `-- ${source}: ${safe(nombre).slice(0, 60)}`,
    `update public.tipo_ejercicio set equipment = '${safe(equipment)}' where nombre = '${safe(
      nombre,
    )}' and (equipment is null or trim(equipment) = '');`,
  );
}
sql.push("commit;");

await writeFile("sql/rellenar_equipment_tipo_ejercicio.sql", sql.join("\n") + "\n", "utf8");
console.log("\nGenerado: sql/rellenar_equipment_tipo_ejercicio.sql");
