import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { subYears, addYears } from "date-fns";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { usePlannedRoutines } from "@/hooks/useWorkoutPlan";
import { useCommunitySettings } from "@/hooks/useCommunitySettings";
import type { InAppNotificationItem } from "@/types/inAppNotification";

/**
 * Notificaciones in-app derivadas del estado (sin tabla propia).
 * Las descartadas persisten en localStorage por usuario.
 */
export function useInAppNotifications() {
  const { dismissed, dismiss, dismissMany } = useInAppNotificationsDismiss();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const { data: allPlannedRoutines, isLoading: plannedLoading } = usePlannedRoutines(
    subYears(today, 1),
    addYears(today, 2),
  );
  const plannedKnown = allPlannedRoutines !== undefined;
  const hasPlanned = plannedKnown ? allPlannedRoutines.length > 0 : false;

  const { comunidadPublicaActividad, isLoading: settingsLoading } = useCommunitySettings();

  const built = useMemo((): InAppNotificationItem[] => {
    const list: InAppNotificationItem[] = [];

    if (plannedKnown && !hasPlanned) {
      list.push({
        id: "plan-suggestion",
        kind: "action",
        title: "Planifica tu semana",
        body: "Crea una hoja de ruta para asignar rutinas a cada día.",
        dismissable: true,
        accion: {
          etiqueta: "Crear hoja de ruta",
          onClick: () => navigate("/", { state: { openPlanWizard: true } }),
        },
      });
    }

    if (!settingsLoading && !comunidadPublicaActividad) {
      list.push({
        id: "community-privacy-hint",
        kind: "info",
        title: "Comunidad",
        body: "Tus entrenos no aparecen en el feed público. Puedes activarlo en Ajustes (icono del engrane).",
        dismissable: true,
      });
    }

    return list;
  }, [plannedKnown, hasPlanned, settingsLoading, comunidadPublicaActividad, navigate]);

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
