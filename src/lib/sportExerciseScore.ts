import {
  type Cualidad,
  type Deporte,
  type PatronMovimiento,
  type Plano,
  coerceTaxonomyList,
  isCualidad,
  isDeporte,
  isPatronMovimiento,
  isPlano,
} from "@/constants/exerciseTaxonomy";
import { SPORT_PROFILES, type SportProfile } from "@/constants/sportProfiles";

/** Forma mínima que necesita el scorer. Encaja con `tipo_ejercicio` y `usuario_ejercicio`. */
export interface ScorableExercise {
  patron_movimiento?: unknown;
  cualidad?: unknown;
  plano?: unknown;
  unilateral?: boolean | null;
  deportes?: unknown;
}

/** Bonus fijo cuando el ejercicio declara explícitamente el deporte. */
export const EXPLICIT_SPORT_BONUS = 0.5;

/**
 * Patrón y cualidad son los términos que puntúan: describen si el ejercicio
 * hace algo que el deporte necesita. Suman como máximo 0.8.
 */
const PESO_PATRON = 0.45;
const PESO_CUALIDAD = 0.35;

/**
 * Plano y unilateralidad son modificadores, no méritos propios: multiplican la
 * relevancia en vez de sumarse a ella.
 *
 * Sumándose, un curl de bíceps sacaba 0.37 en rugby (0.35·hipertrofia +
 * 0.1·sagital) y entraba en las rutinas de rugby sin tener ninguna relevancia
 * mecánica. Multiplicando, un ejercicio irrelevante sigue siendo irrelevante
 * por muy bien orientado que esté su plano.
 */
const MOD_PLANO = 0.15;
const MOD_UNILATERAL = 0.15;

/**
 * Mezcla el mejor encaje con el encaje medio.
 *
 * Solo con el máximo, un ejercicio que toca de refilón un patrón prioritario
 * empata con uno construido para él. Solo con la media, los ejercicios
 * multipatrón salen penalizados por acertar en varias cosas. 70/30 premia el
 * encaje principal sin ignorar el resto.
 */
function blendMaxMean(values: number[]): number {
  if (values.length === 0) return 0;
  let max = 0;
  let sum = 0;
  for (const v of values) {
    if (v > max) max = v;
    sum += v;
  }
  return 0.7 * max + 0.3 * (sum / values.length);
}

function weightsFor<K extends string>(
  keys: K[],
  table: Partial<Record<K, number>>,
): number[] {
  return keys.map((k) => table[k] ?? 0);
}

/**
 * Puntúa lo bien que un ejercicio sirve a un deporte, en 0..1.
 *
 * Un ejercicio sin ninguna etiqueta puntúa 0: la taxonomía es la que hace el
 * trabajo, así que las filas sin etiquetar quedan fuera de las rutinas
 * deportivas hasta que se etiqueten.
 */
export function scoreExerciseForSport(
  exercise: ScorableExercise,
  profile: SportProfile,
): number {
  const patrones = coerceTaxonomyList<PatronMovimiento>(
    exercise.patron_movimiento,
    isPatronMovimiento,
  );
  const cualidades = coerceTaxonomyList<Cualidad>(exercise.cualidad, isCualidad);
  const deportes = coerceTaxonomyList<Deporte>(exercise.deportes, isDeporte);
  const plano: Plano | null = isPlano(exercise.plano) ? exercise.plano : null;

  const patronScore = blendMaxMean(weightsFor(patrones, profile.patrones));
  const cualidadScore = blendMaxMean(weightsFor(cualidades, profile.cualidades));
  const planoScore = plano ? (profile.planos[plano] ?? 0) : 0;
  const unilateralScore = exercise.unilateral ? profile.unilateral : 0;

  const relevancia = PESO_PATRON * patronScore + PESO_CUALIDAD * cualidadScore;
  const modificador = 1 + MOD_PLANO * planoScore + MOD_UNILATERAL * unilateralScore;
  const base = relevancia * modificador;

  // Un ejercicio que declara el deporte a mano gana a cualquier inferencia,
  // pero no rompe la escala: el resultado sigue acotado a 1.
  const bonus = deportes.includes(profile.deporte) ? EXPLICIT_SPORT_BONUS : 0;

  return Math.min(1, base + bonus);
}

export function scoreExerciseForDeporte(
  exercise: ScorableExercise,
  deporte: Deporte,
): number {
  return scoreExerciseForSport(exercise, SPORT_PROFILES[deporte]);
}

export interface RankedExercise<T> {
  exercise: T;
  score: number;
}

/**
 * Ordena ejercicios por encaje con un deporte, de mayor a menor.
 * `minScore` descarta el ruido; 0.35 es un umbral razonable para "sirve".
 */
export function rankExercisesForSport<T extends ScorableExercise>(
  exercises: T[],
  deporte: Deporte,
  options: { minScore?: number; limit?: number } = {},
): RankedExercise<T>[] {
  const { minScore = 0.35, limit } = options;
  const profile = SPORT_PROFILES[deporte];

  const ranked = exercises
    .map((exercise) => ({ exercise, score: scoreExerciseForSport(exercise, profile) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);

  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}
