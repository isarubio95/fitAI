import { useEffect } from "react";
import { toast } from "sonner";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { useMyFollowersReceived } from "@/hooks/useMyFollowersReceived";
import { useAuth } from "@/hooks/useAuth";

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

/** Dedupe global de toasts (Strict Mode / re-fetch / un solo sync montado). */
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

/**
 * Efecto de seed + toasts de nuevos seguidores.
 * Debe montarse UNA sola vez (dentro de InAppNotificationsProvider).
 * Las campanas solo usan `useInAppNotifications` para la lista.
 */
export function InAppFollowerToastSync() {
  const { user } = useAuth();
  const { dismissed, dismissMany } = useInAppNotificationsDismiss();

  const {
    data: followersReceived = [],
    isSuccess: followersSuccess,
    isError: followersError,
  } = useMyFollowersReceived();

  useEffect(() => {
    if (!user?.id || !followersSuccess || followersError) return;

    ensureFollowerToastMemoryHydrated(user.id);

    const key = FOLLOWER_SEED_LS(user.id);
    const needsSeed = !localStorage.getItem(key);
    if (needsSeed) {
      // Marcar seed + toasts ya "vistos" antes de dismiss para que Strict Mode
      // o un re-render con `dismissed` aún vacío no dispare toasts históricos.
      localStorage.setItem(key, "1");
      for (const row of followersReceived) {
        markFollowerToastShownOnce(user.id, row.id);
      }
      const seedIds = followersReceived.map((r) => `new-follow-${r.id}`);
      if (seedIds.length > 0) {
        dismissMany(seedIds);
      }
      return;
    }

    for (const row of followersReceived) {
      const nid = `new-follow-${row.id}`;
      if (dismissed.has(nid)) continue;
      if (followerToastShownInSession.has(row.id)) continue;
      markFollowerToastShownOnce(user.id, row.id);
      const label = row.username?.trim() || "Alguien";
      toast.message(`${label} te ha empezado a seguir`);
    }
  }, [user?.id, followersSuccess, followersError, followersReceived, dismissed, dismissMany]);

  return null;
}
