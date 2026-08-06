import { describe, expect, it } from "vitest";
import { buildLiveStatItems } from "@/lib/cardioLiveStats";

const base = {
  elapsedSec: 300,
  distanceM: 1000,
  elevationM: 12,
  speedMps: 1000 / 300,
  bpm: 150,
  fcMedia: 140,
  fcMax: 170,
};

describe("buildLiveStatItems", () => {
  it("running incluye ritmo medio y actual", () => {
    const keys = buildLiveStatItems("running", base).map((i) => i.key);
    expect(keys).toEqual(["time", "distance", "elevation", "paceAvg", "paceNow", "hr", "hrAvg"]);
    const pace = buildLiveStatItems("running", base).find((i) => i.key === "paceAvg");
    expect(pace?.value).toBe("5:00/km");
  });

  it("cycling incluye velocidades", () => {
    const keys = buildLiveStatItems("cycling", base).map((i) => i.key);
    expect(keys).toContain("speedAvg");
    expect(keys).toContain("speedNow");
    expect(keys).not.toContain("paceAvg");
  });

  it("rowing usa ritmo /500m", () => {
    const items = buildLiveStatItems("rowing", {
      ...base,
      elapsedSec: 120,
      distanceM: 500,
      speedMps: 500 / 120,
    });
    expect(items.find((i) => i.key === "paceAvg500")?.value).toBe("2:00/500m");
  });

  it("swimming sin GPS: tiempo y FC", () => {
    const keys = buildLiveStatItems("swimming", base).map((i) => i.key);
    expect(keys).toEqual(["time", "hr", "hrAvg", "hrMax"]);
  });
});
