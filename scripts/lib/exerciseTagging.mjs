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
  // "cross" es el directo de boxeo, pero "cross body" solo describe que el
  // brazo cruza por delante del tronco (un curl martillo cruzado, p. ej.).
  ["lanzamiento", ["throw", "throws", "slam", "slams", "toss", "scoop", "chest pass", "chest push", "pass", "punch", "punches", "jab", "cross", "uppercut", "hook", "front kick", "side kick", "roundhouse kick", "hook kick", "axe kick", "push kick", "snap kick", "groin kick", "knee kick", "spin back kick", "boxing", "kickboxing"], ["cross body", "crossover", "cross over", "cable crossover"]],
  ["rotacion", ["rotation", "rotational", "twist", "twisting", "chop", "wood chop", "woodchop", "russian twist", "swing", "turn", "windmill", "slingshot", "roll lift", "reach roll"]],
  ["antirotacion", ["pallof", "plank", "planks", "dead bug", "bird dog", "suitcase", "anti rotation", "side plank", "hollow"]],
  ["flexion_core", ["crunch", "crunches", "sit up", "situp", "sit ups", "leg raise", "leg raises", "knee raise", "knee raises", "leg lift", "rollout", "roll out", "ab roller", "side bend", "v up", "toe touch", "toe touchers", "heel touchers", "jackknife", "flutter kick", "flutter kicks", "scissor kick", "hanging leg", "reverse crunch", "abs", "leg pull in", "leg tuck", "leg tucks", "cocoons", "hanging pike", "butt ups", "otis up", "elbow to knee", "wipers", "pike", "v sits", "roll overs"]],
  // "pulldown" excluye curl: un "cable pulldown bicep curl" se hace en la
  // polea alta pero el gesto es de bíceps, no un jalón de dorsal.
  ["traccion_vertical", ["pull up", "pullup", "pullups", "pull ups", "chin up", "chinup", "chins", "chin", "pulldown", "pull down", "lat pulldown", "climb", "climbing", "muscle up", "gironda"], ["curl"]],
  ["traccion_horizontal", ["row", "rows", "rowing", "face pull", "rear delt", "rear lateral", "reverse fly", "reverse peck", "reverse pec", "inverted row"]],
  // Los fondos son empuje VERTICAL: el cuerpo sube y baja en la vertical, no
  // se empuja nada hacia delante. Estuvieron en empuje_horizontal y las 12
  // filas con "dip" del catálogo salían mal etiquetadas, las paralelas y las
  // anillas incluidas.
  // Exclusiones: un "overhead triceps extension" o un "overhead biceps curl"
  // son trabajo analítico, no un empuje por encima de la cabeza; el "overhead"
  // ahí solo dice dónde está el brazo.
  [
    "empuje_vertical",
    ["overhead press", "shoulder press", "military", "jerk", "push press", "handstand", "overhead", "arnold press", "dip", "dips"],
    ["bench dip", "curl", "extension"],
  ],
  // "fly" a secas es apertura de pecho (empuje horizontal), pero un
  // "reverse fly" es justo el gesto contrario y lo cubre traccion_horizontal.
  // "calf raise" excluido porque el nombre del asset a veces arrastra el
  // aparato donde se hace ("Lever Calf Raise bench press machine").
  [
    "empuje_horizontal",
    ["bench press", "push up", "pushup", "pushups", "push ups", "chest press", "fly", "flyes", "flys", "chest fly", "crossover", "cross over", "body up", "fallout", "bench dip"],
    ["reverse fly", "rear delt", "rear lateral", "reverse peck", "reverse pec", "calf raise"],
  ],
  ["bisagra", ["deadlift", "hip thrust", "good morning", "romanian", "rdl", "glute bridge", "bridge", "back extension", "hyperextension", "nordic", "hip hinge", "hip thrusts", "hip lift", "superman", "transverse bend", "kettlebell swing", "clean", "snatch", "pull through", "atlas stone", "atlas stones", "tire flip", "keg load", "sandbag load", "log lift", "stone trainer", "hamstring slides", "manual hamstring"]],
  ["zancada", ["lunge", "lunges", "split squat", "step up", "step ups", "bulgarian", "stepup"]],
  ["sentadilla", ["squat", "squats", "leg press", "hack squat", "wall sit", "sissy", "leg sit", "sit squats", "burpee", "burpees"]],
  ["desplazamiento", ["sprint", "run", "running", "shuffle", "carioca", "agility", "crawl", "walk", "walking", "march", "marching", "skater", "stride", "ladder", "prancing", "butt kick", "butt kicks", "high knee", "high knees", "step out", "speed step", "scissors"]],
  // "drag" es arrastre de trineo, pero un "drag curl" es un curl de bíceps en
  // el que la barra roza el tronco: no se arrastra nada por el suelo.
  ["carry", ["carry", "carries", "farmer", "farmers", "waiter walk", "suitcase carry", "yoke", "drag", "plate pinch", "hand squeeze", "circus bell", "conan", "hercules hold", "front hold", "wrestling", "slide", "slides"], ["drag curl"]],
  ["braceo", ["swim", "swimming", "arm drill", "pullover", "straight arm", "skier", "ski erg", "ski ergometer", "arm over arm", "truck pull", "rope pull", "waves", "battling ropes", "battle ropes"]],
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
  "single leg kick", "leg kick", "lifts vertical", "shoulder lifter",
  "leg circle", "circle", "leg stand", "single leg stand",
];

