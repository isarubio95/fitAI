import {
  DEFAULT_BODYWEIGHT_SET_LOAD,
  STRENGTH_HR_WEIGHT,
  STRENGTH_MECHANICAL_WEIGHT,
  STRENGTH_VOLUME_DIVISOR,
} from "./constants";

/**
 * Intensidad a partir de RIR.
 * RPE ≈ 10 − RIR; factor ~0.7 (RIR alto / fácil) … ~1.15 (RIR 0 / al fallo).
 * Sin RIR → 1.0.
 */
export function intensityFromRir(rir: number | null | undefined): number {
  if (rir == null || !Number.isFinite(rir)) return 1;
  const clamped = Math.max(0, Math.min(10, rir));
  const rpe = 10 - clamped;
  // RPE 5 → ~0.7, RPE 7 → ~0.9, RPE 10 → ~1.15
  return 0.5 + rpe * 0.065;
}

export type StrengthSetInput = {
  repeticiones?: number | null;
  peso_kg?: number | null;
  rir?: number | null;
  duracion_seg?: number | null;
};

/**
 * Impulso mecánico de una serie en unidades de carga.
 * - Con peso+reps: reps × peso × intensidad(RIR) / divisor
 * - Solo reps (peso corporal): reps × bodyWeightKg × intensidad / divisor
 * - Solo duración (isométricos / cardio-en-gym): minutos × 4 × intensidad
 * - Sin datos útiles: 0
 */
export function strengthSetMechanicalImpulse(
  set: StrengthSetInput,
  bodyWeightKg?: number | null,
): number {
  const reps = Number(set.repeticiones ?? 0);
  const weight = Number(set.peso_kg ?? 0);
  const intensity = intensityFromRir(set.rir);
  const durationMin = Number(set.duracion_seg ?? 0) / 60;

  if (reps > 0 && weight > 0) {
    return (reps * weight * intensity) / STRENGTH_VOLUME_DIVISOR;
  }

  if (reps > 0) {
    const bw = bodyWeightKg != null && bodyWeightKg > 0 ? bodyWeightKg : null;
    if (bw != null) {
      return (reps * bw * intensity) / STRENGTH_VOLUME_DIVISOR;
    }
    return DEFAULT_BODYWEIGHT_SET_LOAD * intensity;
  }

  if (durationMin > 0) {
    return durationMin * 4 * intensity;
  }

  return 0;
}

/**
 * Combina carga mecánica de la sesión con TRIMP de FC.
 * Sin FC → solo mecánica. Sin mecánica → solo TRIMP.
 */
export function combineStrengthSessionLoad(mechanical: number, hrTrimp: number): number {
  const m = Math.max(0, mechanical);
  const h = Math.max(0, hrTrimp);
  if (m <= 0 && h <= 0) return 0;
  if (h <= 0) return m;
  if (m <= 0) return h;
  return STRENGTH_MECHANICAL_WEIGHT * m + STRENGTH_HR_WEIGHT * h;
}
