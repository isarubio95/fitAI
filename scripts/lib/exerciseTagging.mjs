/**
 * Etiquetado automático de ejercicios: patrón de movimiento, cualidad física,
 * plano, unilateralidad y modo de registro.
 *
 * Se deduce del nombre en inglés, el equipo y la categoría de la fuente. Es
 * heurístico a propósito: cubre el grueso del catálogo y marca con
 * `confianza: "baja"` lo que no reconoce, para revisión manual.
 *
 * El vocabulario tiene que coincidir con src/constants/exerciseTaxonomy.ts.
 */

/** Normaliza para buscar: minúsculas, sin acentos, separadores a espacio. */
export function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** ¿Aparece alguno de estos términos como palabra o frase completa? */
function has(haystack, terms) {
  for (const t of terms) {
    const needle = norm(t);
    if (!needle) continue;
    if (haystack === needle) return true;
    if (haystack.includes(" " + needle + " ")) return true;
    if (haystack.startsWith(needle + " ")) return true;
    if (haystack.endsWith(" " + needle)) return true;
  }
  return false;
}

// ── Patrón de movimiento ───────────────────────────────────────────────────
// El orden importa: para los casos excluyentes gana la primera regla que casa.
const PATRON_RULES = [
  ["aterrizaje", ["depth jump", "drop jump", "landing", "jump down", "drop push", "depth"]],
  ["salto", ["jump", "jumps", "hop", "hops", "hopping", "bound", "bounding", "leap", "skip", "skips", "skipping", "pogo", "jumping", "jack", "jacks"]],
  ["lanzamiento", ["throw", "throws", "slam", "slams", "toss", "scoop", "chest pass", "chest push", "pass", "punch", "punches", "jab", "cross", "uppercut", "hook", "front kick", "side kick", "roundhouse kick", "hook kick", "axe kick", "push kick", "snap kick", "groin kick", "knee kick", "spin back kick", "boxing", "kickboxing"]],
  ["rotacion", ["rotation", "rotational", "twist", "twisting", "chop", "wood chop", "woodchop", "russian twist", "swing", "turn", "windmill"]],
  ["antirotacion", ["pallof", "plank", "planks", "dead bug", "bird dog", "suitcase", "anti rotation", "side plank", "hollow"]],
  ["flexion_core", ["crunch", "crunches", "sit up", "situp", "sit ups", "leg raise", "leg raises", "knee raise", "knee raises", "leg lift", "rollout", "roll out", "ab roller", "side bend", "v up", "toe touch", "toe touchers", "heel touchers", "jackknife", "flutter kick", "flutter kicks", "scissor kick", "hanging leg", "reverse crunch", "abs", "leg pull in", "leg tuck", "leg tucks", "cocoons", "hanging pike", "butt ups", "otis up", "elbow to knee", "wipers", "pike"]],
  ["traccion_vertical", ["pull up", "pullup", "pullups", "pull ups", "chin up", "chinup", "chins", "chin", "pulldown", "pull down", "lat pulldown", "climb", "climbing", "muscle up", "gironda"]],
  ["traccion_horizontal", ["row", "rows", "rowing", "face pull", "rear delt", "inverted row"]],
  ["empuje_vertical", ["overhead press", "shoulder press", "military", "jerk", "push press", "handstand", "overhead", "arnold press"]],
  ["empuje_horizontal", ["bench press", "push up", "pushup", "pushups", "push ups", "chest press", "fly", "flyes", "flys", "dip", "dips", "chest fly", "body up", "fallout"]],
  ["bisagra", ["deadlift", "hip thrust", "good morning", "romanian", "rdl", "glute bridge", "bridge", "back extension", "hyperextension", "nordic", "hip hinge", "kettlebell swing", "clean", "snatch", "pull through", "atlas stone", "atlas stones", "tire flip", "keg load", "sandbag load", "log lift", "stone trainer", "hamstring slides", "manual hamstring"]],
  ["zancada", ["lunge", "lunges", "split squat", "step up", "step ups", "bulgarian", "stepup"]],
  ["sentadilla", ["squat", "squats", "leg press", "hack squat", "wall sit", "sissy"]],
  ["desplazamiento", ["sprint", "run", "running", "shuffle", "carioca", "agility", "crawl", "walk", "walking", "march", "marching", "skater", "stride", "ladder", "prancing", "butt kick", "butt kicks", "high knee", "high knees"]],
  ["carry", ["carry", "carries", "farmer", "farmers", "waiter walk", "suitcase carry", "yoke", "drag", "plate pinch", "hand squeeze", "circus bell", "conan"]],
  ["braceo", ["swim", "swimming", "arm drill", "pullover", "straight arm"]],
];

