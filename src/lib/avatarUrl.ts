export const GOOGLE_AVATAR_PROXY_PATH = "/google-avatar";
export const GOOGLE_AVATAR_DISPLAY_SIZE = 128;
export const GOOGLE_AVATAR_IMPORT_SIZE = 256;

export function cleanAvatarUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

export function isDirectAvatarUrl(value: string) {
  return /^(https?:|blob:|data:)/i.test(value);
}

export function isGoogleAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
}

export function normalizeGoogleAvatarUrl(value: string, size = GOOGLE_AVATAR_DISPLAY_SIZE): string {
  if (!isGoogleAvatarUrl(value)) return value;
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    if (/=s\d+(?:-[a-z]+)*$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/=s\d+(?:-[a-z]+)*$/i, `=s${size}-c`);
    }
    return url.toString();
  } catch {
    return value;
  }
}

/** En local, sirve la foto de Google por el mismo origen para evitar 429/ORB. */
export function toDisplayableAvatarUrl(value: string, isDev: boolean): string {
  const normalized = isGoogleAvatarUrl(value) ? normalizeGoogleAvatarUrl(value) : value;
  if (isDev && isGoogleAvatarUrl(normalized)) {
    return `${GOOGLE_AVATAR_PROXY_PATH}?u=${encodeURIComponent(normalized)}`;
  }
  return normalized;
}

export function parseGoogleAvatarProxyTarget(requestUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(requestUrl, "http://127.0.0.1");
  } catch {
    return null;
  }

  if (parsed.pathname !== GOOGLE_AVATAR_PROXY_PATH && parsed.pathname !== `${GOOGLE_AVATAR_PROXY_PATH}/`) {
    return null;
  }

  const target = parsed.searchParams.get("u");
  if (!target || !isGoogleAvatarUrl(target)) return null;
  return normalizeGoogleAvatarUrl(target);
}

export function shouldImportGoogleAvatar(currentAvatarUrl?: string | null): boolean {
  const trimmed = currentAvatarUrl?.trim() ?? "";
  if (!trimmed) return true;
  return isGoogleAvatarUrl(trimmed);
}
