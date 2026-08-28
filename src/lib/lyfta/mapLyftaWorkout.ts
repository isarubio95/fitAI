import type { RegistroSeries } from "@/types/workout";
import { serieCountsAsRecorded } from "@/types/workout";
import { DEFAULT_TIPO_SERIE, type TipoSerie } from "@/lib/setTypes";
import type { LyftaExercise, LyftaSet, LyftaWorkout } from "@/lib/lyfta/types";
import { normalizeExerciseName } from "@/lib/matchExerciseByName";

export type MappedLyftaSet = {
  repeticiones: number;
  peso_kg: number;
  duracion_seg: number | null;
  rir: number | null;
  tipo_serie: TipoSerie;
};

export type MappedLyftaExercise = {
  lyftaExerciseId: string | null;
  nombre: string;
  registro_series: RegistroSeries;
  descanso: number | null;
  supersetKey: string | null;
  sets: MappedLyftaSet[];
};

export type MappedLyftaWorkout = {
  origenExternoId: string;
  titulo: string;
  fecha: string;
  fechaFin: string;
  exercises: MappedLyftaExercise[];
};

export type MappedLyftaRoutine = {
  origenExternoId: string;
  nombre: string;
  descripcion: string;
  exercises: MappedLyftaExercise[];
};

function parseNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseRir(value: unknown): number | null {
  const n = parseNumber(value);
  if (n == null) return null;
  return Math.max(0, Math.min(10, Math.round(n)));
}

export function parseLyftaDurationToMs(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber > 0 && !trimmed.includes(":")) {
    return asNumber < 100_000 ? asNumber * 1000 : asNumber;
  }
  const parts = trimmed.split(":").map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p))) return null;
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return ((h * 60 + m) * 60 + s) * 1000;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return (m * 60 + s) * 1000;
  }
  return null;
}

