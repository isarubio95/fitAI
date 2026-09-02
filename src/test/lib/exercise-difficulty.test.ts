import { describe, expect, it } from "vitest";
import { difficultyLabel, difficultyToLevel, difficultyToStored } from "@/lib/exerciseDifficulty";

describe("difficultyToLevel", () => {
  it("acepta los numeros del catalogo", () => {
    expect(difficultyToLevel("1")).toBe(1);
    expect(difficultyToLevel("2")).toBe(2);
    expect(difficultyToLevel("3")).toBe(3);
    expect(difficultyToLevel(2)).toBe(2);
  });

  it("acepta las etiquetas de la UI", () => {
    expect(difficultyToLevel("baja")).toBe(1);
    expect(difficultyToLevel("Media")).toBe(2);
    expect(difficultyToLevel("ALTA")).toBe(3);
  });

  it("reconoce las filas sucias que antes se perdian", () => {
    // Estas cuatro existen en el catalogo y devolvian null: no se mostraba dificultad.
    expect(difficultyToLevel("Principiante")).toBe(1);
    expect(difficultyToLevel("Intermedio")).toBe(2);
    expect(difficultyToLevel("Avanzado")).toBe(3);
  });

  it("recorta fuera de rango", () => {
    expect(difficultyToLevel("0")).toBe(1);
    expect(difficultyToLevel("9")).toBe(3);
    expect(difficultyToLevel(-4)).toBe(1);
  });

  it("devuelve null cuando no hay nada reconocible", () => {
    expect(difficultyToLevel(null)).toBeNull();
    expect(difficultyToLevel(undefined)).toBeNull();
    expect(difficultyToLevel("")).toBeNull();
    expect(difficultyToLevel("   ")).toBeNull();
    expect(difficultyToLevel("vete a saber")).toBeNull();
  });
});

describe("difficultyToStored", () => {
  it("canoniza cualquier variante a 1/2/3", () => {
    expect(difficultyToStored("Principiante")).toBe("1");
    expect(difficultyToStored("media")).toBe("2");
    expect(difficultyToStored(3)).toBe("3");
    expect(difficultyToStored("basura")).toBeNull();
  });
});

describe("difficultyLabel", () => {
  it("devuelve la etiqueta en espanol", () => {
    expect(difficultyLabel(1)).toBe("Baja");
    expect(difficultyLabel(2)).toBe("Media");
    expect(difficultyLabel(3)).toBe("Alta");
  });
});
