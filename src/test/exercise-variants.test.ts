import { describe, expect, it } from "vitest";
import { groupExerciseFamilies, splitExerciseName } from "@/lib/exerciseVariants";

describe("splitExerciseName", () => {
  it("separa el material con preposiciones", () => {
    expect(splitExerciseName("Press Banca con Barra")).toEqual({
      base: "Press Banca",
      variant: "Con Barra",
    });
    expect(splitExerciseName("Aperturas en Máquina")).toEqual({
      base: "Aperturas",
      variant: "En Máquina",
    });
  });

  it("saca los modificadores de posición del nombre base", () => {
    expect(splitExerciseName("Aperturas Inclinadas con Mancuernas")).toEqual({
      base: "Aperturas",
      variant: "Inclinadas con Mancuernas",
    });
    expect(splitExerciseName("Press Banca Abierto con Barra").base).toBe("Press Banca");
    expect(splitExerciseName("Curl Femoral Aislado en Máquina").base).toBe("Curl Femoral");
  });

  it("mantiene en el nombre base los complementos que identifican el ejercicio", () => {
    expect(splitExerciseName("Extensión de Gemelos Declinada en Máquina").base).toBe(
      "Extensión de Gemelos",
    );
    expect(splitExerciseName("Elevaciones Laterales con Mancuernas").base).toBe(
      "Elevaciones Laterales",
    );
    expect(splitExerciseName("Remo Horizontal en Polea").base).toBe("Remo Horizontal");
  });

  it("trata 'de pie' como variante y el paréntesis como sufijo", () => {
    expect(splitExerciseName("Extensión de Gemelos de pie con Barra").base).toBe(
      "Extensión de Gemelos",
    );
    expect(splitExerciseName("Flexiones (Push-ups)")).toEqual({
      base: "Flexiones",
      variant: "(Push-ups)",
    });
  });

  it("usa una etiqueta genérica cuando el nombre no tiene variante", () => {
    expect(splitExerciseName("Aperturas")).toEqual({ base: "Aperturas", variant: "Estándar" });
  });
});

describe("groupExerciseFamilies", () => {
  const items = [
    { id: "1", nombre: "Aperturas con Mancuernas", grupo_muscular: "Pecho" },
    { id: "2", nombre: "Aperturas en Máquina", grupo_muscular: "Pecho" },
    { id: "3", nombre: "Press Inclinado con Barra", grupo_muscular: "Pecho" },
    { id: "4", nombre: "Press Frontal en Máquina", grupo_muscular: "Hombro" },
  ];

  it("agrupa las variantes bajo su nombre base", () => {
    const families = groupExerciseFamilies(items);
    const aperturas = families.find((f) => f.base === "Aperturas");
    expect(aperturas?.variants.map((v) => v.label)).toEqual(["Con Mancuernas", "En Máquina"]);
  });

  it("no mezcla familias de distinto grupo muscular", () => {
    const families = groupExerciseFamilies(items);
    expect(families.filter((f) => f.base.startsWith("Press"))).toHaveLength(2);
    expect(families.find((f) => f.base === "Press")?.grupoMuscular).toBe("Pecho");
    expect(families.find((f) => f.base === "Press Frontal")?.grupoMuscular).toBe("Hombro");
  });

  it("ignora duplicados con el mismo id", () => {
    const families = groupExerciseFamilies([items[0], { ...items[0] }]);
    expect(families).toHaveLength(1);
    expect(families[0].variants).toHaveLength(1);
  });
});
