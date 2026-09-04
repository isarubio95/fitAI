import type { RegistroSeries } from "@/types/workout";

export type OverloadAction = "increase_weight" | "increase_reps" | "maintain" | "deload";

export interface OverloadSetInput {
  peso_kg: number;
  repeticiones: number;
  rir?: number | null;
  /** Los calentamientos no cuentan para la progresión. Ausente = efectiva. */
  tipo_serie?: string | null;
}

export interface OverloadTarget {
  repesMin: number;
  repesMax: number;
  targetRir: number;
}

export interface OverloadSuggestion {
  action: OverloadAction;
  suggestedWeight: number;
  suggestedReps: number;
  confidence: number;
  reason: string;
}

export interface OverloadInput {
  lastSets: OverloadSetInput[];
  target: OverloadTarget;
  /**
   * Modo de registro del ejercicio. En `solo_reps` (saltos, lanzamientos) no
   * hay carga externa que subir: la progresión va siempre por repeticiones.
   * Ausente = `peso_reps`.
   */
  mode?: RegistroSeries;
  /** Fatiga del grupo muscular normalizada 0–1. */
  muscleFatigueNorm?: number;
  /** CTL − ATL (forma). */
  trainingForm?: number;
  /** Incremento de peso en kg (por defecto 2.5). */
  weightIncrement?: number;
}
