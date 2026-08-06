import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Medida = Tables<"medidas">;
export type MedidaInsert = Omit<TablesInsert<"medidas">, "id" | "created_at">;

export function useMeasurements() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const queryKey = ["medidas", user?.id];

  const query = useQuery<Medida[]>({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medidas")
        .select("*")
        .eq("usuario_id", user!.id)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (medida: Omit<MedidaInsert, "usuario_id">) => {
      const { error } = await supabase
        .from("medidas")
        .insert({ ...medida, usuario_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("medidas")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    ...query,
    addMeasurement: addMutation.mutateAsync,
    deleteMeasurement: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
