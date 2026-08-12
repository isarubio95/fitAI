import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExerciseWithHistory {
  id: string;
  name: string;
  lastPerformed: string;
}

interface ExerciseHistoryPoint {
  date: string;
  oneRepMax: number;
  weight: number;
  reps: number;
}

/** Ventana de historial en meses (agregado diario en SQL). */
export const EXERCISE_HISTORY_MONTHS = 12;

// Returns exercises the user has performed at least once, ordered by most recent
export function useExerciseWithHistory() {
  const { user } = useAuth();

  return useQuery<ExerciseWithHistory[]>({
    queryKey: ["exercise-with-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_exercises_with_history");
      if (error) throw error;
      if (!data?.length) return [];

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        lastPerformed: row.last_performed,
      }));
    },
  });
}

export type ExerciseProgressMetric = "1rm" | "reps";

export interface LastRecord {
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
}

export interface ExerciseHistoryResult {
  history: ExerciseHistoryPoint[];
  lastRecord: LastRecord | null;
  /** "reps" si todo el historial ganador es a peso corporal (0 kg); si no, "1rm". */
  metric: ExerciseProgressMetric;
}

/** Progreso de una serie: 1RM Epley con carga, o max reps a peso corporal. */
export function estimateSetProgress(
  peso: number,
  reps: number,
): { value: number; metric: ExerciseProgressMetric } | null {
  const w = Number(peso);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || r <= 0) return null;
  if (w > 0) {
    return { value: w * (1 + 0.0333 * r), metric: "1rm" };
  }
  return { value: r, metric: "reps" };
}

/**
 * Elige la mejor serie del día.
 * Si hay alguna con carga externa, gana el mayor 1RM; si no, el máximo de reps.
 */
export function pickBestSetOfDay(
  sets: { weight: number; reps: number }[],
): ExerciseHistoryPoint | null {
  let bestWeighted: { value: number; weight: number; reps: number } | null = null;
  let bestBodyweight: { value: number; weight: number; reps: number } | null = null;

  for (const set of sets) {
    const progress = estimateSetProgress(set.weight, set.reps);
    if (!progress) continue;
    if (progress.metric === "1rm") {
      if (!bestWeighted || progress.value > bestWeighted.value) {
        bestWeighted = { value: progress.value, weight: set.weight, reps: set.reps };
      }
    } else if (!bestBodyweight || progress.value > bestBodyweight.value) {
      bestBodyweight = { value: progress.value, weight: set.weight, reps: set.reps };
    }
  }

  const winner = bestWeighted ?? bestBodyweight;
  if (!winner) return null;
  return {
    date: "",
    oneRepMax: winner.value,
    weight: winner.weight,
    reps: winner.reps,
  };
}

export function deriveExerciseMetric(history: { weight: number }[]): ExerciseProgressMetric {
  if (!history.length) return "1rm";
  return history.every((p) => Number(p.weight) <= 0) ? "reps" : "1rm";
}

export const exerciseHistoryQueryKey = (exerciseId: string) => ["exercise-history", exerciseId] as const;

const EXERCISE_HISTORY_STALE_MS = 10 * 60 * 1000;

export async function fetchExerciseHistory(
  _userId: string,
  exerciseId: string,
  months: number = EXERCISE_HISTORY_MONTHS,
): Promise<ExerciseHistoryResult> {
  const { data, error } = await supabase.rpc("get_exercise_daily_best", {
    p_tipo_ejercicio_id: exerciseId,
    p_months: months,
  });
  if (error) throw error;

  const history: ExerciseHistoryPoint[] = (data ?? []).map((row) => ({
    date: row.day,
    oneRepMax: Number(row.one_rep_max),
    weight: Number(row.weight),
    reps: Number(row.reps),
  }));

  return {
    history,
    lastRecord: history.length > 0 ? history[history.length - 1] : null,
    metric: deriveExerciseMetric(history),
  };
}

export function exerciseHistoryQueryOptions(userId: string, exerciseId: string) {
  return {
    queryKey: exerciseHistoryQueryKey(exerciseId),
    queryFn: () => fetchExerciseHistory(userId, exerciseId),
    staleTime: EXERCISE_HISTORY_STALE_MS,
  } as const;
}

// Returns daily best estimated 1RM for a specific exercise type
export function useExerciseHistory(exerciseId: string | null) {
  const { user } = useAuth();

  return useQuery({
    ...exerciseHistoryQueryOptions(user!.id, exerciseId!),
    enabled: !!user && !!exerciseId,
  });
}
