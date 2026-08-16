import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ExerciseFavoriteSource = "catalogo" | "usuario";

export type ExerciseFavoriteRef = {
  source: ExerciseFavoriteSource;
  id: string;
};

export function favoriteKey(source: ExerciseFavoriteSource, id: string): string {
  return `${source}:${id}`;
}

const EMPTY_FAVORITE_KEYS = new Set<string>();

async function fetchExerciseFavorites(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("ejercicio_favorito")
    .select("tipo_ejercicio_id, usuario_ejercicio_id")
    .eq("usuario_id", userId);

  if (error) throw error;

  const keys = new Set<string>();
  for (const row of data ?? []) {
    if (row.tipo_ejercicio_id) keys.add(favoriteKey("catalogo", row.tipo_ejercicio_id));
    if (row.usuario_ejercicio_id) keys.add(favoriteKey("usuario", row.usuario_ejercicio_id));
  }
  return keys;
}

export function useExerciseFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const queryKey = ["exerciseFavorites", user?.id] as const;

  const { data } = useQuery({
    queryKey,
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: () => fetchExerciseFavorites(user!.id),
  });

  const favoriteKeys = data ?? EMPTY_FAVORITE_KEYS;

  const isFavorite = useCallback(
    (source: ExerciseFavoriteSource, id: string) => favoriteKeys.has(favoriteKey(source, id)),
    [favoriteKeys],
  );

  const toggleFavorite = useMutation({
    mutationFn: async (ref: ExerciseFavoriteRef) => {
      if (!user) throw new Error("No user");
      const key = favoriteKey(ref.source, ref.id);
      const isFav = favoriteKeys.has(key);

      if (isFav) {
        let q = supabase.from("ejercicio_favorito").delete().eq("usuario_id", user.id);
        q =
          ref.source === "catalogo"
            ? q.eq("tipo_ejercicio_id", ref.id)
            : q.eq("usuario_ejercicio_id", ref.id);
        const { error } = await q;
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ejercicio_favorito").insert(
          ref.source === "catalogo"
            ? { usuario_id: user.id, tipo_ejercicio_id: ref.id, usuario_ejercicio_id: null }
            : { usuario_id: user.id, usuario_ejercicio_id: ref.id, tipo_ejercicio_id: null },
        );
        if (error) throw error;
      }
    },
    onMutate: async (ref) => {
      const key = favoriteKey(ref.source, ref.id);
      setToggling((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Set<string>>(queryKey);

      queryClient.setQueryData<Set<string>>(queryKey, (old) => {
        const next = new Set(old ?? []);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });

      return { previous };
    },
    onError: (_err, _ref, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
    onSettled: (_data, _err, ref) => {
      const key = favoriteKey(ref.source, ref.id);
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["exerciseFavorites", user?.id] });
    },
  });

  return {
    favoriteKeys,
    isFavorite,
    toggleFavorite: (ref: ExerciseFavoriteRef) => toggleFavorite.mutateAsync(ref),
    isToggling: (source: ExerciseFavoriteSource, id: string) =>
      toggling.has(favoriteKey(source, id)),
  };
}
