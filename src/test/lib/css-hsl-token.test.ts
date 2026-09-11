import { afterEach, describe, expect, it, vi } from "vitest";
import { CSS_HSL_TOKEN_FALLBACK, cssHslToken, gymMapPinColors } from "@/lib/cssHslToken";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockToken(value: string) {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: () => value,
  } as CSSStyleDeclaration);
}

describe("cssHslToken", () => {
  it("convierte canales HSL a hsl() con comas para MapLibre", () => {
    mockToken("142 71% 28%");
    expect(cssHslToken("--primary-solid")).toBe("hsl(142, 71%, 28%)");
  });

  it("conserva un color ya resuelto", () => {
    mockToken("hsl(24, 95%, 48%)");
    expect(cssHslToken("--primary-solid")).toBe("hsl(24, 95%, 48%)");
  });

  it("formatea canales con alpha", () => {
    mockToken("0 0% 100% / 0.9");
    expect(cssHslToken("--hairline")).toBe("hsla(0, 0%, 100%, 0.9)");
  });

  it("usa el fallback si el token está vacío", () => {
    mockToken("  ");
    expect(cssHslToken("--primary-solid")).toBe(CSS_HSL_TOKEN_FALLBACK);
  });
});

describe("gymMapPinColors", () => {
  it("lee primary-solid y primary, no hex esmeralda", () => {
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          getPropertyValue: (name: string) => {
            if (name === "--primary-solid") return "215 92% 36%";
            if (name === "--primary") return "215 92% 48%";
            return "";
          },
        }) as CSSStyleDeclaration,
    );

    expect(gymMapPinColors()).toEqual({
      fill: "hsl(215, 92%, 36%)",
      selected: "hsl(215, 92%, 48%)",
    });
  });
});
