import { useCallback, useEffect, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, Marker, setWorkerUrl } from "maplibre-gl";
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
import { useBrowserLocation } from "@/hooks/useBrowserLocation";
import type { GeoPoint } from "@/lib/gimnasioSearch";
import { cn } from "@/lib/utils";

setWorkerUrl(maplibreWorkerUrl);

const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
const DEFAULT_ZOOM = 13;
const LOCATE_ZOOM = 16;

type Props = {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  className?: string;
};

export function GymPinMap({ value, onChange, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const basemapRef = useRef<MapBasemapId>(readCardioMapBasemap());
  const [basemap, setBasemap] = useState<MapBasemapId>(() => basemapRef.current);
  const [ready, setReady] = useState(false);
  const { point: userPoint, loading: locating, request: requestLocation } = useBrowserLocation(true);

  const placeMarker = useCallback((map: MapLibreMap, point: GeoPoint) => {
    const lngLat: [number, number] = [point.lng, point.lat];
    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "gym-pin-marker";
      el.style.cssText =
        "width:18px;height:18px;border-radius:999px;background:#10b981;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);";
      markerRef.current = new Marker({ element: el, draggable: true }).setLngLat(lngLat).addTo(map);
      markerRef.current.on("dragend", () => {
        const next = markerRef.current?.getLngLat();
        if (next) onChangeRef.current({ lat: next.lat, lng: next.lng });
      });
    } else {
      markerRef.current.setLngLat(lngLat);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    void loadMapBasemapStyle(basemapRef.current).then((style) => {
      const container = containerRef.current;
      if (cancelled || !container) return;
      const map = new MapLibreMap({
        container,
        style,
        center: value ? [value.lng, value.lat] : DEFAULT_CENTER,
        zoom: value ? LOCATE_ZOOM : DEFAULT_ZOOM,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new AttributionControl({ compact: true }), "bottom-right");
      map.on("click", (event) => {
        onChangeRef.current({ lat: event.lngLat.lat, lng: event.lngLat.lng });
      });
      map.on("load", () => {
        if (cancelled) return;
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
      setReady(false);
    };
    // Centro inicial solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBasemapChange = useCallback((id: MapBasemapId) => {
    if (id === basemapRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    basemapRef.current = id;
    setBasemap(id);
    writeCardioMapBasemap(id);
    void loadMapBasemapStyle(id).then((style) => {
      if (mapRef.current !== map || basemapRef.current !== id) return;
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
    const map = mapRef.current;
    if (!map || !ready || !value) return;
    placeMarker(map, value);
  }, [value, ready, placeMarker]);

  useEffect(() => {
    if (!userPoint) return;
    if (!value) onChange(userPoint);
    const map = mapRef.current;
    if (map && ready) {
      map.easeTo({ center: [userPoint.lng, userPoint.lat], zoom: LOCATE_ZOOM });
    }
  }, [userPoint, ready, value, onChange]);

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : null}
      <MapBasemapControl
        value={basemap}
        onChange={onBasemapChange}
        menuPlacement="above"
        className="absolute right-2 z-20"
        style={{ bottom: "0.5rem" }}
      />
      <button
        type="button"
        onClick={() => requestLocation()}
        className={cn(
          "absolute right-2 bottom-14 z-20 flex h-10 w-10 items-center justify-center rounded-full",
          "border border-white/15 bg-[#1a1f21]/90 text-white shadow-lg backdrop-blur-sm",
        )}
        aria-label="Mi ubicación"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : userPoint ? <LocateFixed className="h-4 w-4" /> : <Locate className="h-4 w-4" />}
      </button>
    </div>
  );
}