// ── Cualidad física ────────────────────────────────────────────────────────
const CUALIDAD_RULES = [
  ["pliometria", ["jump", "hop", "bound", "plyo", "plyometric", "depth", "leap", "skip", "tuck jump", "clap"]],
  ["potencia", ["throw", "slam", "clean", "snatch", "jerk", "swing", "power", "explosive", "medicine ball", "med ball", "punch", "wall ball", "front kick", "side kick", "roundhouse kick", "hook kick", "axe kick", "snap kick"]],
  ["velocidad", ["sprint", "speed", "agility", "quick", "fast", "carioca", "ladder", "shuffle"]],
  ["estabilidad", ["plank", "balance", "stability", "bosu", "single leg stand", "pallof", "bird dog", "dead bug", "hollow", "stability ball", "suspension", "hold", "bottoms up", "superman", "bridge", "bridges", "foot touch", "monopodal"]],
  ["movilidad", ["stretch", "mobility", "smr", "foam roll", "yoga", "opener", "cat cow", "pose", "relaxation", "circles", "vacuum"]],
  ["coordinacion", ["drill", "carioca", "skip", "ladder", "crawl", "juggle", "get up"]],
  ["prevencion", ["rotator cuff", "external rotation", "internal rotation", "nordic", "copenhagen", "face pull", "scapular", "ytw", "cuban", "band pull apart", "tibialis"]],
  ["resistencia", ["battling", "battle rope", "sled", "carry", "farmers", "burpee", "mountain climber", "ergometer", "bike", "treadmill", "elliptical", "jump rope", "waves", "step out", "speed step", "scissors", "v sits"]],
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
  "plank", "planks", "hold", "isometric", "wall sit",
  "stretch", "smr", "foam roll", "battling", "battle rope", "carry", "carries",
  "ergometer", "treadmill", "elliptical", "bike", "run", "running",
  "sprint", "jump rope", "mountain climber", "shuffle", "crawl",
  // La suspensión pasiva se nombra explícita: un "hang" a secas marcaba como
  // cronometrada toda la halterofilia colgante (hang clean, hang snatch).
  "dead hang", "one handed hang", "handed hang",
  // Acarreos y sujeciones: se miden en tiempo o distancia, no en reps.
  "farmer", "farmers", "farmer s", "yoke walk", "duck walk", "sandbag walk",
  "monster walk", "overhead carry", "suitcase carry", "drag", "drags",
  "pinch", "squeeze", "hercules hold", "front hold", "crucifix hold",
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

/**
 * Acumula todas las etiquetas cuyas reglas casan. Una regla puede llevar un
 * tercer campo con términos de exclusión: si alguno aparece, esa regla no
 * casa aunque su término principal sí esté. Hace falta porque hay palabras
 * que significan lo contrario según lo que las acompañe —"fly" es empuje de
 * pecho, pero "reverse fly" es tracción— y sin exclusiones las dos reglas se
 * sumaban y el ejercicio quedaba etiquetado como empuje y tracción a la vez.
 */
function collect(rules, haystack) {
  const out = [];
  for (const [tag, terms, excluye] of rules) {
    if (excluye && has(haystack, excluye)) continue;
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
  // "Fly" es apertura de pecho (empuje horizontal) salvo que sea la variante
  // posterior de hombro, que es el gesto contrario: tracción. No se puede
  // expresar como frase en las listas porque admite palabras intercaladas
  // ("Reverse Machine Flyes") y cuatro grafías del propio término (fly, flye,
  // flyes, flys). Con solo las listas quedaban mal "Reverse Flyes",
  // "Reverse Machine Flyes", "Sled Reverse Flye" y "Back Flyes With Bands".
  if (/ (reverse|rear|back)( [a-z0-9]+){0,3} fly(e|es|s)? /.test(nombre)) {
    const i = patron.indexOf("empuje_horizontal");
    if (i >= 0) patron.splice(i, 1);
    if (!patron.includes("traccion_horizontal")) patron.push("traccion_horizontal");
  }

  if (patron.length === 0 && has(nombre, ["press"])) {
    // Tumbado se empuja en horizontal aunque el nombre no diga "bench":
    // "Dumbbell Lying Elbow Press", "floor press". Antes caían en el respaldo
    // vertical, o en el caso del floor press se quedaban sin patrón.
    if (has(nombre, ["lying", "floor", "supine"])) patron.push("empuje_horizontal");
    else if (!has(nombre, PRESS_NO_VERTICAL)) patron.push("empuje_vertical");
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
