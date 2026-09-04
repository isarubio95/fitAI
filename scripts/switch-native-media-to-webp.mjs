/**
 * Apunta las filas nativas a sus WebP recién subidos.
 *
 *   node scripts/switch-native-media-to-webp.mjs            # SIMULACIÓN
 *   node scripts/switch-native-media-to-webp.mjs --apply    # escribe de verdad
 *
 * Solo toca las filas que figuran en `data/native-media-report.json` como
 * convertidas, animadas y subidas: si un WebP no está en el bucket, cambiar la
 * ruta dejaría el ejercicio sin imagen.
 *
 * Cambia SOLO `gif_url`. `imagen` se deja intacta: apunta a
 * `/ejercicios/thumbs/<x>.jpg` y esos 749 thumbs están en el bucket, pesan 3 KB
 * de media y resuelven todos. Hoy no se llegan a pedir —los consumidores hacen
 * `gif_url || imagen` y `gif_url` nunca es null—, pero sobreescribirlos con el
 * WebP animado sería cambiar 3 KB por ~100 KB y perder el thumbnail ligero.
 *
 * Para revertir: los .gif siguen en el bucket, así que basta volver a poner la
 * extensión anterior (--revert).
 *
 * Requiere VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import { cargarEnv, credencialesSupabase, leerTabla } from "./lib/mediaUtils.mjs";

const REPORT_PATH = "data/native-media-report.json";

const args = process.argv.slice(2);
const APLICAR = args.includes("--apply");
const REVERTIR = args.includes("--revert");

async function main() {
  cargarEnv();

  const cred = credencialesSupabase();
  if (!cred) {
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Falta ${REPORT_PATH}. Ejecuta primero:`);
    console.error("  node scripts/convert-native-media.mjs --upload");
    process.exitCode = 1;
    return;
  }

  const informe = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  const listos = (informe.resultados ?? []).filter((r) => r.animado && r.subido);
  const noSubidos = (informe.resultados ?? []).filter((r) => r.animado && !r.subido);

  if (!listos.length) {
    console.error("El informe no tiene ningún medio animado Y subido.");
    console.error("Ejecuta `convert-native-media.mjs --upload` antes de esto.");
    process.exitCode = 1;
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(cred.url, cred.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const filas = await leerTabla(supabase, "tipo_ejercicio", "id, nombre, gif_url, imagen, origen");
  const porId = new Map(filas.map((f) => [f.id, f]));

  const cambios = [];
  const yaEstaban = [];
  const desaparecidas = [];

  for (const r of listos) {
    const fila = porId.get(r.id);
    if (!fila) {
      desaparecidas.push(r.nombre);
      continue;
    }
    // `r.ruta` es el .webp; `r.origen` el nombre del .gif de partida.
    const destino = REVERTIR ? `/ejercicios/${r.origen}` : r.ruta;
    if (fila.gif_url === destino) {
      yaEstaban.push(fila.nombre);
      continue;
    }
    cambios.push({ id: fila.id, nombre: fila.nombre, de: fila.gif_url, a: destino });
  }

  console.log(`=== RUTAS DE MEDIOS NATIVOS → ${REVERTIR ? "GIF (revertir)" : "WEBP"} ===`);
  console.log(`modo: ${APLICAR ? "APLICAR (escribe en la BD)" : "SIMULACIÓN (no escribe)"}`);
  console.log(`medios animados y subidos: ${listos.length}`);
  if (noSubidos.length) console.log(`convertidos pero SIN subir (se ignoran): ${noSubidos.length}`);
  console.log(`ya apuntaban ahí:          ${yaEstaban.length}`);
  console.log(`a cambiar:                 ${cambios.length}`);
  if (desaparecidas.length) {
    console.log(`en el informe pero no en la BD: ${desaparecidas.length}`);
  }

  console.log("`imagen` (thumbs de 3 KB en el bucket): no se toca");

  console.log("\nmuestra de 10:");
  for (const c of cambios.slice(0, 10)) {
    console.log(`  ${c.nombre.slice(0, 34).padEnd(34)} ${c.de} → ${c.a}`);
  }

  if (!APLICAR) {
    console.log("\nNada escrito. Añade --apply para cambiar las rutas de verdad.");
    return;
  }

  let escritas = 0;
  const fallos = [];
  for (let i = 0; i < cambios.length; i += 1) {
    const c = cambios[i];
    const { error } = await supabase
      .from("tipo_ejercicio")
      .update({ gif_url: c.a })
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
