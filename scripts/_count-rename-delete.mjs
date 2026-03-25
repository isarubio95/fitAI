import { readFile } from "node:fs/promises";

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
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j += 1) row[headers[j]] = values[j] ?? "";
    rows.push(row);
  }
  return rows;
}

const toSi = (v) => {
  const t = String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/^["']|["']$/g, "");
  return t === "1" || t === "si" || t === "sí" || t === "true" || t === "x";
};

const rows = parseCsv(
  await readFile(
    new URL("../sql/ejercicios_no_coinciden_con_sugerencia.csv", import.meta.url),
    "utf8",
  ),
);

let countBorrar = 0;
let countAplicar = 0;
let countBoth = 0;

for (const r of rows) {
  const b = toSi(r.borrar);
  const a = toSi(r.aplicar_rename);
  if (b) countBorrar += 1;
  if (a) countAplicar += 1;
  if (a && b) countBoth += 1;
}

console.log(
  JSON.stringify(
    {
      filas: rows.length,
      aplicar_rename_si: countAplicar,
      borrar_si: countBorrar,
      ambas: countBoth,
    },
    null,
    2,
  ),
);

