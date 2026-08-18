import { EXERCISE_SYNONYMS } from "@/constants/exerciseSynonyms";
import { normalizeExerciseName } from "@/lib/matchExerciseByName";
import { CATALOG_NAME_TO_TIPO_ID } from "@/lib/lyfta/catalogNameToTipoId";

export type LyftaCatalogEntry = {
  id: string;
  nombre: string;
};

type TokenizedCatalogEntry = LyftaCatalogEntry & { tokens: Set<string> };

/** Frases largas primero para no trocear "bench press" en press genérico. */
const PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bpress banca\b/g, " press_banca "],
  [/\bbench press\b/g, " press_banca "],
  [/\boverhead press\b/g, " press_militar "],
  [/\bpress militar\b/g, " press_militar "],
  [/\bpress hombros\b/g, " press_militar "],
  [/\bhack squat\b/g, " sentadilla_hack "],
  [/\bsentadilla hack\b/g, " sentadilla_hack "],
  [/\bpeso muerto\b/g, " peso_muerto "],
  [/\blat pulldown\b/g, " jalon "],
  [/\bpull down\b/g, " jalon "],
  [/\bpulldown\b/g, " jalon "],
  [/\blateral raise\b/g, " elevacion_lateral "],
  [/\belevacion lateral\b/g, " elevacion_lateral "],
  [/\belevaciones laterales\b/g, " elevacion_lateral "],
  [/\bchin[\s-]?up\b/g, " dominada_supina "],
  [/\bpull[\s-]?up\b/g, " dominada "],
  [/\bdominada supina\b/g, " dominada_supina "],
  [/\bplancha lateral\b/g, " plancha_lateral "],
  [/\bside plank\b/g, " plancha_lateral "],
  [/\bbent over row\b/g, " remo "],
  [/\bbody ?weight\b/g, " corporal "],
  [/\bpeso corporal\b/g, " corporal "],
];

const WORD_CANON: Record<string, string> = {
  barbell: "barra",
  barra: "barra",
  ez: "barra",
  dumbbell: "mancuerna",
  dumbbells: "mancuerna",
  mancuerna: "mancuerna",
  mancuernas: "mancuerna",
  cable: "polea",
  cables: "polea",
  polea: "polea",
  poleas: "polea",
  smith: "smith",
  band: "banda",
  bands: "banda",
  banda: "banda",
  bandas: "banda",
  machine: "maquina",
  maquina: "maquina",
  kettlebell: "kettlebell",
  squat: "sentadilla",
  sentadilla: "sentadilla",
  deadlift: "peso_muerto",
  row: "remo",
  remo: "remo",
  curl: "curl",
  fly: "apertura",
  flyes: "apertura",
  apertura: "apertura",
  aperturas: "apertura",
  jalon: "jalon",
  lunge: "zancada",
  lunges: "zancada",
  zancada: "zancada",
  zancadas: "zancada",
  dip: "fondos",
  dips: "fondos",
  fondos: "fondos",
  ohp: "press_militar",
  plank: "plancha",
  plancha: "plancha",
  incline: "inclinado",
  inclinada: "inclinado",
  inclinadas: "inclinado",
  inclinados: "inclinado",
  inclinado: "inclinado",
  decline: "declinado",
  declinada: "declinado",
  declinadas: "declinado",
  declinado: "declinado",
  bench: "banca",
  banca: "banca",
  press: "press",
  close: "cerrado",
  cerrado: "cerrado",
  wide: "abierto",
  abierto: "abierto",
  military: "militar",
  militar: "militar",
  corporal: "corporal",
};

const EQUIPMENT_TOKENS = new Set([
  "barra",
  "mancuerna",
  "polea",
  "smith",
  "banda",
  "maquina",
  "kettlebell",
  "corporal",
]);

const MOVEMENT_TOKENS = new Set([
  "press_banca",
  "press_militar",
  "sentadilla",
  "sentadilla_hack",
  "peso_muerto",
  "remo",
  "curl",
  "apertura",
  "jalon",
  "zancada",
  "fondos",
  "elevacion_lateral",
  "dominada",
  "dominada_supina",
  "plancha",
  "plancha_lateral",
  "press",
]);

const STOPWORDS = new Set(["con", "de", "en", "the", "and", "a", "al", "la", "el", "los", "las", "del", "para", "por"]);

const MIN_SCORE = 0.5;
const MIN_MARGIN = 0.08;
const GENERIC_MOVEMENTS = new Set(["press"]);

