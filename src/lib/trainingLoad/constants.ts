/** Factor de decaimiento Banister / Coggan: α = 1 − e^(−1/τ). */

export const FITNESS_TIME_CONSTANT_DAYS = 42;
export const FATIGUE_TIME_CONSTANT_DAYS = 7;
export const LOCAL_MUSCLE_TIME_CONSTANT_DAYS = 4;

/** Escala tonelaje (kg·reps) → unidades de carga comparables a TRIMP/TSS. */
export const STRENGTH_VOLUME_DIVISOR = 50;

/** Fallback histórico cuando no hay peso ni peso corporal de medidas. */
export const DEFAULT_BODYWEIGHT_SET_LOAD = 20;

/** Fallback cardio sin FC ni potencia (minutos × factor). */
export const CARDIO_PER_MINUTE_FACTOR = 8;

/** Mezcla fuerza mecánica + TRIMP de FC de sesión (solo si no hay duración). */
export const STRENGTH_MECHANICAL_WEIGHT = 0.65;
export const STRENGTH_HR_WEIGHT = 0.35;

/** RPE de sesión por defecto si el usuario no lo indica y no hay FC/RIR. */
export const DEFAULT_STRENGTH_SESSION_RPE = 7;
export const DEFAULT_CARDIO_SESSION_RPE = 5;

/**
 * Foster crudo (min × RPE) es ~10× un TSS/TRIMP. Dividir deja CTL/ATL
 * en la escala de las zonas de forma (±30, fresco +5…+25).
 */
export const FOSTER_LOAD_DIVISOR = 10;

/** Reloj de gym desde medianoche (fecha calendario) no es duración real. */
export const MIN_PLAUSIBLE_SESSION_SEC = 3 * 60;
export const MAX_STRENGTH_CLOCK_SEC = 4 * 60 * 60;
export const MAX_CARDIO_CLOCK_SEC = 16 * 60 * 60;

/** Si el reloj no es creíble, ~3 min por serie (trabajo + descanso). */
export const ESTIMATED_SEC_PER_STRENGTH_SET = 180;

/** FCreposo por defecto si el perfil no la define. */
export const DEFAULT_RESTING_HR = 60;

/** Pesos Edwards TRIMP por zona 1–5. */
export const EDWARDS_ZONE_WEIGHTS = [1, 2, 3, 4, 5] as const;

/** Impulso local: grupo principal vs secundarios. */
export const LOCAL_PRIMARY_WEIGHT = 1;
export const LOCAL_SECONDARY_WEIGHT = 0.5;
