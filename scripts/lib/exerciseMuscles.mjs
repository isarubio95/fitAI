/**
 * Mapeo de músculos y grupos de las fuentes externas a la taxonomía propia.
 *
 * free-exercise-db usa 17 músculos en inglés (`primaryMuscles`); Lyfta usa 20
 * `body_part`. Los dos hay que traducirlos a `grupo_muscular` (el vocabulario
 * que ya usa la BD) y a `musculos_involucrados` (los 38 músculos específicos
 * de src/constants/muscleGroups.ts).
 */

import { norm } from "./exerciseTagging.mjs";

/** free-exercise-db → { grupo, músculos específicos }. */
const FDB_MUSCLE = {
  chest: { grupo: "Pecho", musculos: ["Pectoral Medio"] },
  lats: { grupo: "Espalda", musculos: ["Dorsal", "Redondo Mayor"] },
  "middle back": { grupo: "Espalda", musculos: ["Romboides", "Trapecio"] },
  "lower back": { grupo: "Espalda", musculos: ["Erector Espinal"] },
  traps: { grupo: "Espalda", musculos: ["Trapecio"] },
  shoulders: {
    grupo: "Hombro",
    musculos: ["Deltoides Anterior", "Deltoides Lateral", "Deltoides Posterior"],
  },
  biceps: { grupo: "Bíceps", musculos: ["Bíceps Largo", "Bíceps Corto"] },
  triceps: {
    grupo: "Tríceps",
    musculos: ["Tríceps Largo", "Tríceps Lateral", "Tríceps Medial"],
  },
  forearms: {
    grupo: "Antebrazo",
    musculos: ["Flexores del Antebrazo", "Extensores del Antebrazo"],
  },
  quadriceps: {
    grupo: "Cuádriceps",
    musculos: ["Vasto Lateral", "Vasto Medial", "Vasto Intermedio", "Recto Femoral"],
  },
  hamstrings: {
    grupo: "Femoral",
    musculos: ["Bíceps Femoral", "Semitendinoso", "Semimembranoso"],
  },
  glutes: { grupo: "Glúteo", musculos: ["Glúteo Mayor", "Glúteo Medio"] },
  calves: { grupo: "Pantorrilla", musculos: ["Gastrocnemio", "Sóleo"] },
  abdominals: {
    grupo: "Core",
    musculos: ["Recto Abdominal", "Transverso Abdominal"],
  },
  abductors: { grupo: "Glúteo", musculos: ["Glúteo Medio", "Glúteo Menor"] },
  // La taxonomía propia no tiene aductores como músculo específico; el grupo
  // "Pierna" es el que usa el catálogo actual para este trabajo.
  adductors: { grupo: "Pierna", musculos: [] },
  neck: { grupo: "Cuello", musculos: [] },
};

/** Lyfta `body_part` → grupo. Sin músculos: la fuente no los desglosa. */
const LYFTA_BODY_PART = {
  chest: "Pecho",
  back: "Espalda",
  shoulders: "Hombro",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebrazo",
  quadriceps: "Cuádriceps",
  hamstrings: "Femoral",
  calves: "Pantorrilla",
  hips: "Glúteo",
  thighs: "Pierna",
  waist: "Core",
  neck: "Cuello",
  cardio: "Cardio",
  stretching: "Movilidad",
  yoga: "Movilidad",
};

/**
 * Grupos ambiguos de Lyfta: "Upper Arms" puede ser bíceps o tríceps, y
 * "Plyometrics"/"Full body"/"Weightlifting" no son regiones anatómicas.
 * Para esos se decide por el patrón de movimiento.
 */
const PATRON_A_GRUPO = {
  salto: "Pierna",
  aterrizaje: "Pierna",
  sentadilla: "Cuádriceps",
  zancada: "Cuádriceps",
  bisagra: "Femoral",
  empuje_horizontal: "Pecho",
  empuje_vertical: "Hombro",
  traccion_vertical: "Espalda",
  traccion_horizontal: "Espalda",
  rotacion: "Core",
  antirotacion: "Core",
  flexion_core: "Core",
  lanzamiento: "Core",
  desplazamiento: "Pierna",
  carry: "Core",
  braceo: "Espalda",
};

/**
 * Último recurso: el grupo por palabra clave del nombre.
 *
 * Lo necesitan las filas cuyo `body_part` es "Plyometrics" o "Full body"
 * —que no son regiones anatómicas— y cuyo patrón tampoco basta para decidir,
 * como un "Alternating Hamstring Curl" o un "Battling Ropes Side Raise".
 */
