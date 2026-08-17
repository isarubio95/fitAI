import { afterEach, describe, expect, it, vi } from "vitest";
import type { StyleSpecification } from "maplibre-gl";
import {
  CARDIO_MAP_BASEMAP_STORAGE_KEY,
  firstMapLabelLayerId,
  loadMapBasemapStyle,
  readCardioMapBasemap,
  writeCardioMapBasemap,
} from "@/lib/mapBasemap";
import { remapOpenFreeMapSpriteIcons } from "@/lib/stravaDarkMapStyle";

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
    const city = style.layers?.find((layer) => layer.id === "place_city") as
      | { layout?: { "icon-image"?: unknown } }
      | undefined;
    expect(JSON.stringify(city?.layout?.["icon-image"] ?? "")).not.toContain("circle-11");
  });

  it("finds the first place label so routes sit under localities, not roads", () => {
    expect(
      firstMapLabelLayerId([
        { id: "bg", type: "background" },
        { id: "water_name", type: "symbol" },
        { id: "highway_major_inner", type: "line" },
        { id: "highway_name_other", type: "symbol" },
        { id: "place_other", type: "symbol" },
        { id: "place_city", type: "symbol" },
      ]),
    ).toBe("place_other");
    expect(firstMapLabelLayerId([{ id: "esri", type: "raster" }])).toBeUndefined();
    expect(firstMapLabelLayerId([{ id: "water_name", type: "symbol" }])).toBeUndefined();
    expect(firstMapLabelLayerId(undefined)).toBeUndefined();
  });

  it("aliases Liberty hyphen icons to OpenFreeMap sprite names", () => {
    const style = {
      version: 8,
      sources: {},
      layers: [
        {
          id: "place_city",
          type: "symbol",
          source: "openmaptiles",
          layout: { "icon-image": ["step", ["zoom"], "circle-11", 9, ""] },
        },
        {
          id: "road_oneway",
          type: "symbol",
          source: "openmaptiles",
          layout: { "icon-image": "oneway" },
        },
      ],
    } as StyleSpecification;

    remapOpenFreeMapSpriteIcons(style);

    const city = style.layers[0] as { layout: { "icon-image": unknown } };
    const oneway = style.layers[1] as { layout: { "icon-image": unknown } };
    expect(city.layout["icon-image"]).toEqual(["step", ["zoom"], "circle_11", 9, ""]);
    expect(oneway.layout["icon-image"]).toBe("oneway");
  });

  it("hybrid style places route anchor before locality labels and after roads", async () => {
    const style = await loadMapBasemapStyle("hybrid");
    const labelId = firstMapLabelLayerId(style.layers);
    expect(labelId).toBe("place_other");
    const ids = (style.layers ?? []).map((layer) => layer.id);
    expect(ids.indexOf("highway_major_inner")).toBeLessThan(ids.indexOf(labelId!));
    expect(ids.indexOf(labelId!)).toBeLessThanOrEqual(ids.indexOf("place_city"));
  });
});
