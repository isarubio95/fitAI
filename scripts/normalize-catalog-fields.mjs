/**
 * Normaliza `equipment`, `equipment_list` y `dificultad` de todo el catálogo.
 *
 *   node scripts/normalize-catalog-fields.mjs            # SIMULACIÓN
 *   node scripts/normalize-catalog-fields.mjs --apply    # escribe de verdad
 *
 * ── Equipo ─────────────────────────────────────────────────────────────────
 * Había dos vocabularios sueltos en la misma tabla (ver
 * src/constants/exerciseEquipment.ts). Como el filtro de la UI construye sus
 * chips desde los datos, salían duplicados para el mismo aparato:
 * "Mancuernas" de las filas originales junto a "con Mancuernas" de las
 * importadas, más "Other" y "con Lastre".
 *
 * Aquí `equipment_list` pasa a ser la columna de verdad, con el vocabulario
 * canónico en español, y `equipment` se deriva de ella uniendo con ", ". Así
 * las dos columnas no pueden volver a divergir, y de paso se rellenan las 421
 * filas importadas que tenían `equipment` a null.
 *
 * ── Dificultad ─────────────────────────────────────────────────────────────
 * Conviven tres convenciones: "N" en las importadas, "N/3" en las originales
 * y cuatro filas con texto ("Principiante", "media"). `difficultyToLevel` las
 * normaliza al leer, así que no hay bug visible, pero deja la columna
 * imposible de filtrar en servidor. Se unifica a "1" | "2" | "3".
 *
 * Requiere VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { canonicalEquipoList } from "./lib/equipmentVocab.mjs";

const APLICAR = process.argv.includes("--apply");

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

/** Misma lógica que src/lib/exerciseDifficulty.ts, para no divergir. */
function dificultadCanonica(d) {
  if (d == null) return null;
  const s = String(d).trim().toLowerCase();
  if (!s) return null;
  const num = Number.parseInt(s, 10);
  if (Number.isFinite(num)) return String(Math.max(1, Math.min(3, num)));
  if (s.includes("baja") || s.includes("principiante") || s.includes("facil")) return "1";
  if (s.includes("media") || s.includes("intermedi") || s.includes("normal")) return "2";
  if (s.includes("alta") || s.includes("avanzad") || s.includes("dificil") || s.includes("experto")) return "3";
  return null;
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

  // ── Leer todo el catálogo ─────────────────────────────────────────────────
  const filas = [];
  let desde = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("tipo_ejercicio")
      .select("id, nombre, origen, equipment, equipment_list, dificultad")
      .range(desde, desde + 999);
    if (error) {
      console.error(`No se pudo leer el catálogo: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    filas.push(...(data ?? []));
    if (!data || data.length < 1000) break;
    desde += 1000;
  }

  // ── Calcular ──────────────────────────────────────────────────────────────
  const cambios = [];
  const desconocidos = new Map();
  let sinEquipo = 0;
  const distribucion = new Map();

  for (const fila of filas) {
    // Las importadas traen el vocabulario de la fuente en equipment_list; las
    // originales lo traen en el string equipment. Se canonizan las dos.
    const fuente = (fila.equipment_list ?? []).length ? fila.equipment_list : fila.equipment;
    const { lista, desconocidos: desc } = canonicalEquipoList(fuente);
    for (const d of desc) desconocidos.set(d, (desconocidos.get(d) ?? 0) + 1);
    for (const e of lista) distribucion.set(e, (distribucion.get(e) ?? 0) + 1);
    if (lista.length === 0) sinEquipo += 1;

    const equipmentNuevo = lista.length ? lista.join(", ") : null;
    const dificultadNueva = dificultadCanonica(fila.dificultad);

    const cambiaLista = JSON.stringify(fila.equipment_list ?? []) !== JSON.stringify(lista);
    const cambiaString = (fila.equipment ?? null) !== equipmentNuevo;
    const cambiaDif = (fila.dificultad ?? null) !== dificultadNueva;
    if (!cambiaLista && !cambiaString && !cambiaDif) continue;

    cambios.push({
      id: fila.id,
      nombre: fila.nombre,
      origen: fila.origen,
      antesLista: fila.equipment_list ?? [],
      antesString: fila.equipment ?? null,
      antesDif: fila.dificultad ?? null,
      equipment_list: lista,
      equipment: equipmentNuevo,
      dificultad: dificultadNueva,
    });
  }

  // ── Informe ───────────────────────────────────────────────────────────────
  console.log("=== NORMALIZACIÓN DE EQUIPO Y DIFICULTAD ===");
  console.log(`modo: ${APLICAR ? "APLICAR (escribe en la BD)" : "SIMULACIÓN (no escribe)"}`);
  console.log(`filas leídas:        ${filas.length}`);
  console.log(`filas que cambian:   ${cambios.length}`);
  console.log(`filas sin equipo reconocible: ${sinEquipo}`);
  console.log(`términos no reconocidos: ${desconocidos.size}`);
  if (desconocidos.size) {
    for (const [k, v] of [...desconocidos].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(v).padStart(4)}  ${k}`);
    }
    console.error("\nAborto: hay términos de equipo sin entrada en EQUIPO_SINONIMOS.");
    console.error("Añádelos a src/constants/exerciseEquipment.ts antes de aplicar.");
    process.exitCode = 1;
    return;
  }

  console.log("\ndistribución canónica resultante:");
  for (const [k, v] of [...distribucion].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(4)}  ${k}`);
  }

  const difAntes = new Map();
  const difDespues = new Map();
  for (const f of filas) {
    const a = f.dificultad === null ? "(null)" : String(f.dificultad);
    difAntes.set(a, (difAntes.get(a) ?? 0) + 1);
    const d = dificultadCanonica(f.dificultad) ?? "(null)";
    difDespues.set(d, (difDespues.get(d) ?? 0) + 1);
  }
  console.log(`\ndificultad antes:   ${JSON.stringify(Object.fromEntries([...difAntes].sort()))}`);
  console.log(`dificultad después: ${JSON.stringify(Object.fromEntries([...difDespues].sort()))}`);

  console.log("\nmuestra de 12 cambios:");
  for (const c of cambios.slice(0, 12)) {
    console.log(`  ${c.nombre.slice(0, 34).padEnd(34)} [${c.origen ?? "nativo"}]`);
    console.log(`     equipment:  ${JSON.stringify(c.antesString)} → ${JSON.stringify(c.equipment)}`);
    console.log(`     list:       ${JSON.stringify(c.antesLista)} → ${JSON.stringify(c.equipment_list)}`);
    if (c.antesDif !== c.dificultad) {
      console.log(`     dificultad: ${JSON.stringify(c.antesDif)} → ${JSON.stringify(c.dificultad)}`);
    }
  }

  if (!APLICAR) {
    console.log("\nNada escrito. Añade --apply para normalizar de verdad.");
    return;
  }

  // ── Escritura ─────────────────────────────────────────────────────────────
  let escritas = 0;
  const fallos = [];
  for (let i = 0; i < cambios.length; i += 1) {
    const c = cambios[i];
    const { error } = await supabase
      .from("tipo_ejercicio")
      .update({ equipment: c.equipment, equipment_list: c.equipment_list, dificultad: c.dificultad })
      .eq("id", c.id);
    if (error) fallos.push(`${c.nombre}: ${error.message}`);
    else escritas += 1;
    if ((i + 1) % 200 === 0) console.log(`  ${i + 1}/${cambios.length}`);
  }
  console.log(`  ${cambios.length}/${cambios.length}`);
  console.log("");
  console.log(`actualizadas: ${escritas} · fallos: ${fallos.length}`);
  for (const f of fallos.slice(0, 10)) console.log(`  - ${f}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
