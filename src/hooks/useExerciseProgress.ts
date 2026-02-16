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
}

// Returns exercises the user has performed at least once, ordered by most recent
export function useExerciseWithHistory() {
  const { user } = useAuth();

  return useQuery<ExerciseWithHistory[]>({
    queryKey: ["exercise-with-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get all series with exercise + tipo_ejercicio info
      const { data, error } = await supabase
        .from("serie")
        .select(`
          created_at,
          ejercicio!inner (
            tipo_ejercicio_id,
            tipo_ejercicio!inner ( id, nombre )
          )
        `)
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Group by tipo_ejercicio_id, keep most recent date
      const map = new Map<string, ExerciseWithHistory>();
      for (const row of data) {
        const ej = row.ejercicio as any;
        const tipo = ej.tipo_ejercicio;
        if (!map.has(tipo.id)) {
          map.set(tipo.id, {
            id: tipo.id,
            name: tipo.nombre,
            lastPerformed: row.created_at,
          });
        }
      }

      return Array.from(map.values());
    },
  });
}

// Returns daily best estimated 1RM for a specific exercise type
export function useExerciseHistory(exerciseId: string | undefined) {
  const { user } = useAuth();

  return useQuery<ExerciseHistoryPoint[]>({
    queryKey: ["exercise-history", user?.id, exerciseId],
    enabled: !!user && !!exerciseId,
    queryFn: async () => {
      // Get all series for this exercise type via ejercicio join
      const { data, error } = await supabase
        .from("serie")
        .select(`
          peso_kg,
          repeticiones,
          created_at,
          ejercicio!inner ( tipo_ejercicio_id )
        `)
        .eq("usuario_id", user!.id)
        .eq("ejercicio.tipo_ejercicio_id", exerciseId!)
        .eq("completed", true)
        .gt("peso_kg", 0)
        .gt("repeticiones", 0)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data?.length) return [];

      // Calculate 1RM per series and group by day (best 1RM)
      const dayMap = new Map<string, { oneRepMax: number; weight: number }>();

      for (const s of data) {
        const date = s.created_at.slice(0, 10); // YYYY-MM-DD
        const epley = s.peso_kg * (1 + 0.0333 * s.repeticiones);
        const current = dayMap.get(date);
        if (!current || epley > current.oneRepMax) {
          dayMap.set(date, {
            oneRepMax: Math.round(epley * 10) / 10,
            weight: Number(s.peso_kg),
          });
        }
      }

      return Array.from(dayMap.entries()).map(([date, vals]) => ({
        date,
        ...vals,
      }));
    },
  });
}
