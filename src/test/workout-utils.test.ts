import { describe, expect, it } from "vitest";
import {
  defaultSetForMode,
  formatRitmoSegKmLabel,
  normalizeRegistroSeries,
  serieFieldsForRegistro,
  setHasWork,
} from "@/types/workout";

describe("workout utils", () => {
  it("normaliza registro_series con fallback seguro", () => {
    expect(normalizeRegistroSeries("duracion")).toBe("duracion");
    expect(normalizeRegistroSeries("duracion_ritmo")).toBe("duracion_ritmo");
    expect(normalizeRegistroSeries("peso_reps")).toBe("peso_reps");
    expect(normalizeRegistroSeries("algo-raro")).toBe("peso_reps");
    expect(normalizeRegistroSeries(null)).toBe("peso_reps");
  });

  it("formatea ritmo en segundos por km", () => {
    expect(formatRitmoSegKmLabel(300)).toBe("5:00/km");
    expect(formatRitmoSegKmLabel(359.6)).toBe("6:00/km");
    expect(formatRitmoSegKmLabel(null)).toBe("—");
    expect(formatRitmoSegKmLabel(0)).toBe("—");
    expect(formatRitmoSegKmLabel(-10)).toBe("—");
  });

  it("detecta si una serie tiene trabajo", () => {
    expect(setHasWork({ repeticiones: 1 })).toBe(true);
    expect(setHasWork({ peso_kg: 5 })).toBe(true);
    expect(setHasWork({ duracion_seg: 30 })).toBe(true);
    expect(setHasWork({ ritmo_seg_km: 280 })).toBe(true);
    expect(setHasWork({ repeticiones: 0, peso_kg: 0, duracion_seg: 0, ritmo_seg_km: 0 })).toBe(false);
  });

  it("genera set por defecto por modo", () => {
    expect(defaultSetForMode("peso_reps")).toEqual({
      repeticiones: 0,
      peso_kg: 0,
      duracion_seg: null,
      ritmo_seg_km: null,
    });

    expect(defaultSetForMode("duracion", 45)).toEqual({
      repeticiones: 0,
      peso_kg: 0,
      duracion_seg: 45,
      ritmo_seg_km: null,
    });

    expect(defaultSetForMode("duracion_ritmo", 600, 300)).toEqual({
      repeticiones: 0,
      peso_kg: 0,
      duracion_seg: 600,
      ritmo_seg_km: 300,
    });
  });

  it("devuelve campos persistibles según modo", () => {
    const set = { repeticiones: 0, peso_kg: 0, duracion_seg: 120, ritmo_seg_km: 320 };
    expect(serieFieldsForRegistro("peso_reps", set)).toEqual({ duracion_seg: null, ritmo_seg_km: null });
    expect(serieFieldsForRegistro("duracion", set)).toEqual({ duracion_seg: 120, ritmo_seg_km: null });
    expect(serieFieldsForRegistro("duracion_ritmo", set)).toEqual({ duracion_seg: 120, ritmo_seg_km: 320 });
  });
});

