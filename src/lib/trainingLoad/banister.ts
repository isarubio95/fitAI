import {
  FATIGUE_TIME_CONSTANT_DAYS,
  FITNESS_TIME_CONSTANT_DAYS,
  LOCAL_MUSCLE_TIME_CONSTANT_DAYS,
} from "./constants";

export function banisterAlpha(timeConstantDays: number): number {
  return 1 - Math.exp(-1 / Math.max(1, timeConstantDays));
}

export type BanisterPoint = {
  load: number;
  fitness: number;
  fatigue: number;
  form: number;
};

/**
 * Serie diaria Banister/Coggan:
 * Fitness (CTL) τ≈42d, Fatigue (ATL) τ≈7d, Form = Fitness − Fatigue.
 */
export function banisterSeries(
  dailyLoads: number[],
  fitnessTau = FITNESS_TIME_CONSTANT_DAYS,
  fatigueTau = FATIGUE_TIME_CONSTANT_DAYS,
): BanisterPoint[] {
  const aFit = banisterAlpha(fitnessTau);
  const aFat = banisterAlpha(fatigueTau);
  let fitness = 0;
  let fatigue = 0;
  const out: BanisterPoint[] = [];

  for (const load of dailyLoads) {
    const l = Math.max(0, load);
    fitness = fitness + (l - fitness) * aFit;
    fatigue = fatigue + (l - fatigue) * aFat;
    out.push({
      load: l,
      fitness,
      fatigue,
      form: fitness - fatigue,
    });
  }
  return out;
}

/**
 * Fatiga local por grupo: misma recursión Banister con τ corto (~4d).
 * `dailyImpulses[i]` = impulso del día i para un grupo.
 */
export function localMuscleFatigueSeries(
  dailyImpulses: number[],
  tauDays = LOCAL_MUSCLE_TIME_CONSTANT_DAYS,
): number[] {
  const alpha = banisterAlpha(tauDays);
  let fatigue = 0;
  const out: number[] = [];
  for (const impulse of dailyImpulses) {
    fatigue = fatigue + (Math.max(0, impulse) - fatigue) * alpha;
    out.push(fatigue);
  }
  return out;
}

/** Días aproximados hasta que la fatiga baje por debajo de `threshold` sin más carga. */
export function estimatedDaysToBaseline(
  currentFatigue: number,
  threshold = 5,
  tauDays = LOCAL_MUSCLE_TIME_CONSTANT_DAYS,
): number {
  if (currentFatigue <= threshold) return 0;
  const alpha = banisterAlpha(tauDays);
  let f = currentFatigue;
  let days = 0;
  while (f > threshold && days < 60) {
    f = f + (0 - f) * alpha;
    days += 1;
  }
  return days;
}

export type FormLabel = "Fresco" | "Óptimo" | "Cargado" | "Muy fatigado";

export function getFormLabel(form: number): FormLabel {
  if (form >= 15) return "Fresco";
  if (form >= 0) return "Óptimo";
  if (form >= -25) return "Cargado";
  return "Muy fatigado";
}

export function getFormClass(form: number): string {
  if (form >= 15) return "text-sky-500";
  if (form >= 0) return "text-emerald-500";
  if (form >= -25) return "text-amber-500";
  return "text-red-500";
}
