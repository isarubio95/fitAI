import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/integrations/supabase/client";

/** Esquema personalizado registrado en AndroidManifest para volver a la app tras OAuth. */
export const NATIVE_AUTH_CALLBACK = "com.trackgym.app://auth-callback";

export const isNativeApp = () => Capacitor.isNativePlatform();

/**
 * URL de redirección para flujos de auth.
 * - App nativa: deep link que reabre la app.
 * - Web: origen actual.
 */
export function getAuthRedirectUrl() {
  return isNativeApp() ? NATIVE_AUTH_CALLBACK : window.location.origin;
}

/**
 * Lanza el login OAuth. En nativo abre el navegador del sistema y vuelve por deep link;
 * en web hace el redirect normal.
 */
export async function signInWithOAuthNative(provider: "google") {
  if (!isNativeApp()) {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getAuthRedirectUrl() },
    });
  }

  const result = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: NATIVE_AUTH_CALLBACK,
      skipBrowserRedirect: true,
    },
  });

  if (result.data?.url) {
    await Browser.open({ url: result.data.url });
  }

  return result;
}

let listenerRegistered = false;

/** Registra el manejador de deep links que completa el login al volver del navegador. */
export function registerNativeAuthListener() {
  if (!isNativeApp() || listenerRegistered) return;
  listenerRegistered = true;

  CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
    if (!url || !url.startsWith(NATIVE_AUTH_CALLBACK)) return;

    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get("code");
      const errorDescription = parsed.searchParams.get("error_description");

      if (errorDescription) {
        console.error("OAuth error:", errorDescription);
        return;
      }

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    } catch (e) {
      console.error("No se pudo completar el login nativo:", e);
    } finally {
      // Cierra el navegador del sistema y vuelve a la app.
      try {
        await Browser.close();
      } catch {
        /* noop: en algunos dispositivos ya está cerrado */
      }
    }
  });
}
