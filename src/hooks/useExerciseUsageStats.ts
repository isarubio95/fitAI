import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Veces que el usuario ha entrenado cada ejercicio + última vez (ms epoch). */
export type ExerciseUsage = { count: number; lastUsed: number };

/** Clave `catalogo:id` / `usuario:id`, la misma que usan los favoritos. */
export type ExerciseUsageMap = Map<string, ExerciseUsage>;

const USAGE_STALE_MS = 10 * 60 * 1000;

/** Últimos ejercicios registrados que miramos para calcular el uso. */
const USAGE_ROW_LIMIT = 600;

type UsageRow = {
  tipo_ejercicio_id: string | null;
  usuario_ejercicio_id: string | null;
  created_at: string;
};

export function useExerciseUsageStats(enabled = true) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["exerciseUsageStats", user?.id],
    enabled: enabled && !!user,
    staleTime: USAGE_STALE_MS,
    queryFn: async (): Promise<UsageRow[]> => {
      const { data, error } = await supabase
        .from("ejercicio")
        .select("tipo_ejercicio_id, usuario_ejercicio_id, created_at")
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(USAGE_ROW_LIMIT);
      if (error) throw error;
      return (data ?? []) as UsageRow[];
    },
  });

  const usage = useMemo<ExerciseUsageMap>(() => {
    const map: ExerciseUsageMap = new Map();
    for (const row of query.data ?? []) {
      const key = row.usuario_ejercicio_id
        ? `usuario:${row.usuario_ejercicio_id}`
        : row.tipo_ejercicio_id
          ? `catalogo:${row.tipo_ejercicio_id}`
          : null;
      if (!key) continue;
      const at = Date.parse(row.created_at);
      const prev = map.get(key);
      if (prev) {
        prev.count += 1;
        if (Number.isFinite(at) && at > prev.lastUsed) prev.lastUsed = at;
      } else {
        map.set(key, { count: 1, lastUsed: Number.isFinite(at) ? at : 0 });
      }
    }
    return map;
  }, [query.data]);

  /** Claves ordenadas por uso (desc) para poder precargar esas filas del catálogo. */
  const topKeys = useMemo(
    () =>
      [...usage.entries()]
        .sort((a, b) => b[1].count - a[1].count || b[1].lastUsed - a[1].lastUsed)
        .map(([key]) => key),
    [usage],
  );

  return { usage, topKeys, isLoading: query.isLoading };
}
