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

/** Mezcla fuerza mecánica + TRIMP de FC de sesión. */
export const STRENGTH_MECHANICAL_WEIGHT = 0.65;
export const STRENGTH_HR_WEIGHT = 0.35;

/** FCreposo por defecto si el perfil no la define. */
export const DEFAULT_RESTING_HR = 60;

/** Pesos Edwards TRIMP por zona 1–5. */
export const EDWARDS_ZONE_WEIGHTS = [1, 2, 3, 4, 5] as const;

/** Impulso local: grupo principal vs secundarios. */
export const LOCAL_PRIMARY_WEIGHT = 1;
export const LOCAL_SECONDARY_WEIGHT = 0.5;
