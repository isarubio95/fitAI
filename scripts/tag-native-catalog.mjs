/**
 * Rellena la taxonomía (patrón, cualidad, plano, unilateral) de las filas
 * NATIVAS de `public.tipo_ejercicio` — las 750 que ya existían antes de la
 * importación del catálogo ampliado y que entraron sin etiquetar.
 *
 *   node scripts/tag-native-catalog.mjs            # SIMULACIÓN (por defecto)
 *   node scripts/tag-native-catalog.mjs --apply    # escribe de verdad
 *
 * Sin esto, esas 750 filas —que son todo el trabajo clásico de gimnasio:
 * press de banca, sentadilla, peso muerto, dominadas— quedan invisibles a
 * cualquier filtro por deporte, cualidad o patrón, porque sus columnas de
 * taxonomía están vacías.
 *
 * El motor de etiquetado (scripts/lib/exerciseTagging.mjs) trabaja sobre
 * nombres en inglés, y estas filas tienen el nombre en español. El inglés se
 * recupera del propio `gif_url`, que conserva el nombre original del asset:
 *
 *   /ejercicios/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif
 *                        └─ nombre ────────────┘ └─ zona ─┘
 *
 * 747 de las 750 lo tienen. Las 3 restantes se reportan sin tocar.
 *
 * NO toca `equipment_list`: las filas nativas guardan el equipo en español
 * ("Mancuernas") y las importadas en inglés ("dumbbell"), así que rellenarlo
 * sin unificar antes el vocabulario dejaría la columna inservible para
 * filtrar. Es una decisión aparte.
 *
 * Requiere VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { tagExercise } from "./lib/exerciseTagging.mjs";
import { PATRONES_MOVIMIENTO_SQL, CUALIDADES_SQL, PLANOS_SQL } from "./lib/taxonomyVocab.mjs";

const APLICAR = process.argv.includes("--apply");
const LOTE = 100;

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

/**
 * `/ejercicios/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif`
 *   → { nombreEn: "Lever Triceps Extension", zona: "Upper Arms" }
 */
export function nombreDesdeGif(gifUrl) {
  if (!gifUrl) return null;
  const base = String(gifUrl).split("/").pop() ?? "";
  const sinExt = base.replace(/\.gif$/i, "");
  // Prefijo de id: 8 dígitos y un guion. Sin él no sabemos leer el nombre.
  const m = sinExt.match(/^\d{8}-(.+)$/);
  if (!m) return null;

  // El resto es `Nombre-Con-Guiones_Zona_720` (a veces `_720-1` por duplicados).
  const partes = m[1].split("_");
  const nombreEn = partes[0].replace(/-/g, " ").trim();
  const zona = (partes[1] ?? "").replace(/-/g, " ").trim();
  if (!nombreEn) return null;
  return { nombreEn, zona: zona || null };
}

