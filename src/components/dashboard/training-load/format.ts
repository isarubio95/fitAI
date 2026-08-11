import { format } from "date-fns";
import { es } from "date-fns/locale";

/** Signo menos tipográfico (U+2212): no se corta ni se confunde con un guion. */
export const MINUS = "−";

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("es-ES");
}

export function formatSigned(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `${MINUS}${Math.abs(rounded)}`;
  return "0";
}

export function formatAxisValue(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `${MINUS}${Math.abs(rounded)}` : `${rounded}`;
}

/** Abreviatura de mes capitalizada (p. ej. "Ago"). */
export function formatMonthAbbrev(date: Date): string {
  const raw = format(date, "MMM", { locale: es });
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Etiqueta del eje X: "5 jun" en rangos cortos, "Jun" en rangos largos. */
export function formatTrainingLoadXTick(dateValue: string, rangeDays: number): string {
  const date = new Date(dateValue);
  if (rangeDays <= 60) {
    const day = format(date, "d", { locale: es });
    const month = format(date, "MMM", { locale: es }).toLowerCase();
    return `${day} ${month}`;
  }
  return formatMonthAbbrev(date);
}

function monthKey(dateValue: string): string {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/** Primer día presente de cada mes en la serie (orden cronológico). */
function firstDatePerMonth(dates: readonly string[]): string[] {
  const result: string[] = [];
  let lastKey = "";
  for (const dateValue of dates) {
    const key = monthKey(dateValue);
    if (key !== lastKey) {
      result.push(dateValue);
      lastKey = key;
    }
  }
  return result;
}

function pickEveryStep(dates: readonly string[], step: number): string[] {
  if (dates.length === 0) return [];
  const ticks: string[] = [];
  for (let i = 0; i < dates.length; i += step) {
    ticks.push(dates[i]);
  }
  return ticks;
}

/**
 * Fechas del eje X según el rango:
 * - 1 mes: ~5 ticks, cada 6 días
 * - 2 meses: ~5 ticks, cada 12 días (también día + mes)
 * - 6 meses: 6 ticks, 1 por mes
 * - 1 año: 6 ticks, 1 cada 2 meses
 */
export function getTrainingLoadXTicks(dates: readonly string[], rangeDays: number): string[] {
  if (dates.length === 0) return [];

  if (rangeDays <= 30) {
    return pickEveryStep(dates, 6);
  }
  if (rangeDays <= 60) {
    return pickEveryStep(dates, 12);
  }

  const monthly = firstDatePerMonth(dates);
  if (rangeDays <= 180) {
    return monthly.slice(-6);
  }
  return monthly.filter((_, index) => index % 2 === 0).slice(-6);
}
