/**
 * Traducción de nombres de ejercicio inglés → español.
 *
 * No es token a token: el español ordena distinto. "Barbell Bench Press" no es
 * "Barra Banco Press" sino "Press de Banca con Barra". Los nombres de ejercicio
 * siguen una gramática muy formularia:
 *
 *     [Equipo] [Modificadores] [Movimiento] [Cualificador]
 *
 * y en español se emite:
 *
 *     [Movimiento] [Modificadores] con [Equipo]
 *
 * El diccionario se aplica por frases, de más larga a más corta, para que
 * "bench press" gane a "press" y "single leg" gane a "leg".
 *
 * `translateExerciseName` devuelve también los términos que no ha sabido
 * traducir, para poder ampliar el diccionario con datos en vez de a ojo.
 */

import { norm } from "./exerciseTagging.mjs";

/** Equipo: se mueve al final como "con X". */
const EQUIPO = {
  "smith machine": "en Máquina Smith",
  "leverage machine": "en Máquina",
  "sled machine": "con Trineo",
  "power sled": "con Trineo",
  "battling ropes": "con Cuerdas de Batalla",
  "battle ropes": "con Cuerdas de Batalla",
  "battling rope": "con Cuerdas de Batalla",
  "medicine ball": "con Balón Medicinal",
  "med ball": "con Balón Medicinal",
  "stability ball": "en Fitball",
  "exercise ball": "en Fitball",
  "bosu ball": "en Bosu",
  "e z curl bar": "con Barra Z",
  "ez barbell": "con Barra Z",
  "ez bar": "con Barra Z",
  "olympic barbell": "con Barra Olímpica",
  "trap bar": "con Barra Hexagonal",
  "resistance band": "con Banda",
  "wheel roller": "con Rueda Abdominal",
  "ab roller": "con Rueda Abdominal",
  "foam roll": "con Foam Roller",
  "jump rope": "con Comba",
  suspension: "en Suspensión",
  kettlebells: "con Kettlebell",
  kettlebell: "con Kettlebell",
  dumbbells: "con Mancuernas",
  dumbbell: "con Mancuernas",
  barbell: "con Barra",
  cables: "en Polea",
  cable: "en Polea",
  machine: "en Máquina",
  bands: "con Bandas",
  band: "con Banda",
  weighted: "con Lastre",
  plate: "con Disco",
  bodyweight: "",
  "body weight": "",
  "body only": "",
  assisted: "Asistido",
  sandbag: "con Saco",
  sled: "con Trineo",
  "atlas stone": "con Piedra Atlas",
  "atlas stones": "con Piedras Atlas",
  tire: "con Rueda",
  yoke: "con Yugo",
  rope: "con Cuerda",
  stick: "con Barra Ligera",
  "straight bar": "con Barra Recta",
  pulley: "en Polea",
  leverage: "en Máquina",
  towel: "con Toalla",
  chains: "con Cadenas",
  bar: "con Barra",
  chair: "en Silla",
};

