import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Política de scroll al navegar, imitando a una app nativa:
 *
 * - PUSH (entrar en una pantalla nueva): arriba del todo.
 * - POP (botón atrás): se restaura donde estabas.
 * - REPLACE dentro de la misma ruta (los subtabs viven en `?tab=`): cada tab
 *   recuerda su propia posición, así que alternar entre "Rutinas" y
 *   "Ejercicios" ya no tira la lista al principio.
 *
 * Antes se reseteaba siempre, también al cambiar de subtab, que es lo que hacía
 * que moverse por la app se sintiera como recargar una web.
 */

/** Posición guardada por `pathname + search`, viva mientras dure la sesión. */
const positions = new Map<string, number>();

/** Reintentos de restauración: el contenido lazy tarda en tener altura. */
const RESTORE_ATTEMPT_DELAYS_MS = [0, 60, 160];

function locationKey(pathname: string, search: string) {
  return `${pathname}${search}`;
}

function resetInnerScrollers() {
  const main = document.querySelector("main");
  if (main && "scrollTo" in main) (main as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "auto" });

  // Radix ScrollArea (shadcn): tiene su propio viewport con scroll.
  document.querySelectorAll("[data-radix-scroll-area-viewport]").forEach((el) => {
    if ("scrollTo" in el) (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function scrollWindowTo(top: number) {
  window.scrollTo({ top, left: 0, behavior: "auto" });
  document.documentElement?.scrollTo?.({ top, left: 0, behavior: "auto" });
  document.body?.scrollTo?.({ top, left: 0, behavior: "auto" });
}

export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousKeyRef = useRef<string | null>(null);
  const latestScrollYRef = useRef(0);

  useEffect(() => {
    // El navegador restaura por su cuenta y compite con nosotros.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  /**
   * La posición no se puede leer en el cleanup del efecto: para entonces React
   * ya ha montado la pantalla nueva y, si es más corta, el navegador ha
   * recortado el scroll — se guardaría un valor que no es donde estaba el
   * usuario. Por eso se va anotando durante el scroll.
   */
  useEffect(() => {
    const onScroll = () => {
      latestScrollYRef.current = window.scrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const key = locationKey(location.pathname, location.search);
    const previousKey = previousKeyRef.current;
    previousKeyRef.current = key;

    const sameRoute = previousKey !== null && previousKey.split("?")[0] === location.pathname;
    const shouldRestore =
      navigationType === "POP" || (navigationType === "REPLACE" && sameRoute);
    const target = shouldRestore ? (positions.get(key) ?? 0) : 0;

    if (target === 0) {
      resetInnerScrollers();
      scrollWindowTo(0);
      latestScrollYRef.current = 0;
      // Segundo intento tras el montaje del layout, como hacía ScrollToTop.
      const raf = requestAnimationFrame(() => {
        resetInnerScrollers();
        scrollWindowTo(0);
      });
      return () => {
        cancelAnimationFrame(raf);
        positions.set(key, latestScrollYRef.current);
      };
    }

    // Restaurar: el contenido puede no tener altura suficiente todavía (chunk
    // lazy, queries en vuelo), así que reintentamos hasta que encaje. Si el
    // usuario scrollea por su cuenta, dejamos de pelearnos con él.
    let cancelled = false;
    const timers = RESTORE_ATTEMPT_DELAYS_MS.map((delay) =>
      window.setTimeout(() => {
        if (cancelled) return;
        if (Math.abs(window.scrollY - target) < 2) return;
        scrollWindowTo(target);
      }, delay),
    );

    const stopOnUserScroll = () => {
      cancelled = true;
    };
    window.addEventListener("wheel", stopOnUserScroll, { passive: true, once: true });
    window.addEventListener("touchstart", stopOnUserScroll, { passive: true, once: true });

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("wheel", stopOnUserScroll);
      window.removeEventListener("touchstart", stopOnUserScroll);
      positions.set(key, latestScrollYRef.current);
    };
  }, [location.pathname, location.search, navigationType]);

  return null;
}
