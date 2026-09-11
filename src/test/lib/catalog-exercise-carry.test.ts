import { describe, expect, it } from "vitest";
import {
  catalogRefFromCarry,
  clearCarryFromSearchParams,
  readCarryFromSearchParams,
  writeCarryToSearchParams,
} from "@/lib/catalogExerciseCarry";

describe("catalogExerciseCarry", () => {
  it("escribe y lee add / addName / addReg", () => {
    const next = writeCarryToSearchParams(new URLSearchParams("tab=ejercicios&q=press"), {
      source: "catalogo",
      id: "abc",
      nombre: "Press Banca con Barra",
      registro_series: "peso_reps",
    });
    expect(next.get("tab")).toBe("ejercicios");
    expect(next.get("q")).toBe("press");
    expect(readCarryFromSearchParams(next)).toEqual({
      source: "catalogo",
      id: "abc",
      nombre: "Press Banca con Barra",
      registro_series: "peso_reps",
    });
  });

  it("rechaza un add mal formado o sin nombre", () => {
    expect(readCarryFromSearchParams(new URLSearchParams("add=catalogo"))).toBeNull();
    expect(readCarryFromSearchParams(new URLSearchParams("add=catalogo:id"))).toBeNull();
  });

  it("limpia el payload y deja el resto", () => {
    const next = clearCarryFromSearchParams(
      writeCarryToSearchParams(new URLSearchParams("tab=rutinas&q=press"), {
        source: "usuario",
        id: "u1",
        nombre: "Curl",
        registro_series: "solo_reps",
      }),
    );
    expect(readCarryFromSearchParams(next)).toBeNull();
    expect(next.get("tab")).toBe("rutinas");
    expect(next.get("q")).toBe("press");
  });

  it("traduce el carry a un ref de catálogo", () => {
    expect(
      catalogRefFromCarry({
        source: "catalogo",
        id: "t1",
        nombre: "Sentadilla",
        registro_series: "peso_reps",
      }),
    ).toEqual({ tipo_ejercicio_id: "t1", registro_series: "peso_reps" });
    expect(
      catalogRefFromCarry({
        source: "usuario",
        id: "u1",
        nombre: "Mio",
        registro_series: "duracion",
      }),
    ).toEqual({ usuario_ejercicio_id: "u1", registro_series: "duracion" });
  });
});
