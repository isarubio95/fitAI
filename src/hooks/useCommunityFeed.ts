import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { hydrateActividadesWithDetails } from "./useWorkouts";
import type { Actividad, ActividadWithDetails } from "@/types/workout";

export type CommunityAuthor = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type CommunityFeedItem = {
  author: CommunityAuthor;
  workout: ActividadWithDetails;
};

export const COMMUNITY_FEED_PAGE_SIZE = 10;

async function fetchCommunityFeedPage(
  userId: string,
  offset: number,
  pageSize: number,
): Promise<{ items: CommunityFeedItem[]; offset: number; hasMore: boolean }> {
  const { data: actividades, error } = await supabase
    .from("actividad")
    .select("*")
    .eq("es_publica", true)
    .not("fecha_fin", "is", null)
    .neq("usuario_id", userId)
    .order("fecha", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  const acts = (actividades ?? []) as Actividad[];
  if (acts.length === 0) {
    return { items: [], offset, hasMore: false };
  }

  const workouts = await hydrateActividadesWithDetails(acts);

  const userIds = Array.from(new Set(acts.map((a) => a.usuario_id)));
  const { data: perfiles, error: pErr } = await supabase
    .from("perfil")
    .select("id, username, avatar_url")
    .in("id", userIds);

  if (pErr) throw pErr;

  const byId = new Map((perfiles ?? []).map((p) => [p.id, p] as const));

  const items = workouts.map((workout) => {
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

  return {
    items,
    offset,
    hasMore: acts.length === pageSize,
  };
}

export function useCommunityFeed(pageSize = COMMUNITY_FEED_PAGE_SIZE) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["communityFeed", pageSize],
    staleTime: 60 * 1000,
    enabled: !!user,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = Number(pageParam ?? 0);
      return fetchCommunityFeedPage(user!.id, offset, pageSize);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + pageSize : undefined,
  });
}
