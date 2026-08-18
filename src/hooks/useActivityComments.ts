import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeActivityCommentText } from "@/lib/activitySocial";
import { useAuth } from "./useAuth";

export type ActivityCommentAuthor = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type ActivityComment = {
  id: string;
  actividad_id: string;
  usuario_id: string;
  texto: string;
  created_at: string;
  author: ActivityCommentAuthor;
};

export type ActivityCommentCountsState = {
  commentCounts: Record<string, number>;
  commentedIds: Set<string>;
};

function emptyCommentCountsState(): ActivityCommentCountsState {
  return { commentCounts: {}, commentedIds: new Set() };
}

function sortedIdsKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

async function fetchCommentCounts(
  userId: string,
  actividadIds: string[],
): Promise<ActivityCommentCountsState> {
  const commentCounts: Record<string, number> = {};
  const commentedIds = new Set<string>();
  for (const id of actividadIds) commentCounts[id] = 0;
  if (actividadIds.length === 0) return { commentCounts, commentedIds };

  const { data, error } = await supabase
    .from("actividad_comentario")
    .select("actividad_id, usuario_id")
    .in("actividad_id", actividadIds);

  if (error) throw error;

  for (const row of data ?? []) {
    commentCounts[row.actividad_id] = (commentCounts[row.actividad_id] ?? 0) + 1;
    if (row.usuario_id === userId) commentedIds.add(row.actividad_id);
  }
  return { commentCounts, commentedIds };
}

/** Conteos de comentarios en batch para las cards del feed. */
export function useActivityCommentCounts(actividadIds: string[]) {
  const { user } = useAuth();
  const idsKey = sortedIdsKey(actividadIds);
  const stableIds = useMemo(
    () => (idsKey ? idsKey.split(",").filter(Boolean) : []),
    [idsKey],
  );

  const { data } = useQuery({
    queryKey: ["activityCommentCounts", user?.id, idsKey],
    enabled: !!user && stableIds.length > 0,
    staleTime: 30 * 1000,
    queryFn: () => fetchCommentCounts(user!.id, stableIds),
  });

  return {
    commentCounts: data?.commentCounts ?? emptyCommentCountsState().commentCounts,
    commentedIds: data?.commentedIds ?? emptyCommentCountsState().commentedIds,
  };
}

async function fetchActivityComments(actividadId: string): Promise<ActivityComment[]> {
  const { data: rows, error } = await supabase
    .from("actividad_comentario")
    .select("id, actividad_id, usuario_id, texto, created_at")
    .eq("actividad_id", actividadId)
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
    return {
      id: row.id,
      actividad_id: row.actividad_id,
      usuario_id: row.usuario_id,
      texto: row.texto,
      created_at: row.created_at,
      author: {
        id: row.usuario_id,
        username: authorRow?.username ?? null,
        avatar_url: authorRow?.avatar_url ?? null,
      },
    };
  });
}

export function useActivityComments(actividadId: string | null, enabled = true) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["activityComments", actividadId] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user && !!actividadId && enabled,
    staleTime: 30 * 1000,
    queryFn: () => fetchActivityComments(actividadId!),
  });

  const addComment = useMutation({
    mutationFn: async (rawText: string) => {
      if (!user || !actividadId) throw new Error("No user or activity");
      const texto = normalizeActivityCommentText(rawText);
      if (!texto) throw new Error("Comentario inválido");

      const { data: inserted, error } = await supabase
        .from("actividad_comentario")
        .insert({
          actividad_id: actividadId,
          usuario_id: user.id,
          texto,
        })
        .select("id, actividad_id, usuario_id, texto, created_at")
        .single();

      if (error) throw error;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["activityCommentCounts"] });
    },
  });

  const removeComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("actividad_comentario")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["activityCommentCounts"] });
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
