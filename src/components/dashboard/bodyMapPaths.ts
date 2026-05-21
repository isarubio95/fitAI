export { type BodyMapZone } from "./bodyMapZones";

export type MuscleLoadLevel = "none" | "light" | "moderate" | "high";

export const LOAD_COLORS: Record<MuscleLoadLevel, string> = {
  none: "hsl(var(--muted))",
  light: "hsl(var(--primary) / 0.3)",
  moderate: "hsl(var(--primary) / 0.55)",
  high: "hsl(var(--primary) / 0.9)",
};

/** Separación entre músculos (como en mapas de referencia) */
export const MUSCLE_STROKE = "#fafafa";

export function heatLevelToLoad(level: number): MuscleLoadLevel {
  if (level <= 0) return "none";
  if (level === 1) return "light";
  if (level === 2) return "moderate";
  return "high";
}
