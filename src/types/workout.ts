import type { Tables } from "@/integrations/supabase/types";

export type TipoEjercicio = Tables<"tipo_ejercicio">;
export type Actividad = Tables<"actividad">;
export type Ejercicio = Tables<"ejercicio">;
export type Serie = Tables<"serie">;

// Form types for the workout logger
export interface SetFormData {
  repeticiones: number;
  peso_kg: number;
  id?: string;
}

export interface ExerciseFormData {
  tipo_ejercicio_id: string;
  nombre: string;
  sets: SetFormData[];
  id?: string;
  repRange?: string;
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
