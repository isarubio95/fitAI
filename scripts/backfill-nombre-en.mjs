/**
 * Rellena `tipo_ejercicio.nombre_en` en todo el catálogo.
 *
 *   node scripts/backfill-nombre-en.mjs            # SIMULACIÓN (por defecto)
 *   node scripts/backfill-nombre-en.mjs --apply    # escribe de verdad
 *   node scripts/backfill-nombre-en.mjs --apply --force   # sobreescribe lo ya puesto
 *
 * El nombre en inglés existía ya en el proyecto, pero se tiraba por dos sitios
 * distintos, así que se recupera de dos maneras:
 *
 *   IMPORTADAS (origen fdb/lyfta)
 *     `data/exercise-import.json` trae `nombre_en` por fila. El cruce es por
 *     (origen, origen_externo_id), que tiene índice único en la tabla
 *     —`tipo_ejercicio_origen_externo_uidx`—, así que es 1:1 sin ambigüedad.
 *
 *   NATIVAS (origen null)
 *     Lo llevan dentro del nombre del fichero de la demo:
 *       /ejercicios/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif
 *     `nombreDesdeGif()` (scripts/tag-native-catalog.mjs) ya sabe leerlo.
 *     Cubre 747 de 750; las 3 sin prefijo de id se reportan sin tocar.
 *
 * IMPORTANTE: ejecutar ANTES de renombrar los medios a .webp. En las nativas el
 * inglés vive en el nombre del fichero, así que si primero se renombran los
 * medios el dato se pierde.
 *
 * Requiere la migración 20260904090000_exercise_nombre_en.sql aplicada, y
 * VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { nombreDesdeGif } from "./tag-native-catalog.mjs";

const IMPORT_PATH = "data/exercise-import.json";
const PAGINA = 1000;

const args = process.argv.slice(2);
const APLICAR = args.includes("--apply");
const FORZAR = args.includes("--force");

function cargarEnv() {
  const p = path.resolve(".env");
  if (!fs.existsSync(p)) return;
  for (const linea of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    let v = m[2] ?? "";
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

/** Lee una tabla entera saltando el tope de filas de PostgREST. */
async function leerTodo(supabase, columnas) {
  const filas = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await supabase
      .from("tipo_ejercicio")
      .select(columnas)
      .order("id", { ascending: true })
      .range(desde, desde + PAGINA - 1);
    if (error) throw new Error(`lectura de tipo_ejercicio: ${error.message}`);
    filas.push(...(data ?? []));
    if (!data || data.length < PAGINA) return filas;
  }
}

async function main() {
  cargarEnv();

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error("Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(IMPORT_PATH)) {
    console.error(`Falta ${IMPORT_PATH}. Ejecuta primero: npm run catalogo:build`);
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Mapa de nombres en inglés de las fuentes externas ─────────────────────
  const importadas = JSON.parse(fs.readFileSync(IMPORT_PATH, "utf8"));
  const porClaveExterna = new Map();
  for (const fila of importadas) {
    if (!fila.origen || !fila.origen_externo_id || !fila.nombre_en) continue;
    porClaveExterna.set(`${fila.origen}:${fila.origen_externo_id}`, fila.nombre_en);
  }

  const filas = await leerTodo(supabase, "id, nombre, nombre_en, gif_url, origen, origen_externo_id");

  // ── Resolver el inglés de cada fila ───────────────────────────────────────
  const cambios = [];
  const yaTenian = [];
  const sinResolver = [];
  const porFuente = { importacion: 0, gif: 0 };

  for (const fila of filas) {
    if (fila.nombre_en && !FORZAR) {
      yaTenian.push(fila.nombre);
      continue;
    }

    let nombreEn = null;
    let fuente = null;

    if (fila.origen && fila.origen_externo_id) {
      nombreEn = porClaveExterna.get(`${fila.origen}:${fila.origen_externo_id}`) ?? null;
      if (nombreEn) fuente = "importacion";
    }
    if (!nombreEn) {
      // Las nativas, y de rebote cualquier importada que faltara del JSON.
      nombreEn = nombreDesdeGif(fila.gif_url)?.nombreEn ?? null;
      if (nombreEn) fuente = "gif";
    }

    if (!nombreEn) {
      sinResolver.push({ nombre: fila.nombre, origen: fila.origen ?? "nativo", gif_url: fila.gif_url });
      continue;
    }
    if (nombreEn === fila.nombre_en) {
      yaTenian.push(fila.nombre);
      continue;
    }

    porFuente[fuente] += 1;
    cambios.push({ id: fila.id, nombre: fila.nombre, nombreEn, fuente });
  }

  // ── Informe ───────────────────────────────────────────────────────────────
  const nativas = filas.filter((f) => !f.origen).length;
  console.log("=== BACKFILL DE nombre_en ===");
  console.log(`modo: ${APLICAR ? "APLICAR (escribe en la BD)" : "SIMULACIÓN (no escribe)"}${FORZAR ? " + FORZAR" : ""}`);
  console.log(`filas en catálogo:      ${filas.length} (nativas ${nativas} · importadas ${filas.length - nativas})`);
  console.log(`traducciones en el JSON: ${porClaveExterna.size}`);
  console.log(`ya tenían nombre_en:    ${yaTenian.length}`);
  console.log(`a rellenar:             ${cambios.length}  ${JSON.stringify(porFuente)}`);
  console.log(`sin inglés conocido:    ${sinResolver.length}`);

  if (sinResolver.length) {
    console.log("\nsin inglés conocido (se quedan a null):");
    for (const s of sinResolver.slice(0, 20)) {
      console.log(`  - [${s.origen}] ${s.nombre}  [gif_url=${s.gif_url ?? "null"}]`);
    }
    if (sinResolver.length > 20) console.log(`  … y ${sinResolver.length - 20} más`);
  }

  console.log("\nmuestra de 15:");
  for (const c of cambios.slice(0, 15)) {
    console.log(`  ${c.nombre.slice(0, 40).padEnd(40)} ← ${c.nombreEn}  (${c.fuente})`);
  }

  if (!APLICAR) {
    console.log("\nNada escrito. Añade --apply para rellenar de verdad.");
    return;
  }

  // ── Escritura ─────────────────────────────────────────────────────────────
  let escritas = 0;
  const fallos = [];
  for (let i = 0; i < cambios.length; i += 1) {
    const c = cambios[i];
    const { error } = await supabase
      .from("tipo_ejercicio")
      .update({ nombre_en: c.nombreEn })
      .eq("id", c.id);
    if (error) fallos.push(`${c.nombre}: ${error.message}`);
    else escritas += 1;
    if ((i + 1) % 200 === 0 || i + 1 === cambios.length) {
      console.log(`  ${i + 1}/${cambios.length}`);
    }
  }

  console.log("");
  console.log(`actualizadas: ${escritas} · fallos: ${fallos.length}`);
  for (const f of fallos.slice(0, 10)) console.log(`  - ${f}`);
  if (fallos.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
