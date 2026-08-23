import { useMemo, useCallback } from "react";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { useMyFollowersReceived } from "@/hooks/useMyFollowersReceived";
import {
  socialInteractionNotificationId,
  useMySocialInteractionsReceived,
} from "@/hooks/useMySocialInteractionsReceived";
import { buildNotificationFeed } from "@/lib/notificationFeed";
import type { InAppNotificationItem } from "@/types/inAppNotification";

/**
 * `true`: muestra siempre las notificaciones de diseño (seguidor, like, comentario)
 * con datos de ejemplo.
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
    {
      id: "design-preview-social-like",
      variant: "social-interaction",
      kind: "action",
      dismissable: true,
      interaction: "like",
      targetType: "actividad",
      targetId: "00000000-0000-4000-8000-000000000098",
      targetTitle: "Pecho y bíceps",
      autorId: "00000000-0000-4000-8000-000000000099",
      username: "ana_gym",
      avatarUrl: null,
      texto: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "design-preview-social-comment",
      variant: "social-interaction",
      kind: "action",
      dismissable: true,
      interaction: "comment",
      targetType: "cardio",
      targetId: "00000000-0000-4000-8000-000000000097",
      targetTitle: "Carrera matutina",
      autorId: "00000000-0000-4000-8000-000000000096",
      username: "carlos_run",
      avatarUrl: null,
      texto: "Menudo ritmo llevas, la próxima salimos juntos",
      createdAt: new Date().toISOString(),
    },
  ];
}

/** Más recientes primero; las que no tienen fecha (avisos del sistema) van al final. */
function byCreatedAtDesc(a: InAppNotificationItem, b: InAppNotificationItem) {
  const aDate = "createdAt" in a ? a.createdAt ?? "" : "";
  const bDate = "createdAt" in b ? b.createdAt ?? "" : "";
  return bDate.localeCompare(aDate);
}

/**
 * Notificaciones in-app derivadas del estado (sin tabla propia).
 * Las descartadas persisten en localStorage por usuario.
 * No dispara toasts: eso lo hacen `InAppFollowerToastSync` e `InAppSocialToastSync`.
 */
export function useInAppNotifications() {
  const { dismissed, dismiss, dismissMany } = useInAppNotificationsDismiss();

  const {
    data: followersReceived = [],
    isError: followersError,
  } = useMyFollowersReceived();

  const {
    data: socialInteractions = [],
    isError: socialError,
  } = useMySocialInteractionsReceived();

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
        createdAt: row.created_at,
      });
    }
    return list;
  }, [followersReceived, followersError, dismissed]);

  const socialNotifications = useMemo((): InAppNotificationItem[] => {
    if (HARDCODE_ALL_IN_APP_NOTIFICATIONS_FOR_DESIGN) return [];
    if (socialError) return [];
    const list: InAppNotificationItem[] = [];
    for (const row of socialInteractions) {
      const id = socialInteractionNotificationId(row);
      if (dismissed.has(id)) continue;
      list.push({
        id,
        variant: "social-interaction",
        kind: "action",
        dismissable: true,
        interaction: row.interaction,
        targetType: row.targetType,
        targetId: row.targetId,
        targetTitle: row.targetTitle,
        autorId: row.autorId,
        username: row.username,
        avatarUrl: row.avatarUrl,
        texto: row.texto,
        createdAt: row.createdAt,
      });
    }
    return list;
  }, [socialInteractions, socialError, dismissed]);

  const built = useMemo((): InAppNotificationItem[] => {
    if (HARDCODE_ALL_IN_APP_NOTIFICATIONS_FOR_DESIGN) {
      return buildDesignPreviewInAppNotifications();
    }

    return [...followerNotifications, ...socialNotifications].sort(byCreatedAtDesc);
  }, [followerNotifications, socialNotifications]);

  const items = useMemo(() => {
    return built.filter((n) => {
      if (!n.dismissable) return true;
      return !dismissed.has(n.id);
    });
  }, [built, dismissed]);

  const sections = useMemo(() => buildNotificationFeed(items), [items]);
  const unreadCount = useMemo(
    () => sections.reduce((total, section) => total + section.entries.length, 0),
    [sections],
  );

  const topItems = useMemo(() => items.slice(0, 3), [items]);

  const markAllRead = useCallback(() => {
    const dismissableIds = items.filter((i) => i.dismissable).map((i) => i.id);
    dismissMany(dismissableIds);
  }, [items, dismissMany]);

  return {
    items,
    sections,
    topItems,
    unreadCount,
    dismiss,
    dismissMany,
    markAllRead,
  };
}
