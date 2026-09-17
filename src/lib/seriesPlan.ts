import type {
  RoutineExerciseFormData,
  RoutineSetPlan,
  RutinaEjercicioSerie,
} from "@/types/routine";
import type { ExerciseFormData, RegistroSeries, SetFormData } from "@/types/workout";
import {
  defaultSetForMode,
  formatRitmoSegKmLabel,
  normalizeRegistroSeries,
  registroUsesWeight,
} from "@/types/workout";
import { DEFAULT_TIPO_SERIE, normalizeTipoSerie, type TipoSerie } from "@/lib/setTypes";

/**
 * Plan de series de un ejercicio de rutina.
 *
 * Un ejercicio puede planificarse de dos formas:
 *  - simple: `series_plan === null`, los escalares de rutina_ejercicio
 *    (series_objetivo / repes_min / repes_max / rir / descanso) describen todas
 *    las series por igual. Es el comportamiento histórico.
 *  - por serie: `series_plan` tiene una entrada por serie, permitiendo
 *    pirámides, calentamientos y RIR/peso ascendentes.
 *
 * Los escalares se conservan en ambos casos como resumen derivado
 * (`summarizeSeriesPlan`), porque varias vistas y cálculos los siguen leyendo:
 * SortableRoutineCard, muscleMapping, estimateRoutineDuration.
 */

// ---------------------------------------------------------------------------
// Formato de rangos
// ---------------------------------------------------------------------------

/** "8-12" | "8+" (rango abierto) | "10" (valor único) | "—". */
export function formatRepTarget(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const lo = min != null && Number.isFinite(min) && min > 0 ? Math.round(min) : null;
  const hi = max != null && Number.isFinite(max) && max > 0 ? Math.round(max) : null;
  if (lo == null && hi == null) return "—";
  if (lo == null) return String(hi);
  if (hi == null) return `${lo}+`;
  if (hi <= lo) return String(lo);
  return `${lo}-${hi}`;
}

/**
 * Inversa de `formatRepTarget`. Acepta "8-12", "8+", "10".
 * Sustituye a las dos copias de `parseRepRange` que vivían en
 * progressiveOverload/calculateIncrement.ts y workoutToRoutine.ts, que solo
 * entendían el guion y devolvían null en los demás casos.
 */
export function parseRepTarget(
  value: string | null | undefined,
): { min: number; max: number | null } | null {
  if (!value) return null;
  const range = value.match(/(\d+)\s*-\s*(\d+)/);
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min: Math.max(1, min), max: Math.max(min, max) };
  }
  const open = value.match(/(\d+)\s*\+/);
  if (open) {
    const min = Number(open[1]);
    return Number.isFinite(min) ? { min: Math.max(1, min), max: null } : null;
  }
  const single = value.match(/^\s*(\d+)\s*$/);
  if (single) {
    const min = Number(single[1]);
    return Number.isFinite(min) ? { min: Math.max(1, min), max: Math.max(1, min) } : null;
  }
  return null;
}

/** Etiqueta de objetivo de una serie, según el modo de registro del ejercicio. */
export function formatSetTargetLabel(
  mode: RegistroSeries,
  plan: Pick<
    RoutineSetPlan,
    "repes_min" | "repes_max" | "duracion_objetivo_seg" | "ritmo_objetivo_seg_km"
  >,
): string {
  if (mode === "duracion_ritmo") {
    const dur = plan.duracion_objetivo_seg;
    return `${dur != null ? `${dur}s` : "Tiempo"} · ${formatRitmoSegKmLabel(plan.ritmo_objetivo_seg_km ?? null)}`;
  }
  if (mode === "duracion") {
    return plan.duracion_objetivo_seg != null ? `${plan.duracion_objetivo_seg} s` : "Tiempo";
  }
  return formatRepTarget(plan.repes_min, plan.repes_max);
}

// ---------------------------------------------------------------------------
// Construcción y resumen del plan
// ---------------------------------------------------------------------------

