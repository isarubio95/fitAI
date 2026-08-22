/**
 * Combina fatiga local y forma global en un factor 0.3–1.0
 * que modula el tamaño del incremento logarítmico.
 */
export function computeReadiness(
  muscleFatigueNorm = 0,
  trainingForm = 0,
): number {
  let readiness = 1;

  if (muscleFatigueNorm > 0) {
    readiness -= 0.35 * Math.min(1, muscleFatigueNorm);
  }

  if (trainingForm < 0) {
    readiness -= Math.min(0.35, Math.abs(trainingForm) / 50);
  }

  return Math.max(0.3, Math.min(1, readiness));
}

export function shouldDeload(muscleFatigueNorm = 0, trainingForm = 0): boolean {
  return muscleFatigueNorm > 0.8 || trainingForm < -25;
}
