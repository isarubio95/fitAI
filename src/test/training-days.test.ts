import { describe, expect, it } from "vitest";
import { dayKeyFromTimestamp, dayKeyToUltimaFechaIso, latestDayKey } from "@/lib/trainingDays";

describe("trainingDays", () => {
  it("extrae YYYY-MM-DD del timestamp", () => {
    expect(dayKeyFromTimestamp("2026-08-18T07:12:00.000Z")).toBe("2026-08-18");
    expect(dayKeyFromTimestamp(null)).toBe("");
  });

  it("elige el día más reciente", () => {
    expect(latestDayKey(["2026-08-01", "2026-08-18", "2026-07-31"])).toBe("2026-08-18");
    expect(latestDayKey([])).toBeNull();
  });

  it("convierte el día a ISO de fin de jornada UTC", () => {
    expect(dayKeyToUltimaFechaIso("2026-08-18")).toBe("2026-08-18T23:59:59.999Z");
    expect(dayKeyToUltimaFechaIso(null)).toBeNull();
  });
});
