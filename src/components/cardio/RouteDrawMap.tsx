import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Feature } from "geojson";
import { Loader2, LocateFixed, Repeat, Trash2, Undo2 } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
/** Vite empaqueta el worker + shared chunk; sin esto el mapa queda en blanco (404 del worker). */
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MAP_COLORS, loadStravaDarkMapStyle } from "@/lib/stravaDarkMapStyle";
import { cn } from "@/lib/utils";

setWorkerUrl(maplibreWorkerUrl);

const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
const DEFAULT_ZOOM = 14;
const LOCATE_ZOOM = 16;

export type DrawMapPoint = { lat: number; lng: number };

type Props = {
  /** Puntos que ha marcado el usuario; se dibujan como marcadores arrastrables. */
  waypoints: DrawMapPoint[];
  /** Polilínea resultante (recta o ajustada a caminos). */
  path: DrawMapPoint[];
  onAddPoint: (point: DrawMapPoint) => void;
  onMoveWaypoint: (index: number, point: DrawMapPoint) => void;
  onRemoveWaypoint: (index: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onCloseLoop: () => void;
  canUndo: boolean;
  canCloseLoop: boolean;
  /** Hay tramos esperando al enrutador. */
  routing?: boolean;
  className?: string;
};

const TRASH_HIT_PADDING_PX = 14;

/** ¿El marcador (en coords de mapa) cae sobre la zona de la papelera? */
function isOverTrashZone(
  map: MapLibreMap,
  lngLat: { lng: number; lat: number },
  zone: HTMLElement | null,
): boolean {
  if (!zone) return false;
  const containerRect = map.getContainer().getBoundingClientRect();
  const projected = map.project(lngLat);
  const x = containerRect.left + projected.x;
  const y = containerRect.top + projected.y;
  const r = zone.getBoundingClientRect();
  const pad = TRASH_HIT_PADDING_PX;
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

function lineFeature(coordinates: [number, number][]): Feature {
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } };
}

function addDraftLayers(map: MapLibreMap) {
  map.addSource("route-draft", { type: "geojson", data: lineFeature([]) });

  map.addLayer({
    id: "route-draft-casing",
    type: "line",
    source: "route-draft",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": MAP_COLORS.routeCasing,
      "line-blur": 0.6,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 16, 8, 20, 12],
    },
  });

  map.addLayer({
    id: "route-draft-line",
    type: "line",
    source: "route-draft",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": MAP_COLORS.route,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.5, 16, 5, 20, 8],
    },
  });
}

/**
 * `touch-styled` es obligatorio: sin ella el CSS global de táctil vacía el fondo y pinta el
 * borde con currentColor mientras el WebView deja el :hover pegado tras el toque.
 */
