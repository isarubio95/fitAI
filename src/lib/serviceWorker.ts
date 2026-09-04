import { Capacitor } from "@capacitor/core";

/**
 * El service worker es útil en la web (PWA instalable, caché de imágenes) y
 * contraproducente dentro del APK: ahí la app ya se sirve del sistema de
 * ficheros, y una capa de caché encima puede devolver el JS de la versión
 * anterior después de actualizar desde Play — el clásico "la app no se
 * actualiza". Por eso registramos a mano en vez de dejar que `vite-plugin-pwa`
 * inyecte el registro en el HTML.
 */
export function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (Capacitor.isNativePlatform()) {
    void unregisterAll();
    return;
  }

  void import("virtual:pwa-register")
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {
      // Sin service worker la app funciona igual, solo pierde la caché offline.
    });
}

/** Limpia registros heredados de una versión previa del APK. */
async function unregisterAll() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // Nada que hacer: sin permisos o sin registros previos.
  }
}
