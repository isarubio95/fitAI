import { readFile, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";

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

function sqlQuote(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

/**
 * Alias: nombre en BD -> nombre exacto en sql/ejercicios.csv
 * (mismo criterio que scripts de rellenado anteriores)
 */
const NAME_ALIASES = new Map([
  [normName("Air Bike (Assault Bike)"), "Air Bike"],
  [normName("Aperturas con Mancuernas (Flyes)"), "Aperturas con Mancuernas"],
  [normName("Cruce de Poleas (Alto a Bajo)"), "Cruce de Poleas"],
  [normName("Cruce de Poleas (Bajo a Alto)"), "Cruce de Poleas"],
  [normName("Flexiones (Push-ups)"), "Flexiones"],
  [normName("Fondos en Paralelas (Dips)"), "Fondos en Paralelas"],
  [normName("Fondos entre Bancos"), "Fondos entre bancos"],
  [normName("Hiperextensiones (Lumbares)"), "Hiperextensiones"],
  [normName("Press Militar con Barra (Overhead)"), "Press Militar con Barra"],
]);

const PROBLEMATIC = [
  { id: "2264e45d-d496-4902-a9b8-e42eaff5f5d0", nombre: "Air Bike (Assault Bike)" },
  { id: "3bd8696f-fba7-4500-a2d7-e10bc6fe5c67", nombre: "Aperturas con Mancuernas (Flyes)" },
  { id: "85368ee3-2fc1-46b1-9188-800358ebd938", nombre: "Cruce de Poleas (Alto a Bajo)" },
  { id: "85074f0b-d739-458f-b5fd-0a24bc36dc64", nombre: "Cruce de Poleas (Bajo a Alto)" },
  { id: "22368eee-320f-4198-8e54-7b625a55260d", nombre: "Flexiones (Push-ups)" },
  { id: "a4a2782a-d597-4ea2-a0f1-17f68247835b", nombre: "Fondos en Paralelas (Dips)" },
  { id: "e842fea7-9c4a-40e9-aaa3-5af1c42f4c81", nombre: "Fondos entre Bancos" },
  { id: "3ba9a0e1-b044-4d20-80a5-daf6be1171c1", nombre: "Hiperextensiones (Lumbares)" },
  { id: "9f01fc30-8b1a-47fa-b643-cccbe89158f9", nombre: "Press Militar con Barra (Overhead)" },
];

const fitRows = parseCsv(await readFile("sql/ejercicios.csv", "utf8"));
const fitGifByNombre = new Map();
const fitByNorm = new Map();
for (const r of fitRows) {
  const n = String(r.nombre ?? "").trim();
  const gif = String(r.gif_url ?? "").trim();
  if (!n || !gif) continue;
  fitGifByNombre.set(n, gif);
  fitByNorm.set(normName(n), gif);
}

const actualGifs = new Set(readdirSync("public/ejercicios").filter((f) => f.toLowerCase().endsWith(".gif")));

function lookupGif(nombre) {
  const direct = fitGifByNombre.get(nombre);
  if (direct) return { gif: direct, source: "csv" };

  const aliasTarget = NAME_ALIASES.get(normName(nombre));
  if (aliasTarget) {
    const g = fitGifByNombre.get(aliasTarget);
    if (g) return { gif: g, source: "csv (alias)" };
  }

  const byNorm = fitByNorm.get(normName(nombre));
  if (byNorm) return { gif: byNorm, source: "csv (normalizado)" };

  return { gif: null, source: null };
}

const updates = [];
const stillNoMatch = [];
const noPhysicalFile = [];

for (const x of PROBLEMATIC) {
  const { gif, source } = lookupGif(x.nombre);
  if (!gif) {
    stillNoMatch.push(x);
    continue;
  }
  const base = gif.split("/").pop();
  const local = `/ejercicios/${base}`;
  if (!actualGifs.has(base)) {
    noPhysicalFile.push({ ...x, local, source });
    continue;
  }
  updates.push({ ...x, local, source });
}

const sql = [];
sql.push("-- Arreglar gif_url locales usando aliases de nombre");
sql.push("-- Fuente: sql/ejercicios.csv (gif_url) + comprobación física en public/ejercicios");
sql.push("begin;");
for (const u of updates) {
  sql.push(
    `-- ${u.source}: ${sqlQuote(u.nombre)}`,
    `update public.tipo_ejercicio set gif_url = '${sqlQuote(u.local)}' where id = '${sqlQuote(u.id)}';`,
  );
}
sql.push("commit;");

if (stillNoMatch.length) {
  sql.push("");
  sql.push("-- AUN SIN MATCH EN sql/ejercicios.csv (revisar nombre/alias):");
  for (const x of stillNoMatch) sql.push(`-- ${x.id} | ${x.nombre}`);
}
if (noPhysicalFile.length) {
  sql.push("");
  sql.push("-- MATCH PERO FALTA EL GIF EN public/ejercicios (revisar deploy/archivos):");
  for (const x of noPhysicalFile) sql.push(`-- ${x.id} | ${x.nombre} -> ${x.local} (${x.source})`);
}

await writeFile("sql/fix_gif_url_missing_local_files_aliases.sql", sql.join("\n") + "\n", "utf8");

console.log("Updates generados:", updates.length);
console.log("Aún sin match:", stillNoMatch.length);
console.log("Sin fichero físico:", noPhysicalFile.length);
console.log("Generado: sql/fix_gif_url_missing_local_files_aliases.sql");

