import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import { Compass, LocateFixed } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
/** Vite empaqueta el worker + shared chunk; sin esto el mapa queda en blanco (404 del worker). */
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { CardioGpsPoint } from "@/hooks/useCardioGpsRecorder";
import { useDeviceHeading } from "@/hooks/useDeviceHeading";
import { splitTrackByTimeGaps } from "@/lib/cardioTrackSegments";
import {
  courseFromPoints,
  readCardioMapOrientation,
  shortestAngleDelta,
  writeCardioMapOrientation,
  type MapOrientationMode,
} from "@/lib/mapHeading";
import { MAP_COLORS, loadStravaDarkMapStyle } from "@/lib/stravaDarkMapStyle";
import { cn } from "@/lib/utils";

setWorkerUrl(maplibreWorkerUrl);

const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
const FOLLOW_ZOOM = 16;
/** Grabando se acerca un poco más: se ve mejor el trazado que va creciendo. */
const RECORDING_ZOOM = 17.3;
const ZOOM_IN_MS = 900;
/** Giros más pequeños no merecen animación: la brújula nunca está del todo quieta. */
const MIN_BEARING_DELTA_DEG = 2;

type Props = {
  points: CardioGpsPoint[];
  className?: string;
  /** Si true, la cámara sigue el último punto (grabación en vivo). */
  followUser?: boolean;
  /** Sesión en curso: acerca la cámara respecto a la vista de setup. */
  recording?: boolean;
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

const MAP_CONTROL_CLASS = cn(
  "flex h-11 w-11 items-center justify-center rounded-full",
  "border border-white/15 bg-[#1a1f21]/90 shadow-lg backdrop-blur-sm",
  "transition-colors active:scale-95",
);

function RecenterControl({ active, onRecenter }: { active: boolean; onRecenter: () => void }) {
  return (
    <button
      type="button"
      onClick={onRecenter}
      aria-label="Centrar en mi posición"
      className={cn(
        MAP_CONTROL_CLASS,
        active ? "text-[#2D8CFF]" : "text-white/85 hover:text-white",
      )}
    >
      <LocateFixed className="h-5 w-5" strokeWidth={2.25} />
    </button>
  );
}

function OrientationControl({
  mode,
  bearing,
  onToggle,
}: {
  mode: MapOrientationMode;
  bearing: number;
  onToggle: () => void;
}) {
  const label = mode === "heading" ? "Fijar el norte arriba" : "Seguir mi dirección";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      aria-pressed={mode === "heading"}
      className={cn(
        MAP_CONTROL_CLASS,
        mode === "heading" ? "text-[#2D8CFF]" : "text-white/85 hover:text-white",
      )}
    >
      {/* La aguja apunta siempre al norte real, gire el mapa lo que gire. */}
      <Compass className="h-5 w-5" strokeWidth={2.25} style={{ transform: `rotate(${-bearing}deg)` }} />
    </button>
  );
}