/** Modificadores: posición, agarre, lado, tempo. Van tras el movimiento. */
const MODIFICADORES = {
  "bent over": "Inclinado",
  "close grip": "Agarre Cerrado",
  "wide grip": "Agarre Abierto",
  "neutral grip": "Agarre Neutro",
  "reverse grip": "Agarre Invertido",
  "mixed grip": "Agarre Mixto",
  "single leg": "a una Pierna",
  "single arm": "a un Brazo",
  "one leg": "a una Pierna",
  "one arm": "a un Brazo",
  "one hand": "a una Mano",
  "single-leg": "a una Pierna",
  "one legged": "a una Pierna",
  "single legged": "a una Pierna",
  "two legged": "a dos Piernas",
  "b stance": "en Apoyo Escalonado",
  staggered: "Escalonado",
  "half kneeling": "de Rodilla",
  kneeling: "de Rodillas",
  standing: "de Pie",
  seated: "Sentado",
  lying: "Tumbado",
  prone: "Boca Abajo",
  supine: "Boca Arriba",
  incline: "Inclinado",
  decline: "Declinado",
  flat: "Plano",
  alternating: "Alterno",
  alternate: "Alterno",
  reverse: "Invertido",
  overhead: "por Encima de la Cabeza",
  lateral: "Lateral",
  side: "Lateral",
  front: "Frontal",
  rear: "Posterior",
  behind: "Trasero",
  "behind the neck": "Tras Nuca",
  wide: "Abierto",
  close: "Cerrado",
  narrow: "Cerrado",
  high: "Alto",
  low: "Bajo",
  sumo: "Sumo",
  romanian: "Rumano",
  bulgarian: "Búlgara",
  isometric: "Isométrico",
  explosive: "Explosivo",
  rotational: "Rotacional",
  diagonal: "Diagonal",
  cossack: "Cosaco",
  pistol: "Pistol",
  nordic: "Nórdico",
  copenhagen: "Copenhague",
  paused: "con Pausa",
  tempo: "a Tempo",
  eccentric: "Excéntrico",
  "half": "Medio",
  quarter: "Cuarto de",
  deficit: "en Déficit",
  elevated: "Elevado",
  "feet elevated": "Pies Elevados",
  hanging: "Colgado",
  "cross body": "Cruzado",
  crossover: "Cruzado",
  twisting: "con Giro",
  "with twist": "con Giro",
  double: "Doble",
  two: "Doble",
  straight: "Recto",
  upright: "Vertical",
  bent: "Inclinado",
  hang: "Colgado",
  extended: "Extendido",
  backward: "hacia Atrás",
  forward: "hacia Delante",
  oblique: "Oblicuo",
  full: "Completo",
  power: "de Potencia",
  goblet: "Goblet",
  frog: "de Rana",
  hurdle: "de Vallas",
  clock: "en Reloj",
  astride: "a Horcajadas",
  "behind head": "Tras Nuca",
  "behind the neck": "Tras Nuca",
  palms: "Palmas",
  stance: "en Postura",
  step: "con Escalón",
  feet: "Pies",
  butt: "de Glúteo",
  hammer: "Martillo",
  handstand: "en Pino",
  zigzag: "en Zigzag",
  archer: "Archer",
  spider: "Spider",
  strongman: "Strongman",
  powerlifting: "Powerlifting",
  frankenstein: "Frankenstein",
  jefferson: "Jefferson",
  zercher: "Zercher",
  zottman: "Zottman",
  rickshaw: "Rickshaw",

  unilateral: "Unilateral",
  linear: "Lineal",
  sprinter: "de Velocista",
  stiff: "Rígido",
  suspended: "en Suspensión",
  "bottoms up": "Invertido",
  bottoms: "Invertido",
  right: "Derecho",
  left: "Izquierdo",
  vertical: "Vertical",
  horizontal: "Horizontal",
  legged: "Piernas",
  knees: "Rodillas",
  "below the knees": "bajo las Rodillas",
  "below knees": "bajo las Rodillas",
  "from blocks": "desde Blocks",
  blocks: "desde Blocks",
  "from the rack": "desde Rack",
  rack: "desde Rack",
  cross: "Cruzado",
  palm: "Palma",
  hands: "Manos",
  hand: "Mano",
  speed: "Rápido",
  seated: "Sentado",
  "wide stance": "Postura Abierta",
  "close stance": "Postura Cerrada",
  bench: "en Banco",
  wall: "en Pared",
  box: "al Cajón",
  floor: "en Suelo",
  ball: "con Balón",
};

/**
 * Movimientos. Las frases largas van primero al aplicarse: el motor ordena por
 * longitud, así que "bench press" gana a "press".
 */
