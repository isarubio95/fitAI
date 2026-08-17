import { useCallback, useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  setWorkerUrl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { Loader2, Locate, LocateFixed } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MapBasemapControl } from "@/components/cardio/MapBasemapControl";
import {
  loadMapBasemapStyle,
  readCardioMapBasemap,
  writeCardioMapBasemap,
  type MapBasemapId,
} from "@/lib/mapBasemap";
import { MAP_COLORS } from "@/lib/stravaDarkMapStyle";
import { useBrowserLocation } from "@/hooks/useBrowserLocation";
import type { GimnasioCatalogItem } from "@/types/gimnasio";
import { cn } from "@/lib/utils";

setWorkerUrl(maplibreWorkerUrl);

const SPAIN_CENTER: [number, number] = [-3.7, 40.2];
const SPAIN_ZOOM = 5.4;
const LOCATE_ZOOM = 14;
const SOURCE_ID = "gimnasios";
const LAYER_CLUSTERS = "gimnasios-clusters";
const LAYER_CLUSTER_COUNT = "gimnasios-cluster-count";
const LAYER_POINTS = "gimnasios-points";
const LAYER_SELECTED = "gimnasios-selected";
/** OpenFreeMap solo publica este stack; el default de MapLibre (Open Sans) da 404. */
const OPENFREEMAP_GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const CLUSTER_TEXT_FONT = ["Noto Sans Regular"];

type Props = {
  gyms: GimnasioCatalogItem[];
  selectedId?: string | null;
  onSelect: (gym: GimnasioCatalogItem) => void;
  className?: string;
  /** Si true, pide GPS al cargar y centra el mapa. */
  locateOnLoad?: boolean;
};

