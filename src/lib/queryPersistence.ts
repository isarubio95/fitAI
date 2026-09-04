import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Query } from "@tanstack/react-query";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

/**
 * Persiste parte de la caché de React Query para que al abrir la app se pinte
 * el contenido de la última sesión de inmediato y se revalide por detrás, en
 * vez de arrancar con spinners. Es lo que más separa una app nativa de una web.
 *
 * Dos cautelas importantes:
 *
 * 1. **Lista blanca, no todo.** localStorage ronda los 5 MB y hay queries que
 *    no caben ni de lejos (el catálogo entero de ejercicios, el histórico de
 *    actividad sin acotar). Solo se guardan las que alimentan la primera
 *    pantalla y son pequeñas.
 * 2. **Aislamiento por usuario.** `AuthProvider` compara el id de sesión con el
 *    último visto y, si cambia (incluido cerrar sesión), tira la caché entera.
 *    Sin eso, otra cuenta en el mismo dispositivo vería datos ajenos al
 *    arrancar, antes de que las queries se revaliden.
 */

const STORAGE_KEY = "track-gym-query-cache";
const LAST_USER_KEY = "track-gym-query-cache-user";

/** Prefijos de queryKey que sí se persisten. */
const PERSISTED_KEYS = new Set([
  "profileSetup",
  "profileStats",
  "perfil-drawer",
  "profile-avatar",
  "routines",
  "plannedRoutines",
  "monthWorkouts",
  "monthWorkoutDates",
  "monthCardioSessionDates",
  "logros",
  "trainingLoad",
]);

/** Una versión más para invalidar todo a mano si cambia la forma de los datos. */
const SCHEMA_VERSION = "v1";

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: STORAGE_KEY,
  // Si la caché no cabe, se descarta en vez de reventar con QuotaExceededError.
  throttleTime: 2000,
});

function shouldDehydrateQuery(query: Query) {
  if (query.state.status !== "success") return false;
  const [head] = query.queryKey;
  return typeof head === "string" && PERSISTED_KEYS.has(head);
}

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: queryPersister,
  // 24 h: pasado ese punto preferimos pedir datos frescos a pintar algo viejo.
  maxAge: 24 * 60 * 60 * 1000,
  buster: SCHEMA_VERSION,
  dehydrateOptions: { shouldDehydrateQuery },
};

/** Borra la caché persistida (cierre de sesión, borrado de cuenta). */
export function clearPersistedQueries() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin localStorage (modo privado) no hay nada que limpiar.
  }
}

/**
 * Devuelve true si la sesión activa es de otra cuenta que la que dejó la caché.
 * Recuerda el id para la próxima comparación.
 */
export function didUserChange(userId: string | null): boolean {
  try {
    const previous = window.localStorage.getItem(LAST_USER_KEY);
    const current = userId ?? "";
    if (previous === current) return false;
    window.localStorage.setItem(LAST_USER_KEY, current);
    // La primera vez que se ejecuta no hay nada persistido que proteger.
    return previous !== null;
  } catch {
    return false;
  }
}
