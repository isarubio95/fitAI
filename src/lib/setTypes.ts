/**
 * Tipo de serie: única fuente de verdad de la semántica.
 *
 * Antes todas las series de un ejercicio eran equivalentes, así que un
 * calentamiento sumaba volumen, tonelaje, fatiga local, carga y XP igual que
 * una serie al fallo. `isWorkingSet` es el filtro que corrige eso: todo
 * consumidor de métricas debe pasar por aquí en vez de comparar strings.
 */
export type TipoSerie = "calentamiento" | "efectiva" | "dropset" | "amrap";

export const TIPOS_SERIE: readonly TipoSerie[] = [
  "calentamiento",
  "efectiva",
  "dropset",
  "amrap",
] as const;

/** Las series históricas (anteriores a esta feature) quedan aquí por el DEFAULT en BD. */
export const DEFAULT_TIPO_SERIE: TipoSerie = "efectiva";

export function normalizeTipoSerie(v: unknown): TipoSerie {
  return TIPOS_SERIE.includes(v as TipoSerie) ? (v as TipoSerie) : DEFAULT_TIPO_SERIE;
}

/**
 * Serie que cuenta como trabajo real.
 *
 * Gobierna volumen por grupo muscular, tonelaje, fatiga local, impulso
 * mecánico de carga, XP y sobrecarga progresiva. Solo el calentamiento queda
 * fuera: dropset y amrap son trabajo efectivo.
 *
 * Ojo: el calentamiento sí ocupa tiempo, así que sigue contando para la
 * duración estimada de la sesión (ver useTrainingLoad).
 */
export function isWorkingSet(t: unknown): boolean {
  return normalizeTipoSerie(t) !== "calentamiento";
}

/**
 * Los mismos tipos que `isWorkingSet` acepta, para filtrar en la propia query
 * (`.in("tipo_serie", WORKING_SET_TYPES)`) cuando traerlas y descartarlas
 * después sería desperdiciar ancho de banda. Derivado, no duplicado: si
 * `isWorkingSet` cambia, esta lista cambia con ella.
 */
export const WORKING_SET_TYPES: readonly TipoSerie[] = TIPOS_SERIE.filter(isWorkingSet);

const LABELS: Record<TipoSerie, string> = {
  calentamiento: "Calentamiento",
  efectiva: "Efectiva",
  dropset: "Dropset",
  amrap: "AMRAP",
};

export function tipoSerieLabel(t: unknown): string {
  return LABELS[normalizeTipoSerie(t)];
}

/** Badge compacto para la tabla de series del logger. "" en efectiva: es el caso normal. */
const SHORT: Record<TipoSerie, string> = {
  calentamiento: "W",
  efectiva: "",
  dropset: "D",
  amrap: "A",
};

export function tipoSerieShort(t: unknown): string {
  return SHORT[normalizeTipoSerie(t)];
}
