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

/** Serie con algún dato de trabajo: reps (también peso corporal a 0 kg), carga externa, duración o ritmo. */
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

/** Serie con datos o marcada como completada (persistida en sesión activa). */
export function serieCountsAsRecorded(s: {
  completed?: boolean;
  /** Precarga del último entreno: visible en inputs, aún no registrada. */
  seededFromPrevious?: boolean;
  repeticiones?: number;
  peso_kg?: number;
  duracion_seg?: number | null;
  ritmo_seg_km?: number | null;
}): boolean {
  if (s.seededFromPrevious && !s.completed) return false;
  return !!s.completed || setHasWork(s);
}

export function countRecordedSets(
  exercises: Array<{
    sets: Array<Parameters<typeof setHasWork>[0] & { seededFromPrevious?: boolean }>;
  }>,
): number {
  return exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => !s.seededFromPrevious && setHasWork(s)).length,
    0,
  );
}

export type LastSetLike = {
  peso_kg: number;
  repeticiones: number;
  duracion_seg?: number | null;
  ritmo_seg_km?: number | null;
};

/** Serie vacía de la sesión actual, candidata a precargar el último registro. */
export function setIsUnlogged(s: SetFormData, mode: RegistroSeries): boolean {
  if (s.completed || s.seededFromPrevious) return false;
  if (mode === "duracion") return !(Number(s.duracion_seg) > 0);
  if (mode === "duracion_ritmo") {
    return !(Number(s.duracion_seg) > 0) && !(Number(s.ritmo_seg_km) > 0);
  }
  return !Number(s.repeticiones) && !Number(s.peso_kg);
}

/** Serie que puede recibir la sugerencia de sobrecarga (vacía o precargada, no completada). */
export function setCanApplyOverloadPatch(s: SetFormData, mode: RegistroSeries): boolean {
  if (s.completed) return false;
  if (s.seededFromPrevious) return true;
  return setIsUnlogged(s, mode);
}

export function formPatchFromLastSet(mode: RegistroSeries, last: LastSetLike): Partial<SetFormData> {
  if (mode === "duracion") {
    return { duracion_seg: last.duracion_seg ?? 0 };
  }
  if (mode === "duracion_ritmo") {
    return {
      duracion_seg: last.duracion_seg ?? 0,
      ritmo_seg_km: last.ritmo_seg_km ?? null,
    };
  }
  return {
    repeticiones: last.repeticiones,
    peso_kg: last.peso_kg,
  };
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
  /** Valores copiados del último entreno; no cuentan como serie registrada hasta editar o marcar hecha. */
  seededFromPrevious?: boolean;
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
  /** Grupo muscular principal (catálogo); usado para fatiga y sobrecarga progresiva. */
  grupo_muscular?: string | null;
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
