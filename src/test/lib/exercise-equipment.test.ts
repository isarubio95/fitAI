import { describe, expect, it } from "vitest";
import {
  EQUIPOS,
  EQUIPO_SINONIMOS,
  normalizeEquipoKey,
  parseEquipoList,
  toCanonicalEquipo,
} from "@/constants/exerciseEquipment";

describe("normalizeEquipoKey", () => {
  it("colapsa mayúsculas, acentos y separadores", () => {
    expect(normalizeEquipoKey("Body weight")).toBe("body weight");
    expect(normalizeEquipoKey("BODY_WEIGHT")).toBe("body weight");
    expect(normalizeEquipoKey("Máquina")).toBe("maquina");
    expect(normalizeEquipoKey("  e-z curl bar  ")).toBe("e z curl bar");
  });
});

describe("toCanonicalEquipo", () => {
  it("unifica los duplicados que traía cada fuente", () => {
    // El motivo de existir de este módulo: la importación dejó estas parejas
    // conviviendo en la misma columna como si fueran aparatos distintos.
    expect(toCanonicalEquipo("Body weight")).toBe("Ninguno");
    expect(toCanonicalEquipo("body only")).toBe("Ninguno");
    expect(toCanonicalEquipo("Peso corporal")).toBe("Ninguno");

    expect(toCanonicalEquipo("barbell")).toBe("Barra Larga");
    expect(toCanonicalEquipo("Barbell")).toBe("Barra Larga");
    expect(toCanonicalEquipo("Barra Larga")).toBe("Barra Larga");

    expect(toCanonicalEquipo("Kettlebell")).toBe("Kettlebell");
    expect(toCanonicalEquipo("kettlebells")).toBe("Kettlebell");
  });

  it("limpia los fragmentos con preposición que dejó el traductor de nombres", () => {
    // Las filas importadas guardaban "con Mancuernas" / "en Polea" como
    // etiqueta de equipo, porque salían de construir el nombre del ejercicio.
    expect(toCanonicalEquipo("con Mancuernas")).toBe("Mancuernas");
    expect(toCanonicalEquipo("en Polea")).toBe("Polea");
    expect(toCanonicalEquipo("con Lastre")).toBe("Lastre");
    expect(toCanonicalEquipo("en Suspensión")).toBe("Suspensión");
    expect(toCanonicalEquipo("con Cuerdas de Batalla")).toBe("Cuerda de Batalla");
  });

  it("devuelve null en vez de inventarse una categoría", () => {
    expect(toCanonicalEquipo("chirimbolo")).toBeNull();
    expect(toCanonicalEquipo("")).toBeNull();
    expect(toCanonicalEquipo(null)).toBeNull();
    expect(toCanonicalEquipo(undefined)).toBeNull();
  });

  it("todo sinónimo apunta a un término del vocabulario", () => {
    for (const [clave, valor] of Object.entries(EQUIPO_SINONIMOS)) {
      expect(EQUIPOS, `${clave} → ${valor}`).toContain(valor);
    }
  });

  it("las claves del mapa ya están normalizadas", () => {
    // Si una clave llevara acento o mayúscula nunca casaría, porque la
    // búsqueda normaliza el valor de entrada antes de mirar el mapa.
    for (const clave of Object.keys(EQUIPO_SINONIMOS)) {
      expect(normalizeEquipoKey(clave), clave).toBe(clave);
    }
  });

  it("cada término canónico es reconocible a partir de sí mismo", () => {
    for (const e of EQUIPOS) {
      expect(toCanonicalEquipo(e), e).toBe(e);
    }
  });
});

describe("parseEquipoList", () => {
  it("parte el string heredado y canoniza cada átomo", () => {
    expect(parseEquipoList("Banco Plano, Barra Larga")).toEqual(["Barra Larga", "Banco Plano"]);
  });

  it("no repite cuando dos sinónimos caen en el mismo término", () => {
    expect(parseEquipoList("Peso corporal, Ninguno")).toEqual(["Ninguno"]);
  });

  it("devuelve el orden de EQUIPOS, no el del string", () => {
    // Estable: la lista no cambia si la fuente escribe los átomos al revés.
    expect(parseEquipoList("Mancuernas, Barra Larga")).toEqual(
      parseEquipoList("Barra Larga, Mancuernas"),
    );
  });

  it("descarta lo que no reconoce y tolera vacíos", () => {
    expect(parseEquipoList("Mancuernas, chirimbolo, ,")).toEqual(["Mancuernas"]);
    expect(parseEquipoList(null)).toEqual([]);
    expect(parseEquipoList("")).toEqual([]);
  });
});
