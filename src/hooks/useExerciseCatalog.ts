import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useExerciseCatalog(search?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exerciseCatalog", search, user?.id],
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

      // Sort: user exercises first, then system, then alphabetical within each group
      const userId = user?.id;
      return (data ?? []).sort((a, b) => {
        const aIsUser = (a as any).usuario_id === userId ? 0 : 1;
        const bIsUser = (b as any).usuario_id === userId ? 0 : 1;
        if (aIsUser !== bIsUser) return aIsUser - bIsUser;
        return a.nombre.localeCompare(b.nombre);
      });
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nombre, descripcion, usuario_id }: { nombre: string; descripcion?: string; usuario_id: string }) => {
      const { data, error } = await supabase
        .from("tipo_ejercicio")
        .insert({ nombre: nombre.trim(), descripcion: descripcion?.trim() || null, usuario_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exerciseCatalog"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tipo_ejercicio").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exerciseCatalog"] });
    },
  });
}
