/**
 * Utilidades compartidas por los scripts de medios del catálogo
 * (`fetch-exercise-media.mjs`, `convert-native-media.mjs`).
 */

import fs from "node:fs";
import path from "node:path";

/** Carga `.env` en `process.env` sin sobreescribir lo que ya venga del entorno. */
export function cargarEnv() {
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

/** Credenciales de service role, o `null` con el motivo ya impreso. */
export function credencialesSupabase() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error("Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
    return null;
  }
  return { url, key };
}

/** Ejecuta `worker` sobre `items` con `limite` en paralelo, informando del avance. */
export async function pool(items, limite, worker) {
  let i = 0;
  let hechos = 0;
  const runners = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
      hechos += 1;
      if (hechos % 50 === 0 || hechos === items.length) {
        console.log(`  progreso ${hechos}/${items.length}`);
      }
    }
  });
  await Promise.all(runners);
}

/**
 * ¿El WebP lleva de verdad los chunks de animación?
 * libwebp puede devolver un fichero válido pero de un solo fotograma, que en la
 * tarjeta se ve congelado. Mejor detectarlo aquí que en producción.
 */
export function esAnimado(ruta) {
  return fs.readFileSync(ruta).includes(Buffer.from("ANIM"));
}

/** Lee una tabla entera saltando el tope de filas de PostgREST. */
export async function leerTabla(supabase, tabla, columnas, pagina = 1000) {
  const filas = [];
  for (let desde = 0; ; desde += pagina) {
    const { data, error } = await supabase
      .from(tabla)
      .select(columnas)
      .order("id", { ascending: true })
      .range(desde, desde + pagina - 1);
    if (error) throw new Error(`lectura de ${tabla}: ${error.message}`);
    filas.push(...(data ?? []));
    if (!data || data.length < pagina) return filas;
  }
}
