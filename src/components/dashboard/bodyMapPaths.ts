export { type BodyMapZone } from "./bodyMapZones";

export type MuscleLoadLevel = "none" | "light" | "moderate" | "high";

/** Volumen: escala primary (azul/marca). */
export const LOAD_COLORS: Record<MuscleLoadLevel, string> = {
  none: "hsl(var(--muted-foreground) / 0.3)",
  light: "hsl(var(--primary) / 0.3)",
  moderate: "hsl(var(--primary) / 0.55)",
  high: "hsl(var(--primary) / 0.9)",
};

/** Fatiga local: escala ámbar/naranja (misma familia que Fatiga sistémica). */
export const FATIGUE_COLORS: Record<MuscleLoadLevel, string> = {
  none: "hsl(var(--muted-foreground) / 0.3)",
  light: "hsl(38 92% 50% / 0.35)",
  moderate: "hsl(32 95% 48% / 0.62)",
  high: "hsl(24 95% 44% / 0.95)",
};

/** Separación entre músculos (como en mapas de referencia) */
export const MUSCLE_STROKE = "#fafafa";

export function heatLevelToLoad(level: number): MuscleLoadLevel {
  if (level <= 0) return "none";
  if (level === 1) return "light";
  if (level === 2) return "moderate";
  return "high";
}

/** Nivel relativo 0–4 según series vs. máximo del entrenamiento o periodo. */
export function getHeatLevel(sets: number, max: number): number {
  if (sets === 0 || max === 0) return 0;
  if (sets >= max) return 4;
  const ratio = sets / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}
