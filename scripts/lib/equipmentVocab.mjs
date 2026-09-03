/**
 * Vocabulario canónico de equipo, leído de `src/constants/exerciseEquipment.ts`.
 *
 * Mismo motivo que `taxonomyVocab.mjs`: los scripts de Node no pueden importar
 * el módulo TS, y duplicar el mapa a mano garantiza que acabe divergiendo del
 * que usa la UI. Se extrae del fichero TS, que es la fuente única de verdad.
 */

import fs from "node:fs";
import path from "node:path";

const EQUIPMENT_PATH = path.resolve("src/constants/exerciseEquipment.ts");
const src = fs.readFileSync(EQUIPMENT_PATH, "utf8");

function readList(name) {
  const anchor = `export const ${name} = [`;
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`No encuentro ${name} en ${EQUIPMENT_PATH}`);
  const open = at + anchor.length - 1;
  const close = src.indexOf("] as const;", open);
  if (close < 0) throw new Error(`${name} sin cierre "] as const;"`);
  const values = [...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (values.length === 0) throw new Error(`${name} está vacío`);
  return values;
}

function readSinonimos() {
  const anchor = "export const EQUIPO_SINONIMOS: Record<string, Equipo> = {";
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`No encuentro EQUIPO_SINONIMOS en ${EQUIPMENT_PATH}`);
  const open = at + anchor.length;
  const close = src.indexOf("\n};", open);
  if (close < 0) throw new Error("EQUIPO_SINONIMOS sin cierre");
  const cuerpo = src.slice(open, close);

  const mapa = {};
  // Claves con o sin comillas: `"body weight": "Ninguno",` y `barbell: "Barra Larga",`
  const re = /(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*:\s*"([^"]+)"/g;
  for (const m of cuerpo.matchAll(re)) {
    const clave = m[1] ?? m[2];
    mapa[clave] = m[3];
  }
  if (Object.keys(mapa).length === 0) throw new Error("EQUIPO_SINONIMOS está vacío");
  return mapa;
}

export const EQUIPOS = readList("EQUIPOS");
export const EQUIPO_SINONIMOS = readSinonimos();

/** Igual que `normalizeEquipoKey` del fichero TS. */
export function normalizeEquipoKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Término de cualquier procedencia → canónico, o `null` si no se reconoce. */
export function toCanonicalEquipo(value) {
  const key = normalizeEquipoKey(value);
  if (!key) return null;
  return EQUIPO_SINONIMOS[key] ?? null;
}

/**
 * Canoniza una lista o un string con comas. Sin duplicados y en el orden de
 * `EQUIPOS`. Devuelve también lo que no ha reconocido, para poder reportarlo.
 */
export function canonicalEquipoList(value) {
  const trozos = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((s) => s.trim());
  const vistos = new Set();
  const desconocidos = [];
  for (const t of trozos) {
    if (!t) continue;
    const canonico = toCanonicalEquipo(t);
    if (canonico) vistos.add(canonico);
    else desconocidos.push(t);
  }
  return { lista: EQUIPOS.filter((e) => vistos.has(e)), desconocidos };
}
