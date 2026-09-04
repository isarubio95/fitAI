/**
 * Convierte los GIF nativos de `public/ejercicios/` a WebP animado y los sube
 * al bucket `ejercicios`, para que TODO el catálogo tenga un solo formato y un
 * solo origen.
 *
 *   node scripts/convert-native-media.mjs                # convierte a staging
 *   node scripts/convert-native-media.mjs --limit 20     # solo las 20 primeras
 *   node scripts/convert-native-media.mjs --upload       # + sube al bucket
 *   node scripts/convert-native-media.mjs --force        # reconvierte lo ya hecho
 *
 * Punto de partida: las 750 filas nativas (`origen is null`) reparten así sus
 * medios, y conviene tenerlo delante porque no todo es convertible:
 *
 *   741  gif_url apunta a un GIF que existe en public/ejercicios/  → se convierte
 *     6  gif_url apunta a un fichero que NO existe                 → se reporta
 *     3  gif_url null                                              → se reporta
 *
 * Solo se toca `gif_url`. En las nativas `imagen` apunta a
 * `/ejercicios/thumbs/<nombre>.jpg`: no está en public/, pero los 749 thumbs SÍ
 * están en el bucket y pesan 3 KB de media. Hoy no se usan —todos los
 * consumidores hacen `gif_url || imagen` y `gif_url` nunca es null—, pero son un
 * activo útil para servir listados ligeros, así que no se sobreescriben.
 *
 * Se conserva el nombre base del fichero y solo cambia la extensión. Además de
 * hacer trivial el mapeo con la BD, el nombre lleva dentro el nombre original
 * en inglés del ejercicio, que es de donde lo saca `backfill-nombre-en.mjs`.
 *
 * Requiere ffmpeg en el PATH, VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cargarEnv, credencialesSupabase, esAnimado, leerTabla, pool } from "./lib/mediaUtils.mjs";

const execFileAsync = promisify(execFile);

const LOCAL_DIR = "public/ejercicios";
const STAGING_DIR = "data/native-media-staging";
const REPORT_PATH = "data/native-media-report.json";
const BUCKET = "ejercicios";
const PREFIJO = "/ejercicios/";

/** Ancho objetivo. Los originales son de 720 px; 500 basta para una tarjeta. */
const ANCHO = 500;
const CALIDAD = 72;
const CONCURRENCIA = 4;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const valorDe = (n, def) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

const LIMITE = valorDe("--limit", Infinity);
const SUBIR = flag("--upload");
const FORZAR = flag("--force");

/**
 * El flag para conservar los tiempos originales entre fotogramas cambió de
 * nombre en ffmpeg 5 (`-vsync 0` → `-fps_mode passthrough`). Se prueba una vez
 * y se reutiliza la respuesta: sin él, un GIF con retardos variables sale con
 * la animación acelerada o congelada.
 */
async function detectarFlagRitmo() {
  for (const flags of [["-fps_mode", "passthrough"], ["-vsync", "0"]]) {
    try {
      await execFileAsync("ffmpeg", [
        "-hide_banner", "-loglevel", "error",
        "-f", "lavfi", "-i", "color=c=black:s=16x16:d=0.1",
        ...flags,
        "-f", "null", "-",
      ]);
      return flags;
    } catch {
      // Probamos el siguiente.
    }
  }
  console.warn("Aviso: ffmpeg no acepta ni -fps_mode ni -vsync; se convierte sin ellos.");
  return [];
}

/** GIF animado → WebP animado, conservando el ritmo original. */
async function convertir(entrada, salida, flagsRitmo) {
  await execFileAsync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-i", entrada,
    ...flagsRitmo,
    "-c:v", "libwebp",
    "-lossless", "0",
    "-q:v", String(CALIDAD),
    "-loop", "0",
    // `min(ANCHO,iw)` para no reescalar hacia arriba lo que ya sea más pequeño.
    "-vf", `scale='min(${ANCHO},iw)':-1`,
    "-an",
    salida,
  ]);
}

/** Nombre de fichero de una ruta `/ejercicios/x.gif`, o null si no es de ahí. */
function ficheroDeRuta(url) {
  if (!url) return null;
  const s = String(url);
  if (!s.startsWith(PREFIJO)) return null;
  const resto = s.slice(PREFIJO.length);
  // Un subdirectorio (`thumbs/…`) no es un medio de primer nivel.
  return resto && !resto.includes("/") ? resto : null;
}

