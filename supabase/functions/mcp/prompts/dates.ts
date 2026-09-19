/**
 * Fechas concretas para el texto de los prompts.
 *
 * Se calculan aquí y no se le piden al modelo: preguntarle «los últimos 30
 * días» obliga a que acierte qué día es hoy y a que reste bien, y cuando falla
 * el error es invisible —devuelve un resumen perfectamente redactado del mes
 * equivocado—. El prompt sale ya con `from` y `to` escritos.
 *
 * Todo en UTC, que es como agrupan por día y por semana las RPC de lectura
 * (`get_training_summary`, `get_exercise_set_history`). Mezclar husos aquí haría
 * que el rango del prompt no coincidiera con el que suma el SQL.
 */

/** Hoy en UTC, `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Desplaza una fecha de calendario n días (negativo hacia atrás). */
export function shiftIso(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Lunes de la semana a la que pertenece `iso`. Lunes y no domingo porque es
 * donde empiezan las semanas de `get_training_summary` con `group_by:'week'`.
 */
export function mondayOf(iso: string): string {
  const diaSemana = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return shiftIso(iso, diaSemana === 0 ? -6 : 1 - diaSemana);
}
