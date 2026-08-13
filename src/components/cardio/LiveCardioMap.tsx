import { useCallback, useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import { LocateFixed } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
/** Vite empaqueta el worker + shared chunk; sin esto el mapa queda en blanco (404 del worker). */
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { CardioGpsPoint } from "@/hooks/useCardioGpsRecorder";
import { splitTrackByTimeGaps } from "@/lib/cardioTrackSegments";
import { MAP_COLORS, loadStravaDarkMapStyle } from "@/lib/stravaDarkMapStyle";
import { cn } from "@/lib/utils";

setWorkerUrl(maplibreWorkerUrl);

const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
const FOLLOW_ZOOM = 16;

type Props = {
  points: CardioGpsPoint[];
  className?: string;
  /** Si true, la cámara sigue el último punto (grabación en vivo). */
  followUser?: boolean;
  /** Ruta objetivo (fantasma) debajo del track live. */
  referencePoints?: Array<{ lat: number; lng: number }>;
};

function lineFeature(coordinates: [number, number][]): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } };
}

/** El track se dibuja por tramos para no cerrar con una recta los huecos sin señal. */
function trackFeature(points: CardioGpsPoint[]): Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "MultiLineString", coordinates: splitTrackByTimeGaps(points) },
  };
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
  map.addSource("cardio-reference-route", { type: "geojson", data: lineFeature([]) });
  map.addSource("cardio-route", { type: "geojson", data: lineFeature([]) });
  map.addSource("cardio-start", { type: "geojson", data: pointFeature(null) });

  map.addLayer({
    id: "cardio-reference-route-casing",
    type: "line",
    source: "cardio-reference-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": MAP_COLORS.referenceRouteCasing,
      "line-blur": 0.4,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 5, 16, 9, 20, 13],
    },
  });

  map.addLayer({
    id: "cardio-reference-route-line",
    type: "line",
    source: "cardio-reference-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": MAP_COLORS.referenceRoute,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 3, 16, 6, 20, 9],
      "line-dasharray": [1.5, 1.25],
    },
  });

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
}

function RecenterControl({ active, onRecenter }: { active: boolean; onRecenter: () => void }) {
  return (
    <button
      type="button"
      onClick={onRecenter}
      aria-label="Centrar en mi posición"
      className={cn(
        "absolute right-3 bottom-3 z-10 flex h-11 w-11 items-center justify-center rounded-full",
        "border border-white/15 bg-[#1a1f21]/90 shadow-lg backdrop-blur-sm",
        "transition-colors active:scale-95",
        active ? "text-[#2D8CFF]" : "text-white/85 hover:text-white",
      )}
    >
      <LocateFixed className="h-5 w-5" strokeWidth={2.25} />
    </button>
  );
}

