import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIPO_SERIE,
  TIPOS_SERIE,
  WORKING_SET_TYPES,
  isWorkingSet,
  normalizeTipoSerie,
  tipoSerieLabel,
  tipoSerieShort,
} from "@/lib/setTypes";
import { strengthSetMechanicalImpulse } from "@/lib/trainingLoad";

describe("normalizeTipoSerie", () => {
  it("acepta los tipos válidos", () => {
    for (const t of TIPOS_SERIE) expect(normalizeTipoSerie(t)).toBe(t);
  });

  it("cae a 'efectiva' con valores desconocidos, null o undefined", () => {
    expect(normalizeTipoSerie(null)).toBe("efectiva");
    expect(normalizeTipoSerie(undefined)).toBe("efectiva");
    expect(normalizeTipoSerie("inventado")).toBe("efectiva");
    expect(DEFAULT_TIPO_SERIE).toBe("efectiva");
  });
});

describe("isWorkingSet", () => {
  it("solo excluye el calentamiento", () => {
    expect(isWorkingSet("calentamiento")).toBe(false);
    expect(isWorkingSet("efectiva")).toBe(true);
    expect(isWorkingSet("dropset")).toBe(true);
    expect(isWorkingSet("amrap")).toBe(true);
  });

  it("una serie sin tipo cuenta como trabajo (histórico previo a la feature)", () => {
    expect(isWorkingSet(null)).toBe(true);
    expect(isWorkingSet(undefined)).toBe(true);
  });
});

describe("WORKING_SET_TYPES", () => {
  it("coincide exactamente con lo que isWorkingSet acepta", () => {
    expect([...WORKING_SET_TYPES]).toEqual(TIPOS_SERIE.filter(isWorkingSet));
    expect(WORKING_SET_TYPES).not.toContain("calentamiento");
  });
});

describe("etiquetas", () => {
  it("la serie efectiva no lleva marca en la tabla del logger", () => {
    expect(tipoSerieShort("efectiva")).toBe("");
    expect(tipoSerieShort("calentamiento")).toBe("W");
  });

  it("toda etiqueta larga es no vacía", () => {
    for (const t of TIPOS_SERIE) expect(tipoSerieLabel(t).length).toBeGreaterThan(0);
  });
});

/**
 * Regresión del cambio de métricas: el impulso mecánico se calcula igual que
 * antes; lo único nuevo es qué series entran en la suma.
 */
describe("agregación de tonelaje por tipo de serie", () => {
  const sets = [
    { repeticiones: 15, peso_kg: 40, rir: 5, tipo_serie: "calentamiento" },
    { repeticiones: 10, peso_kg: 100, rir: 2, tipo_serie: "efectiva" },
    { repeticiones: 8, peso_kg: 100, rir: 0, tipo_serie: "dropset" },
  ];

  const sum = (rows: typeof sets) =>
    rows
      .filter((s) => isWorkingSet(s.tipo_serie))
      .reduce((acc, s) => acc + strengthSetMechanicalImpulse(s), 0);

  it("el calentamiento no suma impulso", () => {
    const conWarmup = sum(sets);
    const sinWarmup = sum(sets.filter((s) => s.tipo_serie !== "calentamiento"));
    expect(conWarmup).toBeCloseTo(sinWarmup, 10);
  });

  it("el dropset sí suma", () => {
    const soloEfectiva = sum(sets.filter((s) => s.tipo_serie === "efectiva"));
    expect(sum(sets)).toBeGreaterThan(soloEfectiva);
  });

  it("series históricas sin tipo dan el mismo total que antes de la feature", () => {
    const legacy = [
      { repeticiones: 10, peso_kg: 100, rir: 2 },
      { repeticiones: 8, peso_kg: 100, rir: 0 },
    ];
    const filtered = legacy
      .filter((s) => isWorkingSet((s as { tipo_serie?: string }).tipo_serie))
      .reduce((acc, s) => acc + strengthSetMechanicalImpulse(s), 0);
    const unfiltered = legacy.reduce((acc, s) => acc + strengthSetMechanicalImpulse(s), 0);

    expect(filtered).toBeCloseTo(unfiltered, 10);
  });
});
