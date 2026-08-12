import type { RutinaEjercicioWithDetails } from "@/types/routine";
import { normalizeRegistroSeries } from "@/types/workout";

/** Segundos de trabajo estimados por serie en modo peso/reps. */
const DEFAULT_WORK_SEC_PER_SET = 45;
/** Descanso por defecto si el ejercicio no lo define (coincide con el form). */
const DEFAULT_REST_SEC = 120;
/** Transición aproximada entre bloques (ejercicio o superserie). */
const TRANSITION_SEC = 30;

type DurationInput = Pick<
  RutinaEjercicioWithDetails,
  | "series_objetivo"
  | "descanso"
  | "registro_series"
  | "duracion_objetivo_seg"
  | "superset_id"
  | "orden"
>;

function workSecPerSet(ej: DurationInput): number {
  const mode = normalizeRegistroSeries(ej.registro_series);
  if (mode === "duracion" || mode === "duracion_ritmo") {
    const d = Number(ej.duracion_objetivo_seg ?? 0);
    return d > 0 ? d : DEFAULT_WORK_SEC_PER_SET;
  }
  return DEFAULT_WORK_SEC_PER_SET;
}

function restSec(ej: DurationInput): number {
  const r = Number(ej.descanso ?? DEFAULT_REST_SEC);
  return Number.isFinite(r) && r >= 0 ? r : DEFAULT_REST_SEC;
}

/**
 * Estimación en minutos de cuánto dura completar la rutina
 * (trabajo por serie + descansos + transición entre bloques).
 * Devuelve `null` si no hay ejercicios.
 */
export function estimateRoutineDurationMinutes(
  ejercicios: DurationInput[],
): number | null {
  if (!ejercicios.length) return null;

  const sorted = [...ejercicios].sort((a, b) => a.orden - b.orden);

  type Block =
    | { kind: "single"; ej: DurationInput }
    | { kind: "superset"; items: DurationInput[] };

  const blocks: Block[] = [];
  let i = 0;
  while (i < sorted.length) {
    const ej = sorted[i];
    const sid = ej.superset_id?.trim() || null;
    if (!sid) {
      blocks.push({ kind: "single", ej });
      i += 1;
      continue;
    }
    const items: DurationInput[] = [];
    while (i < sorted.length && (sorted[i].superset_id?.trim() || null) === sid) {
      items.push(sorted[i]);
      i += 1;
    }
    blocks.push(items.length === 1 ? { kind: "single", ej: items[0] } : { kind: "superset", items });
  }

  let totalSec = 0;

  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b];
    if (block.kind === "single") {
      const sets = Math.max(1, Number(block.ej.series_objetivo) || 1);
      const work = workSecPerSet(block.ej);
      const rest = restSec(block.ej);
      totalSec += sets * work + Math.max(0, sets - 1) * rest;
    } else {
      const rounds = Math.max(
        1,
        ...block.items.map((ej) => Math.max(1, Number(ej.series_objetivo) || 1)),
      );
      const workPerRound = block.items.reduce((sum, ej) => sum + workSecPerSet(ej), 0);
      const restBetween = Math.max(...block.items.map(restSec));
      totalSec += rounds * workPerRound + Math.max(0, rounds - 1) * restBetween;
    }
    if (b < blocks.length - 1) totalSec += TRANSITION_SEC;
  }

  return Math.max(1, Math.round(totalSec / 60));
}

/** Etiqueta corta para UI, p. ej. `~48 min`. */
export function formatEstimatedDurationLabel(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  return `${minutes} min`;
}
