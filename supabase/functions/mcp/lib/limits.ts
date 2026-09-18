/**
 * Topes de tamaño. Existen por tres razones a la vez: el contexto del modelo es
 * finito, cada token lo paga el usuario, y una Edge Function tiene un límite de
 * respuesta. Las tablas de este proyecto pasan de largo cualquiera de los tres
 * sin esfuerzo: `serie` son todas las series de todos los entrenamientos.
 */

/** Tope de la respuesta serializada. Por encima se trunca y se avisa. */
export const MAX_RESPONSE_BYTES = 50_000;

/** Texto libre del usuario (títulos, comentarios, notas) en la salida. */
export const MAX_TEXT_CHARS = 2_000;

/** Rango máximo en días para las herramientas de calendario y resumen. */
export const MAX_RANGE_DAYS = 120;

/**
 * Meses de historial hacia atrás. Coincide con el tope del selector de la app
 * (`EXERCISE_HISTORY_PERIODS`) para que MCP y UI no den respuestas distintas.
 */
export const MAX_HISTORY_MONTHS = 36;

/** Series crudas devueltas por `get_exercise_progress` con `detail: "sets"`. */
export const MAX_RAW_SETS = 400;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Días entre dos fechas ISO (`YYYY-MM-DD`), ambas incluidas. Se calcula en UTC
 * a propósito: es el mismo criterio con el que agrupa por día el SQL existente
 * (ver `get_exercise_set_history`), y mezclar husos daría totales distintos
 * según quién pregunte.
 */
export function rangeDays(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;
  return Math.floor((b - a) / 86_400_000) + 1;
}
