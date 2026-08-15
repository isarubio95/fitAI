import {
  LngLatBounds,
  Map as MapLibreMap,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { firstMapLabelLayerId, loadMapBasemapStyle, readCardioMapBasemap } from "@/lib/mapBasemap";
import { MAP_COLORS } from "@/lib/stravaDarkMapStyle";
import {
  getRouteThumbSnapshot,
  setRouteThumbSnapshot,
} from "@/lib/routeMapThumbCache";
import type { RouteThumbPoint } from "@/lib/routeMapThumb";

setWorkerUrl(maplibreWorkerUrl);

const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 352;
const FIT_PADDING = 28;
const FIT_MAX_ZOOM = 16;

type JobPriority = "high" | "low";

type Job = {
  key: string;
  points: RouteThumbPoint[];
  resolve: (url: string | null) => void;
  aborted: () => boolean;
  priority: JobPriority;
};

let map: MapLibreMap | null = null;
let container: HTMLDivElement | null = null;
let mapReady: Promise<MapLibreMap> | null = null;
const highQueue: Job[] = [];
const lowQueue: Job[] = [];
let pumping = false;

function takeNextJob(): Job | undefined {
  return highQueue.shift() ?? lowQueue.shift();
}

function enqueueJob(job: Job) {
  (job.priority === "high" ? highQueue : lowQueue).push(job);
}

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

function fitRoute(m: MapLibreMap, coordinates: [number, number][]) {
  if (coordinates.length === 0) return;
  if (coordinates.length === 1) {
    m.jumpTo({ center: coordinates[0], zoom: 14 });
    return;
  }
  const bounds = coordinates.reduce(
    (b, c) => b.extend(c),
    new LngLatBounds(coordinates[0], coordinates[0]),
  );
  m.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration: 0 });
}

function waitForIdle(m: MapLibreMap, timeoutMs = 4500): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      m.off("idle", onIdle);
      window.clearTimeout(timer);
      resolve();
    };
    const onIdle = () => finish();
    const timer = window.setTimeout(finish, timeoutMs);
    m.once("idle", onIdle);
    m.triggerRepaint();
  });
}

function ensureMap(): Promise<MapLibreMap> {
  if (map) return Promise.resolve(map);
  if (mapReady) return mapReady;

  mapReady = (async () => {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = [
      "position:fixed",
      "left:0",
      "top:0",
      `width:${THUMB_WIDTH}px`,
      `height:${THUMB_HEIGHT}px`,
      "opacity:0",
      "pointer-events:none",
      "z-index:-1",
      "overflow:hidden",
    ].join(";");
    document.body.appendChild(host);
    container = host;

    const style = await loadMapBasemapStyle(readCardioMapBasemap());
    const m = new MapLibreMap({
      container: host,
      style,
      center: [-3.7038, 40.4168],
      zoom: 12,
      maxZoom: 19,
      attributionControl: false,
      interactive: false,
      preserveDrawingBuffer: true,
      fadeDuration: 0,
    });

    await new Promise<void>((resolve, reject) => {
      m.once("load", () => resolve());
      m.once("error", (e) => reject(e.error ?? new Error("Map thumb load error")));
    });

    m.addSource("cardio-route", { type: "geojson", data: lineFeature([]) });
    m.addSource("cardio-start", { type: "geojson", data: pointFeature(null) });
    m.addSource("cardio-end", { type: "geojson", data: pointFeature(null) });

    const belowLabels = firstMapLabelLayerId(m.getStyle().layers);
    m.addLayer(
      {
        id: "cardio-route-casing",
        type: "line",
        source: "cardio-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": MAP_COLORS.routeCasing,
          "line-blur": 0.6,
          "line-width": 6,
        },
      },
      belowLabels,
    );
    m.addLayer(
      {
        id: "cardio-route-line",
        type: "line",
        source: "cardio-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": MAP_COLORS.route,
          "line-width": 3.5,
        },
      },
      belowLabels,
    );
    m.addLayer(
      {
        id: "cardio-start-dot",
        type: "circle",
        source: "cardio-start",
        paint: {
          "circle-radius": 5,
          "circle-color": MAP_COLORS.start,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      },
      belowLabels,
    );
    m.addLayer(
      {
        id: "cardio-end-dot",
        type: "circle",
        source: "cardio-end",
        paint: {
          "circle-radius": 5,
          "circle-color": MAP_COLORS.route,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      },
      belowLabels,
    );

    map = m;
    return m;
  })().catch((err) => {
    mapReady = null;
    throw err;
  });

  return mapReady;
}

async function renderJob(job: Job): Promise<string | null> {
  const cached = getRouteThumbSnapshot(job.key);
  if (cached) return cached;
  if (job.aborted()) return null;

  const m = await ensureMap();
  if (job.aborted()) return null;

  const coordinates = job.points.map((p) => [p.lng, p.lat] as [number, number]);
  (m.getSource("cardio-route") as GeoJSONSource).setData(lineFeature(coordinates));
  (m.getSource("cardio-start") as GeoJSONSource).setData(
    pointFeature(coordinates.length > 0 ? coordinates[0] : null),
  );
  (m.getSource("cardio-end") as GeoJSONSource).setData(
    pointFeature(coordinates.length > 1 ? coordinates[coordinates.length - 1] : null),
  );
  m.resize();
  fitRoute(m, coordinates);

  await waitForIdle(m);
  if (job.aborted()) return null;

  // Un idle más tras fitBounds/tiles.
  await waitForIdle(m, 2500);
  if (job.aborted()) return null;

  try {
    const dataUrl = m.getCanvas().toDataURL("image/jpeg", 0.82);
    setRouteThumbSnapshot(job.key, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

async function pumpQueue() {
  if (pumping) return;
  pumping = true;
  try {
    for (;;) {
      const job = takeNextJob();
      if (!job) break;
      if (job.aborted()) {
        job.resolve(null);
        continue;
      }
      try {
        job.resolve(await renderJob(job));
      } catch {
        job.resolve(null);
      }
    }
  } finally {
    pumping = false;
    if (highQueue.length > 0 || lowQueue.length > 0) void pumpQueue();
  }
}

/**
 * Pide una captura del mapa real usando un único MapLibre compartido (sin montar
 * WebGL en cada fila del listado).
 */
export function requestRouteThumbSnapshot(
  key: string,
  points: RouteThumbPoint[],
  aborted: () => boolean = () => false,
  priority: JobPriority = "high",
): Promise<string | null> {
  const cached = getRouteThumbSnapshot(key);
  if (cached) return Promise.resolve(cached);
  if (points.length < 2) return Promise.resolve(null);

  return new Promise((resolve) => {
    enqueueJob({ key, points, resolve, aborted, priority });
    void pumpQueue();
  });
}

/** Prefetch en background (prioridad baja): no cancela si el caller se desmonta. */
export function prefetchRouteThumbSnapshot(
  key: string,
  points: RouteThumbPoint[],
): Promise<string | null> {
  return requestRouteThumbSnapshot(key, points, () => false, "low");
}
