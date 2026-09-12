import { describe, expect, it } from "vitest";
import { isActiveSessionPillCovered } from "@/lib/pillCircleTransition";

describe("isActiveSessionPillCovered", () => {
  it("deja la pill visible con el drawer cerrado", () => {
    expect(isActiveSessionPillCovered(false, null)).toBe(false);
    expect(isActiveSessionPillCovered(false, "settled")).toBe(false);
  });

  it("deja la pill visible mientras el círculo abre o cierra", () => {
    expect(isActiveSessionPillCovered(true, "in")).toBe(false);
    expect(isActiveSessionPillCovered(true, "out")).toBe(false);
  });

  it("oculta la pill cuando el drawer está asentado o abrió sin círculo", () => {
    expect(isActiveSessionPillCovered(true, "settled")).toBe(true);
    expect(isActiveSessionPillCovered(true, null)).toBe(true);
    expect(isActiveSessionPillCovered(true, undefined)).toBe(true);
  });
});
