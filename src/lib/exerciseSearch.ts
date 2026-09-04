import { EXERCISE_SYNONYMS } from "@/constants/exerciseSynonyms";

/**
 * Motor de búsqueda del catálogo de ejercicios.
 *
 * Reglas:
 * - Insensible a mayúsculas/minúsculas, tildes, diéresis y `ñ` ("biceps" = "Bíceps").
 * - Insensible a puntuación y separadores ("press-banca" = "press banca" = "pressbanca").
 * - Todos los términos deben aparecer (AND), en cualquier orden.
 * - Tolerante a erratas: una letra de más/menos/cambiada, o dos letras contiguas del revés.
 * - Busca también en material, tipo, grupo muscular y músculos, pero puntúa muy por
 *   encima el nombre para que el resultado obvio salga primero.
 * - Entiende los sinónimos ES/EN curados en `EXERCISE_SYNONYMS` ("dominada" ↔ "pull up").
 */

/* -------------------------------------------------------------------------- */
/* Normalización                                                              */
/* -------------------------------------------------------------------------- */

/** Caracteres que NFD no descompone pero que igualmente queremos plegar. */
const EXTRA_FOLDING: Record<string, string> = {
  ø: "o",
  Ø: "o",
  đ: "d",
  Đ: "d",
  ł: "l",
  Ł: "l",
  ß: "ss",
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
};

const COMBINING_MARKS = new RegExp("[\u0300-\u036f]", "g");

/**
 * Texto → clave de búsqueda: minúsculas, sin diacríticos (la `ñ` se descompone en
 * `n` + tilde y la tilde se descarta) y con cualquier signo convertido en espacio.
 */
export function normalizeSearchText(value: unknown): string {
  const raw = String(value ?? "");
  if (!raw) return "";

  let folded = "";
  for (const ch of raw) folded += EXTRA_FOLDING[ch] ?? ch;

  return folded
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Texto → lista de términos normalizados. */
export function tokenizeSearchText(value: unknown): string[] {
  const normalized = normalizeSearchText(value);
  return normalized ? normalized.split(" ") : [];
}

/** ¿Aparece `phrase` como secuencia completa de palabras dentro de `haystack`? */
function containsPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false;
  return ` ${haystack} `.includes(` ${phrase} `);
}

