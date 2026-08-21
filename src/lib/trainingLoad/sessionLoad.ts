import {
  DEFAULT_RESTING_HR,
  ESTIMATED_SEC_PER_STRENGTH_SET,
  FOSTER_LOAD_DIVISOR,
  MAX_STRENGTH_CLOCK_SEC,
  MIN_PLAUSIBLE_SESSION_SEC,
} from "./constants";

export function clampSessionRpe(rpe: number): number {
  if (!Number.isFinite(rpe)) return 1;
  return Math.max(1, Math.min(10, Math.round(rpe)));
}

/** Foster session-RPE: null si no hay valor usable (1–10). */
export function parseSessionRpe(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  if (n < 1 || n > 10) return null;
  return n;
}

export function estimatedStrengthDurationSec(setCount: number): number {
  if (!(setCount > 0)) return 0;
  return setCount * ESTIMATED_SEC_PER_STRENGTH_SET;
}

/** Acepta un reloj de sesión solo si parece un entreno, no “desde medianoche”. */
export function plausibleClockSec(
  durationSec: number,
  maxClockSec = MAX_STRENGTH_CLOCK_SEC,
  minClockSec = MIN_PLAUSIBLE_SESSION_SEC,
): number {
  if (!Number.isFinite(durationSec)) return 0;
  if (durationSec < minClockSec || durationSec > maxClockSec) return 0;
  return durationSec;
}

export function resolveSessionDurationSec(opts: {
  clockSec: number;
  estimatedSec?: number;
  maxClockSec?: number;
}): number {
  const clock = plausibleClockSec(opts.clockSec, opts.maxClockSec);
  if (clock > 0) return clock;
  const estimated = Math.max(0, opts.estimatedSec ?? 0);
  if (estimated > 0) {
    const cap = opts.maxClockSec ?? MAX_STRENGTH_CLOCK_SEC;
    return Math.min(estimated, cap);
  }
  return 0;
}

/** Carga de sesión Foster en unidades tipo TSS: (minutos × RPE) / 10. */
export function fosterSessionLoad(durationSec: number, rpe: number): number {
  const duration = Math.max(0, durationSec);
  if (duration <= 0) return 0;
  return ((duration / 60) * clampSessionRpe(rpe)) / FOSTER_LOAD_DIVISOR;
}

/** RPE estimado por reserva de FC (Karvonen): 0 % → 1, 100 % → 10. */
export function rpeFromHeartRate(
  fcMedia: number,
  maxHr: number,
  restingHr = DEFAULT_RESTING_HR,
): number | null {
  if (!(fcMedia > 0) || !(maxHr > restingHr) || restingHr <= 0) return null;
  const reserve = (fcMedia - restingHr) / (maxHr - restingHr);
  if (!Number.isFinite(reserve)) return null;
  return clampSessionRpe(1 + Math.max(0, Math.min(1, reserve)) * 9);
}

/** RPE estimado por factor de intensidad (potencia / FTP). IF 1.0 ≈ RPE 10. */
export function rpeFromIntensityFactor(intensityFactor: number): number | null {
  if (!(intensityFactor > 0) || !Number.isFinite(intensityFactor)) return null;
  return clampSessionRpe(Math.max(0.1, Math.min(1.2, intensityFactor)) * 10);
}

/** RPE de sesión aproximado desde RIR de series (RPE ≈ 10 − RIR). */
export function rpeFromSetRirs(rirs: Array<number | null | undefined>): number | null {
  const rpes: number[] = [];
  for (const rir of rirs) {
    if (rir == null || !Number.isFinite(rir)) continue;
    rpes.push(10 - Math.max(0, Math.min(10, rir)));
  }
  if (rpes.length === 0) return null;
  const mean = rpes.reduce((sum, value) => sum + value, 0) / rpes.length;
  return clampSessionRpe(mean);
}

export function resolveSessionRpe(opts: {
  sessionRpe?: number | null;
  fcMedia?: number | null;
  maxHr: number;
  restingHr?: number;
  intensityFactor?: number | null;
  setRirs?: Array<number | null | undefined>;
  fallbackRpe: number;
}): number {
  const explicit = parseSessionRpe(opts.sessionRpe);
  if (explicit != null) return explicit;

  return (
    rpeFromHeartRate(opts.fcMedia ?? 0, opts.maxHr, opts.restingHr ?? DEFAULT_RESTING_HR) ??
    rpeFromIntensityFactor(opts.intensityFactor ?? 0) ??
    rpeFromSetRirs(opts.setRirs ?? []) ??
    clampSessionRpe(opts.fallbackRpe)
  );
}

/**
 * Impulso diario unificado: Foster si hay duración creíble; si no, el fallback
 * (mecánica / TRIMP / TSS) para sesiones históricas sin reloj.
 */
export function unifiedSessionLoad(opts: {
  durationSec: number;
  rpe: number;
  fallbackLoad?: number;
}): number {
  const foster = fosterSessionLoad(opts.durationSec, opts.rpe);
  if (foster > 0) return foster;
  return Math.max(0, opts.fallbackLoad ?? 0);
}