/** Filas de BD → plan del formulario, ordenado. */
export function planFromRows(
  rows: RutinaEjercicioSerie[] | null | undefined,
): RoutineSetPlan[] | null {
  if (!rows?.length) return null;
  return [...rows]
    .sort((a, b) => a.orden - b.orden)
    .map((row, index) => ({
      id: row.id,
      orden: index,
      tipo_serie: normalizeTipoSerie(row.tipo_serie),
      repes_min: row.repes_min,
      repes_max: row.repes_max,
      rir: row.rir,
      peso_objetivo_kg: row.peso_objetivo_kg,
      descanso: row.descanso,
      duracion_objetivo_seg: row.duracion_objetivo_seg,
      ritmo_objetivo_seg_km: row.ritmo_objetivo_seg_km,
    }));
}

type ExerciseScalars = Pick<
  RoutineExerciseFormData,
  | "series_objetivo"
  | "repes_min"
  | "repes_max"
  | "rir"
  | "descanso"
  | "duracion_objetivo_seg"
  | "ritmo_objetivo_seg_km"
>;

/** Una serie del plan con los valores escalares del ejercicio. */
export function blankSetPlan(ej: ExerciseScalars, orden: number): RoutineSetPlan {
  return {
    orden,
    tipo_serie: DEFAULT_TIPO_SERIE,
    repes_min: ej.repes_min,
    repes_max: ej.repes_max,
    rir: ej.rir,
    peso_objetivo_kg: null,
    descanso: null,
    duracion_objetivo_seg: ej.duracion_objetivo_seg,
    ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km,
  };
}

/**
 * Materializa el modo simple en N series idénticas.
 * Es el punto de entrada al modo avanzado: el usuario ve exactamente lo que ya
 * tenía y a partir de ahí edita fila a fila.
 */
export function buildSimplePlan(ej: ExerciseScalars): RoutineSetPlan[] {
  const count = Math.max(1, Math.round(ej.series_objetivo) || 1);
  return Array.from({ length: count }, (_, i) => blankSetPlan(ej, i));
}

/**
 * Recalcula los escalares de rutina_ejercicio a partir del plan.
 * Debe llamarse antes de persistir el ejercicio para que el resumen no quede
 * desincronizado con las filas hijas.
 *
 * El RIR resumen es el MÍNIMO del plan (la serie más exigente): es el que
 * define el carácter del ejercicio y el que espera la sobrecarga progresiva.
 */
export function summarizeSeriesPlan(
  plan: RoutineSetPlan[],
  fallback: ExerciseScalars,
): ExerciseScalars {
  if (!plan.length) return { ...fallback };

  const working = plan.filter((s) => s.tipo_serie !== "calentamiento");
  const relevant = working.length ? working : plan;

  const mins = relevant.map((s) => s.repes_min).filter((v): v is number => v != null && v > 0);
  const maxs = relevant.map((s) => s.repes_max).filter((v): v is number => v != null && v > 0);
  const rirs = relevant.map((s) => s.rir).filter((v): v is number => v != null);
  const descansos = plan.map((s) => s.descanso).filter((v): v is number => v != null && v >= 0);
  const duraciones = relevant
    .map((s) => s.duracion_objetivo_seg)
    .filter((v): v is number => v != null && v > 0);
  const ritmos = relevant
    .map((s) => s.ritmo_objetivo_seg_km)
    .filter((v): v is number => v != null && v > 0);

  const repes_min = mins.length ? Math.min(...mins) : fallback.repes_min;
  // Un rango abierto (repes_max null) no acota por arriba: si NINGUNA serie
  // tiene techo, el resumen se queda en el mínimo en vez de inventar uno.
  const repes_max = maxs.length
    ? Math.max(...maxs, repes_min)
    : mins.length
      ? repes_min
      : fallback.repes_max;

  return {
    series_objetivo: plan.length,
    repes_min,
    repes_max,
    rir: rirs.length ? Math.min(...rirs) : fallback.rir,
    descanso: descansos.length
      ? Math.round(descansos.reduce((a, b) => a + b, 0) / descansos.length)
      : fallback.descanso,
    duracion_objetivo_seg: duraciones.length
      ? Math.round(duraciones.reduce((a, b) => a + b, 0) / duraciones.length)
      : fallback.duracion_objetivo_seg,
    ritmo_objetivo_seg_km: ritmos.length
      ? Math.round(ritmos.reduce((a, b) => a + b, 0) / ritmos.length)
      : fallback.ritmo_objetivo_seg_km,
  };
}

/** Reindexa `orden` tras insertar, borrar o reordenar series. */
export function reindexPlan(plan: RoutineSetPlan[]): RoutineSetPlan[] {
  return plan.map((s, i) => (s.orden === i ? s : { ...s, orden: i }));
}

