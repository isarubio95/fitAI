import type { Tables } from "@/integrations/supabase/types";

export type Rutina = Tables<"rutina">;
export type RutinaEjercicio = Tables<"rutina_ejercicio">;

export interface RutinaEjercicioWithDetails extends RutinaEjercicio {
  tipo_ejercicio: Tables<"tipo_ejercicio">;
}

export interface RutinaWithDetails extends Rutina {
  ejercicios: RutinaEjercicioWithDetails[];
}

export interface RoutineExerciseFormData {
  tipo_ejercicio_id: string;
  nombre: string;
  series_objetivo: number;
  repes_min: number;
  repes_max: number;
  orden: number;
}

export interface RoutineFormData {
  nombre: string;
  descripcion: string;
  ejercicios: RoutineExerciseFormData[];
}