const NOMBRE_A_GRUPO = [
  [["hamstring", "leg curl"], "Femoral"],
  [["calf", "calves", "soleus", "gastrocnemius"], "Pantorrilla"],
  [["quad", "quadriceps", "leg extension"], "Cuádriceps"],
  [["glute", "hip thrust", "bridge"], "Glúteo"],
  [["shoulder", "delt", "lateral raise", "side raise", "front raise", "press"], "Hombro"],
  [["chest", "pec", "bench", "fly", "push up", "pushup"], "Pecho"],
  [["lat", "row", "pull up", "pullup", "pulldown", "back"], "Espalda"],
  [["bicep", "curl"], "Bíceps"],
  [["tricep", "pushdown", "dip"], "Tríceps"],
  [["wrist", "forearm", "grip"], "Antebrazo"],
  [["abs", "crunch", "plank", "sit up", "core", "waist", "oblique"], "Core"],
  [["neck"], "Cuello"],
  [["stretch", "mobility", "pose", "smr"], "Movilidad"],
  [["squat", "lunge", "jump", "hop", "bound", "step", "sprint", "run", "leg", "stand"], "Pierna"],
];

function grupoPorNombre(nombre) {
  const n = " " + norm(nombre) + " ";
  for (const [claves, grupo] of NOMBRE_A_GRUPO) {
    for (const c of claves) {
      if (n.includes(" " + c + " ") || n.includes(" " + c)) return grupo;
    }
  }
  return null;
}

/** Los "Upper Arms" de Lyfta se resuelven por el nombre. */
function grupoDeBrazo(nombre) {
  const n = norm(nombre);
  if (n.includes("tricep") || n.includes("pushdown") || n.includes("kickback") || n.includes("skull")) {
    return "Tríceps";
  }
  if (n.includes("bicep") || n.includes("curl") || n.includes("preacher")) return "Bíceps";
  return null;
}

const MUSCULOS_POR_GRUPO = {
  Pecho: ["Pectoral Medio"],
  Espalda: ["Dorsal", "Trapecio"],
  Hombro: ["Deltoides Anterior", "Deltoides Lateral", "Deltoides Posterior"],
  "Bíceps": ["Bíceps Largo", "Bíceps Corto"],
  "Tríceps": ["Tríceps Largo", "Tríceps Lateral", "Tríceps Medial"],
  Antebrazo: ["Flexores del Antebrazo", "Extensores del Antebrazo"],
  "Cuádriceps": ["Vasto Lateral", "Vasto Medial", "Vasto Intermedio", "Recto Femoral"],
  Femoral: ["Bíceps Femoral", "Semitendinoso", "Semimembranoso"],
  "Glúteo": ["Glúteo Mayor", "Glúteo Medio"],
  Pantorrilla: ["Gastrocnemio", "Sóleo"],
  Core: ["Recto Abdominal", "Transverso Abdominal"],
  Pierna: [],
  Cuello: [],
  Cardio: [],
  Movilidad: [],
};

/**
 * Resuelve grupo y músculos de una fila de free-exercise-db.
 *
 * @param {{primaryMuscles?: string[], secondaryMuscles?: string[], name: string}} row
 * @param {string[]} patrones
 */
export function musclesFromFdb(row, patrones = []) {
  const primarios = (row.primaryMuscles ?? []).map(norm);
  const secundarios = (row.secondaryMuscles ?? []).map(norm);

  const grupo =
    primarios.map((m) => FDB_MUSCLE[m]?.grupo).find(Boolean) ??
    patrones.map((p) => PATRON_A_GRUPO[p]).find(Boolean) ??
    grupoPorNombre(row.name);

  const musculos = [];
  for (const m of [...primarios, ...secundarios]) {
    for (const musculo of FDB_MUSCLE[m]?.musculos ?? []) {
      if (!musculos.includes(musculo)) musculos.push(musculo);
    }
  }

  return { grupo, musculos };
}

/**
 * Resuelve grupo y músculos de una fila de Lyfta.
 *
 * @param {{body_part?: string[], name: string}} row
 * @param {string[]} patrones
 */
export function musclesFromLyfta(row, patrones = []) {
  const partes = (row.body_part ?? []).map(norm);

  let grupo = partes.map((p) => LYFTA_BODY_PART[p]).find(Boolean) ?? null;

  if (!grupo && partes.includes("upper arms")) grupo = grupoDeBrazo(row.name);
  if (!grupo) grupo = patrones.map((p) => PATRON_A_GRUPO[p]).find(Boolean) ?? null;
  if (!grupo) grupo = grupoPorNombre(row.name);

  // Lyfta no desglosa músculos: se rellenan los típicos del grupo para que las
  // vistas de volumen y el mapa corporal no se queden en blanco.
  const musculos = grupo ? [...(MUSCULOS_POR_GRUPO[grupo] ?? [])] : [];

  return { grupo, musculos };
}

/** El `tipo` que ya usa la BD: Fuerza | Cardio | Estiramiento. */
export function tipoFromTags({ grupo, cualidad = [] }) {
  // La segunda mitad de esta condición exigía grupo === "Cardio" otra vez, así
  // que no añadía nada. Cardio es el grupo; el resto se decide por cualidad.
  if (grupo === "Cardio") return "Cardio";
  if (grupo === "Movilidad" || cualidad.includes("movilidad")) return "Estiramiento";
  return "Fuerza";
}
