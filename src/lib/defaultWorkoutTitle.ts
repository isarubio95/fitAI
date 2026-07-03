export type WorkoutTimeOfDay = "madrugada" | "manana" | "mediodia" | "tarde" | "noche";

const TITLES: Record<WorkoutTimeOfDay, string> = {
  madrugada: "Entrenamiento de madrugada",
  manana: "Entrenamiento de mañana",
  mediodia: "Entrenamiento al mediodía",
  tarde: "Entrenamiento de tarde",
  noche: "Entrenamiento de noche",
};

/** Franja horaria local (0–23) para el título por defecto del entrenamiento. */
export function workoutTimeOfDay(hour: number): WorkoutTimeOfDay {
  if (hour < 6) return "madrugada";
  if (hour < 12) return "manana";
  if (hour < 15) return "mediodia";
  if (hour < 21) return "tarde";
  return "noche";
}

/** Título sugerido según la hora local en la que se inicia el entrenamiento. */
export function getDefaultWorkoutTitle(at: Date = new Date()): string {
  return TITLES[workoutTimeOfDay(at.getHours())];
}
