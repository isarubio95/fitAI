import type { StyleSpecification } from "maplibre-gl";

/** Vector tiles gratuitos (sin API key) con esquema OpenMapTiles. */
const BASE_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

export const MAP_COLORS = {
  land: "#23292b",
  water: "#16252e",
  residential: "#2a3134",
  green: "#1f4d3c",
  greenSoft: "#1b4234",
  building: "#2b3235",
  roadMinor: "#333b3e",
  roadMajor: "#3f4749",
  roadCasing: "#4a5356",
  motorway: "#525b5e",
  rail: "#2f3639",
  label: "#98a3a6",
  labelStrong: "#c3cbcd",
  labelHalo: "rgba(0,0,0,0.75)",
  route: "#FC4C02",
  routeCasing: "rgba(0,0,0,0.45)",
  start: "#22c55e",
  position: "#2D8CFF",
} as const;

const PAINT_OVERRIDES: Record<string, Record<string, unknown>> = {
  background: { "background-color": MAP_COLORS.land },
  water: { "fill-color": MAP_COLORS.water },
  waterway: { "line-color": MAP_COLORS.water },
  landuse_residential: { "fill-color": MAP_COLORS.residential, "fill-opacity": 0.5 },
  landuse_park: { "fill-color": MAP_COLORS.green },
  landcover_wood: { "fill-color": MAP_COLORS.greenSoft, "fill-opacity": 0.85 },
  building: {
    "fill-color": MAP_COLORS.building,
    "fill-outline-color": MAP_COLORS.building,
  },
  highway_path: { "line-color": MAP_COLORS.roadMinor },
  highway_minor: { "line-color": MAP_COLORS.roadMinor, "line-opacity": 1 },
  highway_major_casing: { "line-color": MAP_COLORS.roadCasing },
  highway_major_inner: { "line-color": MAP_COLORS.roadMajor },
  highway_major_subtle: { "line-color": MAP_COLORS.roadMinor },
  highway_motorway_casing: { "line-color": MAP_COLORS.roadCasing },
  highway_motorway_inner: { "line-color": MAP_COLORS.motorway },
  highway_motorway_subtle: { "line-color": MAP_COLORS.roadMajor },
  railway: { "line-color": MAP_COLORS.rail },
  railway_minor: { "line-color": MAP_COLORS.rail },
  railway_transit: { "line-color": MAP_COLORS.rail },
  "aeroway-runway": { "line-color": MAP_COLORS.roadMajor },
  "aeroway-taxiway": { "line-color": MAP_COLORS.roadMinor },
  "aeroway-area": { "fill-color": MAP_COLORS.residential },
};

const LABEL_COLORS: Record<string, string> = {
  water_name: MAP_COLORS.label,
  highway_name_other: MAP_COLORS.label,
  highway_name_motorway: MAP_COLORS.label,
  place_other: MAP_COLORS.label,
  place_suburb: MAP_COLORS.label,
  place_village: MAP_COLORS.label,
  place_town: MAP_COLORS.labelStrong,
  place_city: MAP_COLORS.labelStrong,
  place_city_large: MAP_COLORS.labelStrong,
  place_state: MAP_COLORS.label,
};

/** Verde para prados y matorral, que el estilo base deja en gris. */
const GRASS_LAYER = {
  id: "fitai_landcover_grass",
  type: "fill",
  source: "openmaptiles",
  "source-layer": "landcover",
  filter: [
    "all",
    ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
    ["match", ["get", "class"], ["grass", "scrub", "farmland"], true, false],
  ],
  paint: { "fill-color": MAP_COLORS.greenSoft, "fill-opacity": 0.65 },
} as const;

type MutableLayer = {
  id: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};

function applyStravaPalette(style: StyleSpecification): StyleSpecification {
  const layers = style.layers as unknown as MutableLayer[];

  for (const layer of layers) {
    const paintOverride = PAINT_OVERRIDES[layer.id];
    if (paintOverride) {
      layer.paint = { ...layer.paint, ...paintOverride };
    }

    const labelColor = LABEL_COLORS[layer.id];
    if (labelColor) {
      layer.paint = {
        ...layer.paint,
        "text-color": labelColor,
        "text-halo-color": MAP_COLORS.labelHalo,
        "text-halo-width": 1.2,
      };
    }

    // El patrón de bosque tapa el verde plano que buscamos.
    if (layer.id === "landcover_wood" && layer.paint) {
      delete layer.paint["fill-pattern"];
    }
  }

  const residentialIndex = layers.findIndex((l) => l.id === "landuse_residential");
  const insertAt = residentialIndex >= 0 ? residentialIndex + 1 : 1;
  layers.splice(insertAt, 0, GRASS_LAYER as unknown as MutableLayer);

  return style;
}

/** Si los tiles vectoriales fallan, raster oscuro para no dejar el mapa vacío. */
const RASTER_FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": MAP_COLORS.land } },
    { id: "carto", type: "raster", source: "carto" },
  ],
};

let cached: StyleSpecification | null = null;
let pending: Promise<StyleSpecification> | null = null;

/** Cada instancia del mapa recibe su copia: MapLibre puede mutar el estilo. */
function cloneStyle(style: StyleSpecification): StyleSpecification {
  return typeof structuredClone === "function"
    ? structuredClone(style)
    : (JSON.parse(JSON.stringify(style)) as StyleSpecification);
}

export function loadStravaDarkMapStyle(): Promise<StyleSpecification> {
  if (cached) return Promise.resolve(cloneStyle(cached));
  if (!pending) {
    pending = fetch(BASE_STYLE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Style HTTP ${res.status}`);
        return res.json() as Promise<StyleSpecification>;
      })
      .then((style) => {
        cached = applyStravaPalette(style);
        return cloneStyle(cached);
      })
      .catch(() => cloneStyle(RASTER_FALLBACK_STYLE))
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}
