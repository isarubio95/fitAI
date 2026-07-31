const LIVE_SESSION_KEY = "fitai-pref-live-session-notifications";
const REST_FINISHED_KEY = "fitai-pref-rest-finished-notifications";

export type NotificationPreferenceKey = "liveSession" | "restFinished";

type Listener = () => void;

const listeners = new Set<Listener>();

function readBool(key: string, defaultValue: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === "1" || raw === "true";
  } catch {
    return defaultValue;
  }
}

function writeBool(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // ignore quota / private mode
  }
  listeners.forEach((l) => l());
}

/** Preferencias de notificaciones (localStorage). Ambas activas por defecto. */
export function isLiveSessionNotificationEnabled(): boolean {
  return readBool(LIVE_SESSION_KEY, true);
}

export function isRestFinishedNotificationEnabled(): boolean {
  return readBool(REST_FINISHED_KEY, true);
}

export function setLiveSessionNotificationEnabled(enabled: boolean) {
  writeBool(LIVE_SESSION_KEY, enabled);
}

export function setRestFinishedNotificationEnabled(enabled: boolean) {
  writeBool(REST_FINISHED_KEY, enabled);
}

export function subscribeNotificationPreferences(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
