import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

/** Tope de seguridad: un fallo de red no puede dejar el splash colgado. */
const MAX_SPLASH_MS = 3000;

let hidden = false;

function hideSplash() {
  if (hidden) return;
  hidden = true;
  if (!Capacitor.isNativePlatform()) return;
  void SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {});
}

/**
 * Oculta el splash nativo cuando la app tiene contenido que mostrar.
 *
 * Con `launchAutoHide: false` en capacitor.config.ts, el splash aguanta hasta
 * esta llamada, de modo que el arranque pasa del splash al dashboard con un
 * fundido en lugar de encadenar fondo vacío y dos spinners a pantalla completa.
 *
 * @param ready true cuando ya se puede pintar la pantalla real.
 */
export function useHideSplashWhenReady(ready: boolean) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (hidden) return;

    // Se arma una sola vez: si algo se atasca, el splash se va igualmente y el
    // usuario ve el estado de carga de la app en lugar de una pantalla fija.
    if (timeoutRef.current === null) {
      timeoutRef.current = window.setTimeout(hideSplash, MAX_SPLASH_MS);
    }

    if (!ready) return;

    // Un frame de margen para que el primer render llegue a pintar antes del
    // fundido; si no, se ve un parpadeo entre el splash y el contenido.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(hideSplash);
    });
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);
}
