import type { Tables } from "@/integrations/supabase/types";
import { DEFAULT_TIPO_SERIE, normalizeTipoSerie, type TipoSerie } from "@/lib/setTypes";

export type TipoEjercicio = Tables<"tipo_ejercicio">;
export type UsuarioEjercicio = Tables<"usuario_ejercicio">;
export type Actividad = Tables<"actividad">;
export type Ejercicio = Tables<"ejercicio">;
export type Serie = Tables<"serie">;

/**
 * Cómo se registra una serie.
 *
 * `solo_reps` es para el trabajo balístico sin carga externa —saltos,
 * lanzamientos, pliometría—: pedir kilos ahí no significa nada y ensucia la
 * sobrecarga progresiva, que en ese modo debe subir repeticiones y no peso.
 */
export type RegistroSeries = "peso_reps" | "solo_reps" | "duracion" | "duracion_ritmo";

export function normalizeRegistroSeries(v: unknown): RegistroSeries {
  if (v === "duracion") return "duracion";
  if (v === "duracion_ritmo") return "duracion_ritmo";
  if (v === "solo_reps") return "solo_reps";
  return "peso_reps";
}

/** Modos que registran carga externa. Solo `peso_reps` pide kilos. */
export function registroUsesWeight(mode: RegistroSeries): boolean {
  return mode === "peso_reps";
}

/** Modos que cuentan repeticiones, con carga o sin ella. */
export function registroUsesReps(mode: RegistroSeries): boolean {
  return mode === "peso_reps" || mode === "solo_reps";
}

/** Modos cronometrados. */
export function registroUsesDuration(mode: RegistroSeries): boolean {
  return mode === "duracion" || mode === "duracion_ritmo";
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
  if (mode === "solo_reps") return !Number(s.repeticiones);
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
  if (mode === "solo_reps") {
    return { repeticiones: last.repeticiones, peso_kg: 0 };
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

/** Series en blanco al añadir un ejercicio de fuerza desde el catálogo. */
export const DEFAULT_STRENGTH_SET_COUNT = 3;

export function initialSetCountForRegistro(mode: RegistroSeries): number {
  return registroUsesReps(mode) ? DEFAULT_STRENGTH_SET_COUNT : 1;
}

export function initialSetsForNewExercise(mode: RegistroSeries): SetFormData[] {
  const blank = defaultSetForMode(mode);
  return Array.from({ length: initialSetCountForRegistro(mode) }, () => ({ ...blank }));
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

/**
 * Objetivos prescritos de la serie, tal como se guardan en BD.
 * Separado de `serieFieldsForRegistro` porque no dependen del modo de registro.
 */
export function serieTargetFields(s: SetFormData): {
  tipo_serie: TipoSerie;
  objetivo_repes_min: number | null;
  objetivo_repes_max: number | null;
  objetivo_rir: number | null;
  objetivo_peso_kg: number | null;
} {
  return {
    tipo_serie: normalizeTipoSerie(s.tipo_serie),
    objetivo_repes_min: s.objetivo_repes_min ?? null,
    objetivo_repes_max: s.objetivo_repes_max ?? null,
    objetivo_rir: s.objetivo_rir ?? null,
    objetivo_peso_kg: s.objetivo_peso_kg ?? null,
  };
}

/** Reconstruye los objetivos de una serie leída de BD (rehidratación / edición). */
export function serieTargetsFromRow(row: {
  tipo_serie?: string | null;
  objetivo_repes_min?: number | null;
  objetivo_repes_max?: number | null;
  objetivo_rir?: number | null;
  objetivo_peso_kg?: number | null;
}): Pick<
  SetFormData,
  "tipo_serie" | "objetivo_repes_min" | "objetivo_repes_max" | "objetivo_rir" | "objetivo_peso_kg"
> {
  return {
    tipo_serie: normalizeTipoSerie(row.tipo_serie ?? DEFAULT_TIPO_SERIE),
    objetivo_repes_min: row.objetivo_repes_min ?? null,
    objetivo_repes_max: row.objetivo_repes_max ?? null,
    objetivo_rir: row.objetivo_rir ?? null,
    objetivo_peso_kg: row.objetivo_peso_kg ?? null,
  };
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
  /** Valores del último entreno o de una sugerencia; no cuentan como serie hecha hasta editar o marcar. */
  seededFromPrevious?: boolean;
  /** Calentamiento / efectiva / dropset / amrap. Solo la efectiva es el caso por defecto. */
  tipo_serie?: TipoSerie;
  /**
   * Objetivo prescrito para ESTA serie (viene del plan de la rutina).
   * Se persiste en `serie` para sobrevivir a la rehidratación de la sesión
   * activa y para que el histórico conserve lo que se prescribió.
   */
  objetivo_repes_min?: number | null;
  objetivo_repes_max?: number | null;
  objetivo_rir?: number | null;
  objetivo_peso_kg?: number | null;
}

export interface ExerciseFormData {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
  nombre: string;
  sets: SetFormData[];
  id?: string;
  /**
   * Identidad estable de la fila en el formulario, solo en cliente. La necesita
   * el reordenado: un ejercicio recién añadido aún no tiene `id`, y usar el
   * índice hace que la fila y sus datos se separen al mover. Ver `sortableUid`.
   */
  uid?: string;
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
