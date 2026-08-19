import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CARDIO_MAP_DEFAULT_CENTER,
  cardioMapCameraKey,
  cardioMapLastViewKey,
  createMapCameraPersister,
  persistCardioMapCamera,
  readCardioMapLastView,
  readCardioMapScreenCamera,
  resolveCardioMapInitialView,
  snapshotMapCamera,
  writeCardioMapLastView,
  writeCardioMapScreenCamera,
} from "@/lib/mapCameraStorage";

const USER = "user-abc";
const OTHER = "user-xyz";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe("mapCameraStorage", () => {
  it("namespaces last view and screen camera by user", () => {
    writeCardioMapLastView(USER, { lng: -0.37, lat: 39.47, zoom: 14 });
    writeCardioMapScreenCamera(USER, "live", { lng: -0.38, lat: 39.48, zoom: 16 });

    expect(readCardioMapLastView(OTHER)).toBeNull();
    expect(readCardioMapScreenCamera(OTHER, "live")).toBeNull();
    expect(readCardioMapLastView(USER)?.lat).toBeCloseTo(39.47);
    expect(readCardioMapScreenCamera(USER, "live")?.zoom).toBe(16);
    expect(localStorage.getItem(cardioMapLastViewKey(USER))).toBeTruthy();
    expect(localStorage.getItem(cardioMapCameraKey(USER, "live"))).toBeTruthy();
  });

  it("uses anon when userId is empty", () => {
    writeCardioMapLastView(null, { lng: 2.17, lat: 41.38, zoom: 13 });
    expect(readCardioMapLastView(undefined)?.lng).toBeCloseTo(2.17);
    expect(readCardioMapLastView("")).toEqual(readCardioMapLastView(null));
    expect(localStorage.getItem(cardioMapLastViewKey("anon"))).toBeTruthy();
  });

  it("rejects world zoom and invalid coordinates", () => {
    localStorage.setItem(
      cardioMapLastViewKey(USER),
      JSON.stringify({ lng: -3.7, lat: 40.4, zoom: 2, at: 1 }),
    );
    expect(readCardioMapLastView(USER)).toBeNull();

    writeCardioMapLastView(USER, { lng: 999, lat: 40, zoom: 12 });
    expect(readCardioMapLastView(USER)).toBeNull();

    localStorage.setItem(cardioMapLastViewKey(USER), "not-json");
    expect(readCardioMapLastView(USER)).toBeNull();
  });

  it("persistCardioMapCamera writes both last view and screen keys", () => {
    persistCardioMapCamera(USER, "detail", { lng: -3.7, lat: 40.4, zoom: 15 }, "sess-1");
    expect(readCardioMapLastView(USER)?.zoom).toBe(15);
    expect(readCardioMapScreenCamera(USER, "detail", "sess-1")?.lng).toBeCloseTo(-3.7);
    expect(readCardioMapScreenCamera(USER, "detail", "sess-2")).toBeNull();
  });

  it("prefers stored session camera over geometry when requested", () => {
    writeCardioMapScreenCamera(USER, "detail", { lng: 2.17, lat: 41.38, zoom: 14 }, "sess-1");
    const view = resolveCardioMapInitialView({
      userId: USER,
      screen: "detail",
      contextId: "sess-1",
      geometry: { center: [-3.7, 40.4], zoom: 13 },
      preferStored: true,
    });
    expect(view.fromStorage).toBe(true);
    expect(view.center[0]).toBeCloseTo(2.17);
    expect(view.zoom).toBe(14);
  });

  it("does not use last view over a polyline in another city", () => {
    writeCardioMapLastView(USER, { lng: -0.37, lat: 39.47, zoom: 14 });
    const view = resolveCardioMapInitialView({
      userId: USER,
      screen: "detail",
      contextId: "sess-paris",
      geometry: { center: [2.35, 48.85], zoom: 13 },
      preferStored: true,
    });
    expect(view.fromStorage).toBe(false);
    expect(view.center[1]).toBeCloseTo(48.85);
  });

  it("falls back to last view then Madrid when live has no GPS", () => {
    const empty = resolveCardioMapInitialView({
      userId: USER,
      screen: "live",
    });
    expect(empty.center).toEqual(CARDIO_MAP_DEFAULT_CENTER);
    expect(empty.fromStorage).toBe(false);

    writeCardioMapLastView(USER, { lng: -8.54, lat: 42.88, zoom: 15 });
    const restored = resolveCardioMapInitialView({
      userId: USER,
      screen: "live",
    });
    expect(restored.fromStorage).toBe(true);
    expect(restored.center[0]).toBeCloseTo(-8.54);
  });

  it("lets live GPS win over a stored camera", () => {
    writeCardioMapScreenCamera(USER, "live", { lng: -3.7, lat: 40.4, zoom: 12 });
    const view = resolveCardioMapInitialView({
      userId: USER,
      screen: "live",
      geometry: { center: [-8.54, 42.88], zoom: 16 },
    });
    expect(view.fromStorage).toBe(false);
    expect(view.center[1]).toBeCloseTo(42.88);
    expect(view.zoom).toBe(16);
  });

  it("snapshots and rejects invalid map zoom", () => {
    expect(
      snapshotMapCamera({
        getCenter: () => ({ lng: -3.7, lat: 40.4 }),
        getZoom: () => 14,
        getBearing: () => 30,
      }),
    ).toMatchObject({ lng: -3.7, lat: 40.4, zoom: 14 });

    expect(
      snapshotMapCamera({
        getCenter: () => ({ lng: -3.7, lat: 40.4 }),
        getZoom: () => 2,
        getBearing: () => 0,
      }),
    ).toBeNull();
  });

  it("debounces persist and flushes on demand", () => {
    vi.useFakeTimers();
    const persister = createMapCameraPersister({
      getUserId: () => USER,
      screen: "draw",
      debounceMs: 400,
    });
    const map = {
      getCenter: () => ({ lng: -3.7, lat: 40.4 }),
      getZoom: () => 14,
      getBearing: () => 0,
    };
    persister.save(map);
    expect(readCardioMapScreenCamera(USER, "draw")).toBeNull();
    vi.advanceTimersByTime(400);
    expect(readCardioMapScreenCamera(USER, "draw")?.zoom).toBe(14);

    persister.saveView({ lng: 2.17, lat: 41.38, zoom: 13, at: 0 });
    persister.flush();
    expect(readCardioMapLastView(USER)?.lat).toBeCloseTo(41.38);
    persister.cancel();
  });
});
