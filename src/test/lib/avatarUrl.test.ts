import { describe, expect, it } from "vitest";
import {
  GOOGLE_AVATAR_PROXY_PATH,
  cleanAvatarUrl,
  isDirectAvatarUrl,
  isGoogleAvatarUrl,
  normalizeGoogleAvatarUrl,
  parseGoogleAvatarProxyTarget,
  shouldImportGoogleAvatar,
  toDisplayableAvatarUrl,
} from "@/lib/avatarUrl";

const GOOGLE_AVATAR = "https://lh3.googleusercontent.com/a/ACg8ocLyhtuBi2XC3MNvmd2Y4YO1xBybWVlrXsnrv9fBUIwSMmPOz5i9=s96-c";

describe("avatarUrl", () => {
  it("limpia valores vacíos y reconoce URLs directas", () => {
    expect(cleanAvatarUrl("  ")).toBeUndefined();
    expect(cleanAvatarUrl(GOOGLE_AVATAR)).toBe(GOOGLE_AVATAR);
    expect(isDirectAvatarUrl(GOOGLE_AVATAR)).toBe(true);
    expect(isDirectAvatarUrl("blob:http://localhost/1")).toBe(true);
    expect(isDirectAvatarUrl("user-1/avatar.jpg")).toBe(false);
  });

  it("identifica solo hosts de googleusercontent", () => {
    expect(isGoogleAvatarUrl(GOOGLE_AVATAR)).toBe(true);
    expect(isGoogleAvatarUrl("https://lh3.googleusercontent.com/a/abc")).toBe(true);
    expect(isGoogleAvatarUrl("https://evilgoogleusercontent.com/a/abc")).toBe(false);
    expect(isGoogleAvatarUrl("https://example.com/photo.jpg")).toBe(false);
    expect(isGoogleAvatarUrl("user-1/avatar.jpg")).toBe(false);
  });

  it("normaliza el tamaño de las fotos de Google", () => {
    expect(normalizeGoogleAvatarUrl(GOOGLE_AVATAR)).toBe(
      "https://lh3.googleusercontent.com/a/ACg8ocLyhtuBi2XC3MNvmd2Y4YO1xBybWVlrXsnrv9fBUIwSMmPOz5i9=s128-c",
    );
    expect(normalizeGoogleAvatarUrl(GOOGLE_AVATAR, 256)).toBe(
      "https://lh3.googleusercontent.com/a/ACg8ocLyhtuBi2XC3MNvmd2Y4YO1xBybWVlrXsnrv9fBUIwSMmPOz5i9=s256-c",
    );
  });

  it("en desarrollo reescribe la foto de Google al proxy local", () => {
    const display = toDisplayableAvatarUrl(GOOGLE_AVATAR, true);
    expect(display.startsWith(`${GOOGLE_AVATAR_PROXY_PATH}?u=`)).toBe(true);
    expect(display).toContain(encodeURIComponent(normalizeGoogleAvatarUrl(GOOGLE_AVATAR)));
    expect(toDisplayableAvatarUrl(GOOGLE_AVATAR, false)).toBe(normalizeGoogleAvatarUrl(GOOGLE_AVATAR));
    expect(toDisplayableAvatarUrl("user-1/avatar.jpg", true)).toBe("user-1/avatar.jpg");
  });

  it("extrae el destino permitido del proxy", () => {
    const display = toDisplayableAvatarUrl(GOOGLE_AVATAR, true);
    expect(parseGoogleAvatarProxyTarget(display)).toBe(normalizeGoogleAvatarUrl(GOOGLE_AVATAR));
    expect(parseGoogleAvatarProxyTarget("/google-avatar?u=https://example.com/x")).toBeNull();
    expect(parseGoogleAvatarProxyTarget("/otra?u=" + encodeURIComponent(GOOGLE_AVATAR))).toBeNull();
  });

  it("solo importa si el perfil no tiene ya un avatar propio", () => {
    expect(shouldImportGoogleAvatar(null)).toBe(true);
    expect(shouldImportGoogleAvatar("")).toBe(true);
    expect(shouldImportGoogleAvatar(GOOGLE_AVATAR)).toBe(true);
    expect(shouldImportGoogleAvatar("user-1/avatar.jpg")).toBe(false);
    expect(shouldImportGoogleAvatar("https://cdn.example/me.png")).toBe(false);
  });
});
