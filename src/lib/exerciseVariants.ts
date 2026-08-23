import { normalizeExerciseName } from "@/lib/matchExerciseByName";

/**
 * Agrupación del catálogo en familias: `nombre base` + variantes.
 *
 * Los nombres siguen un patrón muy regular:
 * `<base> <modificadores> <con|en|a ...> <material>`
 *   - "Press Banca con Barra"            → base "Press Banca"      · variante "con Barra"
 *   - "Aperturas Inclinadas con Mancuernas" → base "Aperturas"     · variante "Inclinadas con Mancuernas"
 *   - "Extensión de Gemelos sentado con Barra" → base "Extensión de Gemelos" · variante "sentado con Barra"
 *
 * Con eso el selector puede plegar 9 aperturas en una sola fila con "9 variantes"
 * en lugar de 9 filas sueltas.
 */

/** Preposiciones que abren la parte "variante" del nombre. */
const CONNECTORS = new Set([
  "con",
  "en",
  "a",
  "al",
  "sin",
  "sobre",
  "desde",
  "hacia",
  "tras",
  "para",
  "por",
  "entre",
  "tipo",
  "estilo",
]);

/**
 * Modificadores de posición / agarre / ejecución: describen la variante, no el
 * ejercicio. Ojo: `lateral`, `frontal`, `horizontal`, `superior`… NO entran,
 * porque ahí sí identifican el ejercicio ("Elevaciones Laterales", "Remo Horizontal").
 */
const MODIFIERS = new Set([
  "inclinado",
  "inclinada",
  "inclinados",
  "inclinadas",
  "declinado",
  "declinada",
  "declinados",
  "declinadas",
  "plano",
  "plana",
  "planos",
  "planas",
  "sentado",
  "sentada",
  "sentados",
  "sentadas",
  "tumbado",
  "tumbada",
  "acostado",
  "acostada",
  "arrodillado",
  "arrodillada",
  "aislado",
  "aislada",
  "aislados",
  "aisladas",
  "alterno",
  "alterna",
  "alternos",
  "alternas",
  "alternado",
  "alternada",
  "unilateral",
  "bilateral",
  "abierto",
  "abierta",
  "abiertos",
  "abiertas",
  "cerrado",
  "cerrada",
  "cerrados",
  "cerradas",
  "neutro",
  "neutra",
  "neutros",
  "neutras",
  "neutral",
  "inverso",
  "inversa",
  "inversos",
  "inversas",
  "invertido",
  "invertida",
  "cruzado",
  "cruzada",
  "cruzados",
  "cruzadas",
  "colgado",
  "colgada",
  "libre",
  "libres",
  "asistido",
  "asistida",
  "asistidos",
  "asistidas",
  "concentrado",
  "concentrada",
  "isometrico",
  "isometrica",
  "explosivo",
  "explosiva",
  "negativo",
  "negativa",
  "parcial",
  "parciales",
  "pausado",
  "pausada",
  "lento",
  "lenta",
  "extendido",
  "extendida",
  "extendidos",
  "extendidas",
  "diagonal",
  "amplio",
  "amplia",
  "doble",
  "dobles",
  "estricto",
  "estricta",
  "prono",
  "prona",
  "supino",
  "supina",
  "prono-neutro",
  "prono-supino",
]);

/** Los nombres con una sola palabra base ("Aperturas") usan esta etiqueta de variante. */
export const BASE_VARIANT_LABEL = "Estándar";

function word(token: string) {
  return normalizeExerciseName(token).replace(/[^a-z0-9-]/g, "");
}

function capitalizeFirst(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Divide el nombre en `base` (familia) + `variant` (lo que la distingue). */
export function splitExerciseName(nombre: string): { base: string; variant: string } {
  const tokens = nombre.trim().split(/\s+/).filter(Boolean);
  const head: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    const raw = tokens[i];
    const token = word(raw);

    // Un paréntesis abre siempre la parte de variante: "Flexiones (Push-ups)".
    if (raw.startsWith("(")) break;

    if (token === "de" || token === "del") {
      const next = word(tokens[i + 1] ?? "");
      // "de pie" es un modificador; "de Gemelos" forma parte del nombre base.
      if (!next || next === "pie" || CONNECTORS.has(next) || MODIFIERS.has(next)) break;
      head.push(raw, tokens[i + 1]);
      i += 2;
      continue;
    }

    if (head.length && (CONNECTORS.has(token) || MODIFIERS.has(token))) break;

    head.push(raw);
    i += 1;
  }

  const base = head.join(" ") || nombre.trim();
  const rest = tokens.slice(i).join(" ").trim();
  return { base, variant: rest ? capitalizeFirst(rest) : BASE_VARIANT_LABEL };
}

export type VariantEntry<T> = {
  item: T;
  /** Etiqueta corta que distingue la variante dentro de la familia. */
  label: string;
};

export type ExerciseFamily<T> = {
  key: string;
  /** Nombre base de la familia ("Press Banca"). */
  base: string;
  grupoMuscular: string | null;
  variants: VariantEntry<T>[];
};

type GroupableExercise = {
  id: string;
  nombre: string;
  grupo_muscular?: string | null;
  __source?: string;
};

/**
 * Agrupa por nombre base + grupo muscular: así "Press" de Pecho y "Press" de
 * Hombro no acaban en la misma familia.
 */
export function groupExerciseFamilies<T extends GroupableExercise>(items: T[]): ExerciseFamily<T>[] {
  const families = new Map<string, ExerciseFamily<T>>();

  for (const item of items) {
    const { base, variant } = splitExerciseName(item.nombre);
    const grupo = item.grupo_muscular?.trim() || null;
    const key = `${normalizeExerciseName(base)}|${normalizeExerciseName(grupo ?? "")}`;
    const family = families.get(key);
    if (family) {
      if (!family.variants.some((v) => v.item.id === item.id)) {
        family.variants.push({ item, label: variant });
      }
      continue;
    }
    families.set(key, { key, base, grupoMuscular: grupo, variants: [{ item, label: variant }] });
  }

  return [...families.values()];
}
