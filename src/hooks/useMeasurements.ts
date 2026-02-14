import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Medida {
  id: string;
  usuario_id: string;
  fecha: string;
  peso: number | null;
  grasa: number | null;
  cintura: number | null;
  pecho: number | null;
  brazo: number | null;
  pierna: number | null;
  notas: string | null;
  foto_frontal: string | null;
  foto_espalda: string | null;
  created_at: string;
}

export type MedidaInsert = Omit<Medida, "id" | "created_at">;

export function useMeasurements() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const queryKey = ["medidas", user?.id];

  const query = useQuery<Medida[]>({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("medidas")
        .select("*")
        .eq("usuario_id", user!.id)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return (data as Medida[]) ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (medida: Omit<MedidaInsert, "usuario_id">) => {
      const { error } = await (supabase as any)
        .from("medidas")
        .insert({ ...medida, usuario_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
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
