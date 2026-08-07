import type { MainMuscleGroup } from "@/constants/muscleGroups";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";
import { LOCAL_PRIMARY_WEIGHT, LOCAL_SECONDARY_WEIGHT } from "./constants";
import { strengthSetMechanicalImpulse, type StrengthSetInput } from "./strengthImpulse";

export type MuscleInvolvement = {
  musculos_involucrados?: string[] | null;
  grupo_muscular?: string | null;
};

/**
 * Reparte el impulso de una serie: 1.0 al grupo principal + 0.5 a cada secundario mapeable.
 */
export function distributeLocalMuscleImpulse(
  setImpulse: number,
  involvement: MuscleInvolvement,
): Partial<Record<MainMuscleGroup, number>> {
  if (setImpulse <= 0) return {};

  const primary =
    resolveMainMuscleGroup(involvement.grupo_muscular) ??
    (involvement.musculos_involucrados ?? [])
      .map((m) => resolveMainMuscleGroup(m))
      .find((g): g is MainMuscleGroup => g != null) ??
    null;

  if (!primary) return {};

  const out: Partial<Record<MainMuscleGroup, number>> = {
    [primary]: setImpulse * LOCAL_PRIMARY_WEIGHT,
  };

  const secondaries = new Set<MainMuscleGroup>();
  for (const muscle of involvement.musculos_involucrados ?? []) {
    const group = resolveMainMuscleGroup(muscle);
    if (group && group !== primary) secondaries.add(group);
  }

  for (const group of secondaries) {
    out[group] = (out[group] ?? 0) + setImpulse * LOCAL_SECONDARY_WEIGHT;
  }

  return out;
}

export function localImpulseFromSet(
  set: StrengthSetInput,
  involvement: MuscleInvolvement,
  bodyWeightKg?: number | null,
): Partial<Record<MainMuscleGroup, number>> {
  const impulse = strengthSetMechanicalImpulse(set, bodyWeightKg);
  return distributeLocalMuscleImpulse(impulse, involvement);
}
