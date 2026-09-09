import { estimateSetProgress, type ExerciseProgressMetric } from "@/hooks/useExerciseProgress";
import { isWorkingSet, normalizeTipoSerie, type TipoSerie } from "@/lib/setTypes";

/** Fila cruda del RPC `get_exercise_set_history`, ya normalizada a camelCase. */
export interface ExerciseHistorySet {
  day: string;
  actividadId: string;
  actividadTitulo: string | null;
  numeroSerie: number;
  pesoKg: number;
  repeticiones: number;
  tipoSerie: TipoSerie;
  rir: number | null;
  duracionSeg: number | null;
}

/** Qué mide la barra. `1rm` es fuerza pico; `volume`, trabajo total. */
export type ExerciseScoreMetric = "1rm" | "volume";

export type ExerciseHistoryOrder = "date" | "score";

export interface ExerciseHistoryDay {
  day: string;
  actividadId: string;
  actividadTitulo: string | null;
  /** Todas las series de ese día, calentamientos incluidos, en orden de registro. */
  sets: ExerciseHistorySet[];
  /** Cuántas de esas series cuentan como trabajo real. */
  workingSets: number;
  /** Mejor serie efectiva del día: 1RM Epley con carga, o máx. reps a peso corporal. */
  best: { value: number; pesoKg: number; repeticiones: number } | null;
  /**
   * Trabajo total del día. Σ peso×reps de las series efectivas; en ejercicios a
   * peso corporal, donde ese producto siempre daría 0, es la suma de reps.
   */
  volume: number;
}

export const EXERCISE_HISTORY_PERIODS = [
  { key: "1m", months: 1, label: "1 mes" },
  { key: "3m", months: 3, label: "3 meses" },
  { key: "6m", months: 6, label: "6 meses" },
  { key: "12m", months: 12, label: "12 meses" },
] as const;

export type ExerciseHistoryPeriodKey = (typeof EXERCISE_HISTORY_PERIODS)[number]["key"];

export const DEFAULT_EXERCISE_HISTORY_PERIOD: ExerciseHistoryPeriodKey = "3m";

export function monthsForPeriod(key: ExerciseHistoryPeriodKey): number {
  return EXERCISE_HISTORY_PERIODS.find((p) => p.key === key)?.months ?? 12;
}

/**
 * Serie con algo registrado.
 *
 * El logger crea las filas vacías por adelantado, así que una sesión que se
 * abrió y no se llegó a rellenar deja series a 0. Contarlas dejaría barras a
 * cero en el histórico.
 */
function setHasData(set: ExerciseHistorySet): boolean {
  return set.repeticiones > 0 || (set.duracionSeg ?? 0) > 0;
}

/**
 * `reps` si en todo el historial efectivo no hay una sola serie con carga.
 *
 * Se decide con el historial completo, no día a día: si la unidad cambiara de
 * una barra a otra, la lista dejaría de ser comparable, que es justo lo que
 * viene a resolver esta pantalla.
 */
export function deriveScoreUnit(sets: readonly ExerciseHistorySet[]): ExerciseProgressMetric {
  const working = sets.filter((s) => isWorkingSet(s.tipoSerie) && setHasData(s));
  if (!working.length) return "1rm";
  return working.every((s) => s.pesoKg <= 0) ? "reps" : "1rm";
}

/**
 * Agrupa las series por día de entreno.
 *
 * Los calentamientos se conservan en `sets` (el usuario quiere ver lo que hizo)
 * pero quedan fuera de `best` y `volume`: `isWorkingSet` es el filtro que usa
 * todo consumidor de métricas del proyecto, y un calentamiento no es un récord.
 */
