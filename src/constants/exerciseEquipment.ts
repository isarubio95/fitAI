/**
 * Vocabulario canónico de equipo, en español.
 *
 * Hasta la importación del catálogo ampliado había dos vocabularios sueltos
 * conviviendo en la misma tabla:
 *
 *   - Las 750 filas originales guardaban el equipo en `equipment`, en español
 *     y como string con comas ("Banco Plano, Barra Larga"), con duplicados
 *     ("Peso corporal" y "Ninguno" para lo mismo).
 *   - Las 1.533 importadas guardaban en `equipment_list` el vocabulario crudo
 *     de la fuente, en inglés y sin normalizar: "Body weight" (254) junto a
 *     "body only" (93), "barbell" (159) junto a "Barbell" (20), "Kettlebell"
 *     (88) junto a "kettlebells" (56). Y su `equipment` traía fragmentos de la
 *     construcción del nombre ("con Barra", "en Polea"), no etiquetas.
 *
 * Como el filtro de equipo construye sus chips a partir de los propios datos,
 * el resultado eran chips duplicados para el mismo aparato. Este fichero fija
 * el vocabulario y el mapa de sinónimos que resuelve las tres poblaciones.
 *
 * Lo consumen la UI y, vía `scripts/lib/equipmentVocab.mjs`, el pipeline de
 * importación y el script de normalización.
 */

export const EQUIPOS = [
  "Ninguno",
  "Barra Larga",
  "Barra Z",
  "Barra Hexagonal",
  "Mancuernas",
  "Kettlebell",
  "Polea",
  "Máquina",
  "Bandas",
  "Suspensión",
  "Fitball",
  "Bosu",
  "Balón Medicinal",
  "Lastre",
  "Trineo",
  "Cuerda",
  "Cuerda de Batalla",
  "Palo",
  "Foam Roller",
  "Banco Plano",
  "Banco Inclinable",
  "Banco Scott",
  "Cardio",
  "Otro",
] as const;

export type Equipo = (typeof EQUIPOS)[number];

/**
 * Sinónimos → término canónico. La clave se compara normalizada (minúsculas,
 * sin acentos, separadores colapsados), así que "Body weight", "body_weight"
 * y "BODY WEIGHT" casan con la misma entrada.
 *
 * Incluye las tres procedencias: el inglés de free-exercise-db y Lyfta, el
 * español de las filas originales, y los fragmentos con preposición que dejó
 * el traductor de nombres ("con Barra").
 */
