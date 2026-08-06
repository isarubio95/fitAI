import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ActivityLikesState = {
  likeCounts: Record<string, number>;
  likedIds: Set<string>;
};

function emptyLikesState(): ActivityLikesState {
  return { likeCounts: {}, likedIds: new Set() };
}

function sortedIdsKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

async function fetchActivityLikes(
  userId: string,
  actividadIds: string[],
): Promise<ActivityLikesState> {
  if (actividadIds.length === 0) return emptyLikesState();

  const { data, error } = await supabase
    .from("actividad_like")
    .select("actividad_id, usuario_id")
    .in("actividad_id", actividadIds);

  if (error) throw error;

  const likeCounts: Record<string, number> = {};
  const likedIds = new Set<string>();

  for (const id of actividadIds) likeCounts[id] = 0;

  for (const row of data ?? []) {
    likeCounts[row.actividad_id] = (likeCounts[row.actividad_id] ?? 0) + 1;
    if (row.usuario_id === userId) likedIds.add(row.actividad_id);
  }

  return { likeCounts, likedIds };
}

export function useActivityLikes(actividadIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const idsKey = sortedIdsKey(actividadIds);
  const stableIds = useMemo(
    () => (idsKey ? idsKey.split(",").filter(Boolean) : []),
    [idsKey],
  );

  const queryKey = ["activityLikes", user?.id, idsKey] as const;

  const { data } = useQuery({
    queryKey,
    enabled: !!user && stableIds.length > 0,
    staleTime: 30 * 1000,
    queryFn: () => fetchActivityLikes(user!.id, stableIds),
  });

  const likeCounts = data?.likeCounts ?? {};
  const likedIds = data?.likedIds ?? new Set<string>();

  const toggleLike = useMutation({
    mutationFn: async (actividadId: string) => {
      if (!user) throw new Error("No user");
      const isLiked = likedIds.has(actividadId);

      if (isLiked) {
        const { error } = await supabase
          .from("actividad_like")
          .delete()
          .eq("actividad_id", actividadId)
          .eq("usuario_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("actividad_like").insert({
          actividad_id: actividadId,
          usuario_id: user.id,
        });
        if (error) throw error;
      }
    },
    onMutate: async (actividadId: string) => {
      setToggling((prev) => {
        const next = new Set(prev);
        next.add(actividadId);
        return next;
      });

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ActivityLikesState>(queryKey);

      queryClient.setQueryData<ActivityLikesState>(queryKey, (old) => {
        const base = old ?? emptyLikesState();
        const nextLiked = new Set(base.likedIds);
        const nextCounts = { ...base.likeCounts };
        const wasLiked = nextLiked.has(actividadId);
        if (wasLiked) {
          nextLiked.delete(actividadId);
          nextCounts[actividadId] = Math.max(0, (nextCounts[actividadId] ?? 1) - 1);
        } else {
          nextLiked.add(actividadId);
          nextCounts[actividadId] = (nextCounts[actividadId] ?? 0) + 1;
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
      queryClient.invalidateQueries({ queryKey: ["activityLikes", user?.id] });
    },
  });

  return {
    likeCounts,
    likedIds,
    toggleLike: (actividadId: string) => toggleLike.mutateAsync(actividadId),
    isToggling: toggling,
  };
}
