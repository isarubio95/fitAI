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

/** Ritmo medio en s/km a partir de tiempo y distancia. */
export function avgPaceSecPerKm(elapsedSec: number, distanceM: number): number | null {
  if (!(elapsedSec > 0) || !(distanceM > 0)) return null;
  return elapsedSec / (distanceM / 1000);
}

/** Ritmo instantáneo s/km desde velocidad m/s. */
export function paceSecPerKmFromSpeed(speedMps: number | null | undefined): number | null {
  if (speedMps == null || !Number.isFinite(speedMps) || speedMps <= 0) return null;
  return 1000 / speedMps;
}

/** Velocidad media m/s. */
export function avgSpeedMps(elapsedSec: number, distanceM: number): number | null {
  if (!(elapsedSec > 0) || !(distanceM > 0)) return null;
  return distanceM / elapsedSec;
}

/** Ritmo medio s/500m (remo). */
export function avgPaceSecPer500m(elapsedSec: number, distanceM: number): number | null {
  if (!(elapsedSec > 0) || !(distanceM > 0)) return null;
  return (elapsedSec / distanceM) * 500;
}

/** Ritmo instantáneo s/500m desde velocidad m/s. */
export function paceSecPer500mFromSpeed(speedMps: number | null | undefined): number | null {
  if (speedMps == null || !Number.isFinite(speedMps) || speedMps <= 0) return null;
  return 500 / speedMps;
}

function formatPaceClock(sec: number | null | undefined, suffix: string): string {
  if (sec == null || !Number.isFinite(Number(sec)) || Number(sec) <= 0) return "—";
  const n = Math.round(Number(sec));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, "0")}${suffix}`;
}

/** Ritmo en s/km → `5:00/km` */
export function formatPaceSecKm(sec: number | null | undefined): string {
  return formatPaceClock(sec, "/km");
}

/** Ritmo en s/500m → `2:00/500m` */
export function formatPaceSec500m(sec: number | null | undefined): string {
  return formatPaceClock(sec, "/500m");
}

/** Velocidad m/s → `X.X km/h` */
export function formatSpeedKmh(speedMps: number | null | undefined): string {
  if (speedMps == null || !Number.isFinite(speedMps) || speedMps < 0) return "—";
  const kmh = speedMps * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function formatCardioBpm(bpm: number | null | undefined): string {
  if (bpm == null || !Number.isFinite(bpm) || bpm <= 0) return "—";
  return `${Math.round(bpm)}`;
}

/** Ganancia positiva acumulada; ignora saltos pequeños (ruido GPS de altitud). */
/** Ruido barométrico por debajo de esto no cuenta como desnivel. */
export const ELEVATION_MIN_STEP_M = 1.5;

export function elevationGainM(
  points: { elevacion_m?: number | null }[],
  minStepM = ELEVATION_MIN_STEP_M,
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
