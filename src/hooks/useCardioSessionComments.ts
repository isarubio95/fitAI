import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeActivityCommentText } from "@/lib/activitySocial";
import { useAuth } from "./useAuth";
import type { ActivityComment, ActivityCommentAuthor } from "./useActivityComments";

export type CardioSessionComment = Omit<ActivityComment, "actividad_id"> & {
  cardio_sesion_id: string;
};

function sortedIdsKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

async function fetchCommentCounts(sessionIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of sessionIds) counts[id] = 0;
  if (sessionIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("cardio_sesion_comentario")
    .select("cardio_sesion_id")
    .in("cardio_sesion_id", sessionIds);

  if (error) throw error;

  for (const row of data ?? []) {
    counts[row.cardio_sesion_id] = (counts[row.cardio_sesion_id] ?? 0) + 1;
  }
  return counts;
}

/** Conteos de comentarios en batch para cards de cardio. */
export function useCardioSessionCommentCounts(sessionIds: string[]) {
  const { user } = useAuth();
  const idsKey = sortedIdsKey(sessionIds);
  const stableIds = useMemo(
    () => (idsKey ? idsKey.split(",").filter(Boolean) : []),
    [idsKey],
  );

  const { data } = useQuery({
    queryKey: ["cardioSessionCommentCounts", idsKey],
    enabled: !!user && stableIds.length > 0,
    staleTime: 30 * 1000,
    queryFn: () => fetchCommentCounts(stableIds),
  });

  return { commentCounts: data ?? {} };
}

async function fetchCardioSessionComments(sessionId: string): Promise<CardioSessionComment[]> {
  const { data: rows, error } = await supabase
    .from("cardio_sesion_comentario")
    .select("id, cardio_sesion_id, usuario_id, texto, created_at")
    .eq("cardio_sesion_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!rows?.length) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.usuario_id)));
  const { data: perfiles, error: pErr } = await supabase
    .from("perfil")
    .select("id, username, avatar_url")
    .in("id", userIds);

  if (pErr) throw pErr;

  const byId = new Map((perfiles ?? []).map((p) => [p.id, p] as const));

  return rows.map((row) => {
    const authorRow = byId.get(row.usuario_id);
    const author: ActivityCommentAuthor = {
      id: row.usuario_id,
      username: authorRow?.username ?? null,
      avatar_url: authorRow?.avatar_url ?? null,
    };
    return {
      id: row.id,
      cardio_sesion_id: row.cardio_sesion_id,
      usuario_id: row.usuario_id,
      texto: row.texto,
      created_at: row.created_at,
      author,
    };
  });
}

export function useCardioSessionComments(sessionId: string | null, enabled = true) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["cardioSessionComments", sessionId] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user && !!sessionId && enabled,
    staleTime: 30 * 1000,
    queryFn: () => fetchCardioSessionComments(sessionId!),
  });

  const addComment = useMutation({
    mutationFn: async (rawText: string) => {
      if (!user || !sessionId) throw new Error("No user or session");
      const texto = normalizeActivityCommentText(rawText);
      if (!texto) throw new Error("Comentario inválido");

      const { data: inserted, error } = await supabase
        .from("cardio_sesion_comentario")
        .insert({
          cardio_sesion_id: sessionId,
          usuario_id: user.id,
          texto,
        })
        .select("id, cardio_sesion_id, usuario_id, texto, created_at")
        .single();

      if (error) throw error;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["cardioSessionCommentCounts"] });
    },
  });

  const removeComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("cardio_sesion_comentario")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["cardioSessionCommentCounts"] });
    },
  });

  return {
    comments: data ?? [],
    isLoading,
    addComment: (text: string) => addComment.mutateAsync(text),
    removeComment: (commentId: string) => removeComment.mutateAsync(commentId),
    isAdding: addComment.isPending,
    isRemoving: removeComment.isPending,
  };
}
