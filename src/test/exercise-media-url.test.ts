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

describe("resolveExerciseMediaUrl · medios del catálogo ampliado", () => {
  it("resuelve los WebP desde Storage también en web", async () => {
    // Los WebP del catálogo ampliado solo viven en el bucket: public/ejercicios
    // ya pesa 635 MB con los 749 GIF y no se engordó más. Si en web se
    // devolviera la ruta relativa, 1.500 ejercicios saldrían sin imagen.
    const { resolveExerciseMediaUrl } = await import("@/lib/exerciseMediaUrl");
    const url = resolveExerciseMediaUrl("/ejercicios/fdb-Lateral_Bound.webp");
    expect(url).toContain("/storage/v1/object/public/ejercicios/");
    expect(url).toContain("fdb-Lateral_Bound.webp");
  });

  it("mantiene la ruta local para los GIF originales", async () => {
    const { resolveExerciseMediaUrl } = await import("@/lib/exerciseMediaUrl");
    expect(
      resolveExerciseMediaUrl("/ejercicios/00251301-Barbell-Bench-Press_Chest-FIX_720.gif"),
    ).toBe("/ejercicios/00251301-Barbell-Bench-Press_Chest-FIX_720.gif");
  });

  it("deja pasar una URL absoluta sin tocarla", async () => {
    const { resolveExerciseMediaUrl } = await import("@/lib/exerciseMediaUrl");
    expect(resolveExerciseMediaUrl("https://ejemplo.test/x.webp")).toBe(
      "https://ejemplo.test/x.webp",
    );
  });
});