function replacePhrase(haystack: string, phrase: string, replacement: string): string {
  return ` ${haystack} `
    .split(` ${phrase} `)
    .join(` ${replacement} `)
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Sinónimos                                                                  */
/* -------------------------------------------------------------------------- */

/** Grupos de frases equivalentes, ya normalizadas. La equivalencia es bidireccional. */
const SYNONYM_GROUPS: string[][] = Object.entries(EXERCISE_SYNONYMS)
  .map(([key, synonyms]) => [...new Set([key, ...synonyms].map(normalizeSearchText).filter(Boolean))])
  .filter((group) => group.length > 1);

/** Tope de reescrituras por consulta: evita explosión combinatoria en frases largas. */
const MAX_QUERY_VARIANTS = 8;

/**
 * Reescribe la consulta sustituyendo frases por sus sinónimos.
 * La consulta original es siempre la primera variante.
 */
export function expandQueryVariants(normalizedQuery: string): string[] {
  const variants = [normalizedQuery];
  const seen = new Set(variants);

  for (const group of SYNONYM_GROUPS) {
    for (const phrase of group) {
      if (!containsPhrase(normalizedQuery, phrase)) continue;
      for (const sibling of group) {
        if (sibling === phrase) continue;
        const variant = replacePhrase(normalizedQuery, phrase, sibling);
        if (!variant || seen.has(variant)) continue;
        seen.add(variant);
        variants.push(variant);
        if (variants.length >= MAX_QUERY_VARIANTS) return variants;
      }
    }
  }

  return variants;
}

/* -------------------------------------------------------------------------- */
/* Índice por ejercicio                                                       */
/* -------------------------------------------------------------------------- */

export type SearchableExercise = {
  nombre?: string | null;
  tipo?: string | null;
  grupo_muscular?: string | null;
  equipment?: string | null;
  equipment_list?: string[] | null;
  musculos_involucrados?: string[] | null;
  body_part?: string[] | string | null;
  descripcion?: string | null;
};

/**
 * Nexos que la gente se salta al escribir de corrido: "pressbanca" por
 * "press de banca". Solo se usan para la forma compacta alternativa.
 */
const STOP_WORDS = new Set([
  "a", "al", "con", "de", "del", "e", "el", "en", "la", "las", "lo", "los",
  "para", "por", "sin", "sobre", "un", "una", "y",
]);

function compactTokens(tokens: string[], dropStopWords: boolean): string {
  let out = "";
  for (const token of tokens) {
    if (dropStopWords && STOP_WORDS.has(token)) continue;
    out += token;
  }
  return out;
}

export type ExerciseSearchIndex = {
  /** Nombre normalizado ("press de banca"). */
  name: string;
  nameTokens: string[];
  /** Nombre sin espacios, para consultas escritas pegadas ("pressdebanca"). */
  nameCompact: string;
  /** Igual pero sin nexos, para quien los omite al escribir de corrido ("pressbanca"). */
  nameCompactCore: string;
  /** Resto de campos normalizados y concatenados. */
  extra: string;
  extraTokens: string[];
};

/** El índice de una fila no cambia: se cachea por identidad de objeto. */
const indexCache = new WeakMap<object, ExerciseSearchIndex>();

function joinValues(value: unknown): string {
  return Array.isArray(value) ? value.join(" ") : String(value ?? "");
}

export function buildExerciseSearchIndex(exercise: SearchableExercise): ExerciseSearchIndex {
  const name = normalizeSearchText(exercise.nombre);
  const nameTokens = name ? name.split(" ") : [];

  const extra = normalizeSearchText(
    [
      exercise.tipo,
      exercise.grupo_muscular,
      exercise.equipment,
      joinValues(exercise.equipment_list),
      joinValues(exercise.musculos_involucrados),
      joinValues(exercise.body_part),
      exercise.descripcion,
    ]
      .map((value) => String(value ?? ""))
      .join(" "),
  );

  return {
    name,
    nameTokens,
    nameCompact: compactTokens(nameTokens, false),
    nameCompactCore: compactTokens(nameTokens, true),
    extra,
    extraTokens: extra ? extra.split(" ") : [],
  };
}

function getExerciseSearchIndex(exercise: SearchableExercise): ExerciseSearchIndex {
  if (typeof exercise !== "object" || exercise === null) return buildExerciseSearchIndex(exercise);
  const cached = indexCache.get(exercise);
  if (cached) return cached;
  const built = buildExerciseSearchIndex(exercise);
  indexCache.set(exercise, built);
  return built;
}

/* -------------------------------------------------------------------------- */
/* Tolerancia a erratas                                                       */
/* -------------------------------------------------------------------------- */

/** Erratas permitidas según la longitud del término. Palabras cortas: ninguna. */
function typoBudget(length: number): number {
  if (length >= 8) return 2;
  if (length >= 4) return 1;
  return 0;
}

/** `banca` vs `bacna`: dos letras contiguas intercambiadas. */
function isAdjacentTransposition(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i += 1;
  if (i >= a.length - 1) return false;
  if (a[i] !== b[i + 1] || a[i + 1] !== b[i]) return false;
  for (let j = i + 2; j < a.length; j += 1) {
    if (a[j] !== b[j]) return false;
  }
  return true;
}

/** Levenshtein acotado: corta en cuanto se supera `max`, para no pagar el cálculo entero. */
function withinEditDistance(a: string, b: string, max: number): boolean {
  if (a === b) return true;
  if (max <= 0) return false;
  if (Math.abs(a.length - b.length) > max) return false;
  if (isAdjacentTransposition(a, b)) return true;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let rowBest = i;
    const codeA = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j += 1) {
      const cost = codeA === b.charCodeAt(j - 1) ? 0 : 1;
      const value = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      curr[j] = value;
      if (value < rowBest) rowBest = value;
    }
    if (rowBest > max) return false;
    const swap = prev;
    prev = curr;
    curr = swap;
  }

  return prev[b.length] <= max;
}

/* -------------------------------------------------------------------------- */
/* Puntuación                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Peso de cada tipo de coincidencia de un término.
 * Cualquier valor `>= SCORE_NAME_TYPO` significa "encontrado en el nombre".
 */
const SCORE_NAME_EXACT = 1;
const SCORE_NAME_PREFIX = 0.92;
const SCORE_NAME_INFIX = 0.7;
const SCORE_NAME_COMPACT = 0.55;
const SCORE_NAME_TYPO = 0.45;
const SCORE_EXTRA_PREFIX = 0.34;
const SCORE_EXTRA_INFIX = 0.22;

/** Longitud mínima de un término para aceptar coincidencia por infijo (evita ruido). */
const MIN_INFIX_LENGTH = 3;
/** Longitud mínima para probar contra el nombre sin espacios. */
const MIN_COMPACT_LENGTH = 4;

/**
 * Términos exigibles de una consulta. Los nexos ("de", "con", "en"...) se
 * descartan: son ruido al escribir y, si se exigieran, una consulta natural
 * como "press de banca con mancuernas" no encontraría nada. Si la consulta
 * es solo nexos, se respetan tal cual.
 */
function requiredTokens(variant: string): string[] {
  const tokens = variant.split(" ").filter(Boolean);
  const meaningful = tokens.filter((token) => !STOP_WORDS.has(token));
  return meaningful.length ? meaningful : tokens;
}

/** ¿Está `text` dentro del nombre sin espacios, con o sin nexos? */
function matchesCompactName(index: ExerciseSearchIndex, text: string): boolean {
  return index.nameCompact.includes(text) || index.nameCompactCore.includes(text);
}

