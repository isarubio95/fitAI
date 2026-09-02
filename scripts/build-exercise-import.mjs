/**
 * Construye el lote de importación del catálogo a partir de las dos fuentes.
 *
 *   node scripts/build-exercise-import.mjs
 *
 * NO escribe en la base de datos: produce dos artefactos para revisar antes de
 * importar nada.
 *
 *   data/exercise-import.json        filas listas para insertar
 *   data/exercise-import-review.md   tabla de revisión, lo dudoso primero
 *
 * Fuentes:
 *   data/free-exercise-db.json   876 ejercicios, Unlicense (dominio público),
 *                                2 fotos 850×567 por ejercicio → WebP animado
 *   data/lyfta-candidates.json   835 candidatos ya filtrados de la librería
 *                                Lyfta; solo miniatura PNG 184×175
 *
 * El orden importa: free-exercise-db va primero porque su medio es mejor y su
 * licencia es limpia. Lyfta solo aporta lo que la otra no cubre.
 */

import fs from "node:fs";
import path from "node:path";
import { tagExercise, norm } from "./lib/exerciseTagging.mjs";
import { translateExerciseName } from "./lib/exerciseNaming.mjs";
import { musclesFromFdb, musclesFromLyfta, tipoFromTags } from "./lib/exerciseMuscles.mjs";

const FDB_PATH = "data/free-exercise-db.json";
const LYFTA_PATH = "data/lyfta-candidates.json";
const NAME_MAP_PATH = "src/lib/lyfta/catalogNameToTipoId.ts";
const OUT_JSON = "data/exercise-import.json";
const OUT_REVIEW = "data/exercise-import-review.md";

const FDB_RAW_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const LYFTA_IMG_BASE = "https://lyfta.app/images/exercises";

/**
 * Filas que no son ejercicios. La librería de Lyfta mezcla láminas de anatomía
 * ("Body muscles. Female. Back view", "By MAJOR MUSCLE GROUPS Muscle body
 * male") con los ejercicios de verdad.
 */
const NO_ES_EJERCICIO =
  /(body muscles?|body fat|muscle body|by body parts|by major muscle|measurement|side (back|front) view|^standing pose$|^body muscle)/i;

/** Dificultad de free-exercise-db → la escala 1/2/3 de la BD. */
const NIVEL_FDB = { beginner: "1", intermediate: "2", expert: "3" };

