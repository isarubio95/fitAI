import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardioGpsRecorder } from "@/hooks/useCardioGpsRecorder";
import type { NativeCardioTrackPoint, NativeCardioTrackUpdate } from "@/lib/nativeCardioTracker";

const mocks = vi.hoisted(() => ({
  trackListeners: [] as Array<(update: unknown) => void>,
  appListeners: [] as Array<(state: { isActive: boolean }) => void>,
  snapshot: null as unknown,
  startTracking: vi.fn(async () => true),
  setAutoPause: vi.fn(async () => {}),
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(async (event: string, cb: (state: { isActive: boolean }) => void) => {
      if (event === "appStateChange") mocks.appListeners.push(cb);
      return { remove: async () => {} };
    }),
  },
}));

vi.mock("@/lib/nativeCardioTracker", () => ({
  isNativeCardioTrackingAvailable: () => true,
  buildNativeCardioTrackConfig: () => ({ minIntervalMs: 2000, minDeltaM: 4 }),
  addNativeCardioTrackListener: vi.fn(async (cb: (update: unknown) => void) => {
    mocks.trackListeners.push(cb);
    return { remove: async () => {} };
  }),
  startNativeCardioTracking: mocks.startTracking,
  stopNativeCardioTracking: vi.fn(async () => {}),
  getNativeCardioTrackSnapshot: vi.fn(async () => mocks.snapshot),
  setNativeCardioAutoPauseEnabled: mocks.setAutoPause,
  clearNativeCardioTrack: vi.fn(async () => {}),
}));

const T0 = Date.parse("2026-08-11T18:00:00.000Z");

function nativePoint(index: number, lat: number, lng: number): NativeCardioTrackPoint {
  const t = T0 + index * 2000;
  return {
    lat,
    lng,
    t,
    timestamp_utc: new Date(t).toISOString(),
    elevacion_m: 650 + index,
  };
}

function nativeUpdate(overrides: Partial<NativeCardioTrackUpdate> = {}): NativeCardioTrackUpdate {
  return {
    sessionId: "ses-1",
    title: "Carrera",
    tracking: true,
    startedAtMs: T0,
    distanceM: 0,
    elevationGainM: 0,
    hasFix: true,
    paused: false,
    pauseSource: null,
    pausedAccumMs: 0,
    autoPauseEnabled: true,
    revision: 0,
    totalPoints: 0,
    motion: {
      speedMps: 2.5,
      isStationary: false,
      isMoving: true,
      stationaryMs: 0,
      movingMs: 8000,
    },
    points: [],
    full: false,
    resync: false,
    ...overrides,
  };
}

function renderNativeRecorder() {
  return renderHook(() =>
    useCardioGpsRecorder({
      sessionId: "ses-1",
      recording: true,
      preview: true,
      title: "Carrera",
      startedAtMs: T0,
      autoPauseEnabled: true,
    }),
  );
}