/** Puntúa un término contra un ejercicio. `0` = no aparece en ningún campo. */
function scoreToken(index: ExerciseSearchIndex, token: string): number {
  let best = 0;

  for (const nameToken of index.nameTokens) {
    if (nameToken === token) return SCORE_NAME_EXACT;
    if (nameToken.startsWith(token)) {
      if (SCORE_NAME_PREFIX > best) best = SCORE_NAME_PREFIX;
    } else if (token.length >= MIN_INFIX_LENGTH && nameToken.includes(token)) {
      if (SCORE_NAME_INFIX > best) best = SCORE_NAME_INFIX;
    }
  }
  if (best > 0) return best;

  if (token.length >= MIN_COMPACT_LENGTH && matchesCompactName(index, token)) return SCORE_NAME_COMPACT;

  const budget = typoBudget(token.length);
  if (budget > 0) {
    for (const nameToken of index.nameTokens) {
      if (withinEditDistance(nameToken, token, budget)) return SCORE_NAME_TYPO;
    }
  }

  for (const extraToken of index.extraTokens) {
    if (extraToken.startsWith(token)) return SCORE_EXTRA_PREFIX;
  }
  if (token.length >= MIN_INFIX_LENGTH && index.extra.includes(token)) return SCORE_EXTRA_INFIX;

  return 0;
}

/** ¿Aparecen los términos en el nombre en el mismo orden en que se escribieron? */
function tokensAppearInOrder(nameTokens: string[], tokens: string[]): boolean {
  let from = 0;
  for (const token of tokens) {
    let found = -1;
    for (let i = from; i < nameTokens.length; i += 1) {
      if (nameTokens[i].startsWith(token)) {
        found = i;
        break;
      }
    }
    if (found === -1) return false;
    from = found + 1;
  }
  return true;
}

/** Puntúa una variante concreta de la consulta. `-1` si falta algún término. */
function scoreVariant(index: ExerciseSearchIndex, variant: string, tokens: string[]): number {
  if (!tokens.length) return -1;

  let total = 0;
  let allInName = true;
  for (const token of tokens) {
    const tokenScore = scoreToken(index, token);
    if (tokenScore <= 0) return -1;
    if (tokenScore < SCORE_NAME_TYPO) allInName = false;
    total += tokenScore;
  }

  let score = total / tokens.length;

  if (index.name === variant) score += 3;
  else if (index.name.startsWith(`${variant} `)) score += 1.6;
  else if (containsPhrase(index.name, variant)) score += 1;
  else if (variant.length >= MIN_COMPACT_LENGTH && matchesCompactName(index, variant.replace(/ /g, ""))) score += 0.6;

  if (allInName) {
    score += 0.5;
    if (tokens.length > 1 && tokensAppearInOrder(index.nameTokens, tokens)) score += 0.3;
  }

  // Desempate: a igualdad de coincidencia, gana el nombre más escueto.
  score += 0.25 / (1 + index.nameTokens.length);

  return score;
}

/* -------------------------------------------------------------------------- */
/* API pública                                                                */
/* -------------------------------------------------------------------------- */

export type ExerciseSearchResult<T> = { item: T; score: number };

/** Comparador alfabético estable, insensible a tildes y mayúsculas. */
export function compareExerciseNames(a: SearchableExercise, b: SearchableExercise): number {
  return String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""), "es", { sensitivity: "base" });
}

/** Relevancia de un ejercicio frente a la consulta. `0` = no coincide. */
export function scoreExerciseMatch(exercise: SearchableExercise, query: string): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const index = getExerciseSearchIndex(exercise);
  let best = 0;
  for (const variant of expandQueryVariants(normalizedQuery)) {
    const score = scoreVariant(index, variant, requiredTokens(variant));
    if (score > best) best = score;
  }
  return best;
}

export function exerciseMatchesQuery(exercise: SearchableExercise, query: string): boolean {
  return scoreExerciseMatch(exercise, query) > 0;
}

/**
 * Filtra y ordena por relevancia.
 * Con consulta vacía devuelve la lista intacta (todos con score 0).
 */
export function rankExercises<T extends SearchableExercise>(
  items: readonly T[],
  query: string,
): ExerciseSearchResult<T>[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return items.map((item) => ({ item, score: 0 }));

  const variants = expandQueryVariants(normalizedQuery).map((variant) => ({
    variant,
    tokens: requiredTokens(variant),
  }));

  const results: ExerciseSearchResult<T>[] = [];
  for (const item of items) {
    const index = getExerciseSearchIndex(item);
    let best = 0;
    for (const { variant, tokens } of variants) {
      const score = scoreVariant(index, variant, tokens);
      if (score > best) best = score;
    }
    if (best > 0) results.push({ item, score: best });
  }

  results.sort((a, b) => b.score - a.score || compareExerciseNames(a.item, b.item));
  return results;
}

/** Igual que `rankExercises`, devolviendo solo los ejercicios. */
export function searchExercises<T extends SearchableExercise>(items: readonly T[], query: string): T[] {
  return rankExercises(items, query).map((result) => result.item);
}
