import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import { loadStravaDarkMapStyle, remapOpenFreeMapSpriteIcons } from "@/lib/stravaDarkMapStyle";

/** Basemap del mapa cardio: calles, satélite o híbrido (satélite + etiquetas). */
export type MapBasemapId = "map" | "satellite" | "hybrid";

export const CARDIO_MAP_BASEMAP_STORAGE_KEY = "gym-log-cardioMapBasemap";

const BASEMAP_IDS: ReadonlySet<string> = new Set(["map", "satellite", "hybrid"]);

export function readCardioMapBasemap(): MapBasemapId {
  try {
    const raw = localStorage.getItem(CARDIO_MAP_BASEMAP_STORAGE_KEY);
    return BASEMAP_IDS.has(raw ?? "") ? (raw as MapBasemapId) : "map";
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

const ESRI_ATTRIBUTION =
  'Tiles © <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics';

const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Esri World Imagery (sin API key). */
const ESRI_RASTER_SOURCE = {
  type: "raster" as const,
  tiles: [
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  ],
  tileSize: 256,
  maxzoom: 19,
  attribution: ESRI_ATTRIBUTION,
};

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: { esri: ESRI_RASTER_SOURCE },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0b1a12" } },
    { id: "esri", type: "raster", source: "esri" },
  ],
};

/** Vector style usado solo para fuente OpenMapTiles, glyphs y capas de etiquetas. */
const HYBRID_LABEL_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/** Capas symbol útiles sobre satélite (sin flechas oneway). */
const HYBRID_LABEL_LAYER_IDS = new Set([
  "water_name",
  "highway_name_other",
  "highway_name_motorway",
  "place_other",
  "place_suburb",
  "place_village",
  "place_town",
  "place_city",
  "place_city_large",
  "place_state",
  "place_country_other",
  "place_country_minor",
  "place_country_major",
]);

/** Carreteras principales como trazo fino para orientar (patrón híbrido típico). */
const HYBRID_ROAD_LAYER_IDS = new Set([
  "highway_major_casing",
  "highway_major_inner",
  "highway_motorway_casing",
  "highway_motorway_inner",
]);

const HYBRID_LABEL_PAINT = {
  "text-color": "#ffffff",
  "text-halo-color": "rgba(0,0,0,0.85)",
  "text-halo-width": 1.6,
} as const;

let satelliteCached: StyleSpecification | null = null;
let hybridCached: StyleSpecification | null = null;
let hybridPending: Promise<StyleSpecification> | null = null;

function cloneStyle(style: StyleSpecification): StyleSpecification {
  return typeof structuredClone === "function"
    ? structuredClone(style)
    : (JSON.parse(JSON.stringify(style)) as StyleSpecification);
}

function styleHybridLabelLayer(layer: LayerSpecification): LayerSpecification {
  const next = cloneStyle({ version: 8, layers: [layer] }).layers![0] as LayerSpecification & {
    paint?: Record<string, unknown>;
  };
  next.paint = {
    ...(next.paint ?? {}),
    ...HYBRID_LABEL_PAINT,
  };
  return next;
}

function styleHybridRoadLayer(layer: LayerSpecification): LayerSpecification {
  const next = cloneStyle({ version: 8, layers: [layer] }).layers![0] as LayerSpecification & {
    paint?: Record<string, unknown>;
  };
  const isCasing = layer.id.includes("casing");
  next.paint = {
    ...(next.paint ?? {}),
    "line-color": isCasing ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.7)",
    "line-opacity": 1,
  };
  return next;
}

/**
 * Satélite Esri + etiquetas/carreteras OpenMapTiles (OpenFreeMap).
 * Si falla el fetch vectorial, cae al satélite puro.
 */
function loadHybridMapStyle(): Promise<StyleSpecification> {
  if (hybridCached) return Promise.resolve(cloneStyle(hybridCached));
  if (!hybridPending) {
    hybridPending = fetch(HYBRID_LABEL_STYLE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Hybrid style HTTP ${res.status}`);
        return res.json() as Promise<StyleSpecification>;
      })
      .then((base) => {
        const openmaptiles = base.sources?.openmaptiles;
        if (!openmaptiles || !base.glyphs) {
          throw new Error("Hybrid style missing openmaptiles/glyphs");
        }

        remapOpenFreeMapSpriteIcons(base);

        const roadLayers = (base.layers ?? [])
          .filter((layer) => HYBRID_ROAD_LAYER_IDS.has(layer.id))
          .map(styleHybridRoadLayer);

        const labelLayers = (base.layers ?? [])
          .filter((layer) => HYBRID_LABEL_LAYER_IDS.has(layer.id))
          .map(styleHybridLabelLayer);

        const style: StyleSpecification = {
          version: 8,
          name: "fitai-hybrid",
          glyphs: base.glyphs,
          ...(base.sprite ? { sprite: base.sprite } : {}),
          sources: {
            esri: {
              ...ESRI_RASTER_SOURCE,
              attribution: `${ESRI_ATTRIBUTION} · ${OSM_ATTRIBUTION}`,
            },
            openmaptiles,
          },
          layers: [
            { id: "bg", type: "background", paint: { "background-color": "#0b1a12" } },
            { id: "esri", type: "raster", source: "esri" },
            ...roadLayers,
            ...labelLayers,
          ],
        };

        hybridCached = style;
        return cloneStyle(style);
      })
      .catch(() => {
        if (!satelliteCached) satelliteCached = SATELLITE_STYLE;
        return cloneStyle(satelliteCached);
      })
      .finally(() => {
        hybridPending = null;
      });
  }
  return hybridPending;
}

export function loadMapBasemapStyle(id: MapBasemapId): Promise<StyleSpecification> {
  if (id === "satellite") {
    if (!satelliteCached) satelliteCached = SATELLITE_STYLE;
    return Promise.resolve(cloneStyle(satelliteCached));
  }
  if (id === "hybrid") {
    return loadHybridMapStyle();
  }
  return loadStravaDarkMapStyle();
}

/**
 * Primera capa de nombre de localidad (`place_*`).
 * El trazado debe ir *antes* de esta capa (encima de carreteras/vías) y debajo de los topónimos.
 */
export function firstMapLabelLayerId(
  layers: Array<{ id: string; type: string }> | undefined,
): string | undefined {
  if (!layers) return undefined;
  for (const layer of layers) {
    if (layer.type === "symbol" && layer.id.startsWith("place_")) return layer.id;
  }
  return undefined;
}
