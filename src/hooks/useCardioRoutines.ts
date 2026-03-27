import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CardioRoutineBlockInput } from "@/types/cardio";

type CardioRoutineInput = {
  nombre: string;
  descripcion?: string | null;
  cardio_disciplina_id?: string | null;
  bloques: CardioRoutineBlockInput[];
};

export function useCardioRoutines() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cardioRoutines", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_rutina")
        .select("*, cardio_disciplina(*), cardio_rutina_bloque(*)")
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false })
        .order("orden", { referencedTable: "cardio_rutina_bloque", ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertCardioRoutine() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: string | null;
      input: CardioRoutineInput;
    }) => {
      const payload = {
        nombre: input.nombre,
        descripcion: input.descripcion ?? null,
        cardio_disciplina_id: input.cardio_disciplina_id ?? null,
        usuario_id: user!.id,
      };
      let routineId = id ?? null;
      if (routineId) {
        const { error } = await supabase.from("cardio_rutina").update(payload).eq("id", routineId);
        if (error) throw error;
        const { error: deleteError } = await supabase
          .from("cardio_rutina_bloque")
          .delete()
          .eq("cardio_rutina_id", routineId);
        if (deleteError) throw deleteError;
      } else {
        const { data, error } = await supabase.from("cardio_rutina").insert(payload).select("id").single();
        if (error) throw error;
        routineId = data.id;
      }

      if (input.bloques.length > 0) {
        const rows = input.bloques.map((b, index) => ({
          cardio_rutina_id: routineId,
          orden: index,
          tipo_bloque: b.tipo_bloque || "work",
          distancia_objetivo_m: b.distancia_objetivo_m ?? null,
          duracion_objetivo_seg: b.duracion_objetivo_seg ?? null,
          ritmo_objetivo_seg_km: b.ritmo_objetivo_seg_km ?? null,
          fc_objetivo: b.fc_objetivo ?? null,
        }));
        const { error } = await supabase.from("cardio_rutina_bloque").insert(rows);
        if (error) throw error;
      }
      return routineId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cardioRoutines"] });
    },
  });
}

export function useDeleteCardioRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cardio_rutina").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cardioRoutines"] });
    },
  });
}

