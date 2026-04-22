import { describe, expect, it } from "vitest";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";

describe("cardioDisciplineUsesGpsMap", () => {
  it("activa mapa para disciplinas con GPS", () => {
    expect(cardioDisciplineUsesGpsMap("running")).toBe(true);
    expect(cardioDisciplineUsesGpsMap("cycling")).toBe(true);
    expect(cardioDisciplineUsesGpsMap("walking")).toBe(true);
    expect(cardioDisciplineUsesGpsMap("rowing")).toBe(true);
  });

  it("desactiva mapa para disciplinas no soportadas o vacias", () => {
    expect(cardioDisciplineUsesGpsMap("swimming")).toBe(false);
    expect(cardioDisciplineUsesGpsMap("")).toBe(false);
    expect(cardioDisciplineUsesGpsMap(null)).toBe(false);
    expect(cardioDisciplineUsesGpsMap(undefined)).toBe(false);
  });
});