/**
 * "Press" a secas es empuje vertical (militar, kettlebell, Arnold). Las
 * excepciones son los press que ya tienen su propia regla: banca, pecho,
 * pierna y el press de suelo, que es horizontal.
 */
const PRESS_NO_VERTICAL = ["bench press", "chest press", "leg press", "floor press", "board press"];

const AISLADO_TERMS = [
  "curl", "curls", "extension", "extensions", "raise", "raises", "calf", "wrist",
  "shrug", "shrugs", "kickback", "pushdown", "pull over", "concentration",
  "preacher", "reverse fly", "lateral raise", "front raise", "neck",
  "kickback", "kickbacks", "donkey kick", "glute kick", "kick back",
];

// ── Cualidad física ────────────────────────────────────────────────────────
const CUALIDAD_RULES = [
  ["pliometria", ["jump", "hop", "bound", "plyo", "plyometric", "depth", "leap", "skip", "tuck jump", "clap"]],
  ["potencia", ["throw", "slam", "clean", "snatch", "jerk", "swing", "power", "explosive", "medicine ball", "med ball", "punch", "wall ball", "front kick", "side kick", "roundhouse kick", "hook kick", "axe kick", "snap kick"]],
  ["velocidad", ["sprint", "speed", "agility", "quick", "fast", "carioca", "ladder", "shuffle"]],
  ["estabilidad", ["plank", "balance", "stability", "bosu", "single leg stand", "pallof", "bird dog", "dead bug", "hollow", "stability ball", "suspension"]],
  ["movilidad", ["stretch", "mobility", "smr", "foam roll", "yoga", "opener", "cat cow"]],
  ["coordinacion", ["drill", "carioca", "skip", "ladder", "crawl", "juggle", "get up"]],
  ["prevencion", ["rotator cuff", "external rotation", "internal rotation", "nordic", "copenhagen", "face pull", "scapular", "ytw", "cuban", "band pull apart", "tibialis"]],
  ["resistencia", ["battling", "battle rope", "sled", "carry", "farmers", "burpee", "mountain climber", "ergometer", "bike", "treadmill", "elliptical", "jump rope"]],
  ["fuerza_maxima", ["deadlift", "squat", "bench press", "overhead press", "clean", "snatch", "jerk", "front squat", "back squat", "atlas stone", "atlas stones", "tire flip", "keg load", "sandbag load", "log lift", "strongman", "yoke", "conan"]],
  ["hipertrofia", ["curl", "extension", "fly", "raise", "pushdown", "kickback", "shrug", "preacher", "concentration"]],
];

// ── Plano dominante ────────────────────────────────────────────────────────
const PLANO_RULES = [
  ["multiplanar", ["turkish", "get up", "crawl", "burpee", "carioca", "windmill", "world greatest"]],
  ["transversal", ["rotation", "rotational", "twist", "chop", "russian twist", "windmill", "swing", "punch", "hook", "cross"]],
  ["frontal", ["lateral", "side", "abduction", "adduction", "skater", "star", "cossack", "sumo", "wide"]],
];

const UNILATERAL_TERMS = [
  "single", "single leg", "single arm", "one arm", "one leg", "unilateral",
  "split squat", "bulgarian", "pistol", "1 to 2", "2 to 1", "one hand",
  "suitcase", "staggered", "b stance",
];

// Cronometrados: no tiene sentido contarles repeticiones.
const DURACION_TERMS = [
  "plank", "planks", "hold", "isometric", "wall sit", "dead hang", "hang",
  "stretch", "smr", "foam roll", "battling", "battle rope", "carry", "carries",
  "farmers", "ergometer", "treadmill", "elliptical", "bike", "run", "running",
  "sprint", "jump rope", "mountain climber", "shuffle", "crawl",
];

/** Balísticos sin carga externa que registrar: repeticiones y punto. */
const SOLO_REPS_TERMS = [
  "jump", "jumps", "hop", "hops", "bound", "leap", "skip", "throw", "slam",
  "toss", "scoop", "clap", "plyo", "depth", "pogo", "tuck jump", "broad jump",
  "chest push", "chest pass", "punch", "jab", "uppercut",
];

/**
 * Equipo que implica carga externa registrable.
 *
 * Incluye las dos nomenclaturas: la de Lyfta ("Kettlebell", "EZ Barbell") y la
 * de free-exercise-db, que usa plurales y nombres distintos ("kettlebells",
 * "bands", "e-z curl bar"). Sin los plurales, media librería se quedaba sin
 * cualidad porque no disparaba el respaldo de hipertrofia.
 */
