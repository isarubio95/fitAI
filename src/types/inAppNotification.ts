export type InAppNotificationKind = "info" | "action";

export type SocialInteractionType = "like" | "comment";
export type SocialInteractionTargetType = "actividad" | "cardio";

export interface StandardInAppNotificationItem {
  variant?: undefined;
  id: string;
  kind: InAppNotificationKind;
  title: string;
  body?: string;
  /** Si false, no se oculta al descartar (p. ej. entreno en curso hasta que termine). */
  dismissable: boolean;
  accion?: { etiqueta: string; onClick: () => void };
}

export interface NewFollowerInAppNotificationItem {
  variant: "new-follower";
  id: string;
  kind: "action";
  dismissable: boolean;
  seguidorId: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt?: string;
}

/** Like o comentario que alguien ha dejado en un entreno o sesión de cardio propios. */
export interface SocialInteractionInAppNotificationItem {
  variant: "social-interaction";
  id: string;
  kind: "action";
  dismissable: boolean;
  interaction: SocialInteractionType;
  targetType: SocialInteractionTargetType;
  targetId: string;
  targetTitle: string;
  autorId: string;
  username: string | null;
  avatarUrl: string | null;
  /** Solo en comentarios. */
  texto: string | null;
  createdAt: string;
}

export type InAppNotificationItem =
  | StandardInAppNotificationItem
  | NewFollowerInAppNotificationItem
  | SocialInteractionInAppNotificationItem;

export function isNewFollowerNotification(
  item: InAppNotificationItem,
): item is NewFollowerInAppNotificationItem {
  return item.variant === "new-follower";
}

export function isSocialInteractionNotification(
  item: InAppNotificationItem,
): item is SocialInteractionInAppNotificationItem {
  return item.variant === "social-interaction";
}