export function groupSetsByDay(
  sets: readonly ExerciseHistorySet[],
  unit: ExerciseProgressMetric = deriveScoreUnit(sets),
): ExerciseHistoryDay[] {
  const byDay = new Map<string, ExerciseHistoryDay>();

  for (const set of sets) {
    let entry = byDay.get(set.day);
    if (!entry) {
      entry = {
        day: set.day,
        actividadId: set.actividadId,
        actividadTitulo: set.actividadTitulo,
        sets: [],
        workingSets: 0,
        best: null,
        volume: 0,
      };
      byDay.set(set.day, entry);
    }
    entry.sets.push(set);

    if (!isWorkingSet(set.tipoSerie) || !setHasData(set)) continue;
    entry.workingSets += 1;
    entry.volume += unit === "reps" ? set.repeticiones : set.pesoKg * set.repeticiones;

    const progress = estimateSetProgress(set.pesoKg, set.repeticiones);
    // `estimateSetProgress` puntúa a peso corporal por reps, así que en un
    // ejercicio con carga una serie sin peso no puede ganarle a una cargada.
    if (!progress || progress.metric !== unit) continue;
    if (!entry.best || progress.value > entry.best.value) {
      entry.best = { value: progress.value, pesoKg: set.pesoKg, repeticiones: set.repeticiones };
    }
  }

  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function dayScore(day: ExerciseHistoryDay, metric: ExerciseScoreMetric): number {
  return metric === "volume" ? day.volume : (day.best?.value ?? 0);
}

/** Días con al menos una serie efectiva: una sesión de solo calentamiento no puntúa. */
export function withScoredWork(days: readonly ExerciseHistoryDay[]): ExerciseHistoryDay[] {
  return days.filter((d) => d.workingSets > 0);
}

/**
 * `date` deja el día más reciente arriba, no el más antiguo: la lista se lee
 * como un historial, y el pico de forma se busca bajando por ella.
 */
export function sortDays(
  days: readonly ExerciseHistoryDay[],
  order: ExerciseHistoryOrder,
  metric: ExerciseScoreMetric,
): ExerciseHistoryDay[] {
  const sorted = [...days];
  if (order === "score") {
    sorted.sort((a, b) => {
      const diff = dayScore(b, metric) - dayScore(a, metric);
      // Empate a puntuación: manda la fecha, así el orden es estable y
      // reproducible en vez de depender del agrupado.
      return diff !== 0 ? diff : b.day.localeCompare(a.day);
    });
    return sorted;
  }
  sorted.sort((a, b) => b.day.localeCompare(a.day));
  return sorted;
}

/** El día de mayor puntuación del tramo visible, para destacarlo como pico. */
export function peakDay(
  days: readonly ExerciseHistoryDay[],
  metric: ExerciseScoreMetric,
): ExerciseHistoryDay | null {
  let peak: ExerciseHistoryDay | null = null;
  for (const day of days) {
    if (!peak || dayScore(day, metric) > dayScore(peak, metric)) peak = day;
  }
  return peak && dayScore(peak, metric) > 0 ? peak : null;
}

/** Ancho de la barra en %, siempre relativo al máximo visible. */
export function barWidthPct(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  // Un mínimo visible: una sesión floja debe seguir leyéndose como una barra.
  return Math.max(2, Math.min(100, (value / max) * 100));
}

export function normalizeHistoryRow(row: {
  day: string;
  actividad_id: string;
  actividad_titulo: string | null;
  numero_serie: number;
  peso_kg: number | string;
  repeticiones: number;
  tipo_serie: string;
  rir: number | null;
  duracion_seg: number | null;
}): ExerciseHistorySet {
  return {
    day: row.day,
    actividadId: row.actividad_id,
    actividadTitulo: row.actividad_titulo,
    numeroSerie: row.numero_serie,
    pesoKg: Number(row.peso_kg),
    repeticiones: Number(row.repeticiones),
    tipoSerie: normalizeTipoSerie(row.tipo_serie),
    rir: row.rir,
    duracionSeg: row.duracion_seg,
  };
}

/**
 * Recorta a los últimos `months` meses.
 *
 * El fetch siempre trae la ventana de 12 meses, así que el filtro de periodo
 * es una operación local: cambiar de tramo no vuelve a la red.
 */
export function filterDaysByPeriod(
  days: readonly ExerciseHistoryDay[],
  months: number,
  now: Date = new Date(),
): ExerciseHistoryDay[] {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  // Comparación en `yyyy-MM-dd`: `day` ya viene normalizado a fecha UTC desde
  // el RPC, así que comparar cadenas evita reintroducir husos por el camino.
  const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
  return days.filter((d) => d.day >= cutoffKey);
}

/** Tonelaje legible: kg hasta la tonelada, luego toneladas con un decimal. */
export function formatVolumeValue(volume: number): string {
  const v = Math.max(0, volume);
  if (v >= 1000) return `${(v / 1000).toFixed(1)} t`;
  return `${Math.round(v)} kg`;
}

/**
 * Texto de la puntuación de un día.
 *
 * `unit` es la del ejercicio (con carga o a peso corporal) y `metric` lo que
 * mide la barra, así que las cuatro combinaciones tienen su propia unidad.
 */
export function formatScore(
  value: number,
  metric: ExerciseScoreMetric,
  unit: ExerciseProgressMetric,
): string {
  if (unit === "reps") return `${Math.round(value)} reps`;
  if (metric === "volume") return formatVolumeValue(value);
  return `${Math.round(value)} kg`;
}

/** Etiqueta de la métrica en el conmutador, según el tipo de ejercicio. */
export function scoreMetricLabel(
  metric: ExerciseScoreMetric,
  unit: ExerciseProgressMetric,
): string {
  if (metric === "volume") return unit === "reps" ? "Reps totales" : "Volumen";
  return unit === "reps" ? "Máx. reps" : "1RM";
}

/** Serie real tal y como se registró, para la fila desplegada. */
export function formatSetLine(set: ExerciseHistorySet): string {
  if (set.pesoKg > 0) {
    const peso = Number.isInteger(set.pesoKg) ? set.pesoKg : Number(set.pesoKg.toFixed(2));
    return `${peso} kg × ${set.repeticiones}`;
  }
  if (set.repeticiones > 0) return `${set.repeticiones} reps`;
  if (set.duracionSeg) return `${set.duracionSeg}s`;
  return "—";
}
