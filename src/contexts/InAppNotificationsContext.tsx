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

export function InAppNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) {
      setDismissed(new Set());
      return;
    }
    setDismissed(new Set(loadDismissed(user.id)));
  }, [user?.id]);

  const dismiss = useCallback(
    (id: string) => {
      if (!user?.id) return;
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveDismissed(user.id, [...next]);
        return next;
      });
    },
    [user?.id],
  );

  const dismissMany = useCallback(
    (ids: string[]) => {
      if (!user?.id || ids.length === 0) return;
      setDismissed((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        saveDismissed(user.id, [...next]);
        return next;
      });
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
