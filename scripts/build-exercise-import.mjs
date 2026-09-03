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
import { canonicalEquipoList } from "./lib/equipmentVocab.mjs";

const FDB_PATH = "data/free-exercise-db.json";
const LYFTA_PATH = "data/lyfta-candidates.json";
const NAME_MAP_PATH = "src/lib/lyfta/catalogNameToTipoId.ts";
/**
 * Correcciones de nombre revisadas a mano, una por una, con criterio de
 * nomenclatura técnica en español (España) y terminología anatómica correcta.
 * Mandan sobre lo que produzca el traductor automático.
 */
const OVERRIDES_PATH = "data/exercise-name-overrides.json";
/**
 * Instrucciones de ejecución redactadas a mano para las 730 filas de Lyfta,
 * que no traen ninguna. Cuatro pasos: colocación, ejecución, control y la
 * clave técnica o el error a evitar.
 */
const INSTRUCTIONS_PATH = "data/exercise-instructions.json";
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
    tipo: tipoFromTags({ grupo: musculos.grupo, cualidad: tags.cualidad }),
    grupo_muscular: musculos.grupo,
    musculos_involucrados: musculos.musculos,
    // `equipment_list` es la columna de verdad, con el vocabulario canónico en
    // español (src/constants/exerciseEquipment.ts), y `equipment` se deriva de
    // ella. Antes cada fuente escribía su propio vocabulario —"body only" y
    // "Body weight" para lo mismo, e inglés frente al español de las filas
    // originales— y el filtro de equipo de la UI, que construye sus chips
    // desde los datos, mostraba duplicados del mismo aparato.
    equipment: base.equipmentCanonico.length ? base.equipmentCanonico.join(", ") : null,
    equipment_list: base.equipmentCanonico,
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
  const overrides = fs.existsSync(OVERRIDES_PATH) ? leerJson(OVERRIDES_PATH) : {};
  // Una clave que no casa con ningún nombre inglés es una errata: hay que
  // verlo, no tragárselo en silencio.
  const overridesUsados = new Set();
  const instrucciones = fs.existsSync(INSTRUCTIONS_PATH) ? leerJson(INSTRUCTIONS_PATH) : {};
  const instruccionesUsadas = new Set();

  /** Las propias mandan sobre las de la fuente, que están en inglés. */
  const instruccionesDe = (nombreEn, deLaFuente) => {
    if (instrucciones[nombreEn]) {
      instruccionesUsadas.add(nombreEn);
      return instrucciones[nombreEn];
    }
    return deLaFuente ?? [];
  };

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
    if (overrides[row.name]) {
      traduccion.nombre = overrides[row.name];
      traduccion.confianza = "revisado";
      traduccion.sinTraducir = [];
      overridesUsados.add(row.name);
    }
    if (!reservar(row.name, traduccion.nombre)) continue;

    const musculos = musclesFromFdb(row, tags.patron_movimiento);
    const equipmentCanonico = canonicalEquipoList(row.equipment ? [row.equipment] : []).lista;

    // Dos fotogramas (inicio/fin) → bucle WebP de 2 frames en la fase de medios.
    const frames = (row.images ?? []).map((rel) => `${FDB_RAW_BASE}/${rel}`);
    const medio = frames.length
      ? { tipo: frames.length >= 2 ? "webp_2frames" : "jpg_estatico", gif_url: null, imagen: null, frames }
      : { tipo: "sin_medio", gif_url: null, imagen: null, frames: [] };

    filas.push({
      ...construirFila(
        {
          name: row.name,
          equipmentCanonico,
          dificultad: NIVEL_FDB[norm(row.level)] ?? null,
          instructions: instruccionesDe(row.name, row.instructions),
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
    if (overrides[row.name]) {
      traduccion.nombre = overrides[row.name];
      traduccion.confianza = "revisado";
      traduccion.sinTraducir = [];
      overridesUsados.add(row.name);
    }
    if (!reservar(row.name, traduccion.nombre)) continue;

    const musculos = musclesFromLyfta(row, tags.patron_movimiento);
    const equipmentCanonico = canonicalEquipoList(row.equipment ?? []).lista;

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
          equipmentCanonico,
          dificultad: null,
          instructions: instruccionesDe(row.name, []),
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
  /**
   * Calidad de la fila, para elegir cuál sobrevive de un grupo de duplicados.
   * Mandan las instrucciones (free-exercise-db las trae, Lyfta no) y luego el
   * medio: un WebP animado de dos fotogramas vale más que una miniatura
   * estática.
   */
  const CALIDAD_MEDIO = { webp_2frames: 3, jpg_estatico: 2, png_estatico: 1, sin_medio: 0 };
  const calidadDe = (f) =>
    (f.instructions?.length ? 100 : 0) +
    (CALIDAD_MEDIO[f._medio] ?? 0) * 10 +
    (f.origen === "fdb" ? 1 : 0);

  let colapsados = 0;
  const descartadosPorDuplicado = new Set();
  for (const grupo of porNombreEs.values()) {
    if (grupo.length < 2) continue;
    // Con el nombre bien puesto en español, dos filas que coinciden son el
    // mismo ejercicio escrito distinto en inglés ("Alternating Kettlebell
    // Press" vs "Kettlebell Alternating Press"). Se queda la mejor.
    const ordenado = [...grupo].sort((a, b) => calidadDe(b) - calidadDe(a));
    const [gana, ...pierden] = ordenado;
    gana._fusionadoCon = pierden.map((f) => f.nombre_en);
    for (const f of pierden) descartadosPorDuplicado.add(f);
    colapsados += pierden.length;
  }

  const filasFinales = filas.filter((f) => !descartadosPorDuplicado.has(f));
  filas.length = 0;
  filas.push(...filasFinales);
  descartes.duplicadoEs = colapsados;

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
    (f) =>
      f._confianzaTags === "baja" ||
      (f._confianzaNombre !== "alta" && f._confianzaNombre !== "revisado"),
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
  console.log(`duplicados colapsados por nombre ES: ${colapsados}`);

  const overridesHuerfanos = Object.keys(overrides).filter((k) => !overridesUsados.has(k));
  console.log(`correcciones de nombre aplicadas: ${overridesUsados.size}/${Object.keys(overrides).length}`);
  console.log(
    `instrucciones propias aplicadas: ${instruccionesUsadas.size}/${Object.keys(instrucciones).length}`,
  );
  const sinInstrucciones = filas.filter((f) => !f.instructions?.length).length;
  console.log(`filas sin instrucciones: ${sinInstrucciones}`);
  const instrHuerfanas = Object.keys(instrucciones).filter((k) => !instruccionesUsadas.has(k));
  if (instrHuerfanas.length) {
    console.log(`⚠ instrucciones sin ejercicio: ${instrHuerfanas.length}`);
    for (const k of instrHuerfanas.slice(0, 10)) console.log(`   - ${k}`);
  }
  if (overridesHuerfanos.length) {
    console.log(`⚠ correcciones sin ejercicio (erratas en la clave): ${overridesHuerfanos.length}`);
    for (const k of overridesHuerfanos.slice(0, 20)) console.log(`   - ${k}`);
  }

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
    "| ES | EN | origen | medio | registro | grupo | patrón | cualidad | tags | nombre | fusionado con | sin traducir |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...[...revisar, ...filas.filter((f) => !revisar.includes(f))].map(
      (f) =>
        `| ${f.nombre} | ${f.nombre_en} | ${f.origen} | ${f._medio} | ${f.registro_series} | ${f.grupo_muscular ?? "—"} | ${f.patron_movimiento.join(" ")} | ${f.cualidad.join(" ")} | ${f._confianzaTags} | ${f._confianzaNombre} | ${(f._fusionadoCon ?? []).join(" / ")} | ${(f._sinTraducir ?? []).join(" ")} |`,
    ),
  ].join("\n");
  fs.writeFileSync(OUT_REVIEW, md);

  console.log("");
  console.log(`escrito ${OUT_JSON}`);
  console.log(`escrito ${OUT_REVIEW}`);
}

main();
