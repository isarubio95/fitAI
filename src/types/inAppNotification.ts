export type InAppNotificationKind = "info" | "action";

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
}

export type InAppNotificationItem = StandardInAppNotificationItem | NewFollowerInAppNotificationItem;

export function isNewFollowerNotification(
  item: InAppNotificationItem,
): item is NewFollowerInAppNotificationItem {
  return item.variant === "new-follower";
}
