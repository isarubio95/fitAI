import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { hydrateActividadesWithDetails } from "./useWorkouts";
import type { ActividadWithDetails } from "@/types/workout";

export type CommunityAuthor = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type CommunityFeedItem = {
  author: CommunityAuthor;
  workout: ActividadWithDetails;
};

export function useCommunityFeed() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["communityFeed"],
    staleTime: 60 * 1000,
    enabled: !!user,
    queryFn: async (): Promise<CommunityFeedItem[]> => {
      const { data: actividades, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("es_publica", true)
        .neq("usuario_id", user!.id)
        .order("fecha", { ascending: false })
        .limit(50);

      if (error) throw error;

      const acts = (actividades ?? []) as Array<Record<string, unknown>>;
      if (acts.length === 0) return [];

      const workouts = await hydrateActividadesWithDetails(acts);

      const userIds = Array.from(new Set(acts.map((a) => a.usuario_id as string)));
      const { data: perfiles, error: pErr } = await supabase
        .from("perfil")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (pErr) throw pErr;

      const byId = new Map((perfiles ?? []).map((p) => [p.id, p] as const));

      return workouts.map((workout) => {
        const authorRow = byId.get(workout.usuario_id) ?? {
          id: workout.usuario_id,
          username: null,
          avatar_url: null,
        };
        return {
          workout,
          author: {
            id: authorRow.id,
            username: authorRow.username ?? null,
            avatar_url: authorRow.avatar_url ?? null,
          },
        };
      });
    },
  });
}
