import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ActiveWorkoutSummary = {
  id: string;
  titulo: string;
  fecha: string;
  hasExercises: boolean;
};

export function useActiveWorkout() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeWorkout", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async (): Promise<ActiveWorkoutSummary | null> => {
      const { data, error } = await supabase
        .from("actividad")
        .select("id, titulo, fecha")
        .eq("usuario_id", user!.id)
        .is("fecha_fin", null)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { count, error: countError } = await supabase
        .from("ejercicio")
        .select("id", { count: "exact", head: true })
        .eq("actividad_id", data.id);
      if (countError) throw countError;
      return { ...data, hasExercises: (count ?? 0) > 0 };
    },
  });
}