export function LiveCardioMap({ points, className, followUser = true, referencePoints }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const centeredOnceRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [following, setFollowing] = useState(followUser);

  const initialViewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  if (initialViewRef.current === null) {
    const last = points.length > 0 ? points[points.length - 1] : null;
    initialViewRef.current = last
      ? { center: [last.lng, last.lat], zoom: FOLLOW_ZOOM }
      : { center: DEFAULT_CENTER, zoom: 12 };
  }

  useEffect(() => {
    setFollowing(followUser);
  }, [followUser]);

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
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(
        new AttributionControl({ compact: true }),
        "bottom-right",
      );

      map.on("dragstart", () => setFollowing(false));
      map.on("zoomstart", (e) => {
        // Ignora el zoom programático de easeTo/jumpTo: solo gestos del usuario.
        if ((e as { originalEvent?: Event }).originalEvent) setFollowing(false);
      });
      map.on("load", () => {
        if (cancelled) return;
        addRouteLayers(map);
        setReady(true);
        map.resize();
      });
    });

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      centeredOnceRef.current = false;
      setReady(false);
    };
  }, []);

  // El contenedor se monta dentro de paneles con transición: recalcula tamaño.
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
    (map.getSource("cardio-route") as GeoJSONSource | undefined)?.setData(trackFeature(points));
    (map.getSource("cardio-start") as GeoJSONSource | undefined)?.setData(
      pointFeature(coordinates.length > 1 ? coordinates[0] : null),
    );
  }, [points, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const coordinates = (referencePoints ?? []).map((p) => [p.lng, p.lat] as [number, number]);
    (map.getSource("cardio-reference-route") as GeoJSONSource | undefined)?.setData(
      lineFeature(coordinates),
    );

    // En setup (sin track live) encuadra la ruta objetivo.
    if (points.length === 0 && coordinates.length >= 2) {
      let minLng = coordinates[0][0];
      let maxLng = coordinates[0][0];
      let minLat = coordinates[0][1];
      let maxLat = coordinates[0][1];
      for (const [lng, lat] of coordinates) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 48, maxZoom: 16, duration: 600 },
      );
    }
  }, [referencePoints, points.length, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || points.length === 0) return;
    const last = points[points.length - 1];
    const target: [number, number] = [last.lng, last.lat];

    if (markerRef.current) {
      markerRef.current.setLngLat(target);
    } else {
      const element = document.createElement("div");
      element.className = "live-cardio-pos";
      element.innerHTML =
        '<span class="live-cardio-pos-pulse"></span><span class="live-cardio-pos-dot"></span>';
      markerRef.current = new Marker({ element }).setLngLat(target).addTo(map);
    }
  }, [points, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !following || points.length === 0) return;
    const last = points[points.length - 1];
    const target: [number, number] = [last.lng, last.lat];

    if (!centeredOnceRef.current) {
      centeredOnceRef.current = true;
      map.jumpTo({ center: target, zoom: Math.max(map.getZoom(), FOLLOW_ZOOM) });
      return;
    }
    map.easeTo({ center: target, duration: 450 });
  }, [points, ready, following]);

  const onRecenter = useCallback(() => {
    setFollowing(true);
    const map = mapRef.current;
    const last = points.length > 0 ? points[points.length - 1] : null;
    if (!map || !last) return;
    centeredOnceRef.current = true;
    map.easeTo({ center: [last.lng, last.lat], zoom: FOLLOW_ZOOM, duration: 500 });
  }, [points]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <style>{`
        .live-cardio-map-canvas { background: ${MAP_COLORS.land}; }
        .live-cardio-map-canvas .maplibregl-canvas { outline: none; }
        .live-cardio-pos {
          position: relative;
          width: 28px;
          height: 28px;
        }
        .live-cardio-pos-pulse {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: ${MAP_COLORS.position};
          opacity: 0.4;
          animation: live-cardio-pulse 1.6s ease-out infinite;
        }
        .live-cardio-pos-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          margin: -7px 0 0 -7px;
          border-radius: 9999px;
          background: ${MAP_COLORS.position};
          border: 3px solid #fff;
          box-shadow: 0 1px 6px rgba(0,0,0,0.55);
        }
        @keyframes live-cardio-pulse {
          0% { transform: scale(0.45); opacity: 0.5; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .live-cardio-map-canvas .maplibregl-ctrl-bottom-right {
          margin: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        .live-cardio-map-canvas .maplibregl-ctrl-attrib {
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
        .live-cardio-map-canvas .maplibregl-ctrl-attrib,
        .live-cardio-map-canvas .maplibregl-ctrl-attrib * {
          white-space: nowrap !important;
        }
        .live-cardio-map-canvas .maplibregl-ctrl-attrib:hover,
        .live-cardio-map-canvas .maplibregl-ctrl-attrib:focus-within {
          opacity: 0.75;
          color: rgba(255, 255, 255, 0.55);
        }
        .live-cardio-map-canvas .maplibregl-ctrl-attrib a { color: inherit; text-decoration: none; }
        .live-cardio-map-canvas .maplibregl-ctrl-attrib-button {
          background-color: transparent !important;
          width: 14px;
          height: 14px;
          opacity: 0.45;
        }
        .live-cardio-map-canvas .maplibregl-ctrl-attrib.maplibregl-compact {
          min-height: 14px;
          padding: 0;
        }
      `}</style>
      <div
        ref={containerRef}
        className="live-cardio-map-canvas h-full min-h-55 w-full"
        style={{ background: MAP_COLORS.land }}
      />
      {points.length > 0 ? <RecenterControl active={following} onRecenter={onRecenter} /> : null}
    </div>
  );
}
