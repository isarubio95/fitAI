/**
 * Combina una fecha de calendario (YYYY-MM-DD, hora local) con la hora del
 * timestamp original. Evita guardar medianoche UTC al finalizar un gym.
 */
export function mergeCalendarDatePreservingTime(calendarYmd: string, timestampIso: string): string {
  const original = new Date(timestampIso);
  if (!Number.isFinite(original.getTime())) return timestampIso;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(calendarYmd.trim());
  if (!match) return timestampIso;
  const next = new Date(original);
  next.setFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return next.toISOString();
}
