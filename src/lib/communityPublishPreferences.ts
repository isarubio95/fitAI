export const COMMUNITY_PUBLISH_DEFAULT_KEY = "fitai-pref-community-publish-default";

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

/** Preferencia de publicar al finalizar (localStorage). Activa por defecto. */
export function isCommunityPublishDefaultEnabled(): boolean {
  return readBool(COMMUNITY_PUBLISH_DEFAULT_KEY, true);
}

export function setCommunityPublishDefaultEnabled(enabled: boolean) {
  writeBool(COMMUNITY_PUBLISH_DEFAULT_KEY, enabled);
}

export function subscribeCommunityPublishPreferences(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
