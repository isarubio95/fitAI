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
