import type { Page } from "@playwright/test";
import { E2E_USER_EMAIL, E2E_USER_ID } from "./ids";

/** JWT mínimo (sin firma) que supabase-js puede decodificar en cliente. */
function fakeAccessToken(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      aud: "authenticated",
      exp: now + 60 * 60,
      iat: now,
      iss: "https://e2e.supabase.co/auth/v1",
      sub: userId,
      email,
      phone: "",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      role: "authenticated",
      aal: "aal1",
      amr: [{ method: "password", timestamp: now }],
      session_id: "e2e-session",
    }),
  ).toString("base64url");
  return `${header}.${payload}.e2e`;
}

export function buildAuthSession(userId = E2E_USER_ID, email = E2E_USER_EMAIL) {
  const access_token = fakeAccessToken(userId, email);
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60;
  return {
    access_token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at,
    refresh_token: "e2e-refresh-token",
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: new Date().toISOString(),
      phone: "",
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

/** Clave `sb-<ref>-auth-token` según VITE_SUPABASE_URL (local .env o CI placeholder). */
export function supabaseAuthStorageKey(): string {
  const raw =
    process.env.VITE_SUPABASE_URL ||
    process.env.E2E_SUPABASE_URL ||
    "https://placeholder.supabase.co";
  try {
    const ref = new URL(raw).hostname.split(".")[0] || "placeholder";
    return `sb-${ref}-auth-token`;
  } catch {
    return "sb-placeholder-auth-token";
  }
}

/** Inyecta sesión antes de que cargue la app. */
export async function injectAuthSession(page: Page) {
  const session = buildAuthSession();
  const keys = Array.from(
    new Set([supabaseAuthStorageKey(), "sb-placeholder-auth-token"]),
  );
  await page.addInitScript(
    ({ payload, storageKeys }) => {
      const json = JSON.stringify(payload);
      for (const key of storageKeys) {
        window.localStorage.setItem(key, json);
      }
    },
    { payload: session, storageKeys: keys },
  );
}

/** Establece la sesión en la página ya abierta (p. ej. tras /auth). */
export async function writeAuthSession(page: Page) {
  const session = buildAuthSession();
  const keys = Array.from(
    new Set([supabaseAuthStorageKey(), "sb-placeholder-auth-token"]),
  );
  await page.evaluate(
    ({ payload, storageKeys }) => {
      const json = JSON.stringify(payload);
      for (const key of storageKeys) {
        window.localStorage.setItem(key, json);
      }
    },
    { payload: session, storageKeys: keys },
  );
}
