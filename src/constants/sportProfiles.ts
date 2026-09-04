import {
  type Cualidad,
  type Deporte,
  type PatronMovimiento,
  type Plano,
} from "@/constants/exerciseTaxonomy";

/**
 * Perfil de demandas de un deporte.
 *
 * La idea de diseño: en vez de etiquetar cada ejercicio con la lista de
 * deportes a los que sirve (inviable a mano, y hay que rehacerlo al añadir un
 * deporte), etiquetamos cada ejercicio con su patrón/cualidad/plano y
 * describimos el deporte como el peso que da a cada uno. "Ejercicios para
 * pádel" pasa a ser una consulta, no una columna mantenida a mano.
 *
 * Los pesos van de 0 a 1. Omitir una clave equivale a 0.
 */
export interface SportProfile {
  deporte: Deporte;
  /** Peso por patrón mecánico. */
  patrones: Partial<Record<PatronMovimiento, number>>;
  /** Peso por cualidad física. */
  cualidades: Partial<Record<Cualidad, number>>;
  /** Planos dominantes del gesto deportivo. */
  planos: Partial<Record<Plano, number>>;
  /** Cuánto premia el trabajo a una pierna/brazo (0-1). */
  unilateral: number;
  /** Qué se protege: se usa para priorizar ejercicios con cualidad `prevencion`. */
  prevencion: string[];
  notas: string;
}

/** Perfil base de deportes de raqueta; cada uno matiza sobre esto. */
const RAQUETA: Omit<SportProfile, "deporte" | "notas"> = {
  patrones: {
    rotacion: 1,
    desplazamiento: 1,
    aterrizaje: 0.9,
    antirrotacion: 0.8,
    zancada: 0.8,
    salto: 0.6,
    lanzamiento: 0.6,
    bisagra: 0.5,
    sentadilla: 0.5,
    empuje_vertical: 0.4,
    traccion_horizontal: 0.4,
  },
  cualidades: {
    potencia: 1,
    velocidad: 0.9,
    pliometria: 0.9,
    coordinacion: 0.8,
    estabilidad: 0.8,
    prevencion: 0.8,
    fuerza_maxima: 0.5,
    resistencia: 0.5,
  },
  planos: { transversal: 1, frontal: 0.9, multiplanar: 0.8, sagital: 0.4 },
  unilateral: 0.9,
  prevencion: ["hombro", "codo", "zona lumbar", "tobillo"],
};

/** Perfil base de deportes de balón con salto dominante. */
const BALON_SALTO: Omit<SportProfile, "deporte" | "notas"> = {
  patrones: {
    salto: 1,
    aterrizaje: 1,
    desplazamiento: 0.9,
    zancada: 0.8,
    sentadilla: 0.8,
    bisagra: 0.8,
    rotacion: 0.6,
    antirrotacion: 0.6,
    empuje_vertical: 0.5,
  },
  cualidades: {
    pliometria: 1,
    potencia: 1,
    velocidad: 0.9,
    estabilidad: 0.8,
    prevencion: 0.8,
    fuerza_maxima: 0.6,
    coordinacion: 0.6,
  },
  planos: { sagital: 0.9, frontal: 0.8, multiplanar: 0.7, transversal: 0.5 },
  unilateral: 0.9,
  prevencion: ["rodilla", "tobillo", "isquiosurales"],
};

/** Perfil base de deportes de agua: braceo, tronco y hombro sano. */
const AGUA: Omit<SportProfile, "deporte" | "notas"> = {
  patrones: {
    traccion_vertical: 1,
    traccion_horizontal: 0.9,
    braceo: 1,
    antirrotacion: 0.8,
    rotacion: 0.7,
    bisagra: 0.7,
    empuje_horizontal: 0.5,
    carry: 0.4,
  },
  cualidades: {
    resistencia: 0.9,
    prevencion: 1,
    movilidad: 0.9,
    estabilidad: 0.9,
    fuerza_maxima: 0.6,
    potencia: 0.6,
    hipertrofia: 0.4,
  },
  planos: { sagital: 0.8, transversal: 0.7, multiplanar: 0.7, frontal: 0.5 },
  unilateral: 0.6,
  prevencion: ["hombro", "manguito rotador", "zona lumbar"],
};

