import { useEffect } from "react";
import { toast } from "sonner";
import { useInAppNotificationsDismiss } from "@/contexts/InAppNotificationsContext";
import { useMyFollowersReceived } from "@/hooks/useMyFollowersReceived";
import { useAuth } from "@/hooks/useAuth";

const FOLLOWER_SEED_LS = (userId: string) => `gym-log.notifications.follower-seed:${userId}`;
/** Persistente: un toast por fila de follow, no por sesión de pestaña. */
const FOLLOWER_TOAST_LS = (userId: string) => `gym-log.notifications.follower-toast:${userId}`;
const FOLLOWER_TOAST_SESSION_LEGACY = (userId: string) => `gym-log.follower-toast-session:${userId}`;

function loadToastedFollowerIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(FOLLOWER_TOAST_LS(userId));
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveToastedFollowerIds(userId: string, ids: Set<string>) {
  try {
    localStorage.setItem(
      FOLLOWER_TOAST_LS(userId),
      JSON.stringify([...ids].slice(-200)),
    );
  } catch {
    // ignore
  }
}

function rememberToastedFollowerId(userId: string, id: string) {
  const next = loadToastedFollowerIds(userId);
  next.add(id);
  saveToastedFollowerIds(userId, next);
}

/** Dedupe global de toasts (Strict Mode / re-fetch / un solo sync montado). */
const followerToastShown = new Set<string>();
let followerToastMemoryHydratedForUser: string | null = null;

/**
 * Hidrata memoria + migra usuarios que ya tenían seed pero toasts en sessionStorage
 * (se repetían al abrir una pestaña nueva).
 */
function ensureFollowerToastMemoryHydrated(userId: string, currentFollowerIds: string[]) {
  if (followerToastMemoryHydratedForUser === userId) return;
  followerToastMemoryHydratedForUser = userId;
  followerToastShown.clear();

  const stored = loadToastedFollowerIds(userId);

  // Migrar restos de sessionStorage (misma sesión tras el deploy).
  try {
    const legacyRaw = sessionStorage.getItem(FOLLOWER_TOAST_SESSION_LEGACY(userId));
    if (legacyRaw) {
      const arr = JSON.parse(legacyRaw) as unknown;
      if (Array.isArray(arr)) {
        for (const x of arr) {
          if (typeof x === "string") stored.add(x);
        }
      }
      sessionStorage.removeItem(FOLLOWER_TOAST_SESSION_LEGACY(userId));
    }
  } catch {
    // ignore
  }

  // Si ya había seed pero nunca persistimos toasts: no re-avisar follows antiguos.
  if (stored.size === 0 && localStorage.getItem(FOLLOWER_SEED_LS(userId))) {
    for (const id of currentFollowerIds) {
      stored.add(id);
    }
  }

  saveToastedFollowerIds(userId, stored);
  for (const id of stored) {
    followerToastShown.add(id);
  }
}

function markFollowerToastShownOnce(userId: string, rowId: string) {
  followerToastShown.add(rowId);
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

    ensureFollowerToastMemoryHydrated(
      user.id,
      followersReceived.map((r) => r.id),
    );

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
      if (followerToastShown.has(row.id)) continue;
      markFollowerToastShownOnce(user.id, row.id);
      const label = row.username?.trim() || "Alguien";
      toast.message(`${label} te ha empezado a seguir`);
    }
  }, [user?.id, followersSuccess, followersError, followersReceived, dismissed, dismissMany]);

  return null;
}
