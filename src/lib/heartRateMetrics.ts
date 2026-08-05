export type HeartRateSample = {
  /** epoch ms */
  t: number;
  bpm: number;
};

/** Zona 1–5 por % de FCmáx (Karvonen simplificado / ACSM). */
export function heartRateZone(bpm: number, maxHr: number): 1 | 2 | 3 | 4 | 5 | null {
  if (!Number.isFinite(bpm) || bpm <= 0 || !Number.isFinite(maxHr) || maxHr <= 0) return null;
  const pct = (bpm / maxHr) * 100;
  if (pct < 60) return 1;
  if (pct < 70) return 2;
  if (pct < 80) return 3;
  if (pct < 90) return 4;
  return 5;
}

/** FCmáx estimada si no hay perfil: Tanaka 208 − 0.7×edad; sin edad → 190. */
export function estimateMaxHeartRate(ageYears?: number | null): number {
  if (ageYears != null && Number.isFinite(ageYears) && ageYears > 10 && ageYears < 100) {
    return Math.round(208 - 0.7 * ageYears);
  }
  return 190;
}

export function summarizeHeartRate(samples: HeartRateSample[]): { fcMedia: number | null; fcMax: number | null } {
  if (samples.length === 0) return { fcMedia: null, fcMax: null };
  let sum = 0;
  let max = 0;
  for (const s of samples) {
    sum += s.bpm;
    if (s.bpm > max) max = s.bpm;
  }
  return {
    fcMedia: Math.round(sum / samples.length),
    fcMax: max,
  };
}

/**
 * Asigna a cada timestamp el sample FC más cercano.
 * Si no hay samples o el más cercano está a más de `maxDeltaMs`, devuelve null.
 */
export function nearestHeartRate(
  samples: HeartRateSample[],
  timestampMs: number,
  maxDeltaMs = 15_000,
): number | null {
  if (samples.length === 0 || !Number.isFinite(timestampMs)) return null;
  let best: HeartRateSample | null = null;
  let bestDelta = Infinity;
  for (const s of samples) {
    const d = Math.abs(s.t - timestampMs);
    if (d < bestDelta) {
      bestDelta = d;
      best = s;
    }
  }
  if (!best || bestDelta > maxDeltaMs) return null;
  return best.bpm;
}

/** Muestreo periódico de FC cuando no hay track GPS (p. ej. cardio interior). */
export function sampleHeartRateSeries(
  samples: HeartRateSample[],
  startMs: number,
  endMs: number,
  intervalMs = 5000,
): HeartRateSample[] {
  if (samples.length === 0 || !Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return [];
  }
  const out: HeartRateSample[] = [];
  for (let t = startMs; t <= endMs; t += intervalMs) {
    const bpm = nearestHeartRate(samples, t);
    if (bpm != null) out.push({ t, bpm });
  }
  // Asegurar último punto
  const lastBpm = nearestHeartRate(samples, endMs);
  if (lastBpm != null && (out.length === 0 || out[out.length - 1].t !== endMs)) {
    out.push({ t: endMs, bpm: lastBpm });
  }
  return out;
}
