import { describe, expect, it } from "vitest";
import { matchLyftaToCatalog, tokenizeExerciseName } from "@/lib/lyfta/matchLyftaCatalog";
import { CATALOG_NAME_TO_TIPO_ID } from "@/lib/lyfta/catalogNameToTipoId";

const catalog = [
  { id: "banca-barra", nombre: "Press Banca con Barra" },
  { id: "banca-mancuerna", nombre: "Press Banca con Mancuerna" },
  { id: "militar-barra", nombre: "Press Militar con Barra" },
  { id: "sentadilla", nombre: "Sentadilla con Barra" },
  { id: "remo", nombre: "Remo con Barra" },
];

describe("matchLyftaToCatalog", () => {
  it("empareja Barbell Bench Press con Press Banca con Barra (mapa fijo)", () => {
    const match = matchLyftaToCatalog("Barbell Bench Press", catalog);
    expect(match?.id).toBe(CATALOG_NAME_TO_TIPO_ID["barbell bench press"]);
    expect(CATALOG_NAME_TO_TIPO_ID["press banca con barra"]).toBe(match?.id);
  });

  it("no mapea Press suelto a cualquier press", () => {
    expect(matchLyftaToCatalog("Press", catalog)).toBeNull();
  });

  it("devuelve null si hay empate o score bajo", () => {
    expect(matchLyftaToCatalog("Bench Press", catalog)).toBeNull();
    expect(matchLyftaToCatalog("Random Gizmo Twist", catalog)).toBeNull();
  });

  it("distingue equipo: mancuerna vs barra", () => {
    const match = matchLyftaToCatalog("Dumbbell Bench Press", catalog);
    expect(match?.id).toBe(CATALOG_NAME_TO_TIPO_ID["dumbbell bench press"]);
  });
});

describe("tokenizeExerciseName", () => {
  it("canoniza bench press + barbell al mismo conjunto que press banca barra", () => {
    const en = tokenizeExerciseName("Barbell Bench Press");
    const es = tokenizeExerciseName("Press Banca con Barra");
    expect([...en].sort()).toEqual([...es].sort());
  });
});


describe("tokenizeExerciseName", () => {
  it("canoniza bench press + barbell al mismo conjunto que press banca barra", () => {
    const en = tokenizeExerciseName("Barbell Bench Press");
    const es = tokenizeExerciseName("Press Banca con Barra");
    expect([...en].sort()).toEqual([...es].sort());
  });
});
