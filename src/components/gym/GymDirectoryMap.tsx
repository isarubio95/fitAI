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
  firstMapLabelLayerId,
  loadMapBasemapStyle,
  readCardioMapBasemap,
  writeCardioMapBasemap,
  type MapBasemapId,
} from "@/lib/mapBasemap";
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
    features: gyms.map((gym) => ({
      type: "Feature",
      id: gym.id,
      properties: {
        id: gym.id,
        nombre: gym.nombre,
        ciudad: gym.ciudad,
      },
      geometry: { type: "Point", coordinates: [gym.lng, gym.lat] },
    })),
  };
}

function ensureOpenFreeMapGlyphs(map: MapLibreMap) {
  if (!map.getGlyphs()) {
    map.setGlyphs(OPENFREEMAP_GLYPHS);
  }
}

function addGymLayers(map: MapLibreMap) {
  if (map.getSource(SOURCE_ID)) return;

  ensureOpenFreeMapGlyphs(map);

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: gymsToCollection([]),
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 48,
  });

  const beforeId = firstMapLabelLayerId(map.getStyle().layers);

  map.addLayer(
    {
      id: LAYER_CLUSTERS,
      type: "circle",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#059669",
        "circle-opacity": 0.88,
        "circle-stroke-width": 2,
        "circle-stroke-color": "rgba(255,255,255,0.7)",
        "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 50, 26],
      },
    },
    beforeId,
  );

  map.addLayer({
    id: LAYER_CLUSTER_COUNT,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": CLUSTER_TEXT_FONT,
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  map.addLayer(
    {
      id: LAYER_POINTS,
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#10b981",
        "circle-radius": 7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    },
    beforeId,
  );

  map.addLayer(
    {
      id: LAYER_SELECTED,
      type: "circle",
      source: SOURCE_ID,
      filter: ["==", ["get", "id"], ""],
      paint: {
        "circle-color": "#34d399",
        "circle-radius": 10,
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    },
    beforeId,
  );
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

    void loadMapBasemapStyle(basemapRef.current).then((style) => {
      const container = containerRef.current;
      if (cancelled || !container) return;

      const map = new MapLibreMap({
        container,
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

      map.on("load", () => {
        if (cancelled) return;
        addGymLayers(map);
        (map.getSource(SOURCE_ID) as GeoJSONSource | undefined)?.setData(gymsToCollection(gymsRef.current));
        setReady(true);
        map.resize();
      });

      map.on("click", LAYER_CLUSTERS, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
        if (clusterId == null || !source || typeof source.getClusterExpansionZoom !== "function") return;
        void Promise.resolve(source.getClusterExpansionZoom(clusterId)).then((zoom) => {
          if (zoom == null || !feature?.geometry || feature.geometry.type !== "Point") return;
          map.easeTo({
            center: feature.geometry.coordinates as [number, number],
            zoom: typeof zoom === "number" ? zoom : map.getZoom() + 1,
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
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_CLUSTERS, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
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
        addGymLayers(map);
        (map.getSource(SOURCE_ID) as GeoJSONSource | undefined)?.setData(gymsToCollection(gymsRef.current));
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
    (map.getSource(SOURCE_ID) as GeoJSONSource | undefined)?.setData(gymsToCollection(gyms));
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
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
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
          "absolute right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full",
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
