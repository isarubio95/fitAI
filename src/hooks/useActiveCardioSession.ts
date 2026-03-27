import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Sesión cardio sin fecha_fin = grabación en curso (misma idea que gimnasio + fecha_fin). */
export function useActiveCardioSession() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeCardioSession", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select("id, titulo, fecha_inicio, cardio_disciplina_id, cardio_disciplina(codigo, nombre)")
        .eq("usuario_id", user!.id)
        .is("fecha_fin", null)
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
      if (new Date(data.fecha_inicio).getTime() < fourHoursAgo) return null;
      return data;
    },
  });
}
