import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

type Side = "top" | "bottom";

/**
 * Capacitor 8 inyecta `--safe-area-inset-*` en `documentElement` con los
 * WindowInsets reales (systemBars | displayCutout) en cada `onApplyWindowInsets`.
 * Es la fuente más fiable en Android: cubre notch, barra de gestos, 3 botones,
 * rotación y plegables. Devuelve `null` si la variable no existe (web, o
 * `insetsHandling: 'disable'`), y `0` legítimo cuando el teclado está abierto.
 */
function readCapacitorInset(side: Side): number | null {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--safe-area-inset-${side}`)
    .trim();
  if (!raw) return null;
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

function readEnvSafeArea(side: Side): number {
  const padding = side === "top" ? "padding-top" : "padding-bottom";
  const inset = side === "top" ? "safe-area-inset-top" : "safe-area-inset-bottom";
  const probe = document.createElement("div");
  probe.style.cssText =
    `position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;${padding}:constant(${inset});${padding}:env(${inset});`;
  document.documentElement.appendChild(probe);
  const style = getComputedStyle(probe);
  const value = parseFloat(side === "top" ? style.paddingTop : style.paddingBottom) || 0;
  probe.remove();
  return value;
}

function systemFontScale(): number {
  const span = document.createElement("span");
  span.style.cssText = "position:fixed;visibility:hidden;font-size:16px;line-height:1;";
  span.textContent = "X";
  document.body.appendChild(span);
  const textScale = span.getBoundingClientRect().height / 16;
  span.remove();
  return Math.max(textScale, 1);
}

/** Último recurso: WebView antigua (<140) sin soporte de `env(safe-area-inset-*)`. */
function estimateNativeInset(side: Side): number {
  // ~24sp de status bar y ~48dp de navigationBar de 3 botones en Android.
  const base = side === "top" ? 24 : 48;
  return Math.round(base * systemFontScale());
}

function resolveSafeArea(side: Side): number {
  const native = Capacitor.isNativePlatform();

  // 1. Insets reales de Capacitor. Se respeta incluso el 0 (teclado abierto).
  if (native) {
    const injected = readCapacitorInset(side);
    if (injected !== null) return injected;
  }

  // 2. `env(safe-area-inset-*)` — web, PWA instalada y WebView >= 140.
  const envInset = readEnvSafeArea(side);
  if (envInset > 0) return envInset;

  // 3. En web un 0 es un 0; solo estimamos en nativo sin ninguna otra fuente.
  if (!native) return 0;
  return estimateNativeInset(side);
}

/**
 * Expone las zonas seguras como --app-safe-area-top / --app-safe-area-bottom
 * para que el chrome (header, bottom nav, drawers) cubra notch y barra de gesto.
 */
export function useSafeAreaInsetsSync() {
  useEffect(() => {
    let lastTop: string | null = null;
    let lastBottom: string | null = null;

    const sync = () => {
      const top = `${resolveSafeArea("top")}px`;
      const bottom = `${resolveSafeArea("bottom")}px`;
      // Cortocircuito: el MutationObserver observa el mismo `style` que escribimos.
      if (top === lastTop && bottom === lastBottom) return;
      lastTop = top;
      lastBottom = bottom;

      const root = document.documentElement.style;
      root.setProperty("--app-safe-area-top", top);
      root.setProperty("--app-safe-area-bottom", bottom);
    };

    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);

    // Capacitor reinyecta las variables al rotar, al abrir el teclado o al
    // cambiar el modo de navegación, y no siempre dispara `resize`.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);
}
