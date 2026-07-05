import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

function readEnvSafeAreaTop(): number {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:constant(safe-area-inset-top);padding-top:env(safe-area-inset-top);";
  document.documentElement.appendChild(probe);
  const inset = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return inset;
}

/** Estima la altura de la barra de estado cuando env(safe-area-inset-top) es 0 (Android WebView). */
function estimateNativeStatusBarHeight(): number {
  const span = document.createElement("span");
  span.style.cssText = "position:fixed;visibility:hidden;font-size:16px;line-height:1;";
  span.textContent = "X";
  document.body.appendChild(span);
  const textScale = span.getBoundingClientRect().height / 16;
  span.remove();

  // ~24sp de altura base en Android; crece con el tamaño de fuente del sistema.
  return Math.round(24 * Math.max(textScale, 1));
}

function resolveSafeAreaTop(): number {
  const envInset = readEnvSafeAreaTop();
  if (envInset > 0) return envInset;
  if (!Capacitor.isNativePlatform()) return 0;
  return estimateNativeStatusBarHeight();
}

/**
 * Expone la zona segura superior como --app-safe-area-top para que el padding
 * se adapte al escalado de fuente del sistema (p. ej. drawer de perfil).
 */
export function useSafeAreaInsetsSync() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.style.setProperty("--app-safe-area-top", `${resolveSafeAreaTop()}px`);
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
