import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingConsent,
  consentPathFor,
  hostOf,
  safeNextPath,
  savePendingConsent,
  scopeLabel,
  takePendingConsent,
} from "@/lib/oauthConsent";

afterEach(() => {
  clearPendingConsent();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("safeNextPath", () => {
  it("acepta la ruta de consentimiento, con y sin query", () => {
    expect(safeNextPath("/oauth/consent")).toBe("/oauth/consent");
    expect(safeNextPath("/oauth/consent?authorization_id=abc")).toBe(
      "/oauth/consent?authorization_id=abc",
    );
  });

  it("rechaza cualquier otra ruta interna", () => {
    expect(safeNextPath("/")).toBeNull();
    expect(safeNextPath("/evolution")).toBeNull();
    expect(safeNextPath("/oauth/consent-falso")).toBeNull();
  });

  // Lo que de verdad importa: que /auth no se pueda usar como redirector.
  it("rechaza destinos externos", () => {
    expect(safeNextPath("https://evil.example/phishing")).toBeNull();
    expect(safeNextPath("//evil.example/phishing")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("http://localhost:8080/oauth/consent")).toBeNull();
  });

  it("trata vacío, null y undefined como ausencia de destino", () => {
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });
});

describe("consentimiento pendiente", () => {
  it("guarda y devuelve el authorization_id", () => {
    savePendingConsent("abc-123");
    expect(takePendingConsent()).toBe("abc-123");
  });

  it("es de un solo uso, para no dejar bucles de redirección", () => {
    savePendingConsent("abc-123");
    expect(takePendingConsent()).toBe("abc-123");
    expect(takePendingConsent()).toBeNull();
  });

  it("caduca a los diez minutos", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-18T10:00:00Z"));
    savePendingConsent("abc-123");

    vi.setSystemTime(new Date("2026-09-18T10:09:00Z"));
    expect(takePendingConsent()).toBe("abc-123");

    savePendingConsent("def-456");
    vi.setSystemTime(new Date("2026-09-18T10:21:00Z"));
    expect(takePendingConsent()).toBeNull();
  });

  it("devuelve null si lo guardado no es válido", () => {
    window.sessionStorage.setItem("trackgym:oauth-consent-pending", "no-es-json");
    expect(takePendingConsent()).toBeNull();
  });

  it("no revienta si sessionStorage lanza (modo privado)", () => {
    vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => savePendingConsent("abc-123")).not.toThrow();
  });
});

describe("helpers de presentación", () => {
  it("codifica el authorization_id en la ruta", () => {
    expect(consentPathFor("a b&c")).toBe("/oauth/consent?authorization_id=a%20b%26c");
  });

  it("muestra solo el host del destino", () => {
    expect(hostOf("https://claude.ai/api/mcp/callback")).toBe("claude.ai");
    expect(hostOf("no-es-una-url")).toBeNull();
    expect(hostOf(null)).toBeNull();
  });

  it("traduce los scopes conocidos y deja pasar los demás", () => {
    expect(scopeLabel("email")).toBe("Ver tu correo electrónico");
    expect(scopeLabel("scope_desconocido")).toBe("scope_desconocido");
  });
});
