import type {
  SocialInteractionTargetType,
  SocialInteractionType,
} from "@/types/inAppNotification";

const COMMENT_PREVIEW_MAX_CHARS = 140;

export function socialInteractionTitle(interaction: SocialInteractionType): string {
  return interaction === "like" ? "Nuevo me gusta" : "Nuevo comentario";
}

export function socialInteractionTargetLabel(targetType: SocialInteractionTargetType): string {
  return targetType === "cardio" ? "tu sesión de cardio" : "tu entreno";
}

export function socialInteractionAuthorName(username: string | null): string {
  return username?.trim() || "Usuario";
}

export function socialInteractionCommentPreview(texto: string | null): string {
  const clean = texto?.trim() ?? "";
  if (!clean) return "";
  const short =
    clean.length > COMMENT_PREVIEW_MAX_CHARS
      ? `${clean.slice(0, COMMENT_PREVIEW_MAX_CHARS).trimEnd()}…`
      : clean;
  return `«${short}»`;
}

export function socialInteractionToastMessage(params: {
  interaction: SocialInteractionType;
  targetType: SocialInteractionTargetType;
  username: string | null;
}): string {
  const name = params.username?.trim() || "Alguien";
  const target = socialInteractionTargetLabel(params.targetType);
  return params.interaction === "like"
    ? `A ${name} le ha gustado ${target}`
    : `${name} ha comentado ${target}`;
}