function validar(tags) {
  const errores = [];
  for (const p of tags.patron_movimiento ?? []) {
    if (!PATRONES_MOVIMIENTO_SQL.includes(p)) errores.push(`patrón fuera del vocabulario: ${p}`);
  }
  for (const c of tags.cualidad ?? []) {
    if (!CUALIDADES_SQL.includes(c)) errores.push(`cualidad fuera del vocabulario: ${c}`);
  }
  if (tags.plano != null && !PLANOS_SQL.includes(tags.plano)) {
    errores.push(`plano fuera del vocabulario: ${tags.plano}`);
  }
  return errores;
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

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Leer las filas nativas ────────────────────────────────────────────────
  const filas = [];
  {
    let desde = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("tipo_ejercicio")
        .select("id, nombre, gif_url, equipment, grupo_muscular, tipo, patron_movimiento")
        .is("origen", null)
        .range(desde, desde + 999);
      if (error) {
        console.error(`No se pudieron leer las filas nativas: ${error.message}`);
        process.exitCode = 1;
        return;
      }
      filas.push(...(data ?? []));
      if (!data || data.length < 1000) break;
      desde += 1000;
    }
  }

  // ── Etiquetar ─────────────────────────────────────────────────────────────
  const cambios = [];
  const sinNombreEn = [];
  const invalidas = [];
  const yaEtiquetadas = [];
  const porConfianza = {};
  const porPatron = {};

  for (const fila of filas) {
    if ((fila.patron_movimiento ?? []).length > 0) {
      yaEtiquetadas.push(fila.nombre);
      continue;
    }
    const parsed = nombreDesdeGif(fila.gif_url);
    if (!parsed) {
      sinNombreEn.push({ nombre: fila.nombre, gif_url: fila.gif_url });
      continue;
    }

    const tags = tagExercise({
      name: parsed.nombreEn,
      equipment: fila.equipment ? [fila.equipment] : [],
      bodyParts: parsed.zona ? [parsed.zona] : [],
      category: null,
    });

    const errs = validar(tags);
    if (errs.length) {
      invalidas.push({ nombre: fila.nombre, errores: errs });
      continue;
    }

    porConfianza[tags.confianza] = (porConfianza[tags.confianza] ?? 0) + 1;
    for (const p of tags.patron_movimiento) porPatron[p] = (porPatron[p] ?? 0) + 1;

    cambios.push({
      id: fila.id,
      nombre: fila.nombre,
      nombreEn: parsed.nombreEn,
      patron_movimiento: tags.patron_movimiento,
      cualidad: tags.cualidad,
      plano: tags.plano,
      unilateral: tags.unilateral,
      confianza: tags.confianza,
    });
  }

  // ── Informe ───────────────────────────────────────────────────────────────
  console.log("=== ETIQUETADO DE LAS FILAS NATIVAS ===");
  console.log(`modo: ${APLICAR ? "APLICAR (escribe en la BD)" : "SIMULACIÓN (no escribe)"}`);
  console.log(`filas nativas (origen null): ${filas.length}`);
  console.log(`ya etiquetadas, se saltan:   ${yaEtiquetadas.length}`);
  console.log(`sin nombre inglés en el gif: ${sinNombreEn.length}`);
  console.log(`inválidas:                   ${invalidas.length}`);
  console.log(`a etiquetar:                 ${cambios.length}`);
  console.log(`confianza: ${JSON.stringify(porConfianza)}`);
  console.log(`sin patrón asignado:         ${cambios.filter((c) => c.patron_movimiento.length === 0).length}`);
  console.log(`sin cualidad asignada:       ${cambios.filter((c) => c.cualidad.length === 0).length}`);
  console.log(`unilateral:                  ${cambios.filter((c) => c.unilateral).length}`);
  console.log(`\npor patrón: ${JSON.stringify(porPatron, null, 1)}`);

  if (sinNombreEn.length) {
    console.log("\nsin nombre inglés (se quedan sin etiquetar):");
    for (const s of sinNombreEn) console.log(`  - ${s.nombre}  [gif_url=${s.gif_url ?? "null"}]`);
  }
  if (invalidas.length) {
    console.log("\ninválidas:");
    for (const v of invalidas.slice(0, 10)) console.log(`  - ${v.nombre}: ${v.errores.join("; ")}`);
    console.error("\nAborto: hay etiquetas fuera del vocabulario.");
    process.exitCode = 1;
    return;
  }

  console.log("\nmuestra de 15 etiquetados:");
  for (const c of cambios.slice(0, 15)) {
    console.log(
      `  ${c.nombre.slice(0, 34).padEnd(34)} ← ${c.nombreEn.slice(0, 30).padEnd(30)} ` +
        `[${c.patron_movimiento.join(",")}] [${c.cualidad.join(",")}] ${c.plano ?? "-"}` +
        `${c.unilateral ? " unilateral" : ""}`,
    );
  }

  if (!APLICAR) {
    console.log("\nNada escrito. Añade --apply para etiquetar de verdad.");
    return;
  }

  // ── Escritura ─────────────────────────────────────────────────────────────
  let escritas = 0;
  const fallos = [];
  for (let i = 0; i < cambios.length; i += LOTE) {
    const trozo = cambios.slice(i, i + LOTE);
    // Uno a uno: es un update por id, no un upsert; son 750 filas y solo se
    // hace una vez.
    for (const c of trozo) {
      const { error } = await supabase
        .from("tipo_ejercicio")
        .update({
          patron_movimiento: c.patron_movimiento,
          cualidad: c.cualidad,
          plano: c.plano,
          unilateral: c.unilateral,
        })
        .eq("id", c.id);
      if (error) fallos.push(`${c.nombre}: ${error.message}`);
      else escritas += 1;
    }
    console.log(`  ${Math.min(i + LOTE, cambios.length)}/${cambios.length}`);
  }

  console.log("");
  console.log(`actualizadas: ${escritas} · fallos: ${fallos.length}`);
  for (const f of fallos.slice(0, 10)) console.log(`  - ${f}`);
}

// Solo al ejecutarlo directamente: `nombreDesdeGif` se importa desde los tests
// y desde los scripts de auditoría, y no deben disparar la lectura de la BD.
const esEntrada = process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, "/")}`).href;
if (esEntrada) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
