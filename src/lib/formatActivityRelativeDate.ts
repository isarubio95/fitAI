import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

function toValidDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Fecha relativa al estilo feed deportivo / red social (Hoy, Ayer, Hace 3 días…).
 */
export function formatActivityRelativeDate(
  dateInput: string | Date,
  referenceDate: Date = new Date(),
): string {
  const date = toValidDate(dateInput);
  if (!date) return "";

  const today = startOfDay(referenceDate);
  const target = startOfDay(date);
  const days = differenceInCalendarDays(today, target);

  if (days < 0) return "";
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  if (days < 30) {
    return weeksLabel(days);
  }

  if (days < 365) {
    const months = differenceInCalendarMonths(today, target);
    if (months <= 0) return weeksLabel(days);
    return months === 1 ? "Hace un mes" : `Hace ${months} meses`;
  }

  const years = differenceInCalendarYears(today, target);
  return years === 1 ? "Hace un año" : `Hace ${years} años`;
}

/** P. ej. `lunes 12 de julio, 20:50` */
export function formatActivityAbsoluteDate(dateInput: string | Date): string {
  const date = toValidDate(dateInput);
  if (!date) return "";
  return format(date, "EEEE d 'de' MMMM, HH:mm", { locale: es });
}

function weeksLabel(days: number): string {
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "Hace una semana" : `Hace ${weeks} semanas`;
}
