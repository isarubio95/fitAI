import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  SocialInteractionTargetType,
  SocialInteractionType,
} from "@/types/inAppNotification";
import { useAuth } from "./useAuth";

/** Publicaciones propias que vigilamos: las interacciones llegan casi siempre sobre lo último. */
const WATCHED_POSTS_LIMIT = 60;
const INTERACTIONS_PER_TABLE_LIMIT = 40;
const MAX_INTERACTIONS = 40;
/** Evita arrastrar interacciones antiguas al entrar desde un dispositivo nuevo. */
const MAX_AGE_DAYS = 30;

export type SocialInteractionReceivedRow = {
  /** Id de la fila de like/comentario. */
  id: string;
  interaction: SocialInteractionType;
  targetType: SocialInteractionTargetType;
  targetId: string;
  targetTitle: string;
  autorId: string;
  /** Solo en comentarios. */
  texto: string | null;
  createdAt: string;
  username: string | null;
  avatarUrl: string | null;
};

export function socialInteractionNotificationId(
  row: Pick<SocialInteractionReceivedRow, "id" | "interaction" | "targetType">,
): string {
  return `social-${row.interaction}-${row.targetType}-${row.id}`;
}

type RawInteraction = {
  id: string;
  targetId: string;
  autorId: string;
  texto: string | null;
  createdAt: string;
};

async function fetchActividadLikes(
  actividadIds: string[],
  userId: string,
  since: string,
): Promise<RawInteraction[]> {
  if (actividadIds.length === 0) return [];
  const { data, error } = await supabase
    .from("actividad_like")
    .select("id, actividad_id, usuario_id, created_at")
    .in("actividad_id", actividadIds)
    .neq("usuario_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(INTERACTIONS_PER_TABLE_LIMIT);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    targetId: row.actividad_id,
    autorId: row.usuario_id,
    texto: null,
    createdAt: row.created_at,
  }));
}

async function fetchActividadComentarios(
  actividadIds: string[],
  userId: string,
  since: string,
): Promise<RawInteraction[]> {
  if (actividadIds.length === 0) return [];
  const { data, error } = await supabase
    .from("actividad_comentario")
    .select("id, actividad_id, usuario_id, texto, created_at")
    .in("actividad_id", actividadIds)
    .neq("usuario_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(INTERACTIONS_PER_TABLE_LIMIT);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    targetId: row.actividad_id,
    autorId: row.usuario_id,
    texto: row.texto,
    createdAt: row.created_at,
  }));
}

async function fetchCardioLikes(
  sesionIds: string[],
  userId: string,
  since: string,
): Promise<RawInteraction[]> {
  if (sesionIds.length === 0) return [];
  const { data, error } = await supabase
    .from("cardio_sesion_like")
    .select("id, cardio_sesion_id, usuario_id, created_at")
    .in("cardio_sesion_id", sesionIds)
    .neq("usuario_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(INTERACTIONS_PER_TABLE_LIMIT);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    targetId: row.cardio_sesion_id,
    autorId: row.usuario_id,
    texto: null,
    createdAt: row.created_at,
  }));
}

async function fetchCardioComentarios(
  sesionIds: string[],
  userId: string,
  since: string,
): Promise<RawInteraction[]> {
  if (sesionIds.length === 0) return [];
  const { data, error } = await supabase
    .from("cardio_sesion_comentario")
    .select("id, cardio_sesion_id, usuario_id, texto, created_at")
    .in("cardio_sesion_id", sesionIds)
    .neq("usuario_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(INTERACTIONS_PER_TABLE_LIMIT);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    targetId: row.cardio_sesion_id,
    autorId: row.usuario_id,
    texto: row.texto,
    createdAt: row.created_at,
  }));
}

/**
 * Likes y comentarios que otros usuarios han dejado en los entrenos y sesiones
 * de cardio del usuario actual. Base de las notificaciones in-app sociales.
 *
 * Las RLS de `*_like` / `*_comentario` permiten leerlos al dueño de la publicación.
 */
export function useMySocialInteractionsReceived() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["social-interactions-received", user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<SocialInteractionReceivedRow[]> => {
      const userId = user!.id;
      const since = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const [actividades, sesiones] = await Promise.all([
        supabase
          .from("actividad")
          .select("id, titulo")
          .eq("usuario_id", userId)
          .order("fecha", { ascending: false })
          .limit(WATCHED_POSTS_LIMIT),
        supabase
          .from("cardio_sesion")
          .select("id, titulo")
          .eq("usuario_id", userId)
          .order("fecha_inicio", { ascending: false })
          .limit(WATCHED_POSTS_LIMIT),
      ]);

      if (actividades.error) throw actividades.error;
      if (sesiones.error) throw sesiones.error;

      const actividadTitles = new Map((actividades.data ?? []).map((a) => [a.id, a.titulo] as const));
      const cardioTitles = new Map((sesiones.data ?? []).map((s) => [s.id, s.titulo] as const));
      const actividadIds = [...actividadTitles.keys()];
      const cardioIds = [...cardioTitles.keys()];

      if (actividadIds.length === 0 && cardioIds.length === 0) return [];

      const [actividadLikes, actividadComentarios, cardioLikes, cardioComentarios] = await Promise.all([
        fetchActividadLikes(actividadIds, userId, since),
        fetchActividadComentarios(actividadIds, userId, since),
        fetchCardioLikes(cardioIds, userId, since),
        fetchCardioComentarios(cardioIds, userId, since),
      ]);

      const merged: Omit<SocialInteractionReceivedRow, "username" | "avatarUrl">[] = [
        ...actividadLikes.map((r) => ({
          ...r,
          interaction: "like" as const,
          targetType: "actividad" as const,
          targetTitle: actividadTitles.get(r.targetId) ?? "tu entreno",
        })),
        ...actividadComentarios.map((r) => ({
          ...r,
          interaction: "comment" as const,
          targetType: "actividad" as const,
          targetTitle: actividadTitles.get(r.targetId) ?? "tu entreno",
        })),
        ...cardioLikes.map((r) => ({
          ...r,
          interaction: "like" as const,
          targetType: "cardio" as const,
          targetTitle: cardioTitles.get(r.targetId) ?? "tu sesión de cardio",
        })),
        ...cardioComentarios.map((r) => ({
          ...r,
          interaction: "comment" as const,
          targetType: "cardio" as const,
          targetTitle: cardioTitles.get(r.targetId) ?? "tu sesión de cardio",
        })),
      ]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, MAX_INTERACTIONS);

      if (merged.length === 0) return [];

      const autorIds = [...new Set(merged.map((r) => r.autorId))];
      const { data: perfiles, error: perfilError } = await supabase
        .from("perfil")
        .select("id, username, avatar_url")
        .in("id", autorIds);

      if (perfilError) throw perfilError;

      const perfilById = new Map((perfiles ?? []).map((p) => [p.id, p] as const));

      return merged.map((row) => {
        const perfil = perfilById.get(row.autorId);
        return {
          ...row,
          username: perfil?.username ?? null,
          avatarUrl: perfil?.avatar_url ?? null,
        };
      });
    },
  });
}
