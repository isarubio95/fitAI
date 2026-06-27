/** Lunes de la semana del día dado (YYYY-MM-DD), semana ISO lunes–domingo en UTC. */
export function weekStartKeyFromDayStr(dayStr: string): string {
  const d = new Date(dayStr.slice(0, 10) + "T12:00:00.000Z");
  const day = d.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

export function workoutDaysToWeeks(workoutDays: Iterable<string>): Set<string> {
  const weeks = new Set<string>();
  for (const day of workoutDays) {
    weeks.add(weekStartKeyFromDayStr(day));
  }
  return weeks;
}

/** Racha de semanas consecutivas con al menos un entreno, contando hacia atrás desde weekKey. */
export function streakOnWeek(weekKey: string, workoutWeeks: Set<string>): number {
  if (!workoutWeeks.has(weekKey)) return 0;
  let count = 1;
  const d = new Date(weekKey + "T12:00:00.000Z");
  for (;;) {
    d.setUTCDate(d.getUTCDate() - 7);
    const prev = d.toISOString().slice(0, 10);
    if (!workoutWeeks.has(prev)) break;
    count++;
  }
  return count;
}

export function computeStreakStats(workoutDays: Iterable<string>): { actual: number; maxima: number } {
  const weeks = workoutDaysToWeeks(workoutDays);
  if (weeks.size === 0) return { actual: 0, maxima: 0 };

  const sortedWeeks = Array.from(weeks).sort();
  const ultimaSemana = sortedWeeks[sortedWeeks.length - 1];
  const actual = streakOnWeek(ultimaSemana, weeks);
  const maxima = Math.max(...sortedWeeks.map((w) => streakOnWeek(w, weeks)));

  return { actual, maxima };
}
