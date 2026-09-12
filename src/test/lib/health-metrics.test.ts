import { describe, expect, it } from "vitest";
import {
  formatHealthDelta,
  formatSleepHours,
  formatSleepHoursInput,
  healthDeltaClass,
  healthDeltaTone,
} from "@/lib/healthMetrics";

describe("healthDeltaTone", () => {
  it("más sueño es favorable", () => {
    expect(healthDeltaTone("sueno", 0.5)).toBe("good");
    expect(healthDeltaTone("sueno", -0.5)).toBe("bad");
  });

  it("menos FC reposo es favorable", () => {
    expect(healthDeltaTone("fc", -3)).toBe("good");
    expect(healthDeltaTone("fc", 4)).toBe("bad");
  });

  it("peso y calorías no se moralizan", () => {
    expect(healthDeltaTone("peso", -1)).toBe("neutral");
    expect(healthDeltaTone("peso", 1)).toBe("neutral");
    expect(healthDeltaTone("calorias", 200)).toBe("neutral");
    expect(healthDeltaTone("calorias", -200)).toBe("neutral");
  });

  it("cero o no finito es neutro", () => {
    expect(healthDeltaTone("sueno", 0)).toBe("neutral");
    expect(healthDeltaTone("fc", Number.NaN)).toBe("neutral");
  });
});

describe("healthDeltaClass / format", () => {
  it("pinta success y destructive", () => {
    expect(healthDeltaClass("good")).toBe("text-success");
    expect(healthDeltaClass("bad")).toBe("text-destructive");
    expect(healthDeltaClass("neutral")).toBe("text-muted-foreground");
  });

  it("formatea unidades", () => {
    expect(formatHealthDelta(1.2, "kg")).toBe("+1.2 kg");
    expect(formatHealthDelta(-0.5, "h")).toBe("-0.5 h");
    expect(formatHealthDelta(80, null)).toBe("+80");
  });

  it("formatea sueño", () => {
    expect(formatSleepHours(420)).toBe("7 h");
    expect(formatSleepHours(450)).toBe("7.5 h");
    expect(formatSleepHoursInput(450)).toBe("7.5");
  });
});