function applySynonyms(normalized: string): string {
  let out = ` ${normalized} `;
  for (const [key, syns] of Object.entries(EXERCISE_SYNONYMS)) {
    const nk = normalizeExerciseName(key);
    for (const syn of [nk, ...syns.map(normalizeExerciseName)]) {
      if (!syn) continue;
      const re = new RegExp(`\\b${escapeRegExp(syn)}\\b`, "g");
      out = out.replace(re, ` ${nk.replace(/\s+/g, "_")} `);
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function tokenizeExerciseName(nombre: string): Set<string> {
  let n = ` ${normalizeExerciseName(nombre)} `;
  n = applySynonyms(n);
  n = ` ${n} `;
  for (const [re, replacement] of PHRASE_REPLACEMENTS) {
    n = n.replace(re, replacement);
  }
  const tokens = new Set<string>();
  for (const raw of n.split(/[^a-z0-9_]+/)) {
    if (!raw || raw.length < 2) continue;
    if (STOPWORDS.has(raw)) continue;
    const canon = WORD_CANON[raw] ?? raw;
    if (canon.length >= 2) tokens.add(canon);
  }
  return tokens;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter += 1;
  }
  return inter / (a.size + b.size - inter);
}

function hasMovementOverlap(a: Set<string>, b: Set<string>): boolean {
  for (const t of a) {
    if (MOVEMENT_TOKENS.has(t) && b.has(t)) return true;
  }
  return false;
}

function equipmentOf(tokens: Set<string>): Set<string> {
  const eq = new Set<string>();
  for (const t of tokens) {
    if (EQUIPMENT_TOKENS.has(t)) eq.add(t);
  }
  return eq;
}

export function pretokenizeCatalog(catalog: LyftaCatalogEntry[]): TokenizedCatalogEntry[] {
  return catalog.map((item) => ({ ...item, tokens: tokenizeExerciseName(item.nombre) }));
}

/**
 * Empareja un nombre Lyfta (EN) con el catálogo Track Gym.
 * Exige overlap de movimiento, ganador único y score alto.
 */
export function matchLyftaToCatalog(
  lyftaNombre: string,
  catalog: LyftaCatalogEntry[] | TokenizedCatalogEntry[],
): LyftaCatalogEntry | null {
  const normalized = normalizeExerciseName(lyftaNombre);
  const seededId = CATALOG_NAME_TO_TIPO_ID[normalized];
  if (seededId) {
    const named = catalog.find((item) => item.id === seededId);
    return { id: seededId, nombre: named?.nombre ?? lyftaNombre };
  }

  const query = tokenizeExerciseName(lyftaNombre);
  if (!query.size) return null;
  if (isTooGeneric(query)) return null;

  const prepared: TokenizedCatalogEntry[] = catalog.map((item) =>
    "tokens" in item && item.tokens instanceof Set
      ? (item as TokenizedCatalogEntry)
      : { ...item, tokens: tokenizeExerciseName(item.nombre) },
  );

  const queryEq = equipmentOf(query);
  const scored: Array<{ item: TokenizedCatalogEntry; score: number }> = [];

  for (const item of prepared) {
    if (!hasMovementOverlap(query, item.tokens) && !setsEqualMovementFallback(query, item.tokens)) {
      continue;
    }
    const itemEq = equipmentOf(item.tokens);
    if (queryEq.size && itemEq.size) {
      let overlap = false;
      for (const e of queryEq) {
        if (itemEq.has(e)) overlap = true;
      }
      if (!overlap) continue;
    }
    const score = jaccard(query, item.tokens);
    if (score >= MIN_SCORE) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  const best = scored[0];
  const second = scored[1];
  if (second && best.score - second.score < MIN_MARGIN) return null;
  return { id: best.item.id, nombre: best.item.nombre };
}

function isTooGeneric(query: Set<string>): boolean {
  const movements = [...query].filter((t) => MOVEMENT_TOKENS.has(t));
  if (movements.length === 1 && GENERIC_MOVEMENTS.has(movements[0]) && query.size < 3) {
    return true;
  }
  return false;
}

function setsEqualMovementFallback(query: Set<string>, item: Set<string>): boolean {
  // Si no hay token de movimiento canónico, exigir igualdad casi exacta de tokens.
  const qMove = [...query].some((t) => MOVEMENT_TOKENS.has(t));
  const iMove = [...item].some((t) => MOVEMENT_TOKENS.has(t));
  if (qMove || iMove) return false;
  return jaccard(query, item) >= 0.85;
}