describe("useCardioGpsRecorder (backend nativo Android)", () => {
  const watchPosition = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    mocks.trackListeners.length = 0;
    mocks.appListeners.length = 0;
    mocks.startTracking.mockClear();
    mocks.setAutoPause.mockClear();
    watchPosition.mockClear();
    mocks.snapshot = nativeUpdate({
      full: true,
      revision: 2,
      totalPoints: 2,
      distanceM: 120,
      elevationGainM: 3,
      points: [nativePoint(0, 40.4168, -3.7038), nativePoint(1, 40.4175, -3.703)],
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { watchPosition, clearWatch: vi.fn(), getCurrentPosition: vi.fn() } as Geolocation,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("arranca el recorder nativo y no usa watchPosition", async () => {
    renderNativeRecorder();

    await waitFor(() => expect(mocks.startTracking).toHaveBeenCalledTimes(1));
    expect(mocks.startTracking).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "ses-1", title: "Carrera", startedAtMs: T0 }),
    );
    expect(watchPosition).not.toHaveBeenCalled();
  });

  it("carga el snapshot inicial y expone distancia, desnivel y motion del nativo", async () => {
    const { result } = renderNativeRecorder();

    await waitFor(() => expect(result.current.points).toHaveLength(2));
    expect(result.current.distanceM).toBe(120);
    expect(result.current.elevationGainM).toBe(3);
    expect(result.current.hasFix).toBe(true);
    expect(result.current.motion.isMoving).toBe(true);
    expect(result.current.nativeState).toMatchObject({ paused: false, pauseSource: null });
  });

  it("si el nativo reporta distancia 0, usa la longitud de los puntos GPS", async () => {
    mocks.snapshot = nativeUpdate({
      full: true,
      revision: 2,
      totalPoints: 2,
      distanceM: 0,
      elevationGainM: 0,
      points: [nativePoint(0, 40.4168, -3.7038), nativePoint(1, 40.4175, -3.703)],
    });
    const { result } = renderNativeRecorder();

    await waitFor(() => expect(result.current.points).toHaveLength(2));
    expect(result.current.distanceM).toBeGreaterThan(50);
  });

  it("acumula los puntos que llegan por evento delta", async () => {
    const { result } = renderNativeRecorder();
    await waitFor(() => expect(mocks.trackListeners).toHaveLength(1));
    await waitFor(() => expect(result.current.points).toHaveLength(2));

    act(() => {
      mocks.trackListeners[0](
        nativeUpdate({
          revision: 3,
          totalPoints: 3,
          distanceM: 205,
          points: [nativePoint(2, 40.4182, -3.7022)],
        }),
      );
    });

    await waitFor(() => expect(result.current.points).toHaveLength(3));
    expect(result.current.distanceM).toBeGreaterThanOrEqual(205);
    expect(result.current.points[2].lat).toBeCloseTo(40.4182);
  });

  it("espeja la autopausa nativa en nativeState", async () => {
    const { result } = renderNativeRecorder();
    await waitFor(() => expect(mocks.trackListeners).toHaveLength(1));

    act(() => {
      mocks.trackListeners[0](
        nativeUpdate({
          paused: true,
          pauseSource: "auto",
          pausedAccumMs: 14_000,
          motion: {
            speedMps: 0.1,
            isStationary: true,
            isMoving: false,
            stationaryMs: 13_000,
            movingMs: 0,
          },
        }),
      );
    });

    await waitFor(() => expect(result.current.nativeState?.paused).toBe(true));
    expect(result.current.nativeState).toMatchObject({
      pauseSource: "auto",
      pausedAccumMs: 14_000,
    });
  });

  it("resincroniza el buffer completo al volver al primer plano", async () => {
    const { result } = renderNativeRecorder();
    await waitFor(() => expect(result.current.points).toHaveLength(2));
    await waitFor(() => expect(mocks.appListeners).toHaveLength(1));

    // Lo grabado con la pantalla bloqueada: el nativo devuelve el recorrido entero.
    mocks.snapshot = nativeUpdate({
      full: true,
      revision: 5,
      totalPoints: 5,
      distanceM: 940,
      points: [
        nativePoint(0, 40.4168, -3.7038),
        nativePoint(1, 40.4175, -3.703),
        nativePoint(2, 40.4182, -3.7022),
        nativePoint(3, 40.419, -3.7014),
        nativePoint(4, 40.4198, -3.7006),
      ],
    });

    await act(async () => {
      mocks.appListeners[0]({ isActive: true });
    });

    await waitFor(() => expect(result.current.points).toHaveLength(5));
    expect(result.current.distanceM).toBe(940);
  });

  it("pide un snapshot completo cuando el nativo avisa de resync", async () => {
    const { result } = renderNativeRecorder();
    await waitFor(() => expect(mocks.trackListeners).toHaveLength(1));
    await waitFor(() => expect(result.current.points).toHaveLength(2));

    mocks.snapshot = nativeUpdate({
      full: true,
      revision: 9,
      totalPoints: 3,
      distanceM: 1500,
      points: [
        nativePoint(0, 40.4168, -3.7038),
        nativePoint(4, 40.4198, -3.7006),
        nativePoint(8, 40.4222, -3.698),
      ],
    });

    await act(async () => {
      mocks.trackListeners[0](nativeUpdate({ resync: true, points: [], distanceM: 1500 }));
    });

    await waitFor(() => expect(result.current.points).toHaveLength(3));
    expect(result.current.points[2].lat).toBeCloseTo(40.4222);
  });

  it("cae a watchPosition si el servicio nativo no arranca", async () => {
    mocks.startTracking.mockResolvedValueOnce(false);
    const { result } = renderNativeRecorder();

    await waitFor(() => expect(watchPosition).toHaveBeenCalledTimes(1));
    expect(result.current.nativeState).toBeNull();
  });

  it("propaga el cambio de preferencia de autopausa al nativo", async () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useCardioGpsRecorder({
          sessionId: "ses-1",
          recording: true,
          preview: true,
          autoPauseEnabled: enabled,
        }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(mocks.setAutoPause).toHaveBeenCalledWith(true));

    rerender({ enabled: false });
    await waitFor(() => expect(mocks.setAutoPause).toHaveBeenCalledWith(false));
  });
});
