export const fromRoutineStorageKey = (workoutId: string) => `fitai:workout-from-routine:${workoutId}`;

export function markWorkoutStartedFromRoutine(workoutId: string) {
  try {
    sessionStorage.setItem(fromRoutineStorageKey(workoutId), "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearWorkoutStartedFromRoutine(workoutId: string) {
  try {
    sessionStorage.removeItem(fromRoutineStorageKey(workoutId));
  } catch {
    /* ignore */
  }
}

export function wasWorkoutStartedFromRoutine(workoutId: string) {
  try {
    return sessionStorage.getItem(fromRoutineStorageKey(workoutId)) === "1";
  } catch {
    return false;
  }
}
