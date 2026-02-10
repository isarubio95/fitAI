import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { RutinaWithDetails } from "@/types/routine";

export function useRoutines() {
  const { user } = useAuth();
  return useQuery<RutinaWithDetails[]>({
    queryKey: ["routines", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: rutinas, error } = await supabase
        .from("rutina")
        .select("*")
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!rutinas?.length) return [];

      const rutinaIds = rutinas.map((r) => r.id);
      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select("*, tipo_ejercicio(*)")
        .in("rutina_id", rutinaIds)
        .order("orden");
      if (ejError) throw ejError;

      return rutinas.map((r) => ({
        ...r,
        ejercicios: (ejercicios || [])
          .filter((ej) => ej.rutina_id === r.id)
          .map((ej) => ({ ...ej, tipo_ejercicio: ej.tipo_ejercicio! })),
      }));
    },
  });
}

export function useRoutineById(id: string | null) {
  const { user } = useAuth();
  return useQuery<RutinaWithDetails | null>({
    queryKey: ["routine", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data: rutina, error } = await supabase
        .from("rutina")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!rutina) return null;

      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select("*, tipo_ejercicio(*)")
        .eq("rutina_id", id)
        .order("orden");
      if (ejError) throw ejError;

      return {
        ...rutina,
        ejercicios: (ejercicios || []).map((ej) => ({
          ...ej,
          tipo_ejercicio: ej.tipo_ejercicio!,
        })),
      };
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rutina").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}
