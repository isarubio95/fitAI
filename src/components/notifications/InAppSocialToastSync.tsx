import { useEffect } from "react";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { useAuth } from "@/hooks/useAuth";
import {
  socialInteractionNotificationId,
  useMySocialInteractionsReceived,
} from "@/hooks/useMySocialInteractionsReceived";
import { createInAppToastSeenStore } from "@/lib/inAppToastSeenStore";
import { notifySocialInteractionToast } from "@/components/notifications/inAppSocialToast";

const socialToastSeen = createInAppToastSeenStore("social");

/**
 * Toasts de likes y comentarios recibidos.
 * Debe montarse UNA sola vez (dentro de InAppNotificationsProvider).
 * Las campanas solo usan `useInAppNotifications` para la lista.
 */
export function InAppSocialToastSync() {
  const { user } = useAuth();
  const { dismissed, dismissMany } = useInAppNotificationsDismiss();

  const {
    data: interactions = [],
    isSuccess,
    isError,
  } = useMySocialInteractionsReceived();

  useEffect(() => {
    if (!user?.id || !isSuccess || isError) return;

    socialToastSeen.ensureHydrated(user.id);

    if (!socialToastSeen.isSeeded(user.id)) {
      // Marcar como vistas antes de descartar: si `dismissed` aún no se ha
      // propagado, un re-render no debe disparar toasts históricos.
      socialToastSeen.markSeeded(user.id);
      for (const row of interactions) {
        socialToastSeen.markShown(user.id, row.id);
      }
      const seedIds = interactions.map(socialInteractionNotificationId);
      if (seedIds.length > 0) {
        dismissMany(seedIds);
      }
      return;
    }

    for (const row of interactions) {
      if (dismissed.has(socialInteractionNotificationId(row))) continue;
      if (socialToastSeen.hasShown(row.id)) continue;
      socialToastSeen.markShown(user.id, row.id);
      notifySocialInteractionToast(row);
    }
  }, [user?.id, isSuccess, isError, interactions, dismissed, dismissMany]);

  return null;
}