const MOVIMIENTOS = {
  "bench press": "Press de Banca",
  "chest press": "Press de Pecho",
  "shoulder press": "Press de Hombro",
  "overhead press": "Press Militar",
  "military press": "Press Militar",
  "arnold press": "Press Arnold",
  "floor press": "Press en Suelo",
  "board press": "Press con Tabla",
  "push press": "Press de Empuje",
  "leg press": "Prensa de Pierna",
  "pallof press": "Press Pallof",
  "bent press": "Press Inclinado Lateral",
  press: "Press",

  "push up": "Flexiones",
  pushup: "Flexiones",
  pushups: "Flexiones",
  "push ups": "Flexiones",
  "clap push up": "Flexiones con Palmada",
  "plyo push up": "Flexiones Pliométricas",
  dip: "Fondos",
  dips: "Fondos",
  "bench dips": "Fondos en Banco",

  "chest fly": "Aperturas",
  fly: "Aperturas",
  flyes: "Aperturas",
  flys: "Aperturas",
  "reverse fly": "Aperturas Invertidas",
  crossover: "Cruce de Poleas",

  "pull up": "Dominadas",
  pullup: "Dominadas",
  pullups: "Dominadas",
  "pull ups": "Dominadas",
  "chin up": "Dominadas Supinas",
  chinup: "Dominadas Supinas",
  chins: "Dominadas Supinas",
  "muscle up": "Muscle Up",
  pulldown: "Jalón",
  "pull down": "Jalón",
  "lat pulldown": "Jalón al Pecho",
  pullover: "Pullover",
  "face pull": "Face Pull",
  "band pull apart": "Aperturas con Banda",

  "inverted row": "Remo Invertido",
  row: "Remo",
  rows: "Remo",
  rowing: "Remo",
  "renegade row": "Remo Renegado",

  deadlift: "Peso Muerto",
  "romanian deadlift": "Peso Muerto Rumano",
  "stiff leg deadlift": "Peso Muerto Piernas Rígidas",
  "good morning": "Buenos Días",
  "hip thrust": "Hip Thrust",
  "glute bridge": "Puente de Glúteo",
  bridge: "Puente",
  "back extension": "Hiperextensiones",
  hyperextension: "Hiperextensiones",
  "pull through": "Pull Through",

  squat: "Sentadilla",
  squats: "Sentadilla",
  "front squat": "Sentadilla Frontal",
  "back squat": "Sentadilla Trasera",
  "hack squat": "Hack Squat",
  "bulgarian split squat": "Sentadilla Búlgara",
  "split squat": "Sentadilla Partida",
  "sissy squat": "Sentadilla Sissy",
  "wall sit": "Sentadilla Isométrica en Pared",

  lunge: "Zancada",
  lunges: "Zancada",
  "step up": "Subida al Cajón",
  "step ups": "Subida al Cajón",
  stepup: "Subida al Cajón",

  clean: "Cargada",
  "clean and jerk": "Cargada y Envión",
  "power clean": "Cargada de Potencia",
  snatch: "Arrancada",
  jerk: "Envión",
  swing: "Swing",
  "turkish get up": "Turkish Get Up",
  "get up": "Turkish Get Up",

  curl: "Curl",
  curls: "Curl",
  "hammer curl": "Curl Martillo",
  "preacher curl": "Curl en Banco Scott",
  "concentration curl": "Curl Concentrado",
  "leg curl": "Curl Femoral",
  "hamstring curl": "Curl Femoral",
  "wrist curl": "Curl de Muñeca",

  extension: "Extensión",
  extensions: "Extensión",
  "triceps extension": "Extensión de Tríceps",
  "leg extension": "Extensión de Cuádriceps",
  pushdown: "Extensión en Polea",
  "triceps kickback": "Patada de Tríceps",
  "tricep kickback": "Patada de Tríceps",
  kickback: "Patada",
  kickbacks: "Patada",
  "skull crusher": "Rompecráneos",

  raise: "Elevación",
  raises: "Elevación",
  "lateral raise": "Elevaciones Laterales",
  "front raise": "Elevaciones Frontales",
  "calf raise": "Elevación de Gemelos",
  "leg raise": "Elevación de Piernas",
  "knee raise": "Elevación de Rodillas",
  "hip raise": "Elevación de Cadera",
  shrug: "Encogimientos",
  shrugs: "Encogimientos",

  crunch: "Crunch",
  crunches: "Crunch",
  "reverse crunch": "Crunch Invertido",
  "sit up": "Abdominales",
  situp: "Abdominales",
  "sit ups": "Abdominales",
  plank: "Plancha",
  planks: "Plancha",
  "side plank": "Plancha Lateral",
  "dead bug": "Dead Bug",
  "bird dog": "Bird Dog",
  hollow: "Hollow Hold",
  rollout: "Rollout",
  "roll out": "Rollout",
  "side bend": "Flexión Lateral",
  "russian twist": "Giro Ruso",
  twist: "Giro",
  "wood chop": "Hacha",
  chop: "Hacha",
  "v up": "V-Up",
  "toe touch": "Toque de Puntas",
  "flutter kick": "Tijeras",
  "scissor kick": "Tijeras",
  jackknife: "Navaja",
  "leg pull in": "Encogimiento de Piernas",
  "leg tuck": "Encogimiento de Piernas",
  cocoons: "Cocoon",
  pike: "Pike",

  jump: "Salto",
  jumps: "Salto",
  "box jump": "Salto al Cajón",
  "depth jump": "Salto en Profundidad",
  "drop jump": "Salto desde Altura",
  "broad jump": "Salto Horizontal",
  "long jump": "Salto de Longitud",
  "vertical jump": "Salto Vertical",
  "tuck jump": "Salto con Rodillas al Pecho",
  "squat jump": "Salto desde Sentadilla",
  "split jump": "Salto en Zancada",
  "star jump": "Salto Estrella",
  "scissors jump": "Salto de Tijera",
  "rocket jump": "Salto Cohete",
  "jumping jack": "Jumping Jack",
  jack: "Jumping Jack",
  hop: "Salto",
  hops: "Salto",
  "hurdle hop": "Salto de Vallas",
  "cone hop": "Salto de Conos",
  bound: "Zancada Saltada",
  bounding: "Zancadas Saltadas",
  leap: "Salto Amplio",
  skip: "Skipping",
  skips: "Skipping",
  skipping: "Skipping",
  pogo: "Pogo",

  throw: "Lanzamiento",
  throws: "Lanzamiento",
  "overhead throw": "Lanzamiento por Encima de la Cabeza",
  "scoop throw": "Lanzamiento de Cuchara",
  "chest pass": "Pase de Pecho",
  "chest push": "Empuje de Pecho",
  slam: "Golpeo contra el Suelo",
  slams: "Golpeo contra el Suelo",
  "wall ball": "Wall Ball",
  toss: "Lanzamiento",

  sprint: "Sprint",
  sprints: "Sprints",
  run: "Carrera",
  running: "Carrera",
  walk: "Paseo",
  walking: "Marcha",
  march: "Marcha",
  shuffle: "Desplazamiento Lateral",
  carioca: "Carioca",
  crawl: "Gateo",
  "bear crawl": "Gateo del Oso",
  skater: "Patinador",
  drag: "Arrastre",
  carry: "Transporte",
  carries: "Transporte",
  "farmers walk": "Paseo del Granjero",
  "farmers carry": "Paseo del Granjero",
  "suitcase carry": "Transporte de Maleta",
  "waiter walk": "Paseo del Camarero",

  stretch: "Estiramiento",
  mobility: "Movilidad",
  smr: "Liberación Miofascial",
  "external rotation": "Rotación Externa",
  "internal rotation": "Rotación Interna",
  rotation: "Rotación",
  circles: "Círculos",
  superman: "Superman",
  slingshot: "Slingshot",
  balance: "Equilibrio",
  pose: "Postura",
  reach: "Alcance",
  windmill: "Molino",
  "figure 8": "Ocho",
  halo: "Halo",
  split: "Zancada",

  burpee: "Burpee",
  burpees: "Burpees",
  "mountain climber": "Escalador",
  "mountain climbers": "Escalador",
  thruster: "Thruster",
  "muscle snatch": "Arrancada de Fuerza",
  "tire flip": "Volteo de Rueda",
  "log lift": "Levantamiento de Tronco",
  lift: "Levantamiento",
  "pull": "Tirón",
  "keg load": "Carga de Barril",
  "sandbag load": "Carga de Saco",
  "plate pinch": "Pinza con Disco",
  climb: "Escalada",
  climbing: "Escalada",
  kick: "Patada",
  punch: "Puñetazo",
  jab: "Jab",
  "uppercut": "Uppercut",
  hook: "Gancho",
};