export function LiveCardioMap({
  points,
  className,
  followUser = true,
  recording = false,
  referencePoints,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerElementRef = useRef<HTMLDivElement | null>(null);
  const centeredOnceRef = useRef(false);
  /** Último centro aplicado a la cámara: evita reanimar el paneo en cada giro de la brújula. */
  const appliedCenterRef = useRef<[number, number] | null>(null);
  const wasRecordingRef = useRef(recording);
  const [ready, setReady] = useState(false);
  const [following, setFollowing] = useState(followUser);
  const [orientationMode, setOrientationMode] = useState<MapOrientationMode>(() =>
    readCardioMapOrientation(),
  );
  const [mapBearing, setMapBearing] = useState(0);

  const { heading: compassHeading, requestPermission } = useDeviceHeading({
    enabled: orientationMode === "heading",
  });
  const gpsCourse = useMemo(() => courseFromPoints(points), [points]);
  /** Híbrido: la brújula manda (gira parado) y el rumbo GPS cubre cuando no hay sensor. */
  const heading = compassHeading ?? gpsCourse;
  const targetZoom = recording ? RECORDING_ZOOM : FOLLOW_ZOOM;

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
      // Umbral de 1º: rotate se dispara en cada frame de la animación y no hace falta tanto detalle.
      map.on("rotate", () => {
        const next = map.getBearing();
        setMapBearing((prev) => (Math.abs(shortestAngleDelta(prev, next)) < 1 ? prev : next));
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
      markerElementRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      centeredOnceRef.current = false;
      appliedCenterRef.current = null;
      setReady(false);
      setMapBearing(0);
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
        '<span class="live-cardio-pos-pulse"></span><span class="live-cardio-pos-arrow"></span><span class="live-cardio-pos-dot"></span>';
      markerElementRef.current = element;
      markerRef.current = new Marker({ element }).setLngLat(target).addTo(map);
    }
  }, [points, ready]);

  // La flecha se orienta respecto al mapa: en modo dirección apunta siempre arriba.
  useEffect(() => {
    const element = markerElementRef.current;
    if (!element) return;
    if (heading == null) {
      element.style.setProperty("--pos-arrow-opacity", "0");
      return;
    }
    element.style.setProperty("--pos-arrow-opacity", "1");
    element.style.setProperty("--pos-arrow-rot", `${shortestAngleDelta(mapBearing, heading)}deg`);
  }, [heading, mapBearing, points, ready]);

  // Al pulsar Start la cámara se acerca un poco. Si aún no hay fix lo hace el primer centrado.
  useEffect(() => {
    const wasRecording = wasRecordingRef.current;
    wasRecordingRef.current = recording;
    const map = mapRef.current;
    if (!map || !ready || !recording || wasRecording || !centeredOnceRef.current) return;
    map.easeTo({ zoom: Math.max(map.getZoom(), RECORDING_ZOOM), duration: ZOOM_IN_MS });
  }, [recording, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || points.length === 0) return;
    const last = points[points.length - 1];
    const center: [number, number] = [last.lng, last.lat];
    const bearing = orientationMode === "heading" ? heading : 0;
    const rotateTo =
      bearing != null &&
      Math.abs(shortestAngleDelta(map.getBearing(), bearing)) >= MIN_BEARING_DELTA_DEG
        ? bearing
        : null;

    // El usuario movió el mapa: se respeta la orientación, pero no se recentra.
    if (!following) {
      if (rotateTo != null) map.easeTo({ bearing: rotateTo, duration: 300 });
      return;
    }

    if (!centeredOnceRef.current) {
      centeredOnceRef.current = true;
      appliedCenterRef.current = center;
      map.jumpTo({ center, zoom: Math.max(map.getZoom(), FOLLOW_ZOOM), bearing: bearing ?? 0 });
      if (recording) {
        map.easeTo({ zoom: Math.max(map.getZoom(), RECORDING_ZOOM), duration: ZOOM_IN_MS });
      }
      return;
    }

    const applied = appliedCenterRef.current;
    const centerChanged = !applied || applied[0] !== center[0] || applied[1] !== center[1];
    if (!centerChanged && rotateTo == null) return;
    appliedCenterRef.current = center;
    map.easeTo({
      center,
      ...(rotateTo != null ? { bearing: rotateTo } : {}),
      duration: centerChanged ? 450 : 300,
    });
  }, [points, ready, following, heading, orientationMode, recording]);

  const onRecenter = useCallback(() => {
    setFollowing(true);
    const map = mapRef.current;
    const last = points.length > 0 ? points[points.length - 1] : null;
    if (!map || !last) return;
    centeredOnceRef.current = true;
    appliedCenterRef.current = [last.lng, last.lat];
    map.easeTo({ center: [last.lng, last.lat], zoom: targetZoom, duration: 500 });
  }, [points, targetZoom]);

  const onToggleOrientation = useCallback(() => {
    const next: MapOrientationMode = orientationMode === "heading" ? "north" : "heading";
    setOrientationMode(next);
    writeCardioMapOrientation(next);
    if (next === "north") {
      mapRef.current?.easeTo({ bearing: 0, duration: 400 });
      return;
    }
    // iOS exige gesto de usuario para la brújula, así que se pide aquí.
    void requestPermission();
  }, [orientationMode, requestPermission]);

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
        /* Flecha de rumbo: relativa al mapa, así que con el norte fijo apunta al rumbo real. */
        .live-cardio-pos-arrow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 7px solid #fff;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
          transform: translate(-50%, -50%) rotate(var(--pos-arrow-rot, 0deg)) translateY(-14px);
          opacity: var(--pos-arrow-opacity, 0);
          transition: opacity 250ms ease;
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
      {/* Arriba a la derecha: abajo lo tapan la barra de métricas y el drawer de controles. */}
      {points.length > 0 ? (
        <div className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex flex-col gap-2">
          <RecenterControl active={following} onRecenter={onRecenter} />
          <OrientationControl
            mode={orientationMode}
            bearing={mapBearing}
            onToggle={onToggleOrientation}
          />
        </div>
      ) : null}
    </div>
  );
}