/** Aplica el plan al ejercicio manteniendo el resumen sincronizado. */
export function withSeriesPlan(
  ej: RoutineExerciseFormData,
  plan: RoutineSetPlan[] | null,
): RoutineExerciseFormData {
  if (!plan?.length) {
    return { ...ej, series_plan: null };
  }
  const indexed = reindexPlan(plan);
  return { ...ej, ...summarizeSeriesPlan(indexed, ej), series_plan: indexed };
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export type PlanPresetKey =
  | "recta"
  | "piramidal_asc"
  | "piramidal_desc"
  | "con_calentamiento"
  | "dropset_final"
  | "potencia";

export interface PlanPreset {
  key: PlanPresetKey;
  label: string;
  description: string;
  /** Recibe el plan actual (o el simple materializado) y devuelve el nuevo. */
  build: (current: RoutineSetPlan[], ej: ExerciseScalars) => RoutineSetPlan[];
}

/** Escalón de reps entre series de una pirámide. */
const PYRAMID_STEP = 2;

/**
 * Trabajo de potencia y pliometría: series cortas, lejos del fallo y con
 * descanso largo.
 *
 * La pliometría se entrena por calidad de contacto, no por fatiga: en cuanto el
 * salto pierde altura o el apoyo se alarga, la serie ya no entrena lo que
 * pretende. De ahí las 3-5 repeticiones, el RIR alto y los 3 minutos.
 */
const POWER_REPS_MIN = 3;
const POWER_REPS_MAX = 5;
const POWER_RIR = 5;
const POWER_REST_SEC = 180;

/**
 * Reps mínimas de una serie generada por un preset.
 *
 * En el editor manual el usuario ve el resultado y lo corrige; al aplicar una
 * variante a una rutina entera (ver `buildVariantPlan`) nadie lo revisa, y el
 * `Math.max(1, …)` por campo degeneraba: 5 series desde 6-8 daban mins
 * [6,4,2,1,1]. Por debajo de este suelo la serie ya no entrena lo que la rutina
 * pretendía.
 */
export const MIN_PYRAMID_REPS = 4;

/**
 * Desplaza el rango de una serie conservando su anchura.
 *
 * El suelo actúa sobre el mínimo y el máximo se mueve LO MISMO que se haya
 * podido mover el mínimo, no `delta` a secas: así un rango estrecho no se
 * invierte (`repes_max < repes_min`) al toparse con el suelo.
 * Un ejercicio que ya prescribe menos reps que el suelo se respeta tal cual.
 */
function shiftReps(plan: RoutineSetPlan, delta: number): RoutineSetPlan {
  if (plan.repes_min == null) {
    return {
      ...plan,
      repes_max: plan.repes_max != null ? Math.max(1, plan.repes_max + delta) : null,
    };
  }
  const floor = Math.min(MIN_PYRAMID_REPS, plan.repes_min);
  const min = Math.max(floor, plan.repes_min + delta);
  const applied = min - plan.repes_min;
  return {
    ...plan,
    repes_min: min,
    repes_max: plan.repes_max != null ? Math.max(min, plan.repes_max + applied) : null,
  };
}

/** Series efectivas del plan, sin calentamientos: la base sobre la que operan los presets. */
function workingOf(plan: RoutineSetPlan[]): RoutineSetPlan[] {
  return plan.filter((s) => s.tipo_serie !== "calentamiento");
}

export const PLAN_PRESETS: readonly PlanPreset[] = [
  {
    key: "recta",
    label: "Recta",
    description: "Todas las series con el mismo objetivo",
    build: (current, ej) => {
      const base = workingOf(current)[0] ?? blankSetPlan(ej, 0);
      return current.map((s, i) => ({
        ...base,
        id: s.id,
        orden: i,
        tipo_serie: s.tipo_serie,
      }));
    },
  },
  {
    key: "piramidal_desc",
    label: "Pirámide ↓",
    description: "Menos reps y más RIR exigente en cada serie (12 → 10 → 8)",
    build: (current) => {
      let step = 0;
      return current.map((s, i) => {
        if (s.tipo_serie === "calentamiento") return { ...s, orden: i };
        const delta = -PYRAMID_STEP * step;
        const rir = s.rir != null ? Math.max(0, s.rir - step) : null;
        step += 1;
        return { ...shiftReps(s, delta), rir, orden: i };
      });
    },
  },
  {
    key: "piramidal_asc",
    label: "Pirámide ↑",
    description: "Empieza pesado y sube reps al bajar la carga (8 → 10 → 12)",
    build: (current) => {
      const working = workingOf(current);
      let step = working.length - 1;
      return current.map((s, i) => {
        if (s.tipo_serie === "calentamiento") return { ...s, orden: i };
        const delta = -PYRAMID_STEP * step;
        const rir = s.rir != null ? Math.max(0, s.rir - step) : null;
        step -= 1;
        return { ...shiftReps(s, delta), rir, orden: i };
      });
    },
  },
  {
    key: "con_calentamiento",
    label: "+ Calentamiento",
    description: "Añade una serie de aproximación que no cuenta como volumen",
    build: (current, ej) => {
      if (current.some((s) => s.tipo_serie === "calentamiento")) return current;
      const first = workingOf(current)[0] ?? blankSetPlan(ej, 0);
      const warmup: RoutineSetPlan = {
        ...first,
        id: undefined,
        orden: 0,
        tipo_serie: "calentamiento",
        repes_min: first.repes_min != null ? first.repes_min + 4 : null,
        repes_max: first.repes_max != null ? first.repes_max + 4 : null,
        rir: 4,
        peso_objetivo_kg:
          first.peso_objetivo_kg != null
            ? Math.round(first.peso_objetivo_kg * 0.5 * 2) / 2
            : null,
      };
      return reindexPlan([warmup, ...current]);
    },
  },
  {
    key: "potencia",
    label: "Potencia",
    description: "Series cortas, lejos del fallo y con descanso largo (pliometría)",
    build: (current, ej) => {
      const base = workingOf(current)[0] ?? blankSetPlan(ej, 0);
      return current.map((s, i) => ({
        ...base,
        id: s.id,
        orden: i,
        tipo_serie: s.tipo_serie,
        repes_min: POWER_REPS_MIN,
        repes_max: POWER_REPS_MAX,
        rir: POWER_RIR,
        // El dropset vive de encadenar sin descanso: no le impongas el largo.
        descanso: s.tipo_serie === "dropset" ? s.descanso : POWER_REST_SEC,
      }));
    },
  },
  {
    key: "dropset_final",
    label: "Dropset final",
    description: "Encadena una bajada de peso sin descanso al terminar",
    build: (current, ej) => {
      const working = workingOf(current);
      const last = working.length ? working[working.length - 1] : blankSetPlan(ej, 0);
      const drop: RoutineSetPlan = {
        ...last,
        id: undefined,
        orden: current.length,
        tipo_serie: "dropset",
        rir: 0,
        descanso: 0,
        peso_objetivo_kg:
          last.peso_objetivo_kg != null
            ? Math.round(last.peso_objetivo_kg * 0.7 * 2) / 2
            : null,
      };
      return reindexPlan([...current, drop]);
    },
  },
] as const;

export function applyPlanPreset(
  key: PlanPresetKey,
  current: RoutineSetPlan[],
  ej: ExerciseScalars,
): RoutineSetPlan[] {
  const preset = PLAN_PRESETS.find((p) => p.key === key);
  if (!preset) return current;
  return reindexPlan(preset.build(current.length ? current : buildSimplePlan(ej), ej));
}

// ---------------------------------------------------------------------------
// Rutina → sesión
// ---------------------------------------------------------------------------

/**
 * Forma mínima de un ejercicio de rutina venido de Supabase. Cubre tanto
 * `RutinaWithDetails` (Routines.tsx) como la proyección de rutina programada
 * (Dashboard.tsx), que resuelven el nombre por distinta vía.
 */
export interface RoutineExerciseLike {
  tipo_ejercicio_id?: string | null;
  usuario_ejercicio_id?: string | null;
  tipo_ejercicio?: { nombre?: string | null; grupo_muscular?: string | null } | null;
  usuario_ejercicio?: { nombre?: string | null; grupo_muscular?: string | null } | null;
  repes_min: number;
  repes_max: number;
  rir?: number | null;
  descanso?: number | null;
  superset_id?: string | null;
  series_objetivo: number;
  orden?: number | null;
  registro_series?: string | null;
  duracion_objetivo_seg?: number | null;
  ritmo_objetivo_seg_km?: number | null;
  rutina_ejercicio_serie?: RutinaEjercicioSerie[] | null;
}

const DEFAULT_REST_SEC = 120;
const DEFAULT_TARGET_RIR = 1;

/**
 * Expande un ejercicio de rutina a las series en blanco de la sesión.
 * Cada serie arrastra su propio objetivo para que el logger pueda mostrarlo y
 * para que sobreviva a la rehidratación.
 */
export function expandExerciseToSets(ej: RoutineExerciseLike): SetFormData[] {
  const mode = normalizeRegistroSeries(ej.registro_series);
  const plan = planFromRows(ej.rutina_ejercicio_serie);

  if (!plan) {
    // Modo simple: N series idénticas con el objetivo del ejercicio.
    const count = Math.max(1, Math.round(ej.series_objetivo) || 1);
    return Array.from({ length: count }, () => ({
      ...defaultSetForMode(mode, ej.duracion_objetivo_seg ?? null, ej.ritmo_objetivo_seg_km ?? null),
      tipo_serie: DEFAULT_TIPO_SERIE,
      objetivo_repes_min: ej.repes_min,
      objetivo_repes_max: ej.repes_max,
      objetivo_rir: ej.rir ?? DEFAULT_TARGET_RIR,
      objetivo_peso_kg: null,
    }));
  }

  return plan.map((s) => ({
    ...defaultSetForMode(
      mode,
      s.duracion_objetivo_seg ?? ej.duracion_objetivo_seg ?? null,
      s.ritmo_objetivo_seg_km ?? ej.ritmo_objetivo_seg_km ?? null,
    ),
    descanso: s.descanso ?? undefined,
    tipo_serie: s.tipo_serie,
    objetivo_repes_min: s.repes_min,
    objetivo_repes_max: s.repes_max,
    objetivo_rir: s.rir,
    objetivo_peso_kg: s.peso_objetivo_kg,
  }));
}

/**
 * Ejercicio de rutina → ejercicio de sesión.
 * Punto único: antes esta lógica estaba duplicada en Routines.tsx y Dashboard.tsx.
 */
export function routineExerciseToFormData(ej: RoutineExerciseLike): ExerciseFormData {
  const mode = normalizeRegistroSeries(ej.registro_series);
  const nombre = ej.tipo_ejercicio?.nombre ?? ej.usuario_ejercicio?.nombre ?? "";

  return {
    tipo_ejercicio_id: ej.tipo_ejercicio_id ?? undefined,
    usuario_ejercicio_id: ej.usuario_ejercicio_id ?? undefined,
    nombre,
    registro_series: mode,
    repRange: formatSetTargetLabel(mode, {
      repes_min: ej.repes_min,
      repes_max: ej.repes_max,
      duracion_objetivo_seg: ej.duracion_objetivo_seg ?? null,
      ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km ?? null,
    }),
    targetRir: ej.rir ?? DEFAULT_TARGET_RIR,
    grupo_muscular:
      ej.tipo_ejercicio?.grupo_muscular ?? ej.usuario_ejercicio?.grupo_muscular ?? null,
    descanso: ej.descanso ?? DEFAULT_REST_SEC,
    superset_id: ej.superset_id ?? null,
    sets: expandExerciseToSets(ej),
  };
}

export function routineExercisesToFormData(
  ejercicios: readonly RoutineExerciseLike[] | null | undefined,
): ExerciseFormData[] {
  return [...(ejercicios ?? [])]
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(routineExerciseToFormData);
}

/** Descanso efectivo de una serie: el suyo si lo tiene, si no el del ejercicio. */
export function restForSet(
  set: Pick<SetFormData, "descanso">,
  exerciseRest: number | null | undefined,
): number {
  if (set.descanso != null && Number.isFinite(set.descanso)) return set.descanso;
  return exerciseRest ?? DEFAULT_REST_SEC;
}

// ---------------------------------------------------------------------------
// Variantes de rutina
//
// El catálogo de plantillas está escrito en modo plano (mismo rango en todas
// las series). En vez de triplicarlo en base de datos, la variante piramidal se
// materializa al CLONAR la plantilla: se reutilizan los presets de arriba para
// generar `rutina_ejercicio_serie` en la copia del usuario.
// ---------------------------------------------------------------------------

/** Formato de series que el usuario elige al añadir una rutina predefinida. */
export type RoutineVariant = "recta" | "piramidal_desc" | "piramidal_asc";

export interface RoutineVariantOption {
  key: RoutineVariant;
  label: string;
  /** Una línea en cristiano: el usuario puede no saber qué es una pirámide. */
  description: string;
  /** Sufijo del nombre de la copia, para distinguirla en "Mis rutinas". */
  suffix: string;
}

export const ROUTINE_VARIANTS: readonly RoutineVariantOption[] = [
  {
    key: "recta",
    label: "Normal",
    description: "Todas las series con el mismo rango de repeticiones",
    suffix: "",
  },
  {
    key: "piramidal_desc",
    label: "Piramidal",
    description: "Bajan las repeticiones en cada serie para poder subir el peso",
    suffix: " (Pirámide ↓)",
  },
  {
    key: "piramidal_asc",
    label: "Piramidal inversa",
    description: "Empiezas por la serie más pesada y ganas repeticiones al bajar carga",
    suffix: " (Pirámide ↑)",
  },
] as const;

export function variantSuffix(variant: RoutineVariant): string {
  return ROUTINE_VARIANTS.find((v) => v.key === variant)?.suffix ?? "";
}

/**
 * Forma mínima de un ejercicio para decidir su variante. La cumple tanto la
 * fila de `rutina_ejercicio` como el proyectado de la plantilla.
 */
export interface VariantSourceExercise {
  series_objetivo: number;
  repes_min: number | null;
  repes_max: number | null;
  rir?: number | null;
  descanso?: number | null;
  registro_series?: string | null;
  duracion_objetivo_seg?: number | null;
  ritmo_objetivo_seg_km?: number | null;
}

/**
 * Si tiene sentido piramidar este ejercicio.
 *
 * Una pirámide es un intercambio entre repeticiones y carga, así que solo
 * aplica donde hay carga externa que mover:
 *  - `duracion` / `duracion_ritmo` no cuentan repeticiones que desplazar.
 *  - `solo_reps` es trabajo balístico SIN carga externa (saltos, pliometría):
 *    bajar repeticiones ahí es perder volumen a cambio de nada. Ese trabajo ya
 *    tiene su propio preset, `potencia`.
 * Y hace falta margen real: con una sola serie, o partiendo ya del suelo de
 * repeticiones, la "pirámide" saldría plana y solo añadiría filas hijas que el
 * usuario tendría que entender para nada.
 */
export function supportsVariant(ej: VariantSourceExercise): boolean {
  if (!registroUsesWeight(normalizeRegistroSeries(ej.registro_series))) return false;
  if (!(Math.round(ej.series_objetivo) > 1)) return false;
  if (ej.repes_min == null || ej.repes_min <= MIN_PYRAMID_REPS) return false;
  if (ej.repes_max != null && ej.repes_max < ej.repes_min) return false;
  return true;
}

/**
 * Plan por serie para la variante elegida, o `null` para clonar el ejercicio
 * tal cual (modo simple, comportamiento histórico).
 *
 * `existingPlan` es lo que la plantilla ya prescribía: si trae algo, se respeta
 * sin tocar. Esas filas son una decisión deliberada de su autor (calentamiento,
 * dropset, AMRAP) y aplicarles una pirámide encima reescribiría la intención en
 * silencio, además de desplazar cada serie respecto a su propio valor.
 */
export function buildVariantPlan(
  ej: VariantSourceExercise,
  existingPlan: RoutineSetPlan[] | null,
  variant: RoutineVariant,
): RoutineSetPlan[] | null {
  if (existingPlan?.length) return existingPlan;
  if (variant === "recta" || !supportsVariant(ej)) return null;

  const scalars: ExerciseScalars = {
    series_objetivo: ej.series_objetivo,
    repes_min: ej.repes_min!,
    repes_max: ej.repes_max ?? ej.repes_min!,
    rir: ej.rir ?? DEFAULT_TARGET_RIR,
    descanso: ej.descanso ?? DEFAULT_REST_SEC,
    duracion_objetivo_seg: ej.duracion_objetivo_seg ?? null,
    ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km ?? null,
  };
  return applyPlanPreset(variant, buildSimplePlan(scalars), scalars);
}

export type { TipoSerie };
