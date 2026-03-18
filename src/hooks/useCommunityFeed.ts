import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type CommunityAuthor = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type CommunityFeedItem = {
  id: string;
  titulo: string;
  fecha: string;
  comentarios: string | null;
  author: CommunityAuthor;
};

export function useCommunityFeed() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["communityFeed"],
    staleTime: 60 * 1000,
    enabled: !!user,
    queryFn: async (): Promise<CommunityFeedItem[]> => {
      // Nota: para que funcione bien con privacidad, `actividad.es_publica` debe existir en BD.
      const { data: actividades, error } = await supabase
        .from("actividad")
        .select("id, titulo, fecha, comentarios, usuario_id")
        .eq("es_publica", true)
        .neq("usuario_id", user!.id)
        .order("fecha", { ascending: false })
        .limit(50);

      if (error) throw error;

      const acts = (actividades ?? []) as unknown as Array<{
        id: string;
        titulo: string;
        fecha: string;
        comentarios: string | null;
        usuario_id: string;
      }>;

      if (acts.length === 0) return [];

      const userIds = Array.from(new Set(acts.map((a) => a.usuario_id)));
      const { data: perfiles, error: pErr } = await supabase
        .from("perfil")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (pErr) throw pErr;

      const byId = new Map(
        (perfiles ?? []).map((p) => [p.id, p] as const)
      );

      return acts.map((a) => {
        const author = byId.get(a.usuario_id) ?? { id: a.usuario_id, username: null, avatar_url: null };
        return {
          id: a.id,
          titulo: a.titulo,
          fecha: a.fecha,
          comentarios: a.comentarios,
          author: {
            id: author.id,
            username: author.username ?? null,
            avatar_url: author.avatar_url ?? null,
          },
        };
      });
    },
  });
}