export const EQUIPO_SINONIMOS: Record<string, Equipo> = {
  // ── Peso corporal ────────────────────────────────────────────────────────
  "body weight": "Ninguno",
  "body only": "Ninguno",
  bodyweight: "Ninguno",
  "peso corporal": "Ninguno",
  ninguno: "Ninguno",

  // ── Barras ───────────────────────────────────────────────────────────────
  barbell: "Barra Larga",
  "barra larga": "Barra Larga",
  barra: "Barra Larga",
  "con barra": "Barra Larga",
  "olympic barbell": "Barra Larga",
  "e z curl bar": "Barra Z",
  "ez curl bar": "Barra Z",
  "barra z": "Barra Z",
  "con barra z": "Barra Z",
  "barra ligera": "Barra Z",
  "con barra ligera": "Barra Z",
  "trap bar": "Barra Hexagonal",
  "hex bar": "Barra Hexagonal",
  "barra hexagonal": "Barra Hexagonal",
  "con barra hexagonal": "Barra Hexagonal",

  // ── Mancuernas y kettlebells ─────────────────────────────────────────────
  dumbbell: "Mancuernas",
  dumbbells: "Mancuernas",
  mancuernas: "Mancuernas",
  mancuerna: "Mancuernas",
  "con mancuernas": "Mancuernas",
  kettlebell: "Kettlebell",
  kettlebells: "Kettlebell",
  "con kettlebell": "Kettlebell",

  // ── Poleas y máquinas ────────────────────────────────────────────────────
  cable: "Polea",
  polea: "Polea",
  "en polea": "Polea",
  machine: "Máquina",
  "leverage machine": "Máquina",
  "smith machine": "Máquina",
  maquina: "Máquina",
  "en maquina": "Máquina",
  "maquina hack squat": "Máquina",

  // ── Elásticos y suspensión ───────────────────────────────────────────────
  bands: "Bandas",
  band: "Bandas",
  "resistance band": "Bandas",
  bandas: "Bandas",
  banda: "Bandas",
  "con bandas": "Bandas",
  "con banda": "Bandas",
  suspension: "Suspensión",
  trx: "Suspensión",
  "en suspension": "Suspensión",

  // ── Balones ──────────────────────────────────────────────────────────────
  "stability ball": "Fitball",
  "exercise ball": "Fitball",
  "swiss ball": "Fitball",
  fitball: "Fitball",
  "en fitball": "Fitball",
  "bosu ball": "Bosu",
  bosu: "Bosu",
  "en bosu": "Bosu",
  "medicine ball": "Balón Medicinal",
  "med ball": "Balón Medicinal",
  "balon medicinal": "Balón Medicinal",
  "con balon medicinal": "Balón Medicinal",

  // ── Implementos varios ───────────────────────────────────────────────────
  weighted: "Lastre",
  "weight plate": "Lastre",
  lastre: "Lastre",
  "con lastre": "Lastre",
  "sled machine": "Trineo",
  "power sled": "Trineo",
  sled: "Trineo",
  trineo: "Trineo",
  "con trineo": "Trineo",
  rope: "Cuerda",
  cuerda: "Cuerda",
  "con cuerda": "Cuerda",
  "battling rope": "Cuerda de Batalla",
  "battle rope": "Cuerda de Batalla",
  "cuerdas de batalla": "Cuerda de Batalla",
  "cuerda de batalla": "Cuerda de Batalla",
  "con cuerdas de batalla": "Cuerda de Batalla",
  stick: "Palo",
  palo: "Palo",
  "con palo": "Palo",
  "foam roll": "Foam Roller",
  "foam roller": "Foam Roller",
  "con foam roller": "Foam Roller",

  // ── Bancos ───────────────────────────────────────────────────────────────
  bench: "Banco Plano",
  banco: "Banco Plano",
  "banco plano": "Banco Plano",
  "flat bench": "Banco Plano",
  "incline bench": "Banco Inclinable",
  "banco inclinable": "Banco Inclinable",
  "preacher bench": "Banco Scott",
  "banco scott": "Banco Scott",

  // ── Resto ────────────────────────────────────────────────────────────────
  cardio: "Cardio",
  other: "Otro",
  otro: "Otro",
};

/** Normaliza para buscar en el mapa: minúsculas, sin acentos, un solo espacio. */
export function normalizeEquipoKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Lleva un término de cualquiera de las tres procedencias al canónico.
 * Devuelve `null` si no lo reconoce, para que quien llame decida (el script de
 * normalización lo reporta en vez de inventarse una categoría).
 */
export function toCanonicalEquipo(value: string | null | undefined): Equipo | null {
  if (!value) return null;
  const key = normalizeEquipoKey(value);
  if (!key) return null;
  return EQUIPO_SINONIMOS[key] ?? null;
}

/**
 * Parte el `equipment` heredado —un string con comas— y canoniza cada átomo.
 * Sin duplicados y en el orden de `EQUIPOS`, para que la lista sea estable.
 */
export function parseEquipoList(value: string | null | undefined): Equipo[] {
  if (!value) return [];
  const vistos = new Set<Equipo>();
  for (const trozo of value.split(",")) {
    const canonico = toCanonicalEquipo(trozo);
    if (canonico) vistos.add(canonico);
  }
  return EQUIPOS.filter((e) => vistos.has(e));
}
