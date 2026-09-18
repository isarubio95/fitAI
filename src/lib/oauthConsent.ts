/**
 * Memoria corta del consentimiento OAuth que quedó a medias por no haber sesión.
 *
 * Hace falta porque el viaje al login pierde la URL: el login con Google vuelve
 * a `window.location.origin` (ver `getAuthRedirectUrl` en nativeAuth.ts), no a
 * la pantalla desde la que salió, así que un `?next=` no sobrevive. Sin esto, el
 * usuario que conecta su primer asistente aterriza en el dashboard y el
 * `authorization_id` se pierde: el cliente MCP se queda esperando para siempre y
 * no hay forma de saber por qué.
 *
 * `sessionStorage` y no `localStorage` a propósito: esto vive lo que dure la
 * pestaña. Un consentimiento pendiente que sobrevive a cerrar el navegador y
 * reaparece días después sería, como poco, desconcertante.
 */

const STORAGE_KEY = "trackgym:oauth-consent-pending";

/** Los `authorization_id` caducan en el servidor; diez minutos es generoso. */
const TTL_MS = 10 * 60 * 1000;

export const CONSENT_PATH = "/oauth/consent";

type PendingConsent = { id: string; at: number };

/** `sessionStorage` puede lanzar (modo privado, cookies bloqueadas). */
function safeStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function savePendingConsent(authorizationId: string): void {
  const store = safeStorage();
  if (!store || !authorizationId) return;
  try {
    const payload: PendingConsent = { id: authorizationId, at: Date.now() };
    store.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Sin almacenamiento el flujo sigue funcionando si el usuario ya tiene
    // sesión; solo se pierde el retorno automático tras el login.
  }
}

export function clearPendingConsent(): void {
  try {
    safeStorage()?.removeItem(STORAGE_KEY);
  } catch {
    /* nada que hacer */
  }
}

/**
 * Devuelve el consentimiento pendiente y lo borra: es de un solo uso, para que
 * un fallo posterior no deje al usuario en un bucle de redirecciones.
 */
export function takePendingConsent(): string | null {
  const store = safeStorage();
  if (!store) return null;

  let crudo: string | null;
  try {
    crudo = store.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!crudo) return null;

  clearPendingConsent();

  try {
    const parsed = JSON.parse(crudo) as PendingConsent;
    if (!parsed?.id || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed.id;
  } catch {
    return null;
  }
}

/** Ruta de la pantalla de consentimiento para un `authorization_id`. */
export function consentPathFor(authorizationId: string): string {
  return `${CONSENT_PATH}?authorization_id=${encodeURIComponent(authorizationId)}`;
}

/**
 * Valida un `?next=`. Solo se honra el destino del consentimiento: aceptar
 * cualquier ruta convertiría `/auth` en un redirector abierto, que es la forma
 * clásica de usar un login legítimo para llevar a alguien a otro sitio.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  // Rechaza rutas absolutas, protocolo-relativas (`//host`) y con esquema.
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  const sinQuery = next.split("?")[0];
  return sinQuery === CONSENT_PATH ? next : null;
}

/** Etiqueta legible de un scope OAuth, para la pantalla de consentimiento. */
export function scopeLabel(scope: string): string {
  const etiquetas: Record<string, string> = {
    openid: "Identificarte",
    email: "Ver tu correo electrónico",
    profile: "Ver tu nombre y tu avatar",
    phone: "Ver tu teléfono",
    offline_access: "Mantener el acceso cuando no estés usando la app",
  };
  return etiquetas[scope] ?? scope;
}

/** Host de una URL, para enseñar a dónde vuelve el usuario sin pintar la URL entera. */
export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