function MapControl({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "touch-styled flex h-11 w-11 items-center justify-center rounded-full",
        "border border-white/15 bg-[#1a1f21]/90 text-white/85 shadow-lg backdrop-blur-sm",
        "transition-colors active:scale-95 hover:text-white",
        "disabled:pointer-events-none disabled:opacity-35",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Mapa editable: cada toque añade un punto al recorrido y los marcadores se
 * pueden arrastrar para corregir el trazado.
 */
export function RouteDrawMap({
  waypoints,
  path,
  onAddPoint,
  onMoveWaypoint,
  onRemoveWaypoint,
  onUndo,
  onClear,
  onCloseLoop,
  canUndo,
  canCloseLoop,
  routing = false,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  /** Evita que el `click` tras soltar un marcador añada un punto. */
  const ignoreMapClickRef = useRef(false);
  const overTrashRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [draggingWaypoint, setDraggingWaypoint] = useState(false);
  const [overTrash, setOverTrash] = useState(false);

  // Los handlers del mapa se registran una vez; las props se leen por referencia.
  const onAddPointRef = useRef(onAddPoint);
  onAddPointRef.current = onAddPoint;
  const onMoveWaypointRef = useRef(onMoveWaypoint);
  onMoveWaypointRef.current = onMoveWaypoint;
  const onRemoveWaypointRef = useRef(onRemoveWaypoint);
  onRemoveWaypointRef.current = onRemoveWaypoint;

  const initialCenterRef = useRef<[number, number] | null>(null);
  if (initialCenterRef.current === null) {
    const first = path[0] ?? waypoints[0] ?? null;
    initialCenterRef.current = first ? [first.lng, first.lat] : DEFAULT_CENTER;
  }
  const hadInitialPoint = useRef(Boolean(path.length || waypoints.length));

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    void loadStravaDarkMapStyle().then((style) => {
      const container = containerRef.current;
      if (cancelled || !container) return;

      const map = new MapLibreMap({
        container,
        style,
        center: initialCenterRef.current!,
        zoom: DEFAULT_ZOOM,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        // Un doble clic para hacer zoom dejaría dos puntos sueltos en el recorrido.
        doubleClickZoom: false,
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new AttributionControl({ compact: true }), "bottom-right");

      map.on("click", (e) => {
        if (draggingRef.current || ignoreMapClickRef.current) return;
        onAddPointRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });

      map.on("load", () => {
        if (cancelled) return;
        addDraftLayers(map);
        setReady(true);
        map.resize();
      });
    });

    return () => {
      cancelled = true;
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Sin puntos de partida, arrancamos en la posición del usuario.
  useEffect(() => {
    if (hadInitialPoint.current || !ready) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const map = mapRef.current;
        if (cancelled || !map) return;
        map.jumpTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: LOCATE_ZOOM,
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const coordinates = path.map((p) => [p.lng, p.lat] as [number, number]);
    (map.getSource("route-draft") as GeoJSONSource | undefined)?.setData(lineFeature(coordinates));
  }, [path, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const markers = markersRef.current;
    while (markers.length > waypoints.length) markers.pop()?.remove();

    waypoints.forEach((waypoint, index) => {
      const target: [number, number] = [waypoint.lng, waypoint.lat];
      let marker = markers[index];

      if (!marker) {
        const element = document.createElement("div");
        element.className = "route-draft-wp";
        marker = new Marker({ element, draggable: true }).setLngLat(target).addTo(map);
        marker.on("dragstart", () => {
          draggingRef.current = true;
          ignoreMapClickRef.current = true;
          overTrashRef.current = false;
          setOverTrash(false);
          setDraggingWaypoint(true);
        });
        marker.on("drag", () => {
          const activeMap = mapRef.current;
          if (!activeMap) return;
          const hit = isOverTrashZone(activeMap, marker.getLngLat(), trashZoneRef.current);
          if (hit !== overTrashRef.current) {
            overTrashRef.current = hit;
            setOverTrash(hit);
          }
        });
        marker.on("dragend", () => {
          const position = marker.getLngLat();
          const currentIndex = markersRef.current.indexOf(marker);
          const activeMap = mapRef.current;
          const hit = activeMap
            ? isOverTrashZone(activeMap, position, trashZoneRef.current)
            : overTrashRef.current;

          // Liberar antes del commit para que el sync de marcadores reposicione.
          draggingRef.current = false;
          overTrashRef.current = false;
          setOverTrash(false);
          setDraggingWaypoint(false);

          if (currentIndex >= 0) {
            if (hit) {
              onRemoveWaypointRef.current(currentIndex);
            } else {
              onMoveWaypointRef.current(currentIndex, { lat: position.lat, lng: position.lng });
            }
          }
          // El `click` del mapa llega justo después de soltar: no añadir un punto.
          window.setTimeout(() => {
            ignoreMapClickRef.current = false;
          }, 0);
        });
        markers[index] = marker;
      } else if (!draggingRef.current) {
        marker.setLngLat(target);
      }

      const role = index === 0 ? "start" : index === waypoints.length - 1 ? "end" : "mid";
      marker.getElement().dataset.role = role;
    });
  }, [waypoints, ready]);

  const onLocate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        mapRef.current?.easeTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: LOCATE_ZOOM,
          duration: 500,
        });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  const onFitRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || path.length < 2) return;
    const bounds = path.reduce(
      (b, p) => b.extend([p.lng, p.lat]),
      new LngLatBounds([path[0].lng, path[0].lat], [path[0].lng, path[0].lat]),
    );
    map.fitBounds(bounds, { padding: 56, maxZoom: 16, duration: 400 });
  }, [path]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      // Evita que Vaul interprete pan/zoom del mapa como arrastre del drawer.
      data-vaul-no-drag
    >
      <style>{`
        .route-draw-map-canvas { background: ${MAP_COLORS.land}; }
        .route-draw-map-canvas .maplibregl-canvas { outline: none; cursor: crosshair; }
        .route-draft-wp {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          touch-action: none;
        }
        .route-draft-wp::after {
          content: "";
          width: 13px;
          height: 13px;
          border-radius: 9999px;
          background: ${MAP_COLORS.route};
          border: 2.5px solid #fff;
          box-shadow: 0 1px 5px rgba(0,0,0,0.55);
        }
        .route-draft-wp[data-role="start"]::after { background: ${MAP_COLORS.start}; }
        .route-draft-wp[data-role="mid"]::after {
          width: 10px;
          height: 10px;
          border-width: 2px;
        }
        .route-draw-map-canvas .maplibregl-ctrl-bottom-right {
          margin: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        .route-draw-map-canvas .maplibregl-ctrl-attrib {
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
        .route-draw-map-canvas .maplibregl-ctrl-attrib a { color: inherit; text-decoration: none; }
        .route-draw-map-canvas .maplibregl-ctrl-attrib-button {
          background-color: transparent !important;
          width: 14px;
          height: 14px;
          opacity: 0.45;
        }
        .route-draw-map-canvas .maplibregl-ctrl-attrib.maplibregl-compact {
          min-height: 14px;
          padding: 0;
        }
      `}</style>

      <div
        ref={containerRef}
        className="route-draw-map-canvas h-full min-h-55 w-full"
        style={{ background: MAP_COLORS.land }}
      />

      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <MapControl label="Centrar en mi posición" onClick={onLocate} disabled={locating}>
          {locating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LocateFixed className="h-5 w-5" strokeWidth={2.25} />
          )}
        </MapControl>
        <MapControl label="Deshacer último punto" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-5 w-5" strokeWidth={2.25} />
        </MapControl>
        <MapControl label="Cerrar circuito" onClick={onCloseLoop} disabled={!canCloseLoop}>
          <Repeat className="h-5 w-5" strokeWidth={2.25} />
        </MapControl>
        <MapControl label="Borrar recorrido" onClick={onClear} disabled={!canUndo}>
          <Trash2 className="h-5 w-5" strokeWidth={2.25} />
        </MapControl>
      </div>

      {/* Siempre montada para el hit-test; solo visible al arrastrar un punto. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4",
          "transition-opacity duration-150",
          draggingWaypoint ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!draggingWaypoint}
      >
        <div
          ref={trashZoneRef}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm",
            "transition-all duration-150",
            overTrash
              ? "scale-110 border-red-400/55 bg-red-500/30 text-red-100"
              : "border-white/15 bg-[#1a1f21]/90 text-white/85",
          )}
          aria-label="Soltar para eliminar el punto"
        >
          <Trash2 className="h-6 w-6" strokeWidth={2.25} />
        </div>
      </div>

      {!draggingWaypoint && waypoints.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <p className="rounded-full border border-white/15 bg-[#1a1f21]/90 px-4 py-2 text-center text-xs text-white/80 shadow-lg backdrop-blur-sm">
            Toca el mapa para marcar el recorrido
          </p>
        </div>
      ) : null}

      {!draggingWaypoint && waypoints.length > 0 ? (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={onFitRoute}
            disabled={path.length < 2}
            className={cn(
              "touch-styled rounded-full border border-white/15 bg-[#1a1f21]/90 px-4 py-2 text-xs text-white/80",
              "shadow-lg backdrop-blur-sm transition-colors active:scale-95 hover:text-white",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {routing ? "Ajustando a caminos…" : "Ver recorrido completo"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
