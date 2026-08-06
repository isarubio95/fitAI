import { describe, expect, it } from "vitest";
import {
  CARDIO_AUTO_PAUSE_STORAGE_KEY,
  IDLE_BEFORE_PAUSE_MS,
  IDLE_SPEED_M_S,
  MOVE_BEFORE_RESUME_MS,
  START_GRACE_MS,
  createGpsMotionTrackerState,
  estimateSpeedMps,
  readCardioAutoPauseEnabled,
  reduceGpsMotion,
  shouldAutoPause,
  shouldAutoResume,
  toMotionSnapshot,
  writeCardioAutoPauseEnabled,
} from "@/lib/cardioGpsMotion";

/** ~11.1 m al este a lat 0 (≈0.0001°). */
const east = (lng: number, dLng = 0.0001) => lng + dLng;

describe("estimateSpeedMps", () => {
  it("devuelve null sin posición previa ni speed de dispositivo", () => {
    expect(estimateSpeedMps(null, { lat: 0, lng: 0, t: 1000 })).toBeNull();
  });

  it("usa haversine/Δt entre dos puntos", () => {
    const speed = estimateSpeedMps(
      { lat: 0, lng: 0, t: 0 },
      { lat: 0, lng: east(0), t: 10_000 },
    );
    expect(speed).not.toBeNull();
    // ~11.1 m / 10 s ≈ 1.1 m/s
    expect(speed!).toBeGreaterThan(1);
    expect(speed!).toBeLessThan(1.3);
  });

  it("toma el máximo entre path y device speed", () => {
    const speed = estimateSpeedMps(
      { lat: 0, lng: 0, t: 0 },
      { lat: 0, lng: 0, t: 10_000 },
      2.5,
    );
    expect(speed).toBe(2.5);
  });
});

describe("reduceGpsMotion + toMotionSnapshot", () => {
  it("velocidad baja sostenida marca idle", () => {
    let state = createGpsMotionTrackerState();
    const t0 = 1_000_000;
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: t0, accuracy: 10 });
    // ~0 m en 5 s → 0 m/s
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: t0 + 5_000, accuracy: 10 });
    expect(state.speedMps).toBe(0);
    expect(state.stationarySince).toBe(t0 + 5_000);

    const snap = toMotionSnapshot(state, t0 + 5_000 + IDLE_BEFORE_PAUSE_MS);
    expect(snap.isStationary).toBe(true);
    expect(snap.isMoving).toBe(false);
    expect(snap.stationaryMs).toBe(IDLE_BEFORE_PAUSE_MS);
  });

  it("spike corto de movimiento limpia idle", () => {
    let state = createGpsMotionTrackerState();
    const t0 = 1_000_000;
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: t0, accuracy: 10 });
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: t0 + 5_000, accuracy: 10 });
    expect(state.stationarySince).not.toBeNull();

    // ~11 m en 2 s ≈ 5.5 m/s
    state = reduceGpsMotion(state, {
      lat: 0,
      lng: east(0),
      t: t0 + 7_000,
      accuracy: 10,
    });
    expect(state.stationarySince).toBeNull();
    expect(state.movingSince).toBe(t0 + 7_000);
    expect(state.speedMps!).toBeGreaterThan(IDLE_SPEED_M_S);
  });

  it("ignora samples con accuracy mala", () => {
    let state = createGpsMotionTrackerState();
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: 1000, accuracy: 10 }, { maxAccuracyM: 85 });
    const before = state;
    state = reduceGpsMotion(
      state,
      { lat: 1, lng: 1, t: 6000, accuracy: 200 },
      { maxAccuracyM: 85 },
    );
    expect(state).toEqual(before);
  });

  it("transición idle → moving acumula movingMs para resume", () => {
    let state = createGpsMotionTrackerState();
    const t0 = 2_000_000;
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: t0, accuracy: 5 });
    state = reduceGpsMotion(state, { lat: 0, lng: 0, t: t0 + 3_000, accuracy: 5 });
    state = reduceGpsMotion(state, {
      lat: 0,
      lng: east(0),
      t: t0 + 5_000,
      accuracy: 5,
    });
    const snap = toMotionSnapshot(state, t0 + 5_000 + MOVE_BEFORE_RESUME_MS);
    expect(snap.isMoving).toBe(true);
    expect(snap.movingMs).toBe(MOVE_BEFORE_RESUME_MS);
  });
});

describe("shouldAutoPause / shouldAutoResume", () => {
  const started = 1_000_000;

  it("no pausa sin fix o sin idle", () => {
    expect(
      shouldAutoPause({
        hasFix: false,
        isStationary: true,
        stationaryMs: IDLE_BEFORE_PAUSE_MS,
        recordingStartedAtMs: started,
        now: started + START_GRACE_MS + IDLE_BEFORE_PAUSE_MS,
      }),
    ).toBe(false);
    expect(
      shouldAutoPause({
        hasFix: true,
        isStationary: false,
        stationaryMs: 0,
        recordingStartedAtMs: started,
        now: started + START_GRACE_MS + IDLE_BEFORE_PAUSE_MS,
      }),
    ).toBe(false);
  });

  it("no pausa durante grace al inicio", () => {
    expect(
      shouldAutoPause({
        hasFix: true,
        isStationary: true,
        stationaryMs: IDLE_BEFORE_PAUSE_MS,
        recordingStartedAtMs: started,
        now: started + START_GRACE_MS - 1,
      }),
    ).toBe(false);
  });

  it("pausa tras grace + idle sostenido", () => {
    expect(
      shouldAutoPause({
        hasFix: true,
        isStationary: true,
        stationaryMs: IDLE_BEFORE_PAUSE_MS,
        recordingStartedAtMs: started,
        now: started + START_GRACE_MS + 1,
      }),
    ).toBe(true);
  });

  it("solo reanuda si pauseSource es auto y moving sostenido", () => {
    expect(
      shouldAutoResume({
        hasFix: true,
        isMoving: true,
        movingMs: MOVE_BEFORE_RESUME_MS,
        pauseSource: "manual",
      }),
    ).toBe(false);
    expect(
      shouldAutoResume({
        hasFix: true,
        isMoving: true,
        movingMs: MOVE_BEFORE_RESUME_MS - 1,
        pauseSource: "auto",
      }),
    ).toBe(false);
    expect(
      shouldAutoResume({
        hasFix: true,
        isMoving: true,
        movingMs: MOVE_BEFORE_RESUME_MS,
        pauseSource: "auto",
      }),
    ).toBe(true);
  });
});

describe("readCardioAutoPauseEnabled", () => {
  it("por defecto está activa si no hay preferencia", () => {
    localStorage.removeItem(CARDIO_AUTO_PAUSE_STORAGE_KEY);
    expect(readCardioAutoPauseEnabled()).toBe(true);
    writeCardioAutoPauseEnabled(false);
    expect(readCardioAutoPauseEnabled()).toBe(false);
    writeCardioAutoPauseEnabled(true);
    expect(readCardioAutoPauseEnabled()).toBe(true);
  });
});
