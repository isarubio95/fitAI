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
  vi.restoreAllMocks();
});

describe("mapBasemap", () => {
  it("defaults to map when unset", () => {
    expect(readCardioMapBasemap()).toBe("map");
  });

  it("persists satellite and hybrid preferences", () => {
    writeCardioMapBasemap("satellite");
    expect(readCardioMapBasemap()).toBe("satellite");
    writeCardioMapBasemap("hybrid");
    expect(readCardioMapBasemap()).toBe("hybrid");
    expect(localStorage.getItem(CARDIO_MAP_BASEMAP_STORAGE_KEY)).toBe("hybrid");
  });

  it("ignores unknown stored values", () => {
    localStorage.setItem(CARDIO_MAP_BASEMAP_STORAGE_KEY, "terrain");
    expect(readCardioMapBasemap()).toBe("map");
  });

  it("returns raster satellite style", async () => {
    const style = await loadMapBasemapStyle("satellite");
    expect(style.version).toBe(8);
    expect(style.sources).toHaveProperty("esri");
    const esri = style.sources.esri as { type: string; tiles: string[] };
    expect(esri.type).toBe("raster");
    expect(esri.tiles[0]).toContain("World_Imagery");
  });

  it("returns hybrid style with satellite + labels", async () => {
    const style = await loadMapBasemapStyle("hybrid");
    expect(style.sources).toHaveProperty("esri");
    expect(style.sources).toHaveProperty("openmaptiles");
    expect(style.glyphs).toContain("openfreemap.org");
    const ids = (style.layers ?? []).map((layer) => layer.id);
    expect(ids).toContain("esri");
    expect(ids).toContain("place_city");
    expect(ids).toContain("highway_name_other");
    expect(ids).not.toContain("road_oneway");
  });
});