export const SPORT_PROFILES: Record<Deporte, SportProfile> = {
  // ── Raqueta ────────────────────────────────────────────────────────────
  tenis: {
    ...RAQUETA,
    deporte: "tenis",
    notas:
      "Potencia rotacional y frenada lateral. El servicio castiga el hombro: mucha prevención de manguito y escápula.",
  },
  padel: {
    ...RAQUETA,
    deporte: "padel",
    patrones: { ...RAQUETA.patrones, salto: 0.7, empuje_vertical: 0.6, aterrizaje: 1 },
    notas:
      "Pista corta: menos sprint que el tenis y más cambios de dirección, bandeja por encima de la cabeza y salidas de pared.",
  },
  badminton: {
    ...RAQUETA,
    deporte: "badminton",
    patrones: { ...RAQUETA.patrones, zancada: 1, salto: 0.9, aterrizaje: 1 },
    cualidades: { ...RAQUETA.cualidades, velocidad: 1, pliometria: 1 },
    notas: "Zancada profunda repetida y salto en smash. Rodilla y tendón de Aquiles muy exigidos.",
  },
  squash: {
    ...RAQUETA,
    deporte: "squash",
    cualidades: { ...RAQUETA.cualidades, resistencia: 0.8 },
    notas: "Zancadas al fondo y giros en espacio corto, con densidad de esfuerzo alta.",
  },
  tenis_mesa: {
    ...RAQUETA,
    deporte: "tenis_mesa",
    patrones: { ...RAQUETA.patrones, salto: 0.2, aterrizaje: 0.3, desplazamiento: 0.8 },
    cualidades: { ...RAQUETA.cualidades, coordinacion: 1, pliometria: 0.4, potencia: 0.7 },
    notas: "Rotación rápida de tronco en recorrido corto y desplazamientos laterales mínimos.",
  },

  // ── Balón ──────────────────────────────────────────────────────────────
  baloncesto: {
    ...BALON_SALTO,
    deporte: "baloncesto",
    notas: "Salto repetido y aterrizajes a una pierna. Prioridad absoluta a mecánica de aterrizaje y rodilla.",
  },
  voleibol: {
    ...BALON_SALTO,
    deporte: "voleibol",
    patrones: { ...BALON_SALTO.patrones, empuje_vertical: 0.8, lanzamiento: 0.7, rotacion: 0.8 },
    cualidades: { ...BALON_SALTO.cualidades, prevencion: 0.9 },
    notas: "Máximo volumen de salto de todos los deportes de balón; el remate suma carga de hombro.",
  },
  balonmano: {
    ...BALON_SALTO,
    deporte: "balonmano",
    patrones: { ...BALON_SALTO.patrones, lanzamiento: 1, rotacion: 0.9, empuje_horizontal: 0.6 },
    notas: "Lanzamiento en suspensión: potencia rotacional y cadena de hombro además del salto.",
  },
  futbol: {
    ...BALON_SALTO,
    deporte: "futbol",
    patrones: { ...BALON_SALTO.patrones, salto: 0.7, desplazamiento: 1, bisagra: 1, zancada: 0.9 },
    cualidades: { ...BALON_SALTO.cualidades, velocidad: 1, resistencia: 0.7, prevencion: 1 },
    prevencion: ["isquiosurales", "aductores", "rodilla", "tobillo"],
    notas:
      "Sprint y cambio de dirección. Isquios y aductores son la lesión típica: nórdico y Copenhague son innegociables.",
  },
  futbol_sala: {
    ...BALON_SALTO,
    deporte: "futbol_sala",
    patrones: { ...BALON_SALTO.patrones, desplazamiento: 1, aterrizaje: 1, salto: 0.6 },
    cualidades: { ...BALON_SALTO.cualidades, velocidad: 1, resistencia: 0.8 },
    prevencion: ["isquiosurales", "aductores", "rodilla", "tobillo"],
    notas: "Pista dura y frenadas constantes en poco espacio; más deceleración que sprint largo.",
  },
  rugby: {
    ...BALON_SALTO,
    deporte: "rugby",
    patrones: {
      ...BALON_SALTO.patrones,
      empuje_horizontal: 1,
      carry: 0.9,
      sentadilla: 1,
      bisagra: 1,
      salto: 0.5,
    },
    cualidades: { ...BALON_SALTO.cualidades, fuerza_maxima: 1, hipertrofia: 0.8, pliometria: 0.7 },
    prevencion: ["cuello", "hombro", "rodilla", "isquiosurales"],
    notas: "Contacto: fuerza máxima y masa, empuje horizontal y cuello reforzado.",
  },
  hockey: {
    ...BALON_SALTO,
    deporte: "hockey",
    patrones: { ...BALON_SALTO.patrones, rotacion: 0.9, bisagra: 1, salto: 0.4, desplazamiento: 1 },
    planos: { transversal: 0.9, frontal: 0.9, sagital: 0.7, multiplanar: 0.8 },
    prevencion: ["zona lumbar", "aductores", "rodilla"],
    notas: "Postura flexionada mantenida y golpeo rotacional; mucha cadera y lumbar.",
  },
  beisbol: {
    ...BALON_SALTO,
    deporte: "beisbol",
    patrones: { ...BALON_SALTO.patrones, rotacion: 1, lanzamiento: 1, salto: 0.3, antirrotacion: 0.9 },
    cualidades: { ...BALON_SALTO.cualidades, potencia: 1, pliometria: 0.7, prevencion: 1 },
    planos: { transversal: 1, sagital: 0.6, frontal: 0.6, multiplanar: 0.8 },
    prevencion: ["hombro", "codo", "oblicuos"],
    notas: "Todo gira alrededor del gesto rotacional de bateo y lanzamiento; hombro y codo muy expuestos.",
  },

  // ── Agua ───────────────────────────────────────────────────────────────
  natacion: {
    ...AGUA,
    deporte: "natacion",
    notas:
      "Braceo repetido: dominante de tracción, con movilidad torácica y manguito rotador como prioridad de prevención.",
  },
  waterpolo: {
    ...AGUA,
    deporte: "waterpolo",
    patrones: { ...AGUA.patrones, lanzamiento: 1, rotacion: 0.9, empuje_vertical: 0.7, sentadilla: 0.6 },
    cualidades: { ...AGUA.cualidades, potencia: 0.9, fuerza_maxima: 0.7 },
    notas: "Lanzamiento sin apoyo y huevo batido: suma potencia rotacional y aductores a la base de natación.",
  },
  remo: {
    ...AGUA,
    deporte: "remo",
    patrones: {
      ...AGUA.patrones,
      bisagra: 1,
      sentadilla: 1,
      traccion_horizontal: 1,
      traccion_vertical: 0.7,
      braceo: 0.6,
    },
    cualidades: { ...AGUA.cualidades, resistencia: 1, fuerza_maxima: 0.8, potencia: 0.7 },
    planos: { sagital: 1, transversal: 0.4, multiplanar: 0.5, frontal: 0.3 },
    unilateral: 0.4,
    prevencion: ["zona lumbar", "costillas", "rodilla"],
    notas: "Cadena posterior y tracción horizontal en ciclo largo; la lumbar es el punto débil clásico.",
  },
  piraguismo: {
    ...AGUA,
    deporte: "piraguismo",
    patrones: { ...AGUA.patrones, rotacion: 1, antirrotacion: 0.9, traccion_horizontal: 1 },
    cualidades: { ...AGUA.cualidades, resistencia: 1, potencia: 0.8 },
    planos: { transversal: 1, sagital: 0.7, multiplanar: 0.6, frontal: 0.4 },
    notas: "Tracción con rotación de tronco sentado; core antirrotacional y hombro sano.",
  },
  surf: {
    ...AGUA,
    deporte: "surf",
    patrones: { ...AGUA.patrones, empuje_horizontal: 0.8, rotacion: 0.9, sentadilla: 0.8, salto: 0.6 },
    cualidades: { ...AGUA.cualidades, estabilidad: 1, movilidad: 0.9, coordinacion: 0.9, potencia: 0.7 },
    planos: { multiplanar: 1, transversal: 0.8, sagital: 0.6, frontal: 0.7 },
    unilateral: 0.8,
    notas: "Remada (tracción) más take-off explosivo y equilibrio en superficie inestable.",
  },

  // ── Atletismo y resistencia ────────────────────────────────────────────
  atletismo_velocidad: {
    deporte: "atletismo_velocidad",
    patrones: { desplazamiento: 1, salto: 0.9, aterrizaje: 0.9, bisagra: 1, zancada: 0.8, antirrotacion: 0.7 },
    cualidades: { velocidad: 1, potencia: 1, pliometria: 1, fuerza_maxima: 0.8, prevencion: 0.9 },
    planos: { sagital: 1, frontal: 0.4, transversal: 0.4, multiplanar: 0.4 },
    unilateral: 0.9,
    prevencion: ["isquiosurales", "tendón de Aquiles", "aductores"],
    notas: "Rigidez de tobillo y cadena posterior potente; el isquio es la lesión que define la temporada.",
  },
  atletismo_salto: {
    deporte: "atletismo_salto",
    patrones: { salto: 1, aterrizaje: 1, desplazamiento: 0.8, sentadilla: 0.8, bisagra: 0.9, zancada: 0.7 },
    cualidades: { pliometria: 1, potencia: 1, fuerza_maxima: 0.9, velocidad: 0.9, estabilidad: 0.7 },
    planos: { sagital: 1, frontal: 0.5, transversal: 0.4, multiplanar: 0.5 },
    unilateral: 1,
    prevencion: ["tendón rotuliano", "tendón de Aquiles", "zona lumbar"],
    notas: "Batida unipodal a máxima intensidad: pliometría de choque y fuerza máxima.",
  },
  atletismo_lanzamiento: {
    deporte: "atletismo_lanzamiento",
    patrones: { lanzamiento: 1, rotacion: 1, empuje_vertical: 0.8, sentadilla: 0.8, bisagra: 0.8, antirrotacion: 0.8 },
    cualidades: { potencia: 1, fuerza_maxima: 1, pliometria: 0.8, hipertrofia: 0.7, prevencion: 0.7 },
    planos: { transversal: 1, sagital: 0.7, multiplanar: 0.8, frontal: 0.5 },
    unilateral: 0.6,
    prevencion: ["hombro", "codo", "zona lumbar"],
    notas: "Transferencia de suelo a implemento: fuerza máxima más lanzamientos de balón medicinal.",
  },
  running: {
    deporte: "running",
    patrones: { desplazamiento: 1, bisagra: 0.9, zancada: 0.8, aterrizaje: 0.7, antirrotacion: 0.7, salto: 0.5 },
    cualidades: { resistencia: 1, estabilidad: 0.8, prevencion: 0.9, fuerza_maxima: 0.6, pliometria: 0.6 },
    planos: { sagital: 1, frontal: 0.5, transversal: 0.3, multiplanar: 0.4 },
    unilateral: 0.9,
    prevencion: ["rodilla", "tendón de Aquiles", "glúteo medio", "fascia plantar"],
    notas: "Fuerza para tolerar impacto repetido; glúteo medio y sóleo por encima del volumen de gimnasio.",
  },
  ciclismo: {
    deporte: "ciclismo",
    patrones: { sentadilla: 0.9, bisagra: 0.8, antirrotacion: 0.7, zancada: 0.6, empuje_vertical: 0.2 },
    cualidades: { resistencia: 1, fuerza_maxima: 0.7, estabilidad: 0.7, prevencion: 0.8, potencia: 0.6 },
    planos: { sagital: 1, frontal: 0.3, transversal: 0.3, multiplanar: 0.3 },
    unilateral: 0.6,
    prevencion: ["zona lumbar", "rodilla", "cuello"],
    notas: "Extensión de cadera y rodilla en plano sagital; el gimnasio compensa la postura cerrada.",
  },
  esqui: {
    deporte: "esqui",
    patrones: { sentadilla: 1, aterrizaje: 0.9, desplazamiento: 0.8, antirrotacion: 0.9, rotacion: 0.7, salto: 0.6 },
    cualidades: { fuerza_maxima: 0.9, estabilidad: 1, resistencia: 0.8, pliometria: 0.7, prevencion: 1 },
    planos: { frontal: 1, sagital: 0.8, transversal: 0.7, multiplanar: 0.8 },
    unilateral: 0.8,
    prevencion: ["rodilla", "ligamento cruzado", "zona lumbar"],
    notas: "Isométrico de cuádriceps prolongado y control en plano frontal; rodilla como prioridad.",
  },
  escalada: {
    deporte: "escalada",
    patrones: { traccion_vertical: 1, traccion_horizontal: 0.7, antirrotacion: 0.9, carry: 0.8, zancada: 0.5 },
    cualidades: { fuerza_maxima: 1, estabilidad: 0.9, resistencia: 0.8, prevencion: 0.9, movilidad: 0.7 },
    planos: { sagital: 0.8, frontal: 0.7, multiplanar: 0.9, transversal: 0.6 },
    unilateral: 0.8,
    prevencion: ["dedos", "codo", "hombro"],
    notas: "Tracción y agarre por encima de todo, con antagonistas para equilibrar el hombro.",
  },

  // ── Contacto ───────────────────────────────────────────────────────────
  boxeo: {
    deporte: "boxeo",
    patrones: { rotacion: 1, lanzamiento: 0.9, antirrotacion: 0.9, desplazamiento: 0.9, empuje_horizontal: 0.7, bisagra: 0.6 },
    cualidades: { potencia: 1, velocidad: 1, resistencia: 0.9, coordinacion: 0.8, prevencion: 0.7 },
    planos: { transversal: 1, sagital: 0.7, frontal: 0.7, multiplanar: 0.8 },
    unilateral: 0.7,
    prevencion: ["hombro", "cuello", "muñeca"],
    notas: "Potencia rotacional repetida y densidad de trabajo alta; el golpe nace en la cadera.",
  },
  artes_marciales: {
    deporte: "artes_marciales",
    patrones: { rotacion: 1, zancada: 0.8, salto: 0.6, antirrotacion: 0.9, bisagra: 0.8, carry: 0.6 },
    cualidades: { potencia: 0.9, movilidad: 1, estabilidad: 0.9, resistencia: 0.8, coordinacion: 0.9 },
    planos: { multiplanar: 1, transversal: 0.9, frontal: 0.7, sagital: 0.7 },
    unilateral: 0.8,
    prevencion: ["cadera", "rodilla", "hombro"],
    notas: "Patada alta y proyección: movilidad de cadera y control en rangos extremos.",
  },
  golf: {
    deporte: "golf",
    patrones: { rotacion: 1, antirrotacion: 1, bisagra: 0.7, sentadilla: 0.5, lanzamiento: 0.6 },
    cualidades: { potencia: 0.9, movilidad: 0.9, estabilidad: 0.9, coordinacion: 0.8, prevencion: 0.8 },
    planos: { transversal: 1, sagital: 0.5, frontal: 0.5, multiplanar: 0.7 },
    unilateral: 0.6,
    prevencion: ["zona lumbar", "cadera", "muñeca"],
    notas: "Disociación torso-cadera y velocidad angular; la lumbar paga la asimetría del swing.",
  },
};

export function getSportProfile(deporte: Deporte): SportProfile {
  return SPORT_PROFILES[deporte];
}
