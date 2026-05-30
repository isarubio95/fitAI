import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

export const NATIVE_AUTH_REDIRECT = "com.fitai.app://auth/callback";
const AUTH_CALLBACK_PATH = "/auth/callback";

export function getAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    const appUrl = import.meta.env.VITE_APP_URL?.trim();
    if (appUrl) {
      return `${appUrl.replace(/\/$/, "")}${AUTH_CALLBACK_PATH}`;
    }
    return NATIVE_AUTH_REDIRECT;
  }
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`;
}

export function isAuthCallbackUrl(url: string): boolean {
  return (
    url.includes("auth/callback") ||
    url.includes("access_token=") ||
    url.includes("code=")
  );
}

export async function handleAuthCallbackFromUrl(url: string): Promise<void> {
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    const params = new URLSearchParams(url.slice(hashIndex + 1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      return;
    }
  }

  const queryIndex = url.indexOf("?");
  if (queryIndex !== -1) {
    const params = new URLSearchParams(url.slice(queryIndex + 1).split("#")[0]);
    const code = params.get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    }
  }
}
