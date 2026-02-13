import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useActiveWorkout() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeWorkout", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
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
      // Only show if within last 4 hours
      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
      if (new Date(data.fecha).getTime() < fourHoursAgo) return null;
      return data;
    },
  });
}
