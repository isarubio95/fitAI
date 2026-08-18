import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

function readEnvSafeArea(side: "top" | "bottom"): number {
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

/** Estima la altura de la barra de estado cuando env(safe-area-inset-top) es 0 (Android WebView). */
function estimateNativeStatusBarHeight(): number {
  // ~24sp de altura base en Android; crece con el tamaño de fuente del sistema.
  return Math.round(24 * systemFontScale());
}

/** Estima la barra de navegación / gesto cuando env(safe-area-inset-bottom) es 0. */
function estimateNativeNavBarHeight(): number {
  // ~48dp de navigationBar en Android (3 botones); en gesto sobra color, no hueco.
  return Math.round(48 * systemFontScale());
}

function resolveSafeArea(side: "top" | "bottom"): number {
  const envInset = readEnvSafeArea(side);
  if (envInset > 0) return envInset;
  if (!Capacitor.isNativePlatform()) return 0;
  return side === "top" ? estimateNativeStatusBarHeight() : estimateNativeNavBarHeight();
}

/**
 * Expone las zonas seguras como --app-safe-area-top / --app-safe-area-bottom
 * para que el chrome (header, bottom nav, drawers) cubra notch y barra de gesto.
 */
export function useSafeAreaInsetsSync() {
  useEffect(() => {
    const sync = () => {
      const root = document.documentElement.style;
      root.setProperty("--app-safe-area-top", `${resolveSafeArea("top")}px`);
      root.setProperty("--app-safe-area-bottom", `${resolveSafeArea("bottom")}px`);
    };

    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);
}