function leerJson(p) {
  if (!fs.existsSync(p)) {
    console.error(`Falta ${p}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** Alias ya presentes en el catálogo: no se reimporta lo que ya existe. */
function aliasExistentes() {
  if (!fs.existsSync(NAME_MAP_PATH)) return new Set();
  const src = fs.readFileSync(NAME_MAP_PATH, "utf8");
  return new Set([...src.matchAll(/^\s*"([^"]+)":/gm)].map((m) => norm(m[1])));
}

/** Dificultad a partir de la carga y la complejidad, cuando la fuente no la da. */
function dificultadDeTags({ patron_movimiento, cualidad, unilateral }) {
  if (cualidad.includes("pliometria") || cualidad.includes("potencia")) return "3";
  if (unilateral) return "3";
  if (patron_movimiento.includes("aislado") || cualidad.includes("movilidad")) return "1";
  return "2";
}

function construirFila(base, tags, nombreEs, musculos, medio, origen, origenId) {
  return {
    origen,
    origen_externo_id: origenId,
    nombre: nombreEs,
    nombre_en: base.name,
    tipo: tipoFromTags({
      grupo: musculos.grupo,
      cualidad: tags.cualidad,
      registro_series: tags.registro_series,
    }),
    grupo_muscular: musculos.grupo,
    musculos_involucrados: musculos.musculos,
    equipment: base.equipmentEs,
    equipment_list: base.equipmentList,
    dificultad: base.dificultad ?? dificultadDeTags(tags),
    registro_series: tags.registro_series,
    instructions: base.instructions ?? [],
    patron_movimiento: tags.patron_movimiento,
    cualidad: tags.cualidad,
    plano: tags.plano,
    unilateral: tags.unilateral,
    deportes: [],
    gif_url: medio.gif_url,
    imagen: medio.imagen,
    video_url: null,
    // Solo para el informe de revisión; no se inserta.
    _medio: medio.tipo,
    _confianzaTags: tags.confianza,
    _confianzaNombre: nombreEs ? undefined : "baja",
    _sinTraducir: base.sinTraducir ?? [],
  };
}

function main() {
  const fdb = leerJson(FDB_PATH);
  const lyfta = leerJson(LYFTA_PATH);
  const yaExiste = aliasExistentes();

  const vistos = new Set();
  const filas = [];
  const descartes = { yaEnCatalogo: 0, noEsEjercicio: 0, duplicado: 0, sinNombre: 0 };

  const reservar = (nombreEn, nombreEs) => {
    const claveEn = norm(nombreEn);
    if (NO_ES_EJERCICIO.test(nombreEn)) {
      descartes.noEsEjercicio += 1;
      return false;
    }
    if (yaExiste.has(claveEn) || yaExiste.has(norm(nombreEs))) {
      descartes.yaEnCatalogo += 1;
      return false;
    }
    if (vistos.has(claveEn)) {
      descartes.duplicado += 1;
      return false;
    }
    if (!nombreEs) {
      descartes.sinNombre += 1;
      return false;
    }
    vistos.add(claveEn);
    return true;
  };

  // ── 1) free-exercise-db: mejor imagen y licencia limpia, va primero ───────
  for (const row of fdb) {
    const tags = tagExercise({
      name: row.name,
      equipment: row.equipment ? [row.equipment] : [],
      bodyParts: [],
      category: row.category,
    });
    const traduccion = translateExerciseName(row.name);
    if (!reservar(row.name, traduccion.nombre)) continue;

    const musculos = musclesFromFdb(row, tags.patron_movimiento);
    const equipmentEs = translateExerciseName(row.equipment ?? "").nombre || null;

    // Dos fotogramas (inicio/fin) → bucle WebP de 2 frames en la fase de medios.
    const frames = (row.images ?? []).map((rel) => `${FDB_RAW_BASE}/${rel}`);
    const medio = frames.length
      ? { tipo: frames.length >= 2 ? "webp_2frames" : "jpg_estatico", gif_url: null, imagen: null, frames }
      : { tipo: "sin_medio", gif_url: null, imagen: null, frames: [] };

    filas.push({
      ...construirFila(
        {
          name: row.name,
          equipmentEs,
          equipmentList: row.equipment ? [row.equipment] : [],
          dificultad: NIVEL_FDB[norm(row.level)] ?? null,
          instructions: row.instructions ?? [],
          sinTraducir: traduccion.sinTraducir,
        },
        tags,
        traduccion.nombre,
        musculos,
        medio,
        "fdb",
        row.id,
      ),
      _frames: medio.frames,
      _confianzaNombre: traduccion.confianza,
    });
  }

  // ── 2) Lyfta: solo lo que la otra fuente no cubre ─────────────────────────
  for (const row of lyfta) {
    const tags = tagExercise({
      name: row.name,
      equipment: row.equipment ?? [],
      bodyParts: row.body_part ?? [],
      category: null,
    });
    const traduccion = translateExerciseName(row.name);
    if (!reservar(row.name, traduccion.nombre)) continue;

    const musculos = musclesFromLyfta(row, tags.patron_movimiento);
    const equipmentEs =
      (row.equipment ?? [])
        .map((e) => translateExerciseName(e).nombre)
        .filter(Boolean)
        .join(", ") || null;

    const assetId = (String(row.image_url ?? "").match(/\/(\d{6,10})\.\w+$/) ?? [])[1] ?? null;
    const medio = assetId
      ? {
          tipo: "png_estatico",
          gif_url: `${LYFTA_IMG_BASE}/${assetId}.png`,
          imagen: `${LYFTA_IMG_BASE}/${assetId}.png`,
          frames: [],
        }
      : { tipo: "sin_medio", gif_url: null, imagen: null, frames: [] };

    filas.push({
      ...construirFila(
        {
          name: row.name,
          equipmentEs,
          equipmentList: row.equipment ?? [],
          dificultad: null,
          instructions: [],
          sinTraducir: traduccion.sinTraducir,
        },
        tags,
        traduccion.nombre,
        musculos,
        medio,
        "lyfta",
        row.id,
      ),
      _frames: [],
      _confianzaNombre: traduccion.confianza,
    });
  }

  // ── Colisiones de nombre en español ──────────────────────────────────────
  // Dos ejercicios distintos no pueden compartir nombre en el catálogo. Se
  // marcan para resolverlos a mano en vez de descartar uno en silencio.
  const porNombreEs = new Map();
  for (const f of filas) {
    const k = norm(f.nombre);
    if (!porNombreEs.has(k)) porNombreEs.set(k, []);
    porNombreEs.get(k).push(f);
  }
  let colisiones = 0;
  for (const grupo of porNombreEs.values()) {
    if (grupo.length < 2) continue;
    colisiones += grupo.length;
    for (const f of grupo) {
      f._colision = grupo.map((g) => g.nombre_en).join(" / ");
    }
  }

  // ── Informe ──────────────────────────────────────────────────────────────
  const cuenta = (key) =>
    filas.reduce((acc, f) => ((acc[f[key] ?? "—"] = (acc[f[key] ?? "—"] ?? 0) + 1), acc), {});

  const porOrigen = cuenta("origen");
  const porMedio = cuenta("_medio");
  const porRegistro = cuenta("registro_series");
  const porGrupo = cuenta("grupo_muscular");
  const porTags = cuenta("_confianzaTags");
  const porNombre = cuenta("_confianzaNombre");

  const revisar = filas.filter(
    (f) => f._confianzaTags === "baja" || f._confianzaNombre !== "alta" || f._colision,
  );
  const sinGrupo = filas.filter((f) => !f.grupo_muscular);
  const sinMedio = filas.filter((f) => f._medio === "sin_medio");

  console.log("=== LOTE DE IMPORTACIÓN ===");
  console.log(`filas: ${filas.length}`);
  console.log("descartes:", JSON.stringify(descartes));
  console.log("por origen:", JSON.stringify(porOrigen));
  console.log("por medio:", JSON.stringify(porMedio));
  console.log("por registro:", JSON.stringify(porRegistro));
  console.log("confianza etiquetas:", JSON.stringify(porTags));
  console.log("confianza nombre:", JSON.stringify(porNombre));
  console.log("por grupo:", JSON.stringify(porGrupo));
  console.log("");
  console.log(`a revisar a mano: ${revisar.length} (${((revisar.length / filas.length) * 100).toFixed(1)}%)`);
  console.log(`sin grupo muscular: ${sinGrupo.length}`);
  console.log(`sin medio: ${sinMedio.length}`);
  console.log(`colisiones de nombre ES: ${colisiones}`);

  // Términos que el diccionario no supo traducir, por frecuencia: es la lista
  // de trabajo para ampliarlo con datos en vez de a ojo.
  const pendientes = {};
  for (const f of filas) {
    for (const t of f._sinTraducir ?? []) pendientes[t] = (pendientes[t] ?? 0) + 1;
  }
  const topPendientes = Object.entries(pendientes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);
  console.log("");
  console.log("términos sin traducir (top 40):");
  console.log(topPendientes.map(([t, n]) => `${t}:${n}`).join(" "));

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(filas, null, 1));

  const md = [
    "# Revisión del lote de importación",
    "",
    `Generado por \`scripts/build-exercise-import.mjs\`. Filas: **${filas.length}**.`,
    "",
    "Lo dudoso va primero. Revisa el nombre en español y las etiquetas antes de",
    "ejecutar la importación real.",
    "",
    "| ES | EN | origen | medio | registro | grupo | patrón | cualidad | tags | nombre | colisión | sin traducir |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...[...revisar, ...filas.filter((f) => !revisar.includes(f))].map(
      (f) =>
        `| ${f.nombre} | ${f.nombre_en} | ${f.origen} | ${f._medio} | ${f.registro_series} | ${f.grupo_muscular ?? "—"} | ${f.patron_movimiento.join(" ")} | ${f.cualidad.join(" ")} | ${f._confianzaTags} | ${f._confianzaNombre} | ${f._colision ?? ""} | ${(f._sinTraducir ?? []).join(" ")} |`,
    ),
  ].join("\n");
  fs.writeFileSync(OUT_REVIEW, md);

  console.log("");
  console.log(`escrito ${OUT_JSON}`);
  console.log(`escrito ${OUT_REVIEW}`);
}

main();
