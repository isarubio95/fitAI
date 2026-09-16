/** Reabrir la pill de un entreno que ya tiene ejercicios (no un alta en blanco). */
export function isReopeningKnownActiveWorkout(opts: {
  workoutId: string | null | undefined;
  activeId: string | null | undefined;
  hasExercises?: boolean;
}): boolean {
  return !!opts.workoutId && opts.workoutId === opts.activeId && !!opts.hasExercises;
}

export function sessionHasStartedForDrawer(opts: {
  sessionClockStartedAt: string | null;
  reopeningKnownActiveWorkout: boolean;
}): boolean {
  return !!opts.sessionClockStartedAt || opts.reopeningKnownActiveWorkout;
}

/** No mostrar «añade un ejercicio para empezar» mientras llega el entreno ya iniciado. */
export function shouldShowWorkoutEmptyStart(opts: {
  showFloatingActionBar: boolean;
  exerciseCount: number;
  waitingForExistingWorkout: boolean;
}): boolean {
  return opts.showFloatingActionBar && opts.exerciseCount === 0 && !opts.waitingForExistingWorkout;
}

/**
 * Fusiona las filas del servidor con las del formulario sin duplicar.
 *
 * Se resuelve contra `current` (el estado pendiente dentro del updater), no
 * contra el `exercises` capturado por el efecto: la hidratación ocurre en un
 * layout effect y este efecto pasivo llega a correr con la lista vacía de la
 * render anterior, lo que reañadía el entreno entero al recargar la app.
 */
export function mergeServerExercisesIntoForm<C extends { id?: string | null }, S extends { id: string }, R>(
  current: C[],
  serverRows: S[],
  map: (row: S) => R,
): (C | R)[] {
  const known = new Set(current.map((e) => e.id).filter(Boolean) as string[]);
  const extra = serverRows.filter((row) => !known.has(row.id));
  if (extra.length === 0) return current;
  return [...current, ...extra.map(map)];
}
