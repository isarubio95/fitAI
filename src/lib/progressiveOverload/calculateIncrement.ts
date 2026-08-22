import { computeReadiness, shouldDeload } from "./readinessScore";
import type { OverloadInput, OverloadSetInput, OverloadSuggestion, OverloadTarget } from "./types";

export function parseRepRange(repRange?: string): { min: number; max: number } | null {
  if (!repRange) return null;
  const match = repRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min: Math.max(1, min), max: Math.max(min, max) };
}

export function resolveWeightIncrement(weightKg: number): number {
  if (weightKg <= 0) return 0;
  if (weightKg < 20) return 1.25;
  return 2.5;
}

export function roundToWeightIncrement(weightKg: number, increment: number): number {
  if (increment <= 0) return weightKg;
  const rounded = Math.round(weightKg / increment) * increment;
  return Math.round(rounded * 100) / 100;
}

function workingSets(sets: OverloadSetInput[]): OverloadSetInput[] {
  return sets.filter((s) => Number(s.repeticiones) > 0);
}

function summarizeWorkingSets(sets: OverloadSetInput[]): {
  lastWeight: number;
  avgReps: number;
  avgRir: number | null;
} {
  const working = workingSets(sets);
  if (!working.length) {
    return { lastWeight: 0, avgReps: 0, avgRir: null };
  }

  const lastWeight = Math.max(...working.map((s) => Number(s.peso_kg) || 0));
  const topSets =
    lastWeight > 0
      ? working.filter((s) => Number(s.peso_kg) >= lastWeight * 0.95)
      : working;

  const avgReps =
    topSets.reduce((sum, s) => sum + Number(s.repeticiones), 0) / topSets.length;

  const rirValues = topSets
    .map((s) => s.rir)
    .filter((r): r is number => r != null && Number.isFinite(r));
  const avgRir = rirValues.length
    ? rirValues.reduce((sum, r) => sum + r, 0) / rirValues.length
    : null;

  return { lastWeight, avgReps, avgRir };
}

function computePerformanceFactor(
  avgReps: number,
  target: OverloadTarget,
  avgRir: number | null,
): number {
  const { repesMin, repesMax, targetRir } = target;

  if (avgReps < repesMin) return 0;

  let factor: number;
  if (avgReps >= repesMax) {
    factor = avgReps > repesMax ? 1.15 : 1;
  } else {
    const span = Math.max(repesMax - repesMin, 1);
    factor = 0.4 + 0.6 * ((avgReps - repesMin) / span);
  }

  if (avgRir != null) {
    if (avgRir <= targetRir) factor *= 1.1;
    else if (avgRir > targetRir + 2) factor *= 0.7;
  }

  return Math.min(1.2, factor);
}

function maintainSuggestion(
  lastWeight: number,
  avgReps: number,
  performanceFactor: number,
  reason: string,
): OverloadSuggestion {
  return {
    action: "maintain",
    suggestedWeight: lastWeight,
    suggestedReps: Math.max(1, Math.round(avgReps)),
    confidence: performanceFactor > 0.5 ? 0.65 : 0.45,
    reason,
  };
}

/**
 * Motor de sobrecarga progresiva con double progression y
 * incremento de peso modulado por log(1 + rendimiento) × readiness.
 */
export function suggestProgressiveOverload(input: OverloadInput): OverloadSuggestion | null {
  const { lastSets, target } = input;
  const working = workingSets(lastSets);
  if (!working.length) return null;

  const { lastWeight, avgReps, avgRir } = summarizeWorkingSets(lastSets);
  const performanceFactor = computePerformanceFactor(avgReps, target, avgRir);
  const fatigueNorm = input.muscleFatigueNorm ?? 0;
  const form = input.trainingForm ?? 0;
  const increment = input.weightIncrement ?? resolveWeightIncrement(lastWeight);

  if (shouldDeload(fatigueNorm, form)) {
    const deloadWeight =
      lastWeight > 0
        ? roundToWeightIncrement(lastWeight * 0.9, increment)
        : 0;
    return {
      action: "deload",
      suggestedWeight: deloadWeight,
      suggestedReps: target.repesMin,
      confidence: 0.55,
      reason:
        fatigueNorm > 0.8
          ? "Fatiga muscular alta; reduce un 10% esta sesión"
          : "Carga acumulada elevada; semana de descarga sugerida",
    };
  }

  if (performanceFactor < 0.25) {
    return maintainSuggestion(
      lastWeight,
      avgReps,
      performanceFactor,
      avgReps < target.repesMin
        ? "No alcanzaste el mínimo de reps; mantén o baja ligeramente"
        : "Rendimiento por debajo del objetivo; mantén la carga",
    );
  }

  // Fase 1 double progression: subir reps dentro del rango antes del peso.
  if (avgReps < target.repesMax) {
    const nextReps = Math.min(target.repesMax, Math.ceil(avgReps) + 1);
    if (nextReps > avgReps) {
      return {
        action: "increase_reps",
        suggestedWeight: lastWeight,
        suggestedReps: nextReps,
        confidence: 0.7 + performanceFactor * 0.15,
        reason: `Añade 1 rep (${Math.round(avgReps)} → ${nextReps}) antes de subir peso`,
      };
    }
  }

  // Fase 2: subir peso con curva logarítmica × readiness.
  if (avgReps >= target.repesMax && performanceFactor >= 0.5 && lastWeight > 0) {
    const readiness = computeReadiness(fatigueNorm, form);
    const logBonus = Math.log(1 + performanceFactor * 2);
    const deltaKg = increment * logBonus * readiness;
    const newWeight = roundToWeightIncrement(lastWeight + deltaKg, increment);

    if (newWeight > lastWeight) {
      return {
        action: "increase_weight",
        suggestedWeight: newWeight,
        suggestedReps: target.repesMin,
        confidence: Math.min(0.95, 0.65 + performanceFactor * 0.2 + readiness * 0.1),
        reason: `Cumpliste ${target.repesMax} reps; sube a ${newWeight} kg y reinicia en ${target.repesMin} reps`,
      };
    }
  }

  return maintainSuggestion(
    lastWeight,
    avgReps,
    performanceFactor,
    "Buen trabajo; mantén la misma carga esta sesión",
  );
}
