/** YYYY-MM-DD: true si el plan ya terminó (el último día programado es anterior a hoy). */
export function isWorkoutPlanExpired(maxScheduledDate: string, todayYmd: string): boolean {
  return maxScheduledDate < todayYmd;
}

export function maxScheduledDate(dates: string[]): string | null {
  if (dates.length === 0) return null;
  return dates.reduce((max, d) => (d > max ? d : max));
}
