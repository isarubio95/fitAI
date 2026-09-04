/**
 * Descarga y convierte los medios del lote de importación.
 *
 *   node scripts/fetch-exercise-media.mjs                 # descarga y convierte
 *   node scripts/fetch-exercise-media.mjs --limit 30      # solo las 30 primeras
 *   node scripts/fetch-exercise-media.mjs --upload        # + sube al bucket
 *   node scripts/fetch-exercise-media.mjs --force         # reprocesa lo ya hecho
 *
 * Dos fuentes, dos tratamientos:
 *
 *   free-exercise-db  2 fotogramas JPG de 850×567 (inicio y fin del gesto)
 *                     → WebP ANIMADO de 2 fotogramas a 800 ms cada uno.
 *                     ~20 KB por ejercicio, 44 veces menos que los GIF
 *                     actuales de ~850 KB.
 *   Lyfta             1 PNG estático de 184×175 → WebP estático.
 *                     Es lo único que expone su CDN público.
 *
 * Los ficheros NO van a `public/ejercicios/`: esa carpeta ya pesa 635 MB con
 * los 749 GIF originales y se excluye del AAB. Van solo al bucket `ejercicios`
 * de Supabase Storage, que ya acepta image/webp.
 *
 * Es reanudable: lo ya convertido se salta salvo --force.
 */

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cargarEnv, esAnimado, pool } from "./lib/mediaUtils.mjs";

const execFileAsync = promisify(execFile);

const IMPORT_PATH = "data/exercise-import.json";
const STAGING_DIR = "data/media-staging";
const REPORT_PATH = "data/media-report.json";
const BUCKET = "ejercicios";

/** 800 ms por fotograma: una alternancia lenta lee bien las dos posiciones. */
const FRAMERATE = 1.25;
/** Ancho objetivo. Los originales son 850×567; 500 basta para una tarjeta. */
const ANCHO = 500;
const CALIDAD = 72;
const CONCURRENCIA = 6;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const valorDe = (n, def) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

const LIMITE = valorDe("--limit", Infinity);
const SUBIR = flag("--upload");
const FORZAR = flag("--force");

