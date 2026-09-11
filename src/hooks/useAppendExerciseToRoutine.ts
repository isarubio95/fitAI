import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { catalogRefFromCarry, type CatalogExerciseCarry } from "@/lib/catalogExerciseCarry";
import { routineExerciseFromCatalog } from "@/lib/routineExerciseDefaults";

export function useAppendExerciseToRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      routineId,
      carry,
    }: {
      routineId: string;
      carry: CatalogExerciseCarry;
    }) => {
      if (!user) throw new Error("Inicia sesión para añadir a una rutina.");
      const { data: last, error: lastError } = await supabase
        .from("rutina_ejercicio")
        .select("orden")
        .eq("rutina_id", routineId)
        .order("orden", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastError) throw lastError;

      const row = routineExerciseFromCatalog(carry, (last?.orden ?? -1) + 1);
      const ref = catalogRefFromCarry(carry);
      const { error } = await supabase.from("rutina_ejercicio").insert({
        rutina_id: routineId,
        tipo_ejercicio_id: ref.tipo_ejercicio_id ?? null,
        usuario_ejercicio_id: ref.usuario_ejercicio_id ?? null,
        series_objetivo: row.series_objetivo,
        repes_min: row.repes_min,
        repes_max: row.repes_max,
        rir: row.rir,
        orden: row.orden,
        superset_id: null,
        descanso: row.descanso,
        registro_series: row.registro_series,
        duracion_objetivo_seg: row.duracion_objetivo_seg,
        ritmo_objetivo_seg_km: row.ritmo_objetivo_seg_km,
      });
      if (error) throw error;
    },
    onSuccess: async (_data, vars) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["routines"] }),
        queryClient.invalidateQueries({ queryKey: ["routine", vars.routineId] }),
      ]);
    },
  });

  return {
    append: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
