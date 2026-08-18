import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { hydrateActividadesWithDetails } from "./useWorkouts";
import { CARDIO_SESSION_LIST_SELECT } from "./useCardioSessions";
import { attachCardioTrackPreviews } from "@/lib/attachCardioTrackPreviews";
import {
  mergeDatedFeedEntries,
  nextFeedCursorFromItems,
  type DatedFeedEntry,
} from "@/lib/communityFeedMerge";
import { communityFeedAuthorIds } from "@/lib/communityFeedVisibility";
import type { Actividad, ActividadWithDetails } from "@/types/workout";
import type { CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";

export type CommunityAuthor = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type CommunityFeedGymItem = {
  type: "gym";
  author: CommunityAuthor;
  workout: ActividadWithDetails;
  fecha: string;
};

export type CommunityFeedCardioItem = {
  type: "cardio";
  author: CommunityAuthor;
  session: CardioSesionWithDetails;
  fecha: string;
};

export type CommunityFeedItem = CommunityFeedGymItem | CommunityFeedCardioItem;

export const COMMUNITY_FEED_PAGE_SIZE = 10;

function authorFromMap(
  userId: string,
  byId: Map<string, { id: string; username: string | null; avatar_url: string | null }>,
): CommunityAuthor {
  const row = byId.get(userId);
  return {
    id: userId,
    username: row?.username ?? null,
    avatar_url: row?.avatar_url ?? null,
  };
}

async function fetchProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, CommunityAuthor>();
  const { data: perfiles, error } = await supabase
    .from("perfil")
    .select("id, username, avatar_url")
    .in("id", userIds);
  if (error) throw error;
  return new Map(
    (perfiles ?? []).map((p) => [
      p.id,
      {
        id: p.id,
        username: p.username ?? null,
        avatar_url: p.avatar_url ?? null,
      } satisfies CommunityAuthor,
    ]),
  );
}

async function fetchCommunityFeedPage(
  authorIds: string[],
  cursor: string | null,
  pageSize: number,
): Promise<{ items: CommunityFeedItem[]; cursor: string | null; hasMore: boolean }> {
  if (authorIds.length === 0) {
    return { items: [], cursor: null, hasMore: false };
  }

  let gymQuery = supabase
    .from("actividad")
    .select("*")
    .eq("es_publica", true)
    .not("fecha_fin", "is", null)
    .in("usuario_id", authorIds)
    .order("fecha", { ascending: false })
    .limit(pageSize);

  let cardioQuery = supabase
    .from("cardio_sesion")
    .select(CARDIO_SESSION_LIST_SELECT)
    .eq("es_publica", true)
    .not("fecha_fin", "is", null)
    .in("usuario_id", authorIds)
    .order("fecha_inicio", { ascending: false })
    .order("orden", { referencedTable: "cardio_bloque", ascending: true })
    .limit(pageSize);

  if (cursor) {
    gymQuery = gymQuery.lt("fecha", cursor);
    cardioQuery = cardioQuery.lt("fecha_inicio", cursor);
  }

  const [gymRes, cardioRes] = await Promise.all([gymQuery, cardioQuery]);
  if (gymRes.error) throw gymRes.error;
  if (cardioRes.error) throw cardioRes.error;

  const acts = (gymRes.data ?? []) as Actividad[];
  const cardioSessions = (cardioRes.data ?? []) as CardioSesionWithDetails[];

  const workouts = acts.length > 0 ? await hydrateActividadesWithDetails(acts) : [];
  const workoutById = new Map(workouts.map((w) => [w.id, w]));

  const gymEntries: DatedFeedEntry<ActividadWithDetails>[] = acts.map((a) => ({
    id: a.id,
    fecha: a.fecha,
    payload: workoutById.get(a.id)!,
  })).filter((e) => e.payload);

  const cardioEntries: DatedFeedEntry<CardioSesionWithDetails>[] = cardioSessions.map((s) => ({
    id: s.id,
    fecha: s.fecha_inicio,
    payload: s,
  }));

  const { items: merged, hasMoreFromMerge } = mergeDatedFeedEntries(
    gymEntries,
    cardioEntries,
    pageSize,
  );

  const cardioInPage = merged
    .filter((m) => m.source === "b")
    .map((m) => m.entry.payload);
  const hydratedCardio = await attachCardioTrackPreviews(cardioInPage);
  const cardioById = new Map(hydratedCardio.map((s) => [s.id, s]));

  const userIds = Array.from(
    new Set(
      merged.map((m) =>
        m.source === "a" ? m.entry.payload.usuario_id : m.entry.payload.usuario_id,
      ),
    ),
  );
  const byId = await fetchProfilesByIds(userIds);

  const items: CommunityFeedItem[] = merged.map((m) => {
    if (m.source === "a") {
      const workout = m.entry.payload;
      return {
        type: "gym" as const,
        workout,
        author: authorFromMap(workout.usuario_id, byId),
        fecha: workout.fecha,
      };
    }
    const session = cardioById.get(m.entry.payload.id) ?? m.entry.payload;
    return {
      type: "cardio" as const,
      session,
      author: authorFromMap(session.usuario_id, byId),
      fecha: session.fecha_inicio,
    };
  });

  const nextCursor = nextFeedCursorFromItems(items);
  const hasMore =
    items.length > 0 &&
    (hasMoreFromMerge || acts.length === pageSize || cardioSessions.length === pageSize);

  return {
    items,
    cursor: nextCursor,
    hasMore,
  };
}

export function useCommunityFeed(
  followingIds: Set<string>,
  options?: { enabled?: boolean; pageSize?: number },
) {
  const { user } = useAuth();
  const pageSize = options?.pageSize ?? COMMUNITY_FEED_PAGE_SIZE;
  const authorIds = useMemo(
    () => communityFeedAuthorIds(followingIds, user?.id),
    [followingIds, user?.id],
  );
  const followsReady = options?.enabled ?? true;

  return useInfiniteQuery({
    queryKey: ["communityFeed", user?.id, pageSize, authorIds],
    staleTime: 60 * 1000,
    enabled: !!user && followsReady,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      return fetchCommunityFeedPage(authorIds, pageParam, pageSize);
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor : undefined),
  });
}
