import { describe, expect, it } from "vitest";
import { formatCityRegionLabel, geocodeCacheKey } from "@/lib/reverseGeocode";

describe("formatCityRegionLabel", () => {
  it("formatea ciudad y región", () => {
    expect(formatCityRegionLabel("Logroño", "La Rioja")).toBe("Logroño, La Rioja");
  });

  it("omite región si es igual a la ciudad", () => {
    expect(formatCityRegionLabel("Madrid", "Madrid")).toBe("Madrid");
  });

  it("omite región nula", () => {
    expect(formatCityRegionLabel("Haro", null)).toBe("Haro");
  });
});

describe("geocodeCacheKey", () => {
  it("redondea a 3 decimales", () => {
    expect(geocodeCacheKey(42.465123, -2.449876)).toBe("42.465,-2.450");
  });
});