export function parseLyftaDate(raw: string | null | undefined): Date {
  if (!raw?.trim()) return new Date();
  const normalized = raw.trim().replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function exerciseNameOf(ex: LyftaExercise): string {
  return (ex.excercise_name ?? ex.exercise_name ?? ex.name ?? "").trim();
}

export function mapLyftaExerciseType(type: string | null | undefined): RegistroSeries {
  const t = (type ?? "").toLowerCase();
  if (t.includes("duration") || t.includes("duracion") || t === "time") return "duracion";
  return "peso_reps";
}

/**
 * `set_type_id` 0 = normal (docs). El ejemplo de la API contrapone normal vs warmup,
 * así que 1 = calentamiento. 2/3 siguen el enum clásico Strong (dropset / failure→AMRAP)
 * y no cambian volumen: `isWorkingSet` los cuenta. Cualquier otro id (Right, Left,
 * Negative, Partial, …) queda efectiva para no recortar métricas.
 */
export function mapLyftaSetType(raw: string | number | null | undefined): TipoSerie {
  const n = parseNumber(raw);
  if (n === 1) return "calentamiento";
  if (n === 2) return "dropset";
  if (n === 3) return "amrap";
  return DEFAULT_TIPO_SERIE;
}

function mapSet(raw: LyftaSet, mode: RegistroSeries): MappedLyftaSet | null {
  const reps = Math.max(0, Math.round(parseNumber(raw.reps) ?? 0));
  const weight = Math.max(0, parseNumber(raw.weight) ?? 0);
  const durationSec =
    mode === "duracion" ? Math.max(0, Math.round((parseNumber(raw.duration) ?? 0))) : null;
  const mapped: MappedLyftaSet = {
    repeticiones: reps,
    peso_kg: weight,
    duracion_seg: durationSec && durationSec > 0 ? durationSec : null,
    rir: parseRir(raw.rir),
    tipo_serie: mapLyftaSetType(raw.set_type_id),
  };
  if (
    !serieCountsAsRecorded({
      repeticiones: mapped.repeticiones,
      peso_kg: mapped.peso_kg,
      duracion_seg: mapped.duracion_seg,
      completed: raw.is_completed === true,
    })
  ) {
    return null;
  }
  return mapped;
}

export function mapLyftaExercise(ex: LyftaExercise): MappedLyftaExercise | null {
  const nombre = exerciseNameOf(ex);
  if (!nombre) return null;
  const registro_series = mapLyftaExerciseType(ex.exercise_type);
  const rest = parseNumber(ex.exercise_rest_time);
  const supersetRaw = ex.exercise_superset_id;
  const supersetKey =
    supersetRaw != null && String(supersetRaw) !== "" && String(supersetRaw) !== "0"
      ? String(supersetRaw)
      : null;
  const sets = (ex.sets ?? [])
    .map((s) => mapSet(s, registro_series))
    .filter((s): s is MappedLyftaSet => s != null);
  if (!sets.length) return null;
  const rawId = ex.exercise_id;
  return {
    lyftaExerciseId:
      rawId != null && String(rawId) !== "" ? String(rawId) : `name:${normalizeExerciseName(nombre)}`,
    nombre,
    registro_series,
    descanso: rest != null && rest > 0 ? Math.round(rest) : null,
    supersetKey,
    sets,
  };
}

export function mapLyftaWorkout(
  workout: LyftaWorkout,
  durationById?: Map<string, string>,
): MappedLyftaWorkout | null {
  const origenExternoId = workout.id != null ? String(workout.id) : "";
  if (!origenExternoId) return null;

  const exercises = (workout.exercises ?? [])
    .map(mapLyftaExercise)
    .filter((ex): ex is MappedLyftaExercise => ex != null);
  if (!exercises.length) return null;

  const start = parseLyftaDate(workout.workout_perform_date);
  const durationRaw = workout.workout_duration ?? durationById?.get(origenExternoId) ?? null;
  const durationMs = parseLyftaDurationToMs(durationRaw);
  const end = new Date(start.getTime() + (durationMs && durationMs > 0 ? durationMs : 1000));

  return {
    origenExternoId,
    titulo: (workout.title ?? "").trim() || "Entrenamiento",
    fecha: start.toISOString(),
    fechaFin: end.toISOString(),
    exercises,
  };
}

export function remapSupersetKeys(exercises: MappedLyftaExercise[]): MappedLyftaExercise[] {
  const map = new Map<string, string>();
  return exercises.map((ex) => {
    if (!ex.supersetKey) return { ...ex, supersetKey: null };
    let next = map.get(ex.supersetKey);
    if (!next) {
      next = crypto.randomUUID();
      map.set(ex.supersetKey, next);
    }
    return { ...ex, supersetKey: next };
  });
}

export function mapLyftaRoutineFromTemplate(raw: unknown): MappedLyftaRoutine | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const workout = (obj.workout && typeof obj.workout === "object" ? obj.workout : obj) as LyftaWorkout & {
    description?: string | null;
    note?: string | null;
  };
  const id = obj.id ?? workout.id;
  if (id == null) return null;
  const exercises = (workout.exercises ?? [])
    .map(mapLyftaExercise)
    .filter((ex): ex is MappedLyftaExercise => ex != null);
  if (!exercises.length) return null;
  const nombre = (workout.title ?? "").trim() || "Rutina";
  const descripcion = String(workout.description ?? workout.note ?? "").trim();
  return {
    origenExternoId: `template:${id}`,
    nombre,
    descripcion,
    exercises,
  };
}

export function extractLyftaTemplateList(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  const candidates = [obj.data, obj.templates, obj.workouts, obj.collections];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === "object" && Array.isArray((c as { results?: unknown }).results)) {
      return (c as { results: unknown[] }).results;
    }
    if (c && typeof c === "object" && Array.isArray((c as { templates?: unknown }).templates)) {
      return (c as { templates: unknown[] }).templates;
    }
  }
  return [];
}