const CARGA_EXTERNA_EQUIPO = [
  "barbell", "dumbbell", "dumbbells", "kettlebell", "kettlebells", "cable",
  "cables", "machine", "leverage machine", "smith machine", "ez barbell",
  "e z curl bar", "ez curl bar", "olympic barbell", "trap bar", "weighted",
  "plate", "sled machine", "power sled", "bands", "band", "resistance band",
  "medicine ball", "exercise ball", "stability ball", "rollball", "hammer",
];

function collect(rules, haystack) {
  const out = [];
  for (const [tag, terms] of rules) {
    if (has(haystack, terms) && !out.includes(tag)) out.push(tag);
  }
  return out;
}

/**
 * Etiqueta un ejercicio.
 *
 * @param {{name: string, equipment?: string[]|string|null, bodyParts?: string[]|null, category?: string|null}} input
 * @returns {{patron_movimiento: string[], cualidad: string[], plano: string|null,
 *            unilateral: boolean, registro_series: string, confianza: "alta"|"media"|"baja"}}
 */
export function tagExercise(input) {
  const equipos = Array.isArray(input.equipment)
    ? input.equipment
    : input.equipment
      ? [input.equipment]
      : [];
  const bodyParts = Array.isArray(input.bodyParts) ? input.bodyParts : [];

  // El nombre manda; equipo y categoría solo aportan contexto extra.
  const nombre = " " + norm(input.name) + " ";
  const contexto = " " + norm([input.name, ...equipos, ...bodyParts, input.category].join(" ")) + " ";
  const equipoNorm = equipos.map(norm);

  const esPlyoCategoria =
    norm(input.category) === "plyometrics" || bodyParts.some((b) => norm(b) === "plyometrics");
  const esStretchCategoria =
    norm(input.category) === "stretching" || bodyParts.some((b) => norm(b) === "stretching");
  const esCardioCategoria =
    norm(input.category) === "cardio" || bodyParts.some((b) => norm(b) === "cardio");

  // ── Patrón ───────────────────────────────────────────────────────────────
  const patron = collect(PATRON_RULES, nombre);
  // Un depth jump es aterrizaje Y salto; la regla de aterrizaje va primero y
  // corta la de salto, así que la reañadimos.
  if (
    patron.includes("aterrizaje") &&
    !patron.includes("salto") &&
    has(nombre, ["jump", "hop", "drop"])
  ) {
    patron.push("salto");
  }
  if (patron.length === 0 && has(nombre, ["press"]) && !has(nombre, PRESS_NO_VERTICAL)) {
    patron.push("empuje_vertical");
  }
  if (patron.length === 0 && has(nombre, AISLADO_TERMS)) patron.push("aislado");

  // ── Cualidad ─────────────────────────────────────────────────────────────
  const cualidad = collect(CUALIDAD_RULES, contexto);
  if (esPlyoCategoria && !cualidad.includes("pliometria")) cualidad.unshift("pliometria");
  if (esStretchCategoria && !cualidad.includes("movilidad")) cualidad.unshift("movilidad");
  if (esCardioCategoria && !cualidad.includes("resistencia")) cualidad.unshift("resistencia");
  // Nada reconocido pero hay carga: es trabajo de fuerza genérico.
  if (cualidad.length === 0 && equipoNorm.some((e) => CARGA_EXTERNA_EQUIPO.includes(e))) {
    cualidad.push("hipertrofia");
  }

  // ── Plano ────────────────────────────────────────────────────────────────
  const planos = collect(PLANO_RULES, nombre);
  const plano = planos[0] ?? (patron.length ? "sagital" : null);

  // ── Unilateral ───────────────────────────────────────────────────────────
  const unilateral = has(nombre, UNILATERAL_TERMS);

  // ── Modo de registro ─────────────────────────────────────────────────────
  let registro_series = "peso_reps";
  if (has(nombre, DURACION_TERMS) || esCardioCategoria || esStretchCategoria) {
    registro_series = "duracion";
  } else if (
    has(nombre, SOLO_REPS_TERMS) &&
    !equipoNorm.some((e) => CARGA_EXTERNA_EQUIPO.includes(e))
  ) {
    registro_series = "solo_reps";
  }

  // ── Confianza ────────────────────────────────────────────────────────────
  // Sin patrón o sin cualidad la fila no sirve para rutinas deportivas:
  // el scorer la puntuaría 0. Esas son las que hay que revisar a mano.
  let confianza = "alta";
  if (patron.length === 0 && cualidad.length === 0) {
    confianza = "baja";
  } else if (patron.length === 0) {
    // Un estiramiento o una movilidad no tienen patrón mecánico: es correcto,
    // no un fallo de etiquetado. Simplemente no puntuarán para ningún deporte.
    confianza = cualidad.includes("movilidad") ? "alta" : "media";
  } else if (cualidad.length === 0) {
    confianza = "media";
  }

  return { patron_movimiento: patron, cualidad, plano, unilateral, registro_series, confianza };
}
