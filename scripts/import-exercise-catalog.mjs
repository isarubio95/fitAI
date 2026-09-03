/**
 * Inserta el lote de importación en `public.tipo_ejercicio`.
 *
 *   node scripts/import-exercise-catalog.mjs            # SIMULACIÓN (por defecto)
 *   node scripts/import-exercise-catalog.mjs --apply    # escribe de verdad
 *   node scripts/import-exercise-catalog.mjs --apply --limit 20
 *
 * Por defecto NO escribe nada: imprime qué haría y valida todo contra la BD.
 * Hay que pedir `--apply` explícitamente.
 *
 * Es idempotente: hace upsert sobre el índice único
 * `(origen, origen_externo_id)` que crea la migración de taxonomía, así que
 * reimportar actualiza en lugar de duplicar.
 *
 * Requiere:
 *   - VITE_SUPABASE_URL (o SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY   (Dashboard → Project Settings → API)
 *   - La migración `exercise_taxonomy` aplicada.
 *   - data/exercise-import.json     (npm run catalogo:build)
 *   - data/media-report.json        (npm run catalogo:medios) para los gif_url
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  PATRONES_MOVIMIENTO_SQL,
  CUALIDADES_SQL,
  PLANOS_SQL,
  DEPORTES_SQL,
} from "./lib/taxonomyVocab.mjs";

const IMPORT_PATH = "data/exercise-import.json";
const MEDIA_REPORT_PATH = "data/media-report.json";
const LOTE = 100;

const args = process.argv.slice(2);
const APLICAR = args.includes("--apply");
const idxLimite = args.indexOf("--limit");
const LIMITE = idxLimite >= 0 && args[idxLimite + 1] ? Number(args[idxLimite + 1]) : Infinity;

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

/** Nombre de fichero de medio, igual que en fetch-exercise-media.mjs. */
function nombreMedio(fila) {
  const id = String(fila.origen_externo_id ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${fila.origen}-${id || "sin-id"}.webp`;
}

/** Quita los campos internos del informe y deja la fila lista para insertar. */
function filaParaBd(fila, mediosDisponibles) {
  const medio = nombreMedio(fila);
  const ruta = mediosDisponibles.has(medio) ? `/ejercicios/${medio}` : null;

  return {
    nombre: fila.nombre,
    tipo: fila.tipo,
    grupo_muscular: fila.grupo_muscular,
    musculos_involucrados: fila.musculos_involucrados ?? [],
    equipment: fila.equipment,
    equipment_list: fila.equipment_list ?? [],
    dificultad: fila.dificultad,
    registro_series: fila.registro_series,
    instructions: fila.instructions ?? [],
    patron_movimiento: fila.patron_movimiento ?? [],
    cualidad: fila.cualidad ?? [],
    plano: fila.plano,
    unilateral: fila.unilateral,
    deportes: fila.deportes ?? [],
    // gif_url e imagen son duplicados históricos de la misma ruta; se mantiene
    // la redundancia para no romper los consumidores actuales.
    gif_url: ruta,
    imagen: ruta,
    video_url: fila.video_url ?? null,
    origen: fila.origen,
    origen_externo_id: fila.origen_externo_id,
  };
}

/** Valida contra los vocabularios: un valor fuera de rango rompe el CHECK. */
function validar(fila) {
  const errores = [];
  if (!fila.nombre?.trim()) errores.push("nombre vacío");
  if (!fila.origen || !fila.origen_externo_id) errores.push("origen incompleto");
  if (!["Fuerza", "Cardio", "Estiramiento"].includes(fila.tipo)) {
    errores.push(`tipo inválido: ${fila.tipo}`);
  }
  if (!["peso_reps", "solo_reps", "duracion", "duracion_ritmo"].includes(fila.registro_series)) {
    errores.push(`registro_series inválido: ${fila.registro_series}`);
  }
  if (fila.dificultad != null && !["1", "2", "3"].includes(String(fila.dificultad))) {
    errores.push(`dificultad inválida: ${fila.dificultad}`);
  }
  for (const p of fila.patron_movimiento) {
    if (!PATRONES_MOVIMIENTO_SQL.includes(p)) errores.push(`patrón fuera del vocabulario: ${p}`);
  }
  for (const c of fila.cualidad) {
    if (!CUALIDADES_SQL.includes(c)) errores.push(`cualidad fuera del vocabulario: ${c}`);
  }
  if (fila.plano != null && !PLANOS_SQL.includes(fila.plano)) {
    errores.push(`plano fuera del vocabulario: ${fila.plano}`);
  }
  for (const d of fila.deportes) {
    if (!DEPORTES_SQL.includes(d)) errores.push(`deporte fuera del vocabulario: ${d}`);
  }
  return errores;
}

async function main() {
  cargarEnv();

  if (!fs.existsSync(IMPORT_PATH)) {
    console.error(`Falta ${IMPORT_PATH}. Ejecuta: npm run catalogo:build`);
    process.exit(1);
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error(
      "Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
        "La service role key está en Dashboard → Project Settings → API.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Comprobación previa: ¿está aplicada la migración? ─────────────────────
  const { error: errColumnas } = await supabase
    .from("tipo_ejercicio")
    .select("id, patron_movimiento, cualidad, deportes, video_url, equipment_list, origen")
    .limit(1);
  if (errColumnas) {
    console.error(
      "La tabla no tiene las columnas de la taxonomía. Aplica primero la migración\n" +
        "supabase/migrations/20260902081500_exercise_taxonomy.sql\n\n" +
        `Detalle: ${errColumnas.message}`,
    );
    process.exitCode = 1;
    return;
  }

  const { count: antes } = await supabase
    .from("tipo_ejercicio")
    .select("*", { count: "exact", head: true });

  // ── Medios disponibles ────────────────────────────────────────────────────
  const mediosDisponibles = new Set();
  if (fs.existsSync(MEDIA_REPORT_PATH)) {
    const rep = JSON.parse(fs.readFileSync(MEDIA_REPORT_PATH, "utf8"));
    for (const r of rep.resultados ?? []) mediosDisponibles.add(r.nombre);
  }

  // ── Preparación y validación ──────────────────────────────────────────────
  const origen = JSON.parse(fs.readFileSync(IMPORT_PATH, "utf8"));
  const recortado = LIMITE === Infinity ? origen : origen.slice(0, LIMITE);
  const filas = recortado.map((f) => filaParaBd(f, mediosDisponibles));

  const invalidas = [];
  filas.forEach((f, i) => {
    const errs = validar(f);
    if (errs.length) invalidas.push({ nombre: f.nombre, errores: errs, indice: i });
  });

  const conMedio = filas.filter((f) => f.gif_url).length;
  // nombre en minúsculas -> dueños actuales del nombre, como "origen::origen_externo_id".
  const nombresExistentes = new Map();
  {
    // Chequeo de choque de nombre contra el catálogo que ya está en la BD.
    let desde = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("tipo_ejercicio")
        .select("nombre, origen, origen_externo_id")
        .range(desde, desde + 999);
      if (error) break;
      for (const r of data ?? []) {
        const key = r.nombre.trim().toLowerCase();
        if (!nombresExistentes.has(key)) nombresExistentes.set(key, new Set());
        nombresExistentes.get(key).add(`${r.origen ?? ""}::${r.origen_externo_id ?? ""}`);
      }
      if (!data || data.length < 1000) break;
      desde += 1000;
    }
  }
  // Reimportar (mismo origen+origen_externo_id) actualiza esa misma fila, así
  // que no es un choque de nombre: solo lo es si el nombre pertenece a OTRA fila.
  const choques = filas.filter((f) => {
    const dueños = nombresExistentes.get(f.nombre.trim().toLowerCase());
    if (!dueños) return false;
    const propio = `${f.origen}::${f.origen_externo_id}`;
    return [...dueños].some((d) => d !== propio);
  });

  console.log("=== IMPORTACIÓN DEL CATÁLOGO ===");
  console.log(`modo: ${APLICAR ? "APLICAR (escribe en la BD)" : "SIMULACIÓN (no escribe)"}`);
  console.log(`filas en el lote: ${filas.length}`);
  console.log(`filas en tipo_ejercicio ahora: ${antes}`);
  console.log(`con medio ya convertido: ${conMedio}/${filas.length}`);
  console.log(`sin medio (necesitan video_url o quedan sin imagen): ${filas.length - conMedio}`);
  console.log(`choques de nombre con el catálogo existente: ${choques.length}`);
  console.log(`filas inválidas: ${invalidas.length}`);

  if (choques.length) {
    console.log("\nprimeros choques de nombre:");
    for (const c of choques.slice(0, 15)) console.log(`  - ${c.nombre}`);
  }
  if (invalidas.length) {
    console.log("\nfilas inválidas (no se insertará ninguna):");
    for (const v of invalidas.slice(0, 20)) {
      console.log(`  - ${v.nombre}: ${v.errores.join("; ")}`);
    }
    console.error("\nAborto: corrige el lote antes de importar.");
    process.exit(1);
  }
  if (choques.length) {
    console.error(
      "\nAborto: hay nombres que ya existen en el catálogo. Resuélvelos en\n" +
        "data/exercise-name-overrides.json antes de importar (el nombre debe ser único).",
    );
    process.exit(1);
  }

  if (!APLICAR) {
    console.log("\nEjemplo de fila que se insertaría:");
    console.log(JSON.stringify(filas[0], null, 1));
    console.log("\nNada escrito. Añade --apply para importar de verdad.");
    return;
  }

  // ── Escritura ─────────────────────────────────────────────────────────────
  let insertadas = 0;
  const fallos = [];
  for (let i = 0; i < filas.length; i += LOTE) {
    const trozo = filas.slice(i, i + LOTE);
    const { error, count } = await supabase
      .from("tipo_ejercicio")
      .upsert(trozo, { onConflict: "origen,origen_externo_id", count: "exact" });
    if (error) {
      fallos.push(`lote ${i}-${i + trozo.length}: ${error.message}`);
    } else {
      insertadas += count ?? trozo.length;
    }
    console.log(`  lote ${Math.min(i + LOTE, filas.length)}/${filas.length}`);
  }

  const { count: despues } = await supabase
    .from("tipo_ejercicio")
    .select("*", { count: "exact", head: true });

  console.log("");
  console.log(`upsert: ${insertadas} · fallos: ${fallos.length}`);
  for (const f of fallos.slice(0, 10)) console.log(`  - ${f}`);
  console.log(`filas en tipo_ejercicio: ${antes} → ${despues}`);
  console.log("");
  console.log("Siguientes pasos:");
  console.log("  1. npm run supabase:types    (regenerar los tipos)");
  console.log("  2. node scripts/gen-lyfta-name-map.mjs   (regenerar el mapa de alias)");
  console.log("  3. npm run catalogo:doc      (regenerar CATALOGO_EJERCICIOS.md)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
