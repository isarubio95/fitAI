import { describe, expect, it } from "vitest";
import { calculateLevel, xpProgress } from "@/hooks/useGamification";

describe("gamification utils", () => {
  it("calcula nivel en saltos de 1000 XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(999)).toBe(1);
    expect(calculateLevel(1000)).toBe(2);
    expect(calculateLevel(2500)).toBe(3);
  });

  it("calcula progreso dentro del nivel actual", () => {
    expect(xpProgress(0)).toEqual({
      level: 1,
      progress: 0,
      needed: 1000,
      percent: 0,
    });

    expect(xpProgress(1450)).toEqual({
      level: 2,
      progress: 450,
      needed: 1000,
      percent: 45,
    });
  });

  it("acota percent entre 0 y 100", () => {
    // El helper actual permite XP negativo y lo mapea dentro del nivel calculado.
    expect(xpProgress(-200).percent).toBe(80);
    expect(xpProgress(1000).percent).toBe(0);
    expect(xpProgress(1999).percent).toBe(100);
  });
});

