import { describe, expect, it } from "vitest";
import {
  formatCommittedNumber,
  parseDecimalInput,
  sanitizeDecimalDraft,
} from "@/lib/parseDecimalInput";

describe("parseDecimalInput", () => {
  it("acepta coma y punto como decimal", () => {
    expect(parseDecimalInput("12,5")).toBe(12.5);
    expect(parseDecimalInput("12.5")).toBe(12.5);
    expect(parseDecimalInput("12,")).toBe(12);
    expect(parseDecimalInput("12.")).toBe(12);
  });

  it("trata vacío o separador suelto como nulo", () => {
    expect(parseDecimalInput("")).toBeNull();
    expect(parseDecimalInput("   ")).toBeNull();
    expect(parseDecimalInput(",")).toBeNull();
    expect(parseDecimalInput(".")).toBeNull();
  });

  it("colapsa separadores extra", () => {
    expect(parseDecimalInput("12,5,25")).toBe(12.525);
    expect(parseDecimalInput("1.2.5")).toBe(1.25);
  });
});

describe("sanitizeDecimalDraft", () => {
  it("deja un único separador y conserva la coma mientras se escribe", () => {
    expect(sanitizeDecimalDraft("12,5", true)).toBe("12,5");
    expect(sanitizeDecimalDraft("12.5kg", true)).toBe("12.5");
    expect(sanitizeDecimalDraft("12,5,5", true)).toBe("12,55");
  });

  it("quita separadores si no se permiten decimales", () => {
    expect(sanitizeDecimalDraft("12,5", false)).toBe("125");
  });
});

describe("formatCommittedNumber", () => {
  it("normaliza a punto decimal sin ceros sobrantes", () => {
    expect(formatCommittedNumber(12.5)).toBe("12.5");
    expect(formatCommittedNumber(12)).toBe("12");
    expect(formatCommittedNumber(12.25)).toBe("12.25");
  });
});
