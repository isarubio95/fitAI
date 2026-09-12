import { format } from "date-fns";

export type HealthMetric = "peso" | "calorias" | "fc" | "sueno";

export const HEALTH_METRIC_LABEL: Record<HealthMetric, string> = {
  peso: "Peso",
  calorias: "Calorías",
  fc: "FC reposo",
  sueno: "Sueño",
};

export const HEALTH_CHART_TITLE: Record<HealthMetric, string> = {
  peso: "Evolución del peso",
  calorias: "Ingesta y cardio",
  fc: "FC reposo y de sesión",
  sueno: "Horas de sueño",
};

export const HEALTH_EMPTY_COPY: Record<HealthMetric, { headline: string; detail: string }> = {
  peso: {
    headline: "Aún no hay peso.",
    detail: "Registra el de hoy para ver la evolución.",
  },
  calorias: {
    headline: "Aún no hay calorías.",
    detail: "Anota la ingesta de hoy. Las quemadas salen del cardio que registres.",
  },
  fc: {
    headline: "Aún no hay FC reposo.",
    detail: "Mídela en calma y regístrala para compararla con tus sesiones.",
  },
  sueno: {
    headline: "Aún no hay sueño.",
    detail: "Anota las horas de anoche. La calidad 1–5 queda en la card.",
  },
};

/** Polaridad del delta: qué dirección es favorable. Calorías y peso no se moralizan. */
export type HealthDeltaTone = "good" | "bad" | "neutral";

export function healthDeltaTone(metric: HealthMetric, delta: number): HealthDeltaTone {
  if (!Number.isFinite(delta) || delta === 0) return "neutral";
  if (metric === "sueno") return delta > 0 ? "good" : "bad";
  if (metric === "fc") return delta < 0 ? "good" : "bad";
  return "neutral";
}

export function healthDeltaClass(tone: HealthDeltaTone): string {
  if (tone === "good") return "text-success";
  if (tone === "bad") return "text-destructive";
  return "text-muted-foreground";
}

export function formatHealthDelta(
  delta: number,
  unit: "kg" | "h" | null,
): string {
  const sign = delta > 0 ? "+" : "";
  const value =
    unit === "h" || unit === "kg" ? delta.toFixed(1) : String(Math.round(delta));
  return unit ? `${sign}${value} ${unit}` : `${sign}${value}`;
}

export function formatSleepHours(min: number): string {
  const hours = min / 60;
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`;
}

export function formatSleepHoursInput(min: number): string {
  const hours = min / 60;
  return Number.isInteger(hours) ? String(hours) : String(Number(hours.toFixed(2)));
}

export function dayKey(value: string | Date): string {
  return format(typeof value === "string" ? new Date(value) : value, "yyyy-MM-dd");
}
