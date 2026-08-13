const MAX_REMEMBERED_IDS = 200;

/**
 * Recuerda por usuario qué filas ya generaron un toast in-app, para no repetirlas
 * al recargar la página ni al volver a hacer fetch.
 *
 * El "seed" marca la primera carga: todo lo que ya existía entonces se considera
 * visto, así estrenar sesión o dispositivo no dispara un aluvión de avisos viejos.
 */
export function createInAppToastSeenStore(namespace: string) {
  const seedKey = (userId: string) => `gym-log.notifications.${namespace}-seed:${userId}`;
  const toastKey = (userId: string) => `gym-log.notifications.${namespace}-toast:${userId}`;

  /** Dedupe entre renders y Strict Mode, sin volver a leer localStorage. */
  const shownInMemory = new Set<string>();
  let hydratedForUser: string | null = null;

  function load(userId: string): Set<string> {
    try {
      const raw = localStorage.getItem(toastKey(userId));
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
    } catch {
      return new Set();
    }
  }

  function save(userId: string, ids: Set<string>) {
    try {
      localStorage.setItem(toastKey(userId), JSON.stringify([...ids].slice(-MAX_REMEMBERED_IDS)));
    } catch {
      // ignore
    }
  }

  return {
    ensureHydrated(userId: string) {
      if (hydratedForUser === userId) return;
      hydratedForUser = userId;
      shownInMemory.clear();
      for (const id of load(userId)) {
        shownInMemory.add(id);
      }
    },

    isSeeded(userId: string) {
      try {
        return !!localStorage.getItem(seedKey(userId));
      } catch {
        return false;
      }
    },

    markSeeded(userId: string) {
      try {
        localStorage.setItem(seedKey(userId), "1");
      } catch {
        // ignore
      }
    },

    hasShown(id: string) {
      return shownInMemory.has(id);
    },

    markShown(userId: string, id: string) {
      shownInMemory.add(id);
      const stored = load(userId);
      stored.add(id);
      save(userId, stored);
    },
  };
}
