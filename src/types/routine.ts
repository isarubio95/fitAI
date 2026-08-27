import type { Tables } from "@/integrations/supabase/types";
import type { RegistroSeries } from "@/types/workout";
import type { TipoSerie } from "@/lib/setTypes";

export type Rutina = Tables<"rutina">;
export type RutinaEjercicio = Tables<"rutina_ejercicio">;
export type RutinaEjercicioSerie = Tables<"rutina_ejercicio_serie">;

export interface RutinaEjercicioWithDetails extends RutinaEjercicio {
  tipo_ejercicio: Tables<"tipo_ejercicio"> | Tables<"usuario_ejercicio">;
  /** Plan por serie; vacío o ausente = ejercicio en modo simple. */
  rutina_ejercicio_serie?: RutinaEjercicioSerie[] | null;
}

export interface RutinaWithDetails extends Rutina {
  ejercicios: RutinaEjercicioWithDetails[];
}

/**
 * Una serie planificada dentro de un ejercicio. Permite pirámides, series de
 * calentamiento y RIR/peso ascendentes dentro del mismo ejercicio.
 */
export interface RoutineSetPlan {
  /** Id de la fila en BD; ausente mientras la serie solo existe en el formulario. */
  id?: string;
  orden: number;
  tipo_serie: TipoSerie;
  repes_min: number | null;
  /** null = rango abierto; se muestra "8+" (típico en amrap). */
  repes_max: number | null;
  rir: number | null;
  peso_objetivo_kg: number | null;
  /** null = hereda el descanso del ejercicio. */
  descanso: number | null;
  duracion_objetivo_seg: number | null;
  ritmo_objetivo_seg_km: number | null;
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
  /**
   * Plan por serie. null = modo simple: los escalares de arriba describen
   * todas las series por igual (comportamiento anterior a esta feature).
   *
   * Cuando no es null los escalares pasan a ser un resumen derivado; se
   * recalculan al guardar con `summarizeSeriesPlan` (src/lib/seriesPlan.ts)
   * para que las vistas que aún los leen (tarjeta de rutina, volumen por
   * grupo muscular, duración estimada) sigan funcionando.
   */
  series_plan: RoutineSetPlan[] | null;
}

export interface RoutineFormData {
  nombre: string;
  descripcion: string;
  ejercicios: RoutineExerciseFormData[];
}

export interface RoutineFormSnapshot {
  nombre: string;
  descripcion: string;
  icono: string;
  ejercicios: RoutineExerciseFormData[];
}