async function main() {
  cargarEnv();

  const cred = credencialesSupabase();
  if (!cred) {
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(LOCAL_DIR)) {
    console.error(`No existe ${LOCAL_DIR}.`);
    process.exitCode = 1;
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(cred.url, cred.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const filas = (await leerTabla(supabase, "tipo_ejercicio", "id, nombre, gif_url, imagen, origen"))
    .filter((f) => !f.origen);

  // ── Clasificar antes de tocar nada ────────────────────────────────────────
  const enDisco = new Set(fs.readdirSync(LOCAL_DIR).filter((n) => /\.gif$/i.test(n)));
  const tareas = [];
  const sinMedio = [];
  const rotas = [];

  for (const fila of filas) {
    const fichero = ficheroDeRuta(fila.gif_url);
    if (!fila.gif_url) {
      sinMedio.push({ id: fila.id, nombre: fila.nombre });
    } else if (fichero && enDisco.has(fichero)) {
      tareas.push({ fila, fichero, destino: fichero.replace(/\.gif$/i, ".webp") });
    } else {
      rotas.push({ id: fila.id, nombre: fila.nombre, gif_url: fila.gif_url });
    }
  }

  const usados = new Set(tareas.map((t) => t.fichero));
  const huerfanos = [...enDisco].filter((n) => !usados.has(n));

  console.log("=== CONVERSIÓN DE LOS MEDIOS NATIVOS A WEBP ===");
  console.log(`filas nativas:            ${filas.length}`);
  console.log(`convertibles:             ${tareas.length}`);
  console.log(`gif_url a fichero que no existe: ${rotas.length}`);
  console.log(`sin gif_url:              ${sinMedio.length}`);
  console.log(`gifs en disco sin fila:   ${huerfanos.length}`);

  if (rotas.length) {
    console.log("\nrutas rotas (se quedan como están, hay que arreglarlas a mano):");
    for (const r of rotas) console.log(`  - ${r.nombre}  →  ${r.gif_url}`);
  }
  if (sinMedio.length) {
    console.log("\nsin medio ninguno:");
    for (const s of sinMedio) console.log(`  - ${s.nombre}`);
  }

  // Después del inventario: aunque falte ffmpeg, el recuento de arriba ya es
  // información útil.
  try {
    await execFileAsync("ffmpeg", ["-version"]);
  } catch {
    console.error(
      "\nNo encuentro ffmpeg en el PATH. Es imprescindible para el WebP animado.\n" +
        "  winget install Gyan.FFmpeg   (y reabrir la terminal)",
    );
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(STAGING_DIR, { recursive: true });
  const flagsRitmo = await detectarFlagRitmo();
  const pendientes = LIMITE === Infinity ? tareas : tareas.slice(0, LIMITE);
  console.log(`\nconvirtiendo ${pendientes.length}${flagsRitmo.length ? ` (ritmo: ${flagsRitmo.join(" ")})` : ""}…`);

  const resultados = [];
  const errores = [];
  const congelados = [];

  await pool(pendientes, CONCURRENCIA, async (t) => {
    const entrada = path.join(LOCAL_DIR, t.fichero);
    const salida = path.join(STAGING_DIR, t.destino);
    try {
      const cacheado = !FORZAR && fs.existsSync(salida) && fs.statSync(salida).size > 0;
      if (!cacheado) await convertir(entrada, salida, flagsRitmo);

      const bytes = fs.statSync(salida).size;
      if (bytes === 0) throw new Error("salida vacía");

      const animado = esAnimado(salida);
      if (!animado) congelados.push(t.fichero);

      resultados.push({
        id: t.fila.id,
        nombre: t.fila.nombre,
        origen: t.fichero,
        fichero: t.destino,
        ruta: `${PREFIJO}${t.destino}`,
        bytes,
        bytesOriginal: fs.statSync(entrada).size,
        animado,
        cache: cacheado,
      });
    } catch (e) {
      errores.push({ fichero: t.fichero, nombre: t.fila.nombre, error: String(e.message ?? e) });
      // Un fichero a medias es peor que ninguno.
      if (fs.existsSync(salida)) fs.rmSync(salida, { force: true });
    }
  });

  const bytes = resultados.reduce((s, r) => s + r.bytes, 0);
  const bytesAntes = resultados.reduce((s, r) => s + r.bytesOriginal, 0);
  console.log("");
  console.log(`convertidos: ${resultados.length} · fallos: ${errores.length}`);
  console.log(`animados verificados: ${resultados.filter((r) => r.animado).length}`);
  if (resultados.length) {
    console.log(
      `peso: ${(bytesAntes / 1024 / 1024).toFixed(1)} MB → ${(bytes / 1024 / 1024).toFixed(1)} MB ` +
        `(${(bytes / resultados.length / 1024).toFixed(1)} KB de media, ` +
        `÷${(bytesAntes / Math.max(bytes, 1)).toFixed(1)})`,
    );
  }
  if (congelados.length) {
    console.log(`\nAVISO: ${congelados.length} salieron SIN animación y no se subirán:`);
    for (const c of congelados.slice(0, 10)) console.log(`  - ${c}`);
  }
  if (errores.length) {
    console.log("\nprimeros fallos:");
    for (const e of errores.slice(0, 10)) console.log(`  - ${e.nombre}: ${e.error}`);
  }

  // Solo lo animado y verificado es candidato a sustituir a un GIF que sí se movía.
  const subibles = resultados.filter((r) => r.animado);

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        generado: new Date().toISOString(),
        subido: SUBIR,
        resultados,
        errores,
        rotas,
        sinMedio,
        huerfanos,
      },
      null,
      1,
    ),
  );
  console.log(`\nescrito ${REPORT_PATH}`);

  if (!SUBIR) {
    console.log(`Los ficheros están en ${STAGING_DIR}/. Añade --upload para subirlos al bucket.`);
    return;
  }

  console.log(`\nsubiendo ${subibles.length} ficheros a ${BUCKET}…`);
  let ok = 0;
  const fallosSubida = [];
  await pool(subibles, CONCURRENCIA, async (r) => {
    const body = fs.readFileSync(path.join(STAGING_DIR, r.fichero));
    const { error } = await supabase.storage.from(BUCKET).upload(r.fichero, body, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) fallosSubida.push(`${r.fichero}: ${error.message}`);
    else ok += 1;
  });

  console.log(`subidos: ${ok} · fallos: ${fallosSubida.length}`);
  for (const f of fallosSubida.slice(0, 10)) console.log(`  - ${f}`);

  const informe = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  const subidos = new Set(subibles.filter((r) => !fallosSubida.some((f) => f.startsWith(`${r.fichero}:`))).map((r) => r.fichero));
  for (const r of informe.resultados) r.subido = subidos.has(r.fichero);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(informe, null, 1));

  if (ok) {
    console.log(
      `\nprueba: ${cred.url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(subibles[0].fichero)}`,
    );
    console.log("Siguiente paso: node scripts/switch-native-media-to-webp.mjs");
  }
  if (fallosSubida.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
