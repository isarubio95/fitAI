import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type FollowerReceivedRow = {
  id: string;
  seguidor_id: string;
  created_at: string;
  username: string | null;
  avatar_url: string | null;
};

/**
 * Filas de seguimiento donde el usuario actual es el seguido (quien recibe el follow).
 * Requiere RLS: SELECT permitido cuando seguido_id = auth.uid().
 */
export function useMyFollowersReceived() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["followers-received", user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<FollowerReceivedRow[]> => {
      const sb = supabase as any;
      const { data: rows, error } = await sb
        .from("seguimiento")
        .select("id, seguidor_id, created_at")
        .eq("seguido_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(40);

      if (error) throw error;
      const list = (rows ?? []) as { id: string; seguidor_id: string; created_at: string }[];
      const ids = [...new Set(list.map((r) => r.seguidor_id))];
      if (ids.length === 0) return [];

      const { data: profiles, error: pErr } = await sb
        .from("perfil")
        .select("id, username, avatar_url")
        .in("id", ids);
      if (pErr) throw pErr;

      const profileById = new Map(
        (
          (profiles ?? []) as {
            id: string;
            username: string | null;
            avatar_url: string | null;
          }[]
        ).map((p) => [p.id, p]),
      );

      return list.map((r) => {
        const p = profileById.get(r.seguidor_id);
        return {
          ...r,
          username: p?.username ?? null,
          avatar_url: p?.avatar_url ?? null,
        };
      });
    },
  });
}
