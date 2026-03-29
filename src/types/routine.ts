import type { Tables } from "@/integrations/supabase/types";
import type { RegistroSeries } from "@/types/workout";

export type Rutina = Tables<"rutina">;
export type RutinaEjercicio = Tables<"rutina_ejercicio">;

export interface RutinaEjercicioWithDetails extends RutinaEjercicio {
  tipo_ejercicio: Tables<"tipo_ejercicio"> | Tables<"usuario_ejercicio">;
}

export interface RutinaWithDetails extends Rutina {
  ejercicios: RutinaEjercicioWithDetails[];
}

export interface RoutineExerciseFormData {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
  nombre: string;
  series_objetivo: number;
  repes_min: number;
  repes_max: number;
  rir: number;
  orden: number;
  superset_id?: string | null;
  descanso: number; // seconds, default 120
  registro_series: RegistroSeries;
  /** Objetivo por serie en segundos (modo duración / duración+ritmo). */
  duracion_objetivo_seg: number | null;
  /** Objetivo de ritmo en s/km (solo modo duracion_ritmo). */
  ritmo_objetivo_seg_km: number | null;
}

export interface RoutineFormData {
  nombre: string;
  descripcion: string;
  ejercicios: RoutineExerciseFormData[];
}
