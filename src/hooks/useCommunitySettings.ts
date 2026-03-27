import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useCommunitySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["communitySettings", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<{ comunidad_publica_actividad: boolean }> => {
      const { data, error } = await supabase
        .from("perfil" as any)
        .select("comunidad_publica_actividad")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return { comunidad_publica_actividad: (data?.comunidad_publica_actividad as boolean) ?? false };
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (value: boolean) => {
      if (!user) throw new Error("No user");

      const { error: profileErr } = await supabase
        .from("perfil" as any)
        .update({ comunidad_publica_actividad: value } as any)
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      const { error: actErr } = await supabase
        .from("actividad")
        .update({ es_publica: value } as any)
        .eq("usuario_id", user.id);

      if (actErr) throw actErr;

      const { error: cardioErr } = await supabase
        .from("cardio_sesion")
        .update({ es_publica: value } as any)
        .eq("usuario_id", user.id);

      if (cardioErr) throw cardioErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communitySettings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["communityFeed"] });
      queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
      queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
      queryClient.invalidateQueries({ queryKey: ["cardioSessions"] });
      queryClient.invalidateQueries({ queryKey: ["cardioSession"] });
      queryClient.invalidateQueries({ queryKey: ["monthCardioSessions"] });
      queryClient.invalidateQueries({ queryKey: ["monthCardioSessionDates"] });
    },
  });

  return {
    comunidadPublicaActividad: settingsQuery.data?.comunidad_publica_actividad ?? false,
    isLoading: settingsQuery.isLoading,
    isUpdating: updateSettingsMutation.isPending,
    setComunidadPublicaActividad: updateSettingsMutation.mutateAsync,
  };
}

