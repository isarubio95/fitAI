import { describe, expect, it } from "vitest";

import { resolveExerciseMediaUrl } from "@/lib/exerciseMediaUrl";

describe("resolveExerciseMediaUrl", () => {
  it("resuelve todo /ejercicios contra Storage, sea .webp o .gif", () => {
    // Un solo origen: el bucket tiene las demos en WebP y los thumbs. Antes se
    // decidía por la extensión y los .gif se servían de public/ejercicios/,
    // que es lo que obligaba a arrastrar 637 MB en el repo.
    const webp = resolveExerciseMediaUrl("/ejercicios/fdb-Lateral_Bound.webp");
    expect(webp).toContain("/storage/v1/object/public/ejercicios/");
    expect(webp).toContain("fdb-Lateral_Bound.webp");

    const gif = resolveExerciseMediaUrl("/ejercicios/00251301-Barbell-Bench-Press_Chest-FIX_720.gif");
    expect(gif).toContain("/storage/v1/object/public/ejercicios/");
    expect(gif).toContain("00251301-Barbell-Bench-Press_Chest-FIX_720.gif");
  });

  it("conserva los subdirectorios sin escapar la barra", () => {
    // `imagen` de las filas nativas apunta a los thumbs de 3 KB del bucket.
    const url = resolveExerciseMediaUrl("/ejercicios/thumbs/00021301-Side-Bend_Waist_720.jpg");
    expect(url).toContain("/public/ejercicios/thumbs/00021301-Side-Bend_Waist_720.jpg");
  });

  it("no toca URLs absolutas ni blob/data", () => {
    expect(resolveExerciseMediaUrl("https://cdn.example/a.gif")).toBe("https://cdn.example/a.gif");
    expect(resolveExerciseMediaUrl("blob:abcd")).toBe("blob:abcd");
    expect(resolveExerciseMediaUrl("data:image/webp;base64,AA")).toBe("data:image/webp;base64,AA");
  });

  it("deja pasar rutas que no son del catálogo", () => {
    expect(resolveExerciseMediaUrl("/otra/cosa.png")).toBe("/otra/cosa.png");
  });

  it("devuelve null con entrada vacía", () => {
    expect(resolveExerciseMediaUrl(null)).toBeNull();
    expect(resolveExerciseMediaUrl(undefined)).toBeNull();
    expect(resolveExerciseMediaUrl("   ")).toBeNull();
    expect(resolveExerciseMediaUrl("/ejercicios/")).toBeNull();
  });
});