/** Palabras de relleno que no aportan al nombre español. */
const RELLENO = new Set([
  "the", "a", "an", "with", "and", "to", "on", "in", "of", "for", "from",
  "or", "at", "by", "up", "exercise", "variation", "version", "male", "female",
  "m", "f", "fix",
]);

/** Partes del cuerpo: solo se usan si el nombre se queda corto. */
const PARTES = {
  chest: "de Pecho",
  back: "de Espalda",
  shoulder: "de Hombro",
  shoulders: "de Hombros",
  biceps: "de Bíceps",
  triceps: "de Tríceps",
  forearm: "de Antebrazo",
  abs: "Abdominal",
  glute: "de Glúteo",
  glutes: "de Glúteos",
  hamstring: "de Isquios",
  hamstrings: "de Isquios",
  quad: "de Cuádriceps",
  quads: "de Cuádriceps",
  calf: "de Gemelo",
  calves: "de Gemelos",
  hip: "de Cadera",
  hips: "de Cadera",
  neck: "de Cuello",
  wrist: "de Muñeca",
  ankle: "de Tobillo",
  lat: "de Dorsal",
  lats: "de Dorsales",
  "delt": "de Deltoides",
  leg: "de Pierna",
  legs: "de Piernas",
  arm: "de Brazo",
  arms: "de Brazos",
  knee: "de Rodilla",
  core: "de Core",
  "lower back": "Lumbar",
  "upper back": "de Espalda Alta",
  groin: "de Aductores",
  adductor: "de Aductores",
  abductor: "de Abductores",
  tibialis: "de Tibial",
  serratus: "de Serrato",
  tricep: "de Tríceps",
  bicep: "de Bíceps",
  flexor: "de Flexores",
  extensor: "de Extensores",
  brachialis: "de Braquial",
  piriformis: "de Piramidal",
  peroneals: "de Peroneos",
  "iliotibial tract": "de Cintilla Iliotibial",
  "latissimus dorsi": "de Dorsal",
  spinal: "de Columna",
  foot: "de Pie",
  head: "de Cabeza",
  trap: "de Trapecio",
  traps: "de Trapecios",
  body: "de Cuerpo Completo",
  "full body": "de Cuerpo Completo",
};

