import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkoutById } from "@/hooks/useWorkouts";
import { useCardioSessionById } from "@/hooks/useCardioSessions";
import type { CommunityAuthor, CommunityFeedItem } from "@/hooks/useCommunityFeed";

function authorFromProfile(
  userId: string,
  row: { username: string | null; avatar_url: string | null } | null | undefined,
): CommunityAuthor {
  return {
    id: userId,
    username: row?.username ?? null,
    avatar_url: row?.avatar_url ?? null,
  };
}

/** Entreno o cardio al que apunta `/community?gym=` / `?cardio=`, aunque no esté en el feed. */
export function useCommunityFocusedItem(gymId: string | null, cardioId: string | null) {
  const { data: workout, isLoading: loadingGym } = useWorkoutById(gymId);
  const { data: session, isLoading: loadingCardio } = useCardioSessionById(cardioId);
  const authorId = workout?.usuario_id ?? session?.usuario_id ?? null;

  const { data: profile } = useQuery({
    queryKey: ["community-focus-author", authorId],
    enabled: !!authorId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username, avatar_url")
        .eq("id", authorId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const item = useMemo((): CommunityFeedItem | null => {
    if (gymId && workout) {
      return {
        type: "gym",
        workout,
        fecha: workout.fecha,
        author: authorFromProfile(workout.usuario_id, profile),
      };
    }
    if (cardioId && session) {
      return {
        type: "cardio",
        session,
        fecha: session.fecha_inicio,
        author: authorFromProfile(session.usuario_id, profile),
      };
    }
    return null;
  }, [gymId, cardioId, workout, session, profile]);

  return {
    item,
    isLoading: (!!gymId && loadingGym) || (!!cardioId && loadingCardio),
  };
}
