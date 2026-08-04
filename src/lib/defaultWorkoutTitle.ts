export type WorkoutTimeOfDay = "madrugada" | "manana" | "mediodia" | "tarde" | "noche";

const TIME_SUFFIX: Record<WorkoutTimeOfDay, string> = {
  madrugada: "de madrugada",
  manana: "de mañana",
  mediodia: "al mediodía",
  tarde: "de tarde",
  noche: "de noche",
};

/** Franja horaria local (0–23) para el título por defecto del entrenamiento. */
export function workoutTimeOfDay(hour: number): WorkoutTimeOfDay {
  if (hour < 6) return "madrugada";
  if (hour < 12) return "manana";
  if (hour < 15) return "mediodia";
  if (hour < 21) return "tarde";
  return "noche";
}

function titleWithTimeOfDay(base: string, at: Date = new Date()): string {
  return `${base} ${TIME_SUFFIX[workoutTimeOfDay(at.getHours())]}`;
}

/** Título sugerido según la hora local en la que se inicia el entrenamiento. */
export function getDefaultWorkoutTitle(at: Date = new Date()): string {
  return titleWithTimeOfDay("Entrenamiento", at);
}

/** Título sugerido para cardio manual según disciplina y franja horaria. */
export function getDefaultCardioTitle(disciplineName?: string | null, at: Date = new Date()): string {
  const base = disciplineName?.trim() || "Cardio";
  return titleWithTimeOfDay(base, at);
}
