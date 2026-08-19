/** Cámara persistida de los mapas cardio (live / draw / detalle). */

export const CARDIO_MAP_DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
export const CARDIO_MAP_MIN_ZOOM = 8;
export const CARDIO_MAP_MAX_ZOOM = 19;
export const CARDIO_MAP_CAMERA_PERSIST_MS = 400;

export const CARDIO_MAP_LAST_VIEW_KEY_PREFIX = "gym-log-cardioMapLastView";
export const CARDIO_MAP_CAMERA_KEY_PREFIX = "gym-log-cardioMapCamera";

export type MapCameraScreen = "live" | "draw" | "detail";

export type MapCameraView = {
  lng: number;
  lat: number;
  zoom: number;
  bearing?: number;
  at: number;
};

export type MapCameraSnapshotSource = {
  getCenter: () => { lng: number; lat: number };
  getZoom: () => number;
  getBearing: () => number;
};

export function mapCameraUserKey(userId: string | null | undefined): string {
  const trimmed = userId?.trim();
  return trimmed ? trimmed : "anon";
}

export function cardioMapLastViewKey(userId: string | null | undefined): string {
  return `${CARDIO_MAP_LAST_VIEW_KEY_PREFIX}:${mapCameraUserKey(userId)}`;
}

export function cardioMapCameraKey(
  userId: string | null | undefined,
  screen: MapCameraScreen,
  contextId = "_",
): string {
  return `${CARDIO_MAP_CAMERA_KEY_PREFIX}:${mapCameraUserKey(userId)}:${screen}:${contextId}`;
}

export function isValidMapCameraView(value: unknown): value is MapCameraView {
  if (!value || typeof value !== "object") return false;
  const view = value as MapCameraView;
  return (
    Number.isFinite(view.lng) &&
    view.lng >= -180 &&
    view.lng <= 180 &&
    Number.isFinite(view.lat) &&
    view.lat >= -90 &&
    view.lat <= 90 &&
    Number.isFinite(view.zoom) &&
    view.zoom >= CARDIO_MAP_MIN_ZOOM &&
    view.zoom <= CARDIO_MAP_MAX_ZOOM &&
    (view.bearing == null || Number.isFinite(view.bearing))
  );
}

export function parseMapCameraView(raw: unknown): MapCameraView | null {
  if (!isValidMapCameraView(raw)) return null;
  return {
    lng: raw.lng,
    lat: raw.lat,
    zoom: raw.zoom,
    ...(raw.bearing != null ? { bearing: raw.bearing } : {}),
    at: Number.isFinite(raw.at) ? raw.at : 0,
  };
}

function readStorage(key: string): MapCameraView | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return parseMapCameraView(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function writeStorage(key: string, view: MapCameraView): void {
  if (!isValidMapCameraView(view)) return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        lng: view.lng,
        lat: view.lat,
        zoom: view.zoom,
        ...(view.bearing != null ? { bearing: view.bearing } : {}),
        at: view.at,
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function readCardioMapLastView(userId: string | null | undefined): MapCameraView | null {
  return readStorage(cardioMapLastViewKey(userId));
}

export function writeCardioMapLastView(
  userId: string | null | undefined,
  view: Omit<MapCameraView, "at"> & { at?: number },
): void {
  writeStorage(cardioMapLastViewKey(userId), { ...view, at: view.at ?? Date.now() });
}

export function readCardioMapScreenCamera(
  userId: string | null | undefined,
  screen: MapCameraScreen,
  contextId = "_",
): MapCameraView | null {
  return readStorage(cardioMapCameraKey(userId, screen, contextId));
}

export function writeCardioMapScreenCamera(
  userId: string | null | undefined,
  screen: MapCameraScreen,
  view: Omit<MapCameraView, "at"> & { at?: number },
  contextId = "_",
): void {
  writeStorage(cardioMapCameraKey(userId, screen, contextId), {
    ...view,
    at: view.at ?? Date.now(),
  });
}

export function persistCardioMapCamera(
  userId: string | null | undefined,
  screen: MapCameraScreen,
  view: Omit<MapCameraView, "at"> & { at?: number },
  contextId = "_",
): void {
  const stamped = { ...view, at: view.at ?? Date.now() };
  writeCardioMapScreenCamera(userId, screen, stamped, contextId);
  writeCardioMapLastView(userId, stamped);
}

export function snapshotMapCamera(
  map: MapCameraSnapshotSource,
  opts?: { includeBearing?: boolean },
): MapCameraView | null {
  try {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const view: MapCameraView = {
      lng: center.lng,
      lat: center.lat,
      zoom,
      at: Date.now(),
    };
    if (opts?.includeBearing) view.bearing = map.getBearing();
    return isValidMapCameraView(view) ? view : null;
  } catch {
    return null;
  }
}

function viewFromStored(view: MapCameraView): {
  center: [number, number];
  zoom: number;
  bearing?: number;
  fromStorage: true;
} {
  return {
    center: [view.lng, view.lat],
    zoom: view.zoom,
    ...(view.bearing != null ? { bearing: view.bearing } : {}),
    fromStorage: true,
  };
}

export function resolveCardioMapInitialView(opts: {
  userId: string | null | undefined;
  screen: MapCameraScreen;
  contextId?: string;
  geometry?: { center: [number, number]; zoom: number } | null;
  /** Si true, la cámara de esta pantalla/sesión gana a la geometría (detalle). */
  preferStored?: boolean;
  fallbackZoom?: number;
}): { center: [number, number]; zoom: number; bearing?: number; fromStorage: boolean } {
  const storedScreen = readCardioMapScreenCamera(opts.userId, opts.screen, opts.contextId ?? "_");
  const lastView = readCardioMapLastView(opts.userId);
  const geometry = opts.geometry ?? null;

  if (opts.preferStored && storedScreen) return viewFromStored(storedScreen);
  if (geometry) {
    return { center: geometry.center, zoom: geometry.zoom, fromStorage: false };
  }
  if (storedScreen) return viewFromStored(storedScreen);
  if (lastView) return viewFromStored(lastView);
  return {
    center: CARDIO_MAP_DEFAULT_CENTER,
    zoom: opts.fallbackZoom ?? 12,
    fromStorage: false,
  };
}

export function createMapCameraPersister(opts: {
  getUserId: () => string | null | undefined;
  screen: MapCameraScreen;
  getContextId?: () => string;
  includeBearing?: boolean;
  debounceMs?: number;
}): {
  save: (map: MapCameraSnapshotSource, flags?: { immediate?: boolean }) => void;
  saveView: (view: MapCameraView, flags?: { immediate?: boolean }) => void;
  flush: () => void;
  cancel: () => void;
} {
  const debounceMs = opts.debounceMs ?? CARDIO_MAP_CAMERA_PERSIST_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: MapCameraView | null = null;

  const flush = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    if (!pending) return;
    persistCardioMapCamera(
      opts.getUserId(),
      opts.screen,
      pending,
      opts.getContextId?.() ?? "_",
    );
    pending = null;
  };

  const enqueue = (view: MapCameraView, immediate?: boolean) => {
    pending = view;
    if (immediate) {
      flush();
      return;
    }
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  };

  return {
    save(map, flags) {
      const snap = snapshotMapCamera(map, { includeBearing: opts.includeBearing });
      if (!snap) return;
      enqueue(snap, flags?.immediate);
    },
    saveView(view, flags) {
      if (!isValidMapCameraView(view)) return;
      enqueue({ ...view, at: Date.now() }, flags?.immediate);
    },
    flush,
    cancel() {
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      pending = null;
    },
  };
}
