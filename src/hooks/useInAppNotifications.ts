import { useMemo, useCallback } from "react";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { useMyFollowersReceived } from "@/hooks/useMyFollowersReceived";
import type { InAppNotificationItem } from "@/types/inAppNotification";

/**
 * `true`: muestra siempre las notificaciones de diseño (seguidor) con datos de ejemplo.
 * Pon `false` cuando termines de maquetar o antes de desplegar.
 *
 * Si las descartas y quieres verlas otra vez: en localStorage quita del array de
 * `gym-log.notifications.dismissed:<userId>` los ids `design-preview-*`, o cambia
 * esos ids en `buildDesignPreviewInAppNotifications` abajo.
 */
const HARDCODE_ALL_IN_APP_NOTIFICATIONS_FOR_DESIGN = false;

function buildDesignPreviewInAppNotifications(): InAppNotificationItem[] {
  return [
    {
      id: "design-preview-new-follower",
      variant: "new-follower",
      kind: "action",
      dismissable: true,
      seguidorId: "00000000-0000-4000-8000-000000000099",
      username: "ana_gym",
      avatarUrl: null,
    },
  ];
}

/**
 * Notificaciones in-app derivadas del estado (sin tabla propia).
 * Las descartadas persisten en localStorage por usuario.
 * No dispara toasts: eso lo hace `InAppFollowerToastSync`.
 */
export function useInAppNotifications() {
  const { dismissed, dismiss, dismissMany } = useInAppNotificationsDismiss();

  const {
    data: followersReceived = [],
    isError: followersError,
  } = useMyFollowersReceived();

  const followerNotifications = useMemo((): InAppNotificationItem[] => {
    if (HARDCODE_ALL_IN_APP_NOTIFICATIONS_FOR_DESIGN) return [];
    if (followersError) return [];
    const list: InAppNotificationItem[] = [];
    for (const row of followersReceived) {
      const id = `new-follow-${row.id}`;
      if (dismissed.has(id)) continue;
      list.push({
        id,
        variant: "new-follower",
        kind: "action",
        dismissable: true,
        seguidorId: row.seguidor_id,
        username: row.username,
        avatarUrl: row.avatar_url,
      });
    }
    return list;
  }, [followersReceived, followersError, dismissed]);

  const built = useMemo((): InAppNotificationItem[] => {
    if (HARDCODE_ALL_IN_APP_NOTIFICATIONS_FOR_DESIGN) {
      return buildDesignPreviewInAppNotifications();
    }

    return [...followerNotifications];
  }, [followerNotifications]);

  const items = useMemo(() => {
    return built.filter((n) => {
      if (!n.dismissable) return true;
      return !dismissed.has(n.id);
    });
  }, [built, dismissed]);

  const unreadCount = items.length;

  const topItems = useMemo(() => items.slice(0, 3), [items]);

  const markAllRead = useCallback(() => {
    const dismissableIds = items.filter((i) => i.dismissable).map((i) => i.id);
    dismissMany(dismissableIds);
  }, [items, dismissMany]);

  return {
    items,
    topItems,
    unreadCount,
    dismiss,
    markAllRead,
  };
}
