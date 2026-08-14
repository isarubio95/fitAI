import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CARDIO_MAP_BASEMAP_STORAGE_KEY,
  loadMapBasemapStyle,
  readCardioMapBasemap,
  writeCardioMapBasemap,
} from "@/lib/mapBasemap";

afterEach(() => {
  localStorage.removeItem(CARDIO_MAP_BASEMAP_STORAGE_KEY);
  vi.unstubAllGlobals();
});

describe("mapBasemap", () => {
  it("defaults to map when unset", () => {
    expect(readCardioMapBasemap()).toBe("map");
  });

  it("persists satellite preference", () => {
    writeCardioMapBasemap("satellite");
    expect(readCardioMapBasemap()).toBe("satellite");
    expect(localStorage.getItem(CARDIO_MAP_BASEMAP_STORAGE_KEY)).toBe("satellite");
  });

  it("returns raster satellite style", async () => {
    const style = await loadMapBasemapStyle("satellite");
    expect(style.version).toBe(8);
    expect(style.sources).toHaveProperty("esri");
    const esri = style.sources.esri as { type: string; tiles: string[] };
    expect(esri.type).toBe("raster");
    expect(esri.tiles[0]).toContain("World_Imagery");
  });
});
