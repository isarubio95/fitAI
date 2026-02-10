import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExerciseCatalog(search?: string) {
  return useQuery({
    queryKey: ["exerciseCatalog", search],
    queryFn: async () => {
      let query = supabase
        .from("tipo_ejercicio")
        .select("*")
        .order("nombre");

      if (search) {
        query = query.ilike("nombre", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
