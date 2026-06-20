import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

type InAppNotificationsContextValue = {
  dismissed: Set<string>;
  dismiss: (id: string) => void;
  dismissMany: (ids: string[]) => void;
};

const InAppNotificationsContext = createContext<InAppNotificationsContextValue | null>(null);

function storageKey(userId: string) {
  return `gym-log.notifications.dismissed:${userId}`;
}

function loadDismissed(userId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveDismissed(userId: string, ids: string[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/** Fusiona estado en memoria + localStorage para no perder descartes tras re-login. */
function mergeAndSaveDismissed(userId: string, prev: Set<string>, ids: string[]): Set<string> {
  const stored = loadDismissed(userId);
  const next = new Set([...stored, ...prev, ...ids]);
  saveDismissed(userId, [...next]);
  return next;
}

function readDismissedForUser(userId: string | undefined): Set<string> {
  if (!userId) return new Set();
  return new Set(loadDismissed(userId));
}

export function InAppNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissedForUser(user?.id));

  useEffect(() => {
    setDismissed(readDismissedForUser(user?.id));
  }, [user?.id]);

  const dismiss = useCallback(
    (id: string) => {
      if (!user?.id) return;
      setDismissed((prev) => mergeAndSaveDismissed(user.id, prev, [id]));
    },
    [user?.id],
  );

  const dismissMany = useCallback(
    (ids: string[]) => {
      if (!user?.id || ids.length === 0) return;
      setDismissed((prev) => mergeAndSaveDismissed(user.id, prev, ids));
    },
    [user?.id],
  );

  const value = useMemo(
    () => ({ dismissed, dismiss, dismissMany }),
    [dismissed, dismiss, dismissMany],
  );

  return (
    <InAppNotificationsContext.Provider value={value}>{children}</InAppNotificationsContext.Provider>
  );
}

export function useInAppNotificationsDismiss() {
  const ctx = useContext(InAppNotificationsContext);
  if (!ctx) {
    throw new Error("useInAppNotificationsDismiss debe usarse dentro de InAppNotificationsProvider");
  }
  return ctx;
}