function gymsToCollection(gyms: GimnasioCatalogItem[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: gyms.flatMap((gym) => {
      const lat = Number(gym.lat);
      const lng = Number(gym.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
      return [
        {
          type: "Feature" as const,
          properties: { id: gym.id },
          geometry: { type: "Point" as const, coordinates: [lng, lat] },
        },
      ];
    }),
  };
}

function addLayerIfMissing(
  map: MapLibreMap,
  layer: Parameters<MapLibreMap["addLayer"]>[0],
) {
  if (map.getLayer(layer.id)) return;
  map.addLayer(layer);
}

function ensureOpenFreeMapGlyphs(map: MapLibreMap) {
  if (!map.getGlyphs()) {
    map.setGlyphs(OPENFREEMAP_GLYPHS);
  }
}

function addGymLayers(map: MapLibreMap) {
  ensureOpenFreeMapGlyphs(map);

  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: gymsToCollection([]),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 48,
      generateId: true,
    });
  }

  addLayerIfMissing(map, {
    id: LAYER_CLUSTERS,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#10b981",
      "circle-opacity": 0.92,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 50, 28],
    },
  });

  addLayerIfMissing(map, {
    id: LAYER_POINTS,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#10b981",
      "circle-radius": 8,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  addLayerIfMissing(map, {
    id: LAYER_SELECTED,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", ["get", "id"], ""],
    paint: {
      "circle-color": "#34d399",
      "circle-radius": 11,
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff",
    },
  });

  try {
    addLayerIfMissing(map, {
      id: LAYER_CLUSTER_COUNT,
      type: "symbol",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": CLUSTER_TEXT_FONT,
        "text-size": 12,
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });
  } catch {
    /* sin glifos el recuento no pinta; los círculos sí */
  }
}

function syncGymsOnMap(map: MapLibreMap, gyms: GimnasioCatalogItem[]) {
  addGymLayers(map);
  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
  source?.setData(gymsToCollection(gyms));
}

export function GymDirectoryMap({
  gyms,
  selectedId,
  onSelect,
  className,
  locateOnLoad = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const gymsRef = useRef(gyms);
  gymsRef.current = gyms;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const basemapRef = useRef<MapBasemapId>(readCardioMapBasemap());
  const [basemap, setBasemap] = useState<MapBasemapId>(() => basemapRef.current);
  const [ready, setReady] = useState(false);
  const { point: userPoint, loading: locating, request: requestLocation } = useBrowserLocation(false);
  const didAutoLocate = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let map: MapLibreMap | null = null;
    let raf = 0;

    const paintGyms = () => {
      if (cancelled || !map) return;
      try {
        syncGymsOnMap(map, gymsRef.current);
      } catch {
        return;
      }
      setReady(true);
      map.resize();
    };

    void (async () => {
      const style = await loadMapBasemapStyle(basemapRef.current);
      if (cancelled) return;
      await new Promise<void>((resolve) => {
        raf = requestAnimationFrame(() => resolve());
      });
      if (cancelled || !containerRef.current) return;

      map = new MapLibreMap({
        container: containerRef.current,
        style,
        center: SPAIN_CENTER,
        zoom: SPAIN_ZOOM,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new AttributionControl({ compact: true }), "bottom-right");

      map.on("load", paintGyms);
      map.on("style.load", paintGyms);

      map.on("click", LAYER_CLUSTERS, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
        if (!map || clusterId == null || !source || typeof source.getClusterExpansionZoom !== "function") return;
        void Promise.resolve(source.getClusterExpansionZoom(clusterId)).then((zoom) => {
          if (zoom == null || !feature?.geometry || feature.geometry.type !== "Point") return;
          map?.easeTo({
            center: feature.geometry.coordinates as [number, number],
            zoom: typeof zoom === "number" ? zoom : (map?.getZoom() ?? 0) + 1,
          });
        });
      });

      map.on("click", LAYER_POINTS, (event: MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const gym = gymsRef.current.find((g) => g.id === id);
        if (gym) onSelectRef.current(gym);
      });

      map.on("mouseenter", LAYER_CLUSTERS, () => {
        if (map) map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_CLUSTERS, () => {
        if (map) map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", LAYER_POINTS, () => {
        if (map) map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_POINTS, () => {
        if (map) map.getCanvas().style.cursor = "";
      });
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
      map = null;
    };
  }, []);

  const onBasemapChange = useCallback((id: MapBasemapId) => {
    if (id === basemapRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    basemapRef.current = id;
    setBasemap(id);
    writeCardioMapBasemap(id);
    setReady(false);
    void loadMapBasemapStyle(id).then((style) => {
      if (mapRef.current !== map || basemapRef.current !== id) return;
      map.once("style.load", () => {
        if (mapRef.current !== map) return;
        syncGymsOnMap(map, gymsRef.current);
        setReady(true);
      });
      map.setStyle(style);
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    try {
      syncGymsOnMap(map, gyms);
    } catch {
      /* el estilo puede estar recargándose */
    }
  }, [gyms, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(LAYER_SELECTED)) return;
    map.setFilter(LAYER_SELECTED, ["==", ["get", "id"], selectedId ?? ""]);
  }, [selectedId, ready]);

  useEffect(() => {
    if (!ready || !selectedId) return;
    const gym = gymsRef.current.find((g) => g.id === selectedId);
    const map = mapRef.current;
    if (!gym || !map) return;
    map.easeTo({ center: [gym.lng, gym.lat], zoom: Math.max(map.getZoom(), 14) });
  }, [selectedId, ready]);

  useEffect(() => {
    if (!locateOnLoad || !ready || didAutoLocate.current) return;
    didAutoLocate.current = true;
    requestLocation();
  }, [locateOnLoad, ready, requestLocation]);

  useEffect(() => {
    if (!userPoint || !mapRef.current) return;
    mapRef.current.easeTo({ center: [userPoint.lng, userPoint.lat], zoom: LOCATE_ZOOM });
  }, [userPoint]);

  return (
    <div className={cn("relative h-full min-h-0 w-full overflow-hidden bg-muted", className)}>
      <style>{`
        .gym-directory-map-canvas { background: ${MAP_COLORS.land}; }
        .gym-directory-map-canvas,
        .gym-directory-map-canvas .maplibregl-canvas-container,
        .gym-directory-map-canvas .maplibregl-canvas {
          width: 100% !important;
          height: 100% !important;
        }
        .gym-directory-map-canvas .maplibregl-canvas { outline: none; }
        .gym-directory-map-canvas .maplibregl-ctrl-bottom-right {
          margin: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        .gym-directory-map-canvas .maplibregl-ctrl-attrib {
          background: transparent !important;
          color: rgba(255, 255, 255, 0.28);
          font-size: 8px;
          line-height: 1.2;
          padding: 1px 3px 0 0 !important;
          margin: 0 !important;
          box-shadow: none;
          opacity: 0.4;
          max-width: none;
          white-space: nowrap;
        }
        .gym-directory-map-canvas .maplibregl-ctrl-attrib,
        .gym-directory-map-canvas .maplibregl-ctrl-attrib * {
          white-space: nowrap !important;
        }
        .gym-directory-map-canvas .maplibregl-ctrl-attrib:hover,
        .gym-directory-map-canvas .maplibregl-ctrl-attrib:focus-within {
          opacity: 0.75;
          color: rgba(255, 255, 255, 0.55);
        }
        .gym-directory-map-canvas .maplibregl-ctrl-attrib a {
          color: inherit;
          text-decoration: none;
        }
        .gym-directory-map-canvas .maplibregl-ctrl-attrib-button {
          background-color: transparent !important;
          width: 14px;
          height: 14px;
          opacity: 0.45;
        }
        .gym-directory-map-canvas .maplibregl-ctrl-attrib.maplibregl-compact {
          min-height: 14px;
          padding: 0;
        }
      `}</style>
      <div ref={containerRef} className="gym-directory-map-canvas absolute inset-0 h-full w-full" />
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}
      <MapBasemapControl
        value={basemap}
        onChange={onBasemapChange}
        menuPlacement="above"
        className="absolute right-3 z-20"
        style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      />
      <button
        type="button"
        onClick={() => requestLocation()}
        className={cn(
          "touch-styled absolute right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full",
          "border border-white/15 bg-[#1a1f21]/90 text-white shadow-lg backdrop-blur-sm",
          "transition-colors active:scale-95",
        )}
        style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label="Mi ubicación"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : userPoint ? (
          <LocateFixed className="h-4 w-4" />
        ) : (
          <Locate className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