/** Ordena las claves de un diccionario de más palabras a menos. */
function byPhraseLength(dict) {
  return Object.keys(dict).sort((a, b) => b.split(" ").length - a.split(" ").length || b.length - a.length);
}

const EQUIPO_KEYS = byPhraseLength(EQUIPO);
const MOVIMIENTO_KEYS = byPhraseLength(MOVIMIENTOS);
const MODIFICADOR_KEYS = byPhraseLength(MODIFICADORES);
const PARTE_KEYS = byPhraseLength(PARTES);

/** Extrae la primera frase del diccionario que aparezca, y la quita del texto. */
function takePhrase(tokens, keys, dict) {
  for (const key of keys) {
    const words = key.split(" ");
    for (let i = 0; i <= tokens.length - words.length; i++) {
      let match = true;
      for (let j = 0; j < words.length; j++) {
        if (tokens[i + j] !== words[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        const resto = [...tokens.slice(0, i), ...tokens.slice(i + words.length)];
        return { value: dict[key], key, tokens: resto };
      }
    }
  }
  return null;
}

/** Toma TODAS las frases del diccionario que aparezcan, en orden de aparición. */
function takeAllPhrases(tokens, keys, dict) {
  const found = [];
  let rest = tokens;
  for (;;) {
    const hit = takePhrase(rest, keys, dict);
    if (!hit) break;
    if (hit.value) found.push(hit.value);
    rest = hit.tokens;
  }
  return { values: found, tokens: rest };
}

function titleCase(s) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Traduce un nombre de ejercicio al español.
 *
 * @param {string} englishName
 * @returns {{nombre: string, sinTraducir: string[], confianza: "alta"|"media"|"baja"}}
 */
export function translateExerciseName(englishName) {
  const tokens = norm(englishName).split(" ").filter(Boolean);
  if (tokens.length === 0) {
    return { nombre: "", sinTraducir: [], confianza: "baja" };
  }

  // 1) El equipo sale del nombre y se reserva para el final.
  const equipo = takeAllPhrases(tokens, EQUIPO_KEYS, EQUIPO);
  // 2) El movimiento es el núcleo; solo se coge el primero (el principal).
  const movimiento = takePhrase(equipo.tokens, MOVIMIENTO_KEYS, MOVIMIENTOS);
  // Un segundo movimiento encadenado ("X to Y") es parte del ejercicio.
  const movimientoEncadenado = movimiento
    ? takePhrase(movimiento.tokens, MOVIMIENTO_KEYS, MOVIMIENTOS)
    : null;
  // 3) Los modificadores se acumulan tras el movimiento.
  const trasMovimiento = movimientoEncadenado
    ? movimientoEncadenado.tokens
    : movimiento
      ? movimiento.tokens
      : equipo.tokens;
  const mods = takeAllPhrases(trasMovimiento, MODIFICADOR_KEYS, MODIFICADORES);
  // 4) La parte del cuerpo solo si aporta.
  const partes = takeAllPhrases(mods.tokens, PARTE_KEYS, PARTES);

  const sinTraducir = partes.tokens.filter((t) => !RELLENO.has(t) && !/^\d+$/.test(t));

  const nucleo = movimientoEncadenado
    ? `${movimiento.value} a ${movimientoEncadenado.value}`
    : (movimiento?.value ?? partes.values[0] ?? "");
  const restoPartes = movimiento ? partes.values : partes.values.slice(1);

  // "Salto Lateral a una Pierna" se lee mejor que "Salto a una Pierna Lateral":
  // los cualificadores de lado/postura van antes, y el unilateral cierra.
  const modsOrdenados = [
    ...mods.values.filter((m) => !m.startsWith("a un")),
    ...mods.values.filter((m) => m.startsWith("a un")),
  ];

  // Los tokens que el diccionario no conoce se conservan tal cual, en
  // capitalizado. Un "Salto Frog" pendiente de pulir es infinitamente mejor
  // que perder el ejercicio por colisión de nombre.
  const sobrantes = sinTraducir.map((t) => t.charAt(0).toUpperCase() + t.slice(1));

  const trozos = [nucleo, ...restoPartes, ...modsOrdenados, ...sobrantes, ...equipo.values].filter(
    Boolean,
  );
  const nombre = titleCase(trozos.join(" "));

  // Sin movimiento reconocido el nombre no se sostiene; hay que revisarlo.
  let confianza = "alta";
  if (!movimiento) confianza = "baja";
  else if (sinTraducir.length > 0) confianza = "media";

  return { nombre, sinTraducir, confianza };
}
