import { describe, expect, it } from "vitest";
import {
  DEFAULT_YOU_PROGRESS_PERIOD,
  parseYouProgressPeriod,
  youProgressPeriodMeta,
} from "@/lib/youProgressPeriod";

describe("parseYouProgressPeriod", () => {
  it("devuelve 4w si falta o no vale", () => {
    expect(parseYouProgressPeriod(null)).toBe(DEFAULT_YOU_PROGRESS_PERIOD);
    expect(parseYouProgressPeriod("")).toBe("4w");
    expect(parseYouProgressPeriod("year")).toBe("4w");
  });

  it("acepta las cuatro claves", () => {
    expect(parseYouProgressPeriod("7d")).toBe("7d");
    expect(parseYouProgressPeriod("4w")).toBe("4w");
    expect(parseYouProgressPeriod("3m")).toBe("3m");
    expect(parseYouProgressPeriod("6m")).toBe("6m");
  });
});

describe("youProgressPeriodMeta", () => {
  it("da frase y reloj para etiquetar cards", () => {
    expect(youProgressPeriodMeta("4w").enPhrase).toBe("estas 4 semanas");
    expect(youProgressPeriodMeta("4w").clockLabel).toBe("estas 4 semanas");
    expect(youProgressPeriodMeta("7d").label).toBe("7 días");
  });
});
