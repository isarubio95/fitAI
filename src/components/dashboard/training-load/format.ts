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

const Y_TICK_COUNT = 5;
const Y_HEADROOM = 1.08;
/** Si el pico cabe por debajo de 70, el eje se queda en 60 (15 en 15) para acercar el zoom. */
const Y_COMPACT_MAX = 70;
const Y_COMPACT_DOMAIN = 60;
const Y_COMPACT_STEP = 15;

/** Paso redondo (1, 2, 5 × 10ⁿ) que cubre al menos `value`. */
function niceCeilStep(value: number): number {
  const v = Math.max(1, value);
  const exponent = Math.floor(Math.log10(v));
  const magnitude = 10 ** exponent;
  const fraction = v / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

/**
 * Escala Y del gráfico Fitness/Fatiga: siempre `tickCount` marcas (incluye 0),
 * con el mismo intervalo numérico y visual. El máximo crece o encoge con los datos.
 * Por debajo de 70 se usa 0–60 de 15 en 15 (una guía menos que 0–80) para ganar zoom.
 */
export function getTrainingLoadYScale(
  maxValue: number,
  tickCount = Y_TICK_COUNT,
): { domain: [number, number]; ticks: number[] } {
  if (maxValue < Y_COMPACT_MAX) {
    const compactDivisions = Y_COMPACT_DOMAIN / Y_COMPACT_STEP;
    const ticks = Array.from({ length: compactDivisions + 1 }, (_, i) => i * Y_COMPACT_STEP);
    return { domain: [0, Y_COMPACT_DOMAIN], ticks };
  }

  const divisions = Math.max(1, tickCount - 1);
  const paddedMax = Math.max(0, maxValue) * Y_HEADROOM;
  const step = niceCeilStep(paddedMax / divisions);
  const maxDomain = step * divisions;
  const ticks = Array.from({ length: divisions + 1 }, (_, i) => i * step);
  return { domain: [0, maxDomain], ticks };
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
