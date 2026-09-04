export const PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY =
  "fitai-pref-progressive-overload-suggestions";

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

/** Preferencia de banners de sobrecarga (localStorage). Activa por defecto. */
export function isProgressiveOverloadSuggestionsEnabled(): boolean {
  return readBool(PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY, true);
}

export function setProgressiveOverloadSuggestionsEnabled(enabled: boolean) {
  writeBool(PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY, enabled);
}

export function subscribeProgressiveOverloadPreferences(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