/** Nombre de fichero estable y seguro, derivado del origen. */
function nombreFichero(fila) {
  const id = String(fila.origen_externo_id ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${fila.origen}-${id || "sin-id"}.webp`;
}

async function descargar(url, destino) {
  const res = await fetch(url, {
    headers: { "User-Agent": "TrackGym-media/1.0 (catalog import)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error(`respuesta vacía en ${url}`);
  fs.writeFileSync(destino, buf);
  return buf.length;
}

/** Compone los fotogramas en un WebP animado con ffmpeg. */
async function componerAnimado(frames, salida) {
  const tmp = fs.mkdtempSync(path.join(STAGING_DIR, ".tmp-"));
  try {
    for (let i = 0; i < frames.length; i++) {
      await descargar(frames[i], path.join(tmp, `f${i}.jpg`));
    }
    await execFileAsync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-framerate", String(FRAMERATE),
      "-i", path.join(tmp, "f%d.jpg"),
      "-loop", "0",
      "-c:v", "libwebp",
      "-lossless", "0",
      "-q:v", String(CALIDAD),
      "-vf", `scale=${ANCHO}:-1`,
      salida,
    ]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** Convierte una imagen suelta a WebP estático. */
async function convertirEstatico(url, salida) {
  const tmp = fs.mkdtempSync(path.join(STAGING_DIR, ".tmp-"));
  try {
    const origen = path.join(tmp, "in.img");
    await descargar(url, origen);
    await execFileAsync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-i", origen,
      "-c:v", "libwebp",
      "-lossless", "0",
      "-q:v", String(CALIDAD),
      salida,
    ]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  cargarEnv();

  if (!fs.existsSync(IMPORT_PATH)) {
    console.error(`Falta ${IMPORT_PATH}. Ejecuta primero: npm run catalogo:build`);
    process.exit(1);
  }
  try {
    await execFileAsync("ffmpeg", ["-version"]);
  } catch {
    console.error("No encuentro ffmpeg en el PATH. Es necesario para el WebP animado.");
    process.exit(1);
  }

  fs.mkdirSync(STAGING_DIR, { recursive: true });
  const filas = JSON.parse(fs.readFileSync(IMPORT_PATH, "utf8"));

  const tareas = [];
  let sinMedio = 0;
  for (const fila of filas) {
    const frames = fila._frames ?? [];
    if (frames.length >= 2) {
      tareas.push({ fila, tipo: "animado", frames });
    } else if (frames.length === 1) {
      tareas.push({ fila, tipo: "estatico", url: frames[0] });
    } else if (fila.gif_url && String(fila.gif_url).startsWith("http")) {
      tareas.push({ fila, tipo: "estatico", url: fila.gif_url });
    } else {
      sinMedio += 1;
    }
  }

  const pendientes = tareas.slice(0, LIMITE === Infinity ? tareas.length : LIMITE);
  console.log(`tareas: ${tareas.length} (procesando ${pendientes.length}) · sin medio: ${sinMedio}`);

  const resultados = [];
  const errores = [];

  await pool(pendientes, CONCURRENCIA, async (t) => {
    const nombre = nombreFichero(t.fila);
    const salida = path.join(STAGING_DIR, nombre);
    try {
      if (!FORZAR && fs.existsSync(salida) && fs.statSync(salida).size > 0) {
        resultados.push({ nombre, tipo: t.tipo, bytes: fs.statSync(salida).size, cache: true });
        return;
      }
      if (t.tipo === "animado") {
        await componerAnimado(t.frames, salida);
      } else {
        await convertirEstatico(t.url, salida);
      }
      const bytes = fs.statSync(salida).size;
      if (bytes === 0) throw new Error("salida vacía");
      resultados.push({
        nombre,
        tipo: t.tipo,
        bytes,
        animado: t.tipo === "animado" ? esAnimado(salida) : false,
      });
    } catch (e) {
      errores.push({ nombre, nombre_en: t.fila.nombre_en, error: String(e.message ?? e) });
      // Un fichero a medias es peor que ninguno: se borra.
      if (fs.existsSync(salida)) fs.rmSync(salida, { force: true });
    }
  });

  const bytesTotal = resultados.reduce((s, r) => s + r.bytes, 0);
  const animados = resultados.filter((r) => r.animado).length;
  console.log("");
  console.log(`convertidos: ${resultados.length} · fallos: ${errores.length}`);
  console.log(`animados verificados: ${animados}`);
  console.log(`peso total: ${(bytesTotal / 1024 / 1024).toFixed(1)} MB`);
  if (resultados.length) {
    console.log(`media por fichero: ${(bytesTotal / resultados.length / 1024).toFixed(1)} KB`);
  }
  if (errores.length) {
    console.log("primeros fallos:");
    for (const e of errores.slice(0, 10)) console.log(`  - ${e.nombre_en}: ${e.error}`);
  }

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify({ generado: new Date().toISOString(), resultados, errores }, null, 1),
  );
  console.log(`escrito ${REPORT_PATH}`);

  if (!SUBIR) {
    console.log("");
    console.log(`Los ficheros están en ${STAGING_DIR}/. Añade --upload para subirlos al bucket.`);
    return;
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error("Para --upload hacen falta VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`\nsubiendo ${resultados.length} ficheros a ${BUCKET}…`);
  let ok = 0;
  const fallosSubida = [];
  await pool(resultados, CONCURRENCIA, async (r) => {
    const body = fs.readFileSync(path.join(STAGING_DIR, r.nombre));
    const { error } = await supabase.storage.from(BUCKET).upload(r.nombre, body, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) fallosSubida.push(`${r.nombre}: ${error.message}`);
    else ok += 1;
  });
  console.log(`subidos: ${ok} · fallos: ${fallosSubida.length}`);
  for (const f of fallosSubida.slice(0, 10)) console.log(`  - ${f}`);
  if (ok) {
    console.log(
      `prueba: ${url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(resultados[0].nombre)}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
