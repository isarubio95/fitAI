/** Formato de métricas de cardio en vivo / resumen. */

export function formatCardioDuration(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function formatCardioDistanceM(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

export function formatCardioElevationM(m: number) {
  return `${Math.round(m)} m`;
}

/** Ganancia positiva acumulada; ignora saltos pequeños (ruido GPS de altitud). */
export function elevationGainM(
  points: { elevacion_m?: number | null }[],
  minStepM = 1.5,
): number {
  let gain = 0;
  let prev: number | null = null;
  for (const p of points) {
    const e = p.elevacion_m;
    if (e == null || !Number.isFinite(e)) continue;
    if (prev != null) {
      const d = e - prev;
      if (d >= minStepM) gain += d;
    }
    prev = e;
  }
  return gain;
}
