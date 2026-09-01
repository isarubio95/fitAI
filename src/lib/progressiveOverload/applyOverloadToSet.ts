import { resolveWeightIncrement, roundToWeightIncrement } from "./calculateIncrement";
import type { OverloadSuggestion } from "./types";

export type OverloadSetPatch = {
  peso_kg: number;
  repeticiones: number;
};

type SetLike = {
  peso_kg: number;
  repeticiones: number;
  objetivo_repes_max?: number | null;
};

/**
 * Series "de trabajo" de la sugerencia: peso ≥ 95% del máximo
 * (la misma regla con la que se calcula el banner).
 */
export function isTopOverloadSet(weightKg: number, topWeightKg: number): boolean {
  if (topWeightKg <= 0) return true;
  return Number(weightKg) >= topWeightKg * 0.95;
}

/**
 * Traduce la sugerencia del ejercicio a ESTA serie.
 * No aplana pirámides: subir reps suma 1 (con tope), subir peso solo
 * toca las series cercanas a la carga máxima.
 */
export function applyOverloadToSet(
  set: SetLike,
  suggestion: OverloadSuggestion,
  topWeightKg: number,
): OverloadSetPatch {
  const weight = Number(set.peso_kg) || 0;
  const reps = Number(set.repeticiones) || 0;
  const repCap =
    set.objetivo_repes_max != null && Number(set.objetivo_repes_max) > 0
      ? Math.round(Number(set.objetivo_repes_max))
      : null;

  if (suggestion.action === "increase_reps") {
    if (reps <= 0) {
      return {
        peso_kg: weight > 0 ? weight : suggestion.suggestedWeight,
        repeticiones: suggestion.suggestedReps,
      };
    }
    const plusOne = reps + 1;
    const cappedBySet = repCap != null ? Math.min(plusOne, repCap) : plusOne;
    const nextReps = Math.min(cappedBySet, Math.max(reps, suggestion.suggestedReps));
    return { peso_kg: weight > 0 ? weight : suggestion.suggestedWeight, repeticiones: nextReps };
  }

  if (suggestion.action === "increase_weight") {
    if (isTopOverloadSet(weight, topWeightKg)) {
      return {
        peso_kg: suggestion.suggestedWeight,
        repeticiones: suggestion.suggestedReps,
      };
    }
    if (reps <= 0) {
      return {
        peso_kg: weight > 0 ? weight : suggestion.suggestedWeight,
        repeticiones: suggestion.suggestedReps,
      };
    }
    const plusOne = reps + 1;
    const nextReps = repCap != null ? Math.min(plusOne, repCap) : plusOne;
    return { peso_kg: weight, repeticiones: nextReps };
  }

  if (suggestion.action === "deload") {
    if (weight <= 0 || isTopOverloadSet(weight, topWeightKg)) {
      return {
        peso_kg: suggestion.suggestedWeight,
        repeticiones: suggestion.suggestedReps,
      };
    }
    const ratio = topWeightKg > 0 ? suggestion.suggestedWeight / topWeightKg : 0.9;
    const increment = resolveWeightIncrement(weight);
    return {
      peso_kg: roundToWeightIncrement(weight * ratio, increment || 1.25),
      repeticiones: suggestion.suggestedReps,
    };
  }

  return {
    peso_kg: weight > 0 ? weight : suggestion.suggestedWeight,
    repeticiones: reps > 0 ? reps : suggestion.suggestedReps,
  };
}

export function overloadPatchChangesSet(
  set: Pick<SetLike, "peso_kg" | "repeticiones">,
  patch: OverloadSetPatch,
): boolean {
  return Number(set.peso_kg) !== Number(patch.peso_kg) || Number(set.repeticiones) !== Number(patch.repeticiones);
}
