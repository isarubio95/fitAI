/**
 * Corrige `grupo_muscular` y `musculos_involucrados` de los ejercicios de
 * pierna analíticos que arrastran un boilerplate anatómicamente imposible.
 *
 *   node scripts/fix-leg-muscle-groups.mjs            # SIMULACIÓN
 *   node scripts/fix-leg-muscle-groups.mjs --apply    # escribe de verdad
 *
 * El problema: 91 filas comparten exactamente la misma lista de 9 músculos
 * ("todas las piernas": gemelos, glúteos, cuádriceps e isquiosurales a la vez),
 * y de ese cajón de sastre salió su `grupo_muscular = 'Pierna'`. La lista es
 * boilerplate, no anatomía: aparece igual en un curl femoral, en una extensión
 * de gemelos y en una rotación de aductor. Resultado: un curl femoral declara
 * trabajar el cuádriceps, y quien filtre por "Pantorrilla" no encuentra las
 * extensiones de gemelos.
 *
 * Este script SOLO toca los casos en que el nombre no admite discusión: un
 * ejercicio que se llama "Extensión de Gemelos" trabaja la pantorrilla, y uno
 * que se llama "Curl Femoral" trabaja el isquiosural. Los compuestos
 * (sentadillas, zancadas, prensas, peso muerto) se dejan como `Pierna` a
 * propósito: reparten carga entre varios grupos y asignarles uno solo sería
 * peor que el genérico.
 *
 * Requiere VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const APLICAR = process.argv.includes("--apply");

/**
 * Reglas inequívocas: el nombre nombra el músculo. Cada una fija el grupo y
 * la lista de músculos, tomados de src/constants/muscleGroups.ts.
 */
const REGLAS = [
  {
    etiqueta: "gemelos / sóleo → Pantorrilla",
    test: (n) => /\b(gemelo|gemelos|soleo|pantorrilla)\b/.test(n),
    grupo: "Pantorrilla",
    musculos: ["Gastrocnemio", "Sóleo"],
  },
  {
    etiqueta: "curl femoral → Femoral",
    test: (n) => /curl femoral|femoral nordico|nordic/.test(n),
    grupo: "Femoral",
    musculos: ["Bíceps Femoral", "Semitendinoso", "Semimembranoso"],
  },
  {
    etiqueta: "extensión de cuádriceps → Cuádriceps",
    test: (n) => /extension de cuadriceps|extension de rodilla|cuadriceps en maquina/.test(n),
    grupo: "Cuádriceps",
    musculos: ["Vasto Lateral", "Vasto Medial", "Vasto Intermedio", "Recto Femoral"],
  },
  {
    etiqueta: "puente / hip thrust / patada de glúteo → Glúteo",
    test: (n) => /hip thrust|puente de gluteo|patada de gluteo|extension de cadera|gluteo en maquina|gluteo en polea/.test(n),
    grupo: "Glúteo",
    musculos: ["Glúteo Mayor", "Glúteo Medio", "Glúteo Menor"],
  },
];

/** Normaliza igual que el resto del pipeline: sin acentos ni signos. */
function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

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

  const filas = [];
  let desde = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("tipo_ejercicio")
      .select("id, nombre, grupo_muscular, musculos_involucrados")
      .eq("grupo_muscular", "Pierna")
      .range(desde, desde + 999);
    if (error) {
      console.error(`No se pudo leer: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    filas.push(...(data ?? []));
    if (!data || data.length < 1000) break;
    desde += 1000;
  }

  const cambios = [];
  const seQuedan = [];
  const porRegla = new Map();

  for (const fila of filas) {
    const n = norm(fila.nombre);
    // La primera regla que casa manda; si casan dos, el nombre es ambiguo y se
    // deja en Pierna en vez de elegir a ciegas.
    const casan = REGLAS.filter((r) => r.test(n));
    if (casan.length !== 1) {
      seQuedan.push({ nombre: fila.nombre, motivo: casan.length === 0 ? "compuesto o no reconocido" : "ambiguo" });
      continue;
    }
    const regla = casan[0];
    porRegla.set(regla.etiqueta, (porRegla.get(regla.etiqueta) ?? 0) + 1);
    cambios.push({
      id: fila.id,
      nombre: fila.nombre,
      regla: regla.etiqueta,
      antesMusculos: fila.musculos_involucrados ?? [],
      grupo_muscular: regla.grupo,
      musculos_involucrados: regla.musculos,
    });
  }

  console.log("=== CORRECCIÓN DE GRUPO EN EJERCICIOS DE PIERNA ===");
  console.log(`modo: ${APLICAR ? "APLICAR (escribe en la BD)" : "SIMULACIÓN (no escribe)"}`);
  console.log(`filas con grupo 'Pierna': ${filas.length}`);
  console.log(`se reasignan:             ${cambios.length}`);
  console.log(`se quedan como 'Pierna':  ${seQuedan.length}`);
  console.log("\npor regla:");
  for (const [k, v] of porRegla) console.log(`  ${String(v).padStart(3)}  ${k}`);

  console.log("\nmuestra de reasignaciones:");
  for (const c of cambios.slice(0, 14)) {
    console.log(`  ${c.nombre.slice(0, 42).padEnd(42)} → ${c.grupo_muscular}`);
    console.log(`     músculos: ${c.antesMusculos.length} → ${JSON.stringify(c.musculos_involucrados)}`);
  }

  console.log("\nmuestra de las que se quedan en 'Pierna' (compuestos, a propósito):");
  for (const s of seQuedan.slice(0, 10)) console.log(`  ${s.nombre.slice(0, 46).padEnd(46)} [${s.motivo}]`);

  if (!APLICAR) {
    console.log("\nNada escrito. Añade --apply para corregir de verdad.");
    return;
  }

  let escritas = 0;
  const fallos = [];
  for (const c of cambios) {
    const { error } = await supabase
      .from("tipo_ejercicio")
      .update({ grupo_muscular: c.grupo_muscular, musculos_involucrados: c.musculos_involucrados })
      .eq("id", c.id);
    if (error) fallos.push(`${c.nombre}: ${error.message}`);
    else escritas += 1;
  }
  console.log("");
  console.log(`actualizadas: ${escritas} · fallos: ${fallos.length}`);
  for (const f of fallos.slice(0, 10)) console.log(`  - ${f}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
