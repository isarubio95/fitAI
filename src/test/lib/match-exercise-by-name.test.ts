import { describe, expect, it } from "vitest";
import { matchExerciseByName, type MatchableExercise } from "@/lib/matchExerciseByName";

const catalog: MatchableExercise[] = [
  { id: "sent-1", nombre: "Sentadilla", source: "catalogo" },
  { id: "press-1", nombre: "Press militar", source: "catalogo" },
  { id: "custom-1", nombre: "Mi press banca", source: "usuario" },
];

describe("matchExerciseByName", () => {
  it("hace match exacto ignorando mayúsculas y acentos", () => {
    expect(matchExerciseByName("sentadilla", catalog)?.id).toBe("sent-1");
    expect(matchExerciseByName("SENTADILLA", catalog)?.id).toBe("sent-1");
  });

  it("usa sinónimos (squat → sentadilla, OHP → press militar)", () => {
    expect(matchExerciseByName("Squat", catalog)?.id).toBe("sent-1");
    expect(matchExerciseByName("Overhead press", catalog)?.id).toBe("press-1");
  });

  it("hace match parcial si el nombre es suficientemente largo", () => {
    expect(matchExerciseByName("press banca", catalog)?.id).toBe("custom-1");
  });

  it("prefiere catálogo global si hay coincidencia en ambos", () => {
    const both: MatchableExercise[] = [
      { id: "u-squat", nombre: "Squat", source: "usuario" },
      { id: "c-squat", nombre: "Sentadilla", source: "catalogo" },
    ];
    expect(matchExerciseByName("squat", both)?.id).toBe("c-squat");
  });

  it("devuelve null si no hay coincidencia", () => {
    expect(matchExerciseByName("Thruster olímpico inventado", catalog)).toBeNull();
  });
});
