import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CARDIO_GPS_DRAFT_STORAGE_KEY,
  haversineM,
  useCardioGpsRecorder,
} from "@/hooks/useCardioGpsRecorder";

type WatchCb = (pos: GeolocationPosition) => void;
type ErrCb = (err: GeolocationPositionError) => void;

describe("useCardioGpsRecorder (geolocation mock)", () => {
  let watchCb: WatchCb | null = null;
  let watchId = 0;

  beforeEach(() => {
    localStorage.clear();
    watchCb = null;
    watchId = 0;

    const geolocation: Geolocation = {
      watchPosition: vi.fn((success: WatchCb, _err?: ErrCb) => {
        watchCb = success;
        watchId += 1;
        return watchId;
      }),
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: geolocation,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calcula distancia haversine entre dos puntos", () => {
    const d = haversineM({ lat: 40.4168, lng: -3.7038 }, { lat: 40.4176, lng: -3.703 });
    expect(d).toBeGreaterThan(50);
    expect(d).toBeLessThan(200);
  });

  it("acumula puntos GPS al grabar con watchPosition mock", async () => {
    const { result } = renderHook(() =>
      useCardioGpsRecorder({
        sessionId: "ses-1",
        recording: true,
        minIntervalMs: 0,
        minDeltaM: 0,
        maxAccuracyM: 100,
      }),
    );

    await waitFor(() => expect(watchCb).not.toBeNull());

    act(() => {
      watchCb?.({
        coords: {
          latitude: 40.4168,
          longitude: -3.7038,
          accuracy: 8,
          altitude: 650,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON() {
            return this;
          },
        },
        timestamp: Date.now(),
        toJSON() {
          return this;
        },
      } as GeolocationPosition);
    });

    act(() => {
      watchCb?.({
        coords: {
          latitude: 40.4175,
          longitude: -3.703,
          accuracy: 8,
          altitude: 652,
          altitudeAccuracy: null,
          heading: null,
          speed: 2,
          toJSON() {
            return this;
          },
        },
        timestamp: Date.now(),
        toJSON() {
          return this;
        },
      } as GeolocationPosition);
    });

    await waitFor(() => expect(result.current.points.length).toBeGreaterThanOrEqual(2));
    expect(result.current.hasFix).toBe(true);
    expect(result.current.distanceM).toBeGreaterThan(0);
    await waitFor(
      () => expect(localStorage.getItem(CARDIO_GPS_DRAFT_STORAGE_KEY)).toBeTruthy(),
      { timeout: 3000 },
    );
  });
});
