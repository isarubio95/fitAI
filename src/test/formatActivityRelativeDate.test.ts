import { describe, expect, it } from "vitest";
import {
  formatActivityAbsoluteDate,
  formatActivityRelativeDate,
} from "@/lib/formatActivityRelativeDate";

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

  it("devuelve formato compacto para badges estrechas", () => {
    expect(formatActivityRelativeDate(new Date(2026, 5, 27), now, { compact: true })).toBe("hoy");
    expect(formatActivityRelativeDate(new Date(2026, 5, 26), now, { compact: true })).toBe("ayer");
    expect(formatActivityRelativeDate(new Date(2026, 5, 21), now, { compact: true })).toBe("hace 6d");
    expect(formatActivityRelativeDate(new Date(2026, 5, 13), now, { compact: true })).toBe("hace 2 sem");
    expect(formatActivityRelativeDate(new Date(2026, 4, 27), now, { compact: true })).toBe("hace 1 mes");
    expect(formatActivityRelativeDate(new Date(2025, 5, 27), now, { compact: true })).toBe("hace 1 a");
  });
});

describe("formatActivityAbsoluteDate", () => {
  it("formatea día, mes y hora en español", () => {
    // lunes 13 de julio de 2026, 20:50 (hora local)
    const date = new Date(2026, 6, 13, 20, 50, 0);
    expect(formatActivityAbsoluteDate(date)).toBe("lunes 13 de julio, 20:50");
  });

  it("acepta fechas inválidas", () => {
    expect(formatActivityAbsoluteDate("invalid")).toBe("");
  });
});
