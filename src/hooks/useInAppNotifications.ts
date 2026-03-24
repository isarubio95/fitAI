import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { subYears, addYears } from "date-fns";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { usePlannedRoutines } from "@/hooks/useWorkoutPlan";
import { useCommunitySettings } from "@/hooks/useCommunitySettings";
import { useMyFollowersReceived } from "@/hooks/useMyFollowersReceived";
import type { InAppNotificationItem } from "@/types/inAppNotification";
import { useAuth } from "@/hooks/useAuth";

/**
 * `true`: muestra siempre las 3 notificaciones (nuevo seguidor, plan, comunidad) con datos de ejemplo.
 * Pon `false` cuando termines de maquetar o antes de desplegar.
 *
 * Si las descartas y quieres verlas otra vez: en localStorage quita del array de
 * `gym-log.notifications.dismissed:<userId>` los ids `design-preview-*`, o cambia
 * esos ids en `buildDesignPreviewInAppNotifications` abajo.
 */
const HARDCODE_ALL_IN_APP_NOTIFICATIONS_FOR_DESIGN = false;

const FOLLOWER_SEED_LS = (userId: string) => `gym-log.notifications.follower-seed:${userId}`;
const FOLLOWER_TOAST_SESSION = (userId: string) => `gym-log.follower-toast-session:${userId}`;

function loadToastedFollowerIds(userId: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(FOLLOWER_TOAST_SESSION(userId));
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function rememberToastedFollowerId(userId: string, id: string) {
  try {
    const next = loadToastedFollowerIds(userId);
    next.add(id);
    sessionStorage.setItem(
      FOLLOWER_TOAST_SESSION(userId),
      JSON.stringify([...next].slice(-200)),
    );
  } catch {
    // ignore
  }
}

/** El hook se usa en varios sitios a la vez (campana, sidebar, pills); un solo ref por instancia no deduplica entre ellos. */
const followerToastShownInSession = new Set<string>();
let followerToastMemoryHydratedForUser: string | null = null;

function ensureFollowerToastMemoryHydrated(userId: string) {
  if (followerToastMemoryHydratedForUser === userId) return;
  followerToastMemoryHydratedForUser = userId;
  followerToastShownInSession.clear();
  for (const id of loadToastedFollowerIds(userId)) {
    followerToastShownInSession.add(id);
  }
}

function markFollowerToastShownOnce(userId: string, rowId: string) {
  followerToastShownInSession.add(rowId);
  rememberToastedFollowerId(userId, rowId);
}

function buildDesignPreviewInAppNotifications(
  navigate: ReturnType<typeof useNavigate>,
): InAppNotificationItem[] {
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
      id: "design-preview-plan",
      kind: "action",
      title: "Planifica tu semana",
      body: "Crea una hoja de ruta para asignar rutinas a cada día.",
      dismissable: true,
      accion: {
        etiqueta: "Crear hoja de ruta",
        onClick: () => navigate("/", { state: { openPlanWizard: true } }),
      },
    },
    {
      id: "design-preview-community",
      kind: "info",
      title: "Comunidad",
      body: "Tus entrenos no aparecen en el feed público. Puedes activarlo en Ajustes (icono del engrane).",
      dismissable: true,
    },
  ];
}

/**
 * Notificaciones in-app derivadas del estado (sin tabla propia).
 * Las descartadas persisten en localStorage por usuario.
 */
export function useInAppNotifications() {
  const { user } = useAuth();
  const { dismissed, dismiss, dismissMany } = useInAppNotificationsDismiss();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const { data: allPlannedRoutines } = usePlannedRoutines(
    subYears(today, 1),
    addYears(today, 2),
  );
  const plannedKnown = allPlannedRoutines !== undefined;
  const hasPlanned = plannedKnown ? allPlannedRoutines.length > 0 : false;

  const { comunidadPublicaActividad, isLoading: settingsLoading } = useCommunitySettings();

  const {
    data: followersReceived = [],
    isSuccess: followersSuccess,
    isError: followersError,
  } = useMyFollowersReceived();

  useEffect(() => {
    if (!user?.id || !followersSuccess || followersError) return;

    const key = FOLLOWER_SEED_LS(user.id);
    const needsSeed = !localStorage.getItem(key);
    if (needsSeed) {
      localStorage.setItem(key, "1");
      const seedIds = followersReceived.map((r) => `new-follow-${r.id}`);
      if (seedIds.length > 0) {
        dismissMany(seedIds);
        return;
      }
    }

    if (!localStorage.getItem(key)) return;

    ensureFollowerToastMemoryHydrated(user.id);

    for (const row of followersReceived) {
      const nid = `new-follow-${row.id}`;
      if (dismissed.has(nid)) continue;
      if (followerToastShownInSession.has(row.id)) continue;
      markFollowerToastShownOnce(user.id, row.id);
      const label = row.username?.trim() || "Alguien";
      toast.message(`${label} te ha empezado a seguir`);
    }
  }, [user?.id, followersSuccess, followersError, followersReceived, dismissed, dismissMany]);

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
      return buildDesignPreviewInAppNotifications(navigate);
    }

    const list: InAppNotificationItem[] = [...followerNotifications];

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
  }, [
    followerNotifications,
    plannedKnown,
    hasPlanned,
    settingsLoading,
    comunidadPublicaActividad,
    navigate,
  ]);

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
