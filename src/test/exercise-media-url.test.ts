import { describe, expect, it, vi } from "vitest";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

describe("resolveExerciseMediaUrl (web)", () => {
  it("deja rutas /ejercicios relativas en web", async () => {
    const { resolveExerciseMediaUrl } = await import("@/lib/exerciseMediaUrl");
    expect(resolveExerciseMediaUrl("/ejercicios/foo.gif")).toBe("/ejercicios/foo.gif");
  });

  it("no toca URLs absolutas", async () => {
    const { resolveExerciseMediaUrl } = await import("@/lib/exerciseMediaUrl");
    expect(resolveExerciseMediaUrl("https://cdn.example/a.gif")).toBe("https://cdn.example/a.gif");
  });
});
