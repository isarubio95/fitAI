import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
/** Vite empaqueta el worker + shared chunk; sin esto el mapa queda en blanco (404 del worker). */
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MAP_COLORS, loadStravaDarkMapStyle } from "@/lib/stravaDarkMapStyle";
import { cn } from "@/lib/utils";

setWorkerUrl(maplibreWorkerUrl);

const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
const FIT_PADDING = 36;
const FIT_MAX_ZOOM = 16;

export type CardioRouteMapPoint = {
  lat: number;
  lng: number;
};

type Props = {
  points: CardioRouteMapPoint[];
  className?: string;
  /** Si false, desactiva pan/zoom (preview en cards). */
  interactive?: boolean;
};

function lineFeature(coordinates: [number, number][]): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } };
}

function pointFeature(coordinates: [number, number] | null): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: coordinates
      ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates } }]
      : [],
  };
}

function addRouteLayers(map: MapLibreMap) {
  map.addSource("cardio-route", { type: "geojson", data: lineFeature([]) });
  map.addSource("cardio-start", { type: "geojson", data: pointFeature(null) });
  map.addSource("cardio-end", { type: "geojson", data: pointFeature(null) });

  map.addLayer({
    id: "cardio-route-casing",
    type: "line",
    source: "cardio-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": MAP_COLORS.routeCasing,
      "line-blur": 0.6,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 16, 8, 20, 12],
    },
  });

  map.addLayer({
    id: "cardio-route-line",
    type: "line",
    source: "cardio-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": MAP_COLORS.route,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.5, 16, 5, 20, 8],
    },
  });

  map.addLayer({
    id: "cardio-start-dot",
    type: "circle",
    source: "cardio-start",
    paint: {
      "circle-radius": 5.5,
      "circle-color": MAP_COLORS.start,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addLayer({
    id: "cardio-end-dot",
    type: "circle",
    source: "cardio-end",
    paint: {
      "circle-radius": 5.5,
      "circle-color": MAP_COLORS.route,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

function fitRoute(map: MapLibreMap, coordinates: [number, number][]) {
  if (coordinates.length === 0) return;
  if (coordinates.length === 1) {
    map.jumpTo({ center: coordinates[0], zoom: 14 });
    return;
  }
  const bounds = coordinates.reduce(
    (b, c) => b.extend(c),
    new LngLatBounds(coordinates[0], coordinates[0]),
  );
  map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration: 0 });
}

/**
 * Mapa estático del recorrido (feed / detalle). Sin follow-user ni marker en vivo.
 */
export function CardioRouteMap({ points, className, interactive = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const paintedRef = useRef(false);
  const [ready, setReady] = useState(false);
  /** Estilo + primer paint (tiles); el skeleton con reflejo se quita al pintar. */
  const [painted, setPainted] = useState(false);

  const initialViewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  if (initialViewRef.current === null) {
    const mid = points.length > 0 ? points[Math.floor(points.length / 2)] : null;
    initialViewRef.current = mid
      ? { center: [mid.lng, mid.lat], zoom: 13 }
      : { center: DEFAULT_CENTER, zoom: 12 };
  }

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    void loadStravaDarkMapStyle().then((style) => {
      const container = containerRef.current;
      if (cancelled || !container) return;

      const map = new MapLibreMap({
        container,
        style,
        center: initialViewRef.current!.center,
        zoom: initialViewRef.current!.zoom,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        interactive,
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new AttributionControl({ compact: true }), "bottom-right");

      map.on("load", () => {
        if (cancelled) return;
        addRouteLayers(map);
        setReady(true);
        map.resize();
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      paintedRef.current = false;
      setReady(false);
      setPainted(false);
    };
    // interactive fijo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const coordinates = points.map((p) => [p.lng, p.lat] as [number, number]);
    (map.getSource("cardio-route") as GeoJSONSource | undefined)?.setData(lineFeature(coordinates));
    (map.getSource("cardio-start") as GeoJSONSource | undefined)?.setData(
      pointFeature(coordinates.length > 0 ? coordinates[0] : null),
    );
    (map.getSource("cardio-end") as GeoJSONSource | undefined)?.setData(
      pointFeature(coordinates.length > 1 ? coordinates[coordinates.length - 1] : null),
    );
    fitRoute(map, coordinates);

    if (paintedRef.current) return;
    let cancelled = false;
    const reveal = () => {
      if (cancelled || paintedRef.current) return;
      paintedRef.current = true;
      setPainted(true);
    };
    map.once("idle", reveal);
    // Si los tiles fallan o idle no llega, no dejar el skeleton eterno.
    const fallback = window.setTimeout(reveal, 2500);
    return () => {
      cancelled = true;
      map.off("idle", reveal);
      window.clearTimeout(fallback);
    };
  }, [points, ready]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      aria-busy={!painted}
      // Evita que Vaul interprete pan/zoom del mapa como arrastre del drawer.
      {...(interactive ? { "data-vaul-no-drag": true } : {})}
    >
      <style>{`
        .cardio-route-map-canvas { background: ${MAP_COLORS.land}; }
        .cardio-route-map-canvas .maplibregl-canvas { outline: none; }
        .cardio-route-map-canvas .maplibregl-ctrl-bottom-right {
          margin: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        .cardio-route-map-canvas .maplibregl-ctrl-attrib {
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
        .cardio-route-map-canvas .maplibregl-ctrl-attrib,
        .cardio-route-map-canvas .maplibregl-ctrl-attrib * {
          white-space: nowrap !important;
        }
        .cardio-route-map-canvas .maplibregl-ctrl-attrib:hover,
        .cardio-route-map-canvas .maplibregl-ctrl-attrib:focus-within {
          opacity: 0.75;
          color: rgba(255, 255, 255, 0.55);
        }
        .cardio-route-map-canvas .maplibregl-ctrl-attrib a {
          color: inherit;
          text-decoration: none;
        }
        .cardio-route-map-canvas .maplibregl-ctrl-attrib-button {
          background-color: transparent !important;
          width: 14px;
          height: 14px;
          opacity: 0.45;
        }
        .cardio-route-map-canvas .maplibregl-ctrl-attrib.maplibregl-compact {
          min-height: 14px;
          padding: 0;
        }
      `}</style>
      <div
        ref={containerRef}
        className="cardio-route-map-canvas h-full min-h-40 w-full"
        style={{ background: MAP_COLORS.land }}
      />
      {!painted ? (
        <div
          className="map-route-skeleton absolute inset-0 z-10 transition-opacity duration-300"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
