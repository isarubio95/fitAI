export type PremiumGoal =
  | "fuerza"
  | "hipertrofia"
  | "perdida_grasa"
  | "resistencia"
  | "salud_general";

export type PremiumLevel = "principiante" | "intermedio" | "avanzado";
export type PremiumSex = "hombre" | "mujer" | "otro";

export interface PremiumRoutineFormData {
  userId?: string;
  age: number;
  sex: PremiumSex;
  heightCm: number;
  weightKg: number;
  trainingDaysPerWeek: number;
  sessionDurationMinutes: number;
  selectedDays: number[];
  targetSport?: string;
  goal: PremiumGoal;
  level: PremiumLevel;
  availableEquipment?: string;
  injuriesOrLimits?: string;
}

export interface GeneratedExerciseItem {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  rir: number;
}

export interface GeneratedWeeklyRoutine {
  dayOfWeek: number;
  routineTitle: string;
  focus: string;
  durationMinutes: number;
  notes: string;
  exercises: GeneratedExerciseItem[];
}

export interface GeneratedRoadmapWeek {
  week: number;
  goal: string;
  intensity: string;
  notes: string;
}

export interface GeneratedTrainingPlan {
  summary: string;
  roadmap: GeneratedRoadmapWeek[];
  weeklyStructure: GeneratedWeeklyRoutine[];
  recommendations: string[];
  generatedAt: string;
}
