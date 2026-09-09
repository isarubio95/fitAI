import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EXERCISE_HISTORY_MONTHS } from "@/hooks/useExerciseProgress";
import { normalizeHistoryRow, type ExerciseHistorySet } from "@/lib/exerciseHistory";

/**
 * Un ejercicio se identifica por uno de los dos FK de `ejercicio`: catálogo
 * (`tipo_ejercicio_id`) o propio del usuario (`usuario_ejercicio_id`). Mismo
 * contrato que `useLastPerformance`, para no inventar una tercera forma.
 */
export interface ExerciseHistoryTarget {
  tipo_ejercicio_id?: string | null;
  usuario_ejercicio_id?: string | null;
}

const EXERCISE_SET_HISTORY_STALE_MS = 10 * 60 * 1000;

export function exerciseSetHistoryQueryKey(target: ExerciseHistoryTarget, userId?: string) {
  return [
    "exercise-set-history",
    userId,
    target.tipo_ejercicio_id ?? null,
    target.usuario_ejercicio_id ?? null,
  ] as const;
}

export async function fetchExerciseSetHistory(
  target: ExerciseHistoryTarget,
  months: number = EXERCISE_HISTORY_MONTHS,
): Promise<ExerciseHistorySet[]> {
  const { data, error } = await supabase.rpc("get_exercise_set_history", {
    p_tipo_ejercicio_id: target.tipo_ejercicio_id ?? null,
    p_usuario_ejercicio_id: target.usuario_ejercicio_id ?? null,
    p_months: months,
  });
  if (error) throw error;
  return (data ?? []).map(normalizeHistoryRow);
}

/**
 * Historial de series de un ejercicio.
 *
 * Trae siempre la ventana completa (12 meses) aunque el drawer arranque en 3:
 * son unos cientos de filas para un solo ejercicio, y así cambiar de periodo o
 * de métrica no vuelve a la red.
 */
export function useExerciseSetHistory(
  target: ExerciseHistoryTarget,
  options: { enabled?: boolean } = {},
) {
  const { user } = useAuth();
  const hasTarget = !!(target.tipo_ejercicio_id || target.usuario_ejercicio_id);

  return useQuery({
    queryKey: exerciseSetHistoryQueryKey(target, user?.id),
    queryFn: () => fetchExerciseSetHistory(target),
    enabled: (options.enabled ?? true) && !!user && hasTarget,
    staleTime: EXERCISE_SET_HISTORY_STALE_MS,
  });
}
