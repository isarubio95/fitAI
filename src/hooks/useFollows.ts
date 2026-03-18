import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFollows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ["follows", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<{ seguido_id: string }[]> => {
      const { data, error } = await supabase
        .from("seguimiento")
        .select("seguido_id")
        .eq("seguidor_id", user!.id);

      if (error) throw error;
      return (data ?? []) as { seguido_id: string }[];
    },
  });

  const followingIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of data ?? []) ids.add(row.seguido_id);
    return ids;
  }, [data]);

  const toggleFollow = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user) throw new Error("No user");

      const isFollowing = followingIds.has(targetId);

      if (isFollowing) {
        const { error } = await supabase
          .from("seguimiento")
          .delete()
          .eq("seguidor_id", user.id)
          .eq("seguido_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seguimiento")
          .insert({
            seguidor_id: user.id,
            seguido_id: targetId,
          } as any);
        if (error) throw error;
      }
    },
    onMutate: async (targetId: string) => {
      setToggling((prev) => {
        const next = new Set(prev);
        next.add(targetId);
        return next;
      });
    },
    onSettled: () => {
      setToggling(new Set());
      queryClient.invalidateQueries({ queryKey: ["follows", user?.id] });
    },
  });

  return {
    followingIds,
    toggleFollow: (targetId: string) => toggleFollow.mutateAsync(targetId),
    isToggling: toggling,
  };
}

