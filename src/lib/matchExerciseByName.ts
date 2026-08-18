import { EXERCISE_SYNONYMS } from "@/constants/exerciseSynonyms";

export type MatchableExercise = {
  id: string;
  nombre: string;
  source: "catalogo" | "usuario";
  registro_series?: string | null;
};

export function normalizeExerciseName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function expandAliases(nombre: string): Set<string> {
  const n = normalizeExerciseName(nombre);
  const aliases = new Set<string>();
  if (n) aliases.add(n);

  for (const [key, syns] of Object.entries(EXERCISE_SYNONYMS)) {
    const nk = normalizeExerciseName(key);
    const nsyns = syns.map(normalizeExerciseName).filter(Boolean);
    if (!nk) continue;
    if (n === nk || nsyns.includes(n)) {
      aliases.add(nk);
      for (const s of nsyns) aliases.add(s);
    }
  }
  return aliases;
}

function aliasesOverlap(a: Set<string>, b: Set<string>): boolean {
  for (const x of a) {
    if (b.has(x)) return true;
  }
  return false;
}

/**
 * Empareja un nombre (p. ej. de Lyfta o CSV) con el catálogo:
 * exacto → sinónimos → includes (nombres de ≥4 caracteres).
 * Prefiere catálogo global sobre ejercicios custom.
 */
export function matchExerciseByName(
  nombre: string,
  catalog: MatchableExercise[],
): MatchableExercise | null {
  const queryAliases = expandAliases(nombre);
  if (queryAliases.size === 0) return null;

  const ranked = [...catalog].sort((a, b) => {
    if (a.source !== b.source) return a.source === "catalogo" ? -1 : 1;
    return 0;
  });

  for (const item of ranked) {
    const itemAliases = expandAliases(item.nombre);
    if (aliasesOverlap(queryAliases, itemAliases)) return item;
  }

  const n = normalizeExerciseName(nombre);
  if (n.length < 4) return null;

  for (const item of ranked) {
    const en = normalizeExerciseName(item.nombre);
    if (en.length < 4) continue;
    if (en.includes(n) || n.includes(en)) return item;
  }

  return null;
}
