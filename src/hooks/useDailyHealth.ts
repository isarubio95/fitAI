import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type SaludDiaria = Tables<"salud_diaria">;
export type SaludDiariaInsert = Omit<TablesInsert<"salud_diaria">, "id" | "created_at" | "updated_at">;

export type SaludDiariaPatch = {
  fecha: string;
  calorias?: number | null;
  sueno_min?: number | null;
  calidad_sueno?: number | null;
  fc_reposo?: number | null;
  notas?: string | null;
};

function mergeDailyHealth(existing: SaludDiaria | undefined, patch: SaludDiariaPatch, usuarioId: string): SaludDiariaInsert {
  return {
    usuario_id: usuarioId,
    fecha: patch.fecha,
    calorias: patch.calorias !== undefined ? patch.calorias : existing?.calorias ?? null,
    sueno_min: patch.sueno_min !== undefined ? patch.sueno_min : existing?.sueno_min ?? null,
    calidad_sueno: patch.calidad_sueno !== undefined ? patch.calidad_sueno : existing?.calidad_sueno ?? null,
    fc_reposo: patch.fc_reposo !== undefined ? patch.fc_reposo : existing?.fc_reposo ?? null,
    notas: patch.notas !== undefined ? patch.notas : existing?.notas ?? null,
  };
}

export function useDailyHealth() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const queryKey = ["salud_diaria", user?.id];

  const query = useQuery<SaludDiaria[]>({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salud_diaria")
        .select("*")
        .eq("usuario_id", user!.id)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (patch: SaludDiariaPatch) => {
      const existing = (query.data ?? []).find((row) => row.fecha === patch.fecha);
      const row = mergeDailyHealth(existing, patch, user!.id);
      const { error } = await supabase
        .from("salud_diaria")
        .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "usuario_id,fecha" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salud_diaria").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    ...query,
    upsertDailyHealth: upsertMutation.mutateAsync,
    deleteDailyHealth: deleteMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
