import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { ActivityLikesState } from "./useActivityLikes";

function emptyLikesState(): ActivityLikesState {
  return { likeCounts: {}, likedIds: new Set() };
}

function sortedIdsKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

async function fetchCardioSessionLikes(
  userId: string,
  sessionIds: string[],
): Promise<ActivityLikesState> {
  if (sessionIds.length === 0) return emptyLikesState();

  const { data, error } = await supabase
    .from("cardio_sesion_like")
    .select("cardio_sesion_id, usuario_id")
    .in("cardio_sesion_id", sessionIds);

  if (error) throw error;

  const likeCounts: Record<string, number> = {};
  const likedIds = new Set<string>();

  for (const id of sessionIds) likeCounts[id] = 0;

  for (const row of data ?? []) {
    likeCounts[row.cardio_sesion_id] = (likeCounts[row.cardio_sesion_id] ?? 0) + 1;
    if (row.usuario_id === userId) likedIds.add(row.cardio_sesion_id);
  }

  return { likeCounts, likedIds };
}

export function useCardioSessionLikes(sessionIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const idsKey = sortedIdsKey(sessionIds);
  const stableIds = useMemo(
    () => (idsKey ? idsKey.split(",").filter(Boolean) : []),
    [idsKey],
  );

  const queryKey = ["cardioSessionLikes", user?.id, idsKey] as const;

  const { data } = useQuery({
    queryKey,
    enabled: !!user && stableIds.length > 0,
    staleTime: 30 * 1000,
    queryFn: () => fetchCardioSessionLikes(user!.id, stableIds),
  });

  const likeCounts = data?.likeCounts ?? {};
  const likedIds = data?.likedIds ?? new Set<string>();

  const toggleLike = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error("No user");
      const isLiked = likedIds.has(sessionId);

      if (isLiked) {
        const { error } = await supabase
          .from("cardio_sesion_like")
          .delete()
          .eq("cardio_sesion_id", sessionId)
          .eq("usuario_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cardio_sesion_like").insert({
          cardio_sesion_id: sessionId,
          usuario_id: user.id,
        });
        if (error) throw error;
      }
    },
    onMutate: async (sessionId: string) => {
      setToggling((prev) => {
        const next = new Set(prev);
        next.add(sessionId);
        return next;
      });

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ActivityLikesState>(queryKey);

      queryClient.setQueryData<ActivityLikesState>(queryKey, (old) => {
        const base = old ?? emptyLikesState();
        const nextLiked = new Set(base.likedIds);
        const nextCounts = { ...base.likeCounts };
        const wasLiked = nextLiked.has(sessionId);
        if (wasLiked) {
          nextLiked.delete(sessionId);
          nextCounts[sessionId] = Math.max(0, (nextCounts[sessionId] ?? 1) - 1);
        } else {
          nextLiked.add(sessionId);
          nextCounts[sessionId] = (nextCounts[sessionId] ?? 0) + 1;
        }
        return { likeCounts: nextCounts, likedIds: nextLiked };
      });

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
    onSettled: () => {
      setToggling(new Set());
      queryClient.invalidateQueries({ queryKey: ["cardioSessionLikes", user?.id] });
    },
  });

  return {
    likeCounts,
    likedIds,
    toggleLike: (sessionId: string) => toggleLike.mutateAsync(sessionId),
    isToggling: toggling,
  };
}
