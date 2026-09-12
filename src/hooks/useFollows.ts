import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

type FollowRow = { seguido_id: string };
type FollowCounts = { seguidores: number; seguidos: number };
type ToggleFollowInput = { targetId: string; wasFollowing: boolean };

function followSetFromRows(rows: FollowRow[] | undefined): Set<string> {
  const ids = new Set<string>();
  for (const row of rows ?? []) ids.add(row.seguido_id);
  return ids;
}

function bumpFollowCount(
  counts: FollowCounts | undefined,
  field: keyof FollowCounts,
  delta: number,
): FollowCounts | undefined {
  if (!counts) return counts;
  return { ...counts, [field]: Math.max(0, counts[field] + delta) };
}

export function useFollows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const { data, isFetched } = useQuery({
    queryKey: ["follows", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<FollowRow[]> => {
      const { data, error } = await supabase
        .from("seguimiento")
        .select("seguido_id")
        .eq("seguidor_id", user!.id);

      if (error) throw error;
      return (data ?? []) as FollowRow[];
    },
  });

  const followingIds = useMemo(() => followSetFromRows(data), [data]);

  const toggleFollow = useMutation({
    mutationFn: async ({ targetId, wasFollowing }: ToggleFollowInput) => {
      if (!user) throw new Error("No user");
      if (targetId === user.id) return { skipped: true as const };

      if (wasFollowing) {
        const { error } = await supabase
          .from("seguimiento")
          .delete()
          .eq("seguidor_id", user.id)
          .eq("seguido_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("seguimiento").insert({
          seguidor_id: user.id,
          seguido_id: targetId,
        });
        if (error) throw error;
      }
      return { skipped: false as const, wasFollowing };
    },
    onMutate: async ({ targetId, wasFollowing }) => {
      if (!user || targetId === user.id) return undefined;

      setToggling((prev) => {
        const next = new Set(prev);
        next.add(targetId);
        return next;
      });

      await queryClient.cancelQueries({ queryKey: ["follows", user.id] });
      await queryClient.cancelQueries({ queryKey: ["follow-counts"] });

      const previousFollows = queryClient.getQueryData<FollowRow[]>(["follows", user.id]);
      const delta = wasFollowing ? -1 : 1;

      queryClient.setQueryData<FollowRow[]>(["follows", user.id], (old = []) =>
        wasFollowing ? old.filter((row) => row.seguido_id !== targetId) : [...old, { seguido_id: targetId }],
      );

      const prevTargetCounts = queryClient.getQueryData<FollowCounts>(["follow-counts", targetId]);
      const prevSelfCounts = queryClient.getQueryData<FollowCounts>(["follow-counts", user.id]);

      queryClient.setQueryData<FollowCounts>(["follow-counts", targetId], (prev) =>
        bumpFollowCount(prev, "seguidores", delta),
      );
      queryClient.setQueryData<FollowCounts>(["follow-counts", user.id], (prev) =>
        bumpFollowCount(prev, "seguidos", delta),
      );

      return { previousFollows, prevTargetCounts, prevSelfCounts, wasFollowing };
    },
    onError: (_error, { targetId }, context) => {
      if (!user) return;
      if (context?.previousFollows !== undefined) {
        queryClient.setQueryData(["follows", user.id], context.previousFollows);
      }
      if (context?.prevTargetCounts !== undefined) {
        queryClient.setQueryData(["follow-counts", targetId], context.prevTargetCounts);
      }
      if (context?.prevSelfCounts !== undefined) {
        queryClient.setQueryData(["follow-counts", user.id], context.prevSelfCounts);
      }
      toast({
        title: context?.wasFollowing ? "No se pudo dejar de seguir" : "No se pudo seguir",
        description: "Toca de nuevo para reintentar.",
        variant: "destructive",
      });
    },
    onSettled: (_data, _error, { targetId }) => {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      if (!user) return;
      queryClient.invalidateQueries({ queryKey: ["follows", user.id] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts"] });
      queryClient.invalidateQueries({ queryKey: ["follow-users"] });
      queryClient.invalidateQueries({ queryKey: ["followers-received", user.id] });
    },
  });

  return {
    followingIds,
    isFetched,
    toggleFollow: (targetId: string) =>
      toggleFollow.mutateAsync({
        targetId,
        wasFollowing: followingIds.has(targetId),
      }),
    isToggling: toggling,
  };
}
