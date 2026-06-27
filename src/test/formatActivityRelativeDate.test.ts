import { describe, expect, it } from "vitest";
import { formatActivityRelativeDate } from "@/lib/formatActivityRelativeDate";

describe("formatActivityRelativeDate", () => {
  const now = new Date(2026, 5, 27, 12, 0, 0);

  it("devuelve Hoy y Ayer", () => {
    expect(formatActivityRelativeDate(new Date(2026, 5, 27), now)).toBe("Hoy");
    expect(formatActivityRelativeDate(new Date(2026, 5, 26), now)).toBe("Ayer");
  });

  it("devuelve días recientes", () => {
    expect(formatActivityRelativeDate(new Date(2026, 5, 24), now)).toBe("Hace 3 días");
    expect(formatActivityRelativeDate(new Date(2026, 5, 21), now)).toBe("Hace 6 días");
  });

  it("devuelve semanas", () => {
    expect(formatActivityRelativeDate(new Date(2026, 5, 20), now)).toBe("Hace una semana");
    expect(formatActivityRelativeDate(new Date(2026, 5, 13), now)).toBe("Hace 2 semanas");
  });

  it("devuelve meses y años", () => {
    expect(formatActivityRelativeDate(new Date(2026, 4, 27), now)).toBe("Hace un mes");
    expect(formatActivityRelativeDate(new Date(2026, 3, 27), now)).toBe("Hace 2 meses");
    expect(formatActivityRelativeDate(new Date(2025, 5, 27), now)).toBe("Hace un año");
    expect(formatActivityRelativeDate(new Date(2024, 5, 27), now)).toBe("Hace 2 años");
  });

  it("acepta fechas inválidas", () => {
    expect(formatActivityRelativeDate("invalid")).toBe("");
  });
});
