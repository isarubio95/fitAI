/**
 * Vocabularios de la taxonomía, leídos de `src/constants/exerciseTaxonomy.ts`.
 *
 * Los scripts de Node no pueden importar el módulo TS directamente, y copiar
 * las listas a mano garantiza que acaben divergiendo del CHECK de la BD. Se
 * extraen del fichero TS, que es la fuente única de verdad.
 */

import fs from "node:fs";
import path from "node:path";

const TAXONOMY_PATH = path.resolve("src/constants/exerciseTaxonomy.ts");

function readList(name) {
  const src = fs.readFileSync(TAXONOMY_PATH, "utf8");
  const anchor = `export const ${name} = [`;
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`No encuentro ${name} en ${TAXONOMY_PATH}`);
  const open = at + anchor.length - 1;
  const close = src.indexOf("] as const;", open);
  if (close < 0) throw new Error(`${name} sin cierre "] as const;"`);
  const values = [...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (values.length === 0) throw new Error(`${name} está vacío`);
  return values;
}

export const PATRONES_MOVIMIENTO_SQL = readList("PATRONES_MOVIMIENTO");
export const CUALIDADES_SQL = readList("CUALIDADES");
export const PLANOS_SQL = readList("PLANOS");
export const DEPORTES_SQL = readList("DEPORTES");
export const ORIGENES_SQL = readList("ORIGENES");
