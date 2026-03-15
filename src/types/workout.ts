import type { Tables } from "@/integrations/supabase/types";

export type TipoEjercicio = Tables<"tipo_ejercicio">;
export type Actividad = Tables<"actividad">;
export type Ejercicio = Tables<"ejercicio">;
export type Serie = Tables<"serie">;

// Form types for the workout logger
export interface SetFormData {
  repeticiones: number;
  peso_kg: number;
  rir?: number | null;
  descanso?: number; // rest time in seconds
  id?: string;
  completed?: boolean;
}

export interface ExerciseFormData {
  tipo_ejercicio_id: string;
  nombre: string;
  sets: SetFormData[];
  id?: string;
  repRange?: string;
  targetRir?: number | null;
  descanso?: number; // default rest time in seconds for this exercise
  /** Agrupa con el siguiente en la UI como superserie (viene de rutina). */
  superset_id?: string | null;
}

export interface WorkoutFormData {
  titulo: string;
  fecha: string;
  comentarios?: string;
  exercises: ExerciseFormData[];
}

// Extended types with relations
export interface EjercicioWithDetails extends Ejercicio {
  tipo_ejercicio: TipoEjercicio;
  series: Serie[];
}

export interface ActividadWithDetails extends Actividad {
  ejercicios: EjercicioWithDetails[];
}
