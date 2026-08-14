import type { StyleSpecification } from "maplibre-gl";
import { loadStravaDarkMapStyle } from "@/lib/stravaDarkMapStyle";

/** Basemap del mapa cardio: estilo oscuro (calles) o satélite. */
export type MapBasemapId = "map" | "satellite";

export const CARDIO_MAP_BASEMAP_STORAGE_KEY = "gym-log-cardioMapBasemap";

export function readCardioMapBasemap(): MapBasemapId {
  try {
    return localStorage.getItem(CARDIO_MAP_BASEMAP_STORAGE_KEY) === "satellite"
      ? "satellite"
      : "map";
  } catch {
    return "map";
  }
}

export function writeCardioMapBasemap(id: MapBasemapId): void {
  try {
    localStorage.setItem(CARDIO_MAP_BASEMAP_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Esri World Imagery (sin API key). */
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        'Tiles © <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0b1a12" } },
    { id: "esri", type: "raster", source: "esri" },
  ],
};

let satelliteCached: StyleSpecification | null = null;

function cloneStyle(style: StyleSpecification): StyleSpecification {
  return typeof structuredClone === "function"
    ? structuredClone(style)
    : (JSON.parse(JSON.stringify(style)) as StyleSpecification);
}

export function loadMapBasemapStyle(id: MapBasemapId): Promise<StyleSpecification> {
  if (id === "satellite") {
    if (!satelliteCached) satelliteCached = SATELLITE_STYLE;
    return Promise.resolve(cloneStyle(satelliteCached));
  }
  return loadStravaDarkMapStyle();
}
