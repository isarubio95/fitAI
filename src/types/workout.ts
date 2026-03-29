import type { Tables } from "@/integrations/supabase/types";

export type TipoEjercicio = Tables<"tipo_ejercicio">;
export type UsuarioEjercicio = Tables<"usuario_ejercicio">;
export type Actividad = Tables<"actividad">;
export type Ejercicio = Tables<"ejercicio">;
export type Serie = Tables<"serie">;

export type RegistroSeries = "peso_reps" | "duracion" | "duracion_ritmo";

export function normalizeRegistroSeries(v: unknown): RegistroSeries {
  if (v === "duracion") return "duracion";
  if (v === "duracion_ritmo") return "duracion_ritmo";
  return "peso_reps";
}

/** Ritmo en segundos/km → etiqueta tipo 5:00/km */
export function formatRitmoSegKmLabel(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(Number(sec)) || Number(sec) <= 0) return "—";
  const n = Math.round(Number(sec));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

/** Serie con algún dato de trabajo (reps, peso, segundos o ritmo). */
export function setHasWork(s: {
  repeticiones?: number;
  peso_kg?: number;
  duracion_seg?: number | null;
  ritmo_seg_km?: number | null;
}): boolean {
  return (
    Number(s.repeticiones) > 0 ||
    Number(s.peso_kg) > 0 ||
    Number(s.duracion_seg ?? 0) > 0 ||
    Number(s.ritmo_seg_km ?? 0) > 0
  );
}

export function defaultSetForMode(
  mode: RegistroSeries,
  duracionObjetivoSeg?: number | null,
  ritmoObjetivoSegKm?: number | null
): SetFormData {
  if (mode === "duracion") {
    return { repeticiones: 0, peso_kg: 0, duracion_seg: duracionObjetivoSeg ?? 0, ritmo_seg_km: null };
  }
  if (mode === "duracion_ritmo") {
    return {
      repeticiones: 0,
      peso_kg: 0,
      duracion_seg: duracionObjetivoSeg ?? 0,
      ritmo_seg_km: ritmoObjetivoSegKm ?? null,
    };
  }
  return { repeticiones: 0, peso_kg: 0, duracion_seg: null, ritmo_seg_km: null };
}

/** Campos de serie en BD según modo (evita dejar ritmo en modo solo duración). */
export function serieFieldsForRegistro(mode: RegistroSeries, s: SetFormData): {
  duracion_seg: number | null;
  ritmo_seg_km: number | null;
} {
  if (mode === "duracion") {
    return { duracion_seg: s.duracion_seg ?? null, ritmo_seg_km: null };
  }
  if (mode === "duracion_ritmo") {
    return {
      duracion_seg: s.duracion_seg ?? null,
      ritmo_seg_km: s.ritmo_seg_km ?? null,
    };
  }
  return { duracion_seg: null, ritmo_seg_km: null };
}

// Form types for the workout logger
export interface SetFormData {
  repeticiones: number;
  peso_kg: number;
  duracion_seg?: number | null;
  /** Segundos por km (ej. 300 = 5:00/km). */
  ritmo_seg_km?: number | null;
  rir?: number | null;
  descanso?: number; // rest time in seconds
  id?: string;
  completed?: boolean;
}

export interface ExerciseFormData {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
  nombre: string;
  sets: SetFormData[];
  id?: string;
  /** Copiado del catálogo o rutina al crear la fila de ejercicio en sesión. */
  registro_series?: RegistroSeries;
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
  // Unificado: viene de tipo_ejercicio o usuario_ejercicio
  tipo_ejercicio: TipoEjercicio | UsuarioEjercicio;
  series: Serie[];
}

export interface ActividadWithDetails extends Actividad {
  ejercicios: EjercicioWithDetails[];
}
