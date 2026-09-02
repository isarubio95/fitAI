/**
 * Vocabularios cerrados de la taxonomía de ejercicios.
 *
 * Fuente única de verdad: los CHECK de la migración `exercise_taxonomy` y el
 * script `scripts/import-exercise-catalog.mjs` validan contra estas listas.
 * Si añades un valor aquí, añádelo también al CHECK correspondiente.
 */

/** Patrón mecánico del movimiento. Un ejercicio puede encajar en varios. */
export const PATRONES_MOVIMIENTO = [
  "empuje_horizontal",
  "empuje_vertical",
  "traccion_horizontal",
  "traccion_vertical",
  "sentadilla",
  "bisagra",
  "zancada",
  "rotacion",
  "antirotacion",
  "flexion_core",
  "salto",
  "aterrizaje",
  "lanzamiento",
  "desplazamiento",
  "carry",
  "braceo",
  "aislado",
] as const;

export type PatronMovimiento = (typeof PATRONES_MOVIMIENTO)[number];

export const PATRON_MOVIMIENTO_LABEL: Record<PatronMovimiento, string> = {
  empuje_horizontal: "Empuje horizontal",
  empuje_vertical: "Empuje vertical",
  traccion_horizontal: "Tracción horizontal",
  traccion_vertical: "Tracción vertical",
  sentadilla: "Sentadilla",
  bisagra: "Bisagra de cadera",
  zancada: "Zancada",
  rotacion: "Rotación",
  antirotacion: "Antirrotación",
  flexion_core: "Flexión de core",
  salto: "Salto",
  aterrizaje: "Aterrizaje",
  lanzamiento: "Lanzamiento",
  desplazamiento: "Desplazamiento",
  carry: "Transporte",
  braceo: "Braceo",
  aislado: "Aislamiento",
};

/** Cualidad física que entrena el ejercicio. */
export const CUALIDADES = [
  "fuerza_maxima",
  "hipertrofia",
  "potencia",
  "pliometria",
  "velocidad",
  "resistencia",
  "estabilidad",
  "movilidad",
  "coordinacion",
  "prevencion",
] as const;

export type Cualidad = (typeof CUALIDADES)[number];

export const CUALIDAD_LABEL: Record<Cualidad, string> = {
  fuerza_maxima: "Fuerza máxima",
  hipertrofia: "Hipertrofia",
  potencia: "Potencia",
  pliometria: "Pliometría",
  velocidad: "Velocidad",
  resistencia: "Resistencia",
  estabilidad: "Estabilidad",
  movilidad: "Movilidad",
  coordinacion: "Coordinación",
  prevencion: "Prevención",
};

/** Plano de movimiento dominante. Escalar: se elige el principal. */
export const PLANOS = ["sagital", "frontal", "transversal", "multiplanar"] as const;

export type Plano = (typeof PLANOS)[number];

export const PLANO_LABEL: Record<Plano, string> = {
  sagital: "Sagital",
  frontal: "Frontal",
  transversal: "Transversal",
  multiplanar: "Multiplanar",
};

/** Deportes soportados. El código es estable; la etiqueta es de UI. */
export const DEPORTES = [
  "futbol",
  "futbol_sala",
  "baloncesto",
  "balonmano",
  "voleibol",
  "rugby",
  "tenis",
  "padel",
  "badminton",
  "squash",
  "tenis_mesa",
  "natacion",
  "waterpolo",
  "remo",
  "piraguismo",
  "surf",
  "atletismo_velocidad",
  "atletismo_salto",
  "atletismo_lanzamiento",
  "ciclismo",
  "running",
  "esqui",
  "escalada",
  "boxeo",
  "artes_marciales",
  "hockey",
  "beisbol",
  "golf",
] as const;

export type Deporte = (typeof DEPORTES)[number];

export const DEPORTE_LABEL: Record<Deporte, string> = {
  futbol: "Fútbol",
  futbol_sala: "Fútbol sala",
  baloncesto: "Baloncesto",
  balonmano: "Balonmano",
  voleibol: "Voleibol",
  rugby: "Rugby",
  tenis: "Tenis",
  padel: "Pádel",
  badminton: "Bádminton",
  squash: "Squash",
  tenis_mesa: "Tenis de mesa",
  natacion: "Natación",
  waterpolo: "Waterpolo",
  remo: "Remo",
  piraguismo: "Piragüismo",
  surf: "Surf",
  atletismo_velocidad: "Atletismo · velocidad",
  atletismo_salto: "Atletismo · saltos",
  atletismo_lanzamiento: "Atletismo · lanzamientos",
  ciclismo: "Ciclismo",
  running: "Running",
  esqui: "Esquí",
  escalada: "Escalada",
  boxeo: "Boxeo",
  artes_marciales: "Artes marciales",
  hockey: "Hockey",
  beisbol: "Béisbol",
  golf: "Golf",
};

/** Familias de deporte, para agrupar los chips en la UI. */
export const FAMILIAS_DEPORTE: { nombre: string; deportes: Deporte[] }[] = [
  {
    nombre: "Balón",
    deportes: ["futbol", "futbol_sala", "baloncesto", "balonmano", "voleibol", "rugby", "hockey", "beisbol"],
  },
  { nombre: "Raqueta", deportes: ["tenis", "padel", "badminton", "squash", "tenis_mesa"] },
  { nombre: "Agua", deportes: ["natacion", "waterpolo", "remo", "piraguismo", "surf"] },
  {
    nombre: "Atletismo",
    deportes: ["atletismo_velocidad", "atletismo_salto", "atletismo_lanzamiento", "running"],
  },
  { nombre: "Contacto", deportes: ["boxeo", "artes_marciales"] },
  { nombre: "Resistencia y montaña", deportes: ["ciclismo", "esqui", "escalada", "golf"] },
];

/** Origen de la fila del catálogo. Determina la licencia del medio asociado. */
export const ORIGENES = ["nativo", "fdb", "lyfta", "curado"] as const;

export type OrigenEjercicio = (typeof ORIGENES)[number];

const PATRON_SET: ReadonlySet<string> = new Set(PATRONES_MOVIMIENTO);
const CUALIDAD_SET: ReadonlySet<string> = new Set(CUALIDADES);
const PLANO_SET: ReadonlySet<string> = new Set(PLANOS);
const DEPORTE_SET: ReadonlySet<string> = new Set(DEPORTES);

export function isPatronMovimiento(v: unknown): v is PatronMovimiento {
  return typeof v === "string" && PATRON_SET.has(v);
}

export function isCualidad(v: unknown): v is Cualidad {
  return typeof v === "string" && CUALIDAD_SET.has(v);
}

export function isPlano(v: unknown): v is Plano {
  return typeof v === "string" && PLANO_SET.has(v);
}

export function isDeporte(v: unknown): v is Deporte {
  return typeof v === "string" && DEPORTE_SET.has(v);
}

/** Filtra un array desconocido (p. ej. una columna `text[]`) a valores válidos. */
export function coerceTaxonomyList<T>(value: unknown, guard: (v: unknown) => v is T): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const item of value) {
    if (guard(item) && !out.includes(item)) out.push(item);
  }
  return out;
}
