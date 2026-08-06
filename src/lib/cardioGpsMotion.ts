/** Preferencia de autopausa GPS (localStorage). Ausente = activa. */
export const CARDIO_AUTO_PAUSE_STORAGE_KEY = "gym-log-cardioAutoPause";

export function readCardioAutoPauseEnabled(): boolean {
  try {
    const raw = localStorage.getItem(CARDIO_AUTO_PAUSE_STORAGE_KEY);
    if (raw == null) return true;
    return raw === "1" || raw === "true";
  } catch {
    return true;
  }
}

export function writeCardioAutoPauseEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(CARDIO_AUTO_PAUSE_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(Math.max(0, 1 - s)));
}

/** Velocidad por debajo de caminar (~2.2 km/h). */
export const IDLE_SPEED_M_S = 0.6;
/** Idle sostenido antes de autopausa. */
export const IDLE_BEFORE_PAUSE_MS = 12_000;
/** Movimiento sostenido antes de auto-reanudar. */
export const MOVE_BEFORE_RESUME_MS = 4_000;
/** No autopausar al arrancar parado. */
export const START_GRACE_MS = 30_000;

export type GpsMotionSample = {
  lat: number;
  lng: number;
  t: number;
  accuracy?: number | null;
  deviceSpeedMps?: number | null;
};

export type GpsMotionTrackerState = {
  lastPos: { lat: number; lng: number; t: number } | null;
  speedMps: number | null;
  /** Timestamp cuando empezó el tramo idle actual (null si no idle). */
  stationarySince: number | null;
  /** Timestamp cuando empezó el tramo moving actual (null si no moving). */
  movingSince: number | null;
};

export type GpsMotionSnapshot = {
  speedMps: number | null;
  isStationary: boolean;
  isMoving: boolean;
  stationaryMs: number;
  movingMs: number;
};

export function createGpsMotionTrackerState(): GpsMotionTrackerState {
  return {
    lastPos: null,
    speedMps: null,
    stationarySince: null,
    movingSince: null,
  };
}

/**
 * Estima m/s a partir de Δhaversine/Δt; si el dispositivo reporta speed finita ≥ 0, se usa el máximo
 * (más sensible a movimiento real, menos a quedarse quieto por un speed nativo stale a 0).
 */
export function estimateSpeedMps(
  prev: { lat: number; lng: number; t: number } | null,
  next: { lat: number; lng: number; t: number },
  deviceSpeedMps?: number | null,
): number | null {
  let fromPath: number | null = null;
  if (prev != null) {
    const dtSec = (next.t - prev.t) / 1000;
    if (dtSec > 0) {
      fromPath = haversineM(prev, next) / dtSec;
    }
  }

  const deviceOk =
    deviceSpeedMps != null && Number.isFinite(deviceSpeedMps) && deviceSpeedMps >= 0
      ? deviceSpeedMps
      : null;

  if (fromPath == null && deviceOk == null) return null;
  if (fromPath == null) return deviceOk;
  if (deviceOk == null) return fromPath;
  return Math.max(fromPath, deviceOk);
}

export function reduceGpsMotion(
  state: GpsMotionTrackerState,
  sample: GpsMotionSample,
  opts: { maxAccuracyM: number; idleSpeedMps?: number } = { maxAccuracyM: 85 },
): GpsMotionTrackerState {
  const idleSpeed = opts.idleSpeedMps ?? IDLE_SPEED_M_S;
  if (sample.accuracy != null && sample.accuracy > opts.maxAccuracyM) {
    return state;
  }

  const nextPos = { lat: sample.lat, lng: sample.lng, t: sample.t };
  const speed = estimateSpeedMps(state.lastPos, nextPos, sample.deviceSpeedMps);

  if (speed == null) {
    return { ...state, lastPos: nextPos, speedMps: null };
  }

  const isIdle = speed < idleSpeed;
  if (isIdle) {
    return {
      lastPos: nextPos,
      speedMps: speed,
      stationarySince: state.stationarySince ?? sample.t,
      movingSince: null,
    };
  }

  return {
    lastPos: nextPos,
    speedMps: speed,
    stationarySince: null,
    movingSince: state.movingSince ?? sample.t,
  };
}

export function toMotionSnapshot(state: GpsMotionTrackerState, now: number): GpsMotionSnapshot {
  const isStationary = state.stationarySince != null;
  const isMoving = state.movingSince != null;
  return {
    speedMps: state.speedMps,
    isStationary,
    isMoving,
    stationaryMs: isStationary ? Math.max(0, now - state.stationarySince!) : 0,
    movingMs: isMoving ? Math.max(0, now - state.movingSince!) : 0,
  };
}

export function shouldAutoPause(args: {
  hasFix: boolean;
  isStationary: boolean;
  stationaryMs: number;
  recordingStartedAtMs: number;
  now: number;
  graceMs?: number;
  idleBeforePauseMs?: number;
}): boolean {
  if (!args.hasFix || !args.isStationary) return false;
  const grace = args.graceMs ?? START_GRACE_MS;
  if (args.now - args.recordingStartedAtMs < grace) return false;
  const need = args.idleBeforePauseMs ?? IDLE_BEFORE_PAUSE_MS;
  return args.stationaryMs >= need;
}

export function shouldAutoResume(args: {
  hasFix: boolean;
  isMoving: boolean;
  movingMs: number;
  pauseSource: "auto" | "manual" | null;
  moveBeforeResumeMs?: number;
}): boolean {
  if (args.pauseSource !== "auto") return false;
  if (!args.hasFix || !args.isMoving) return false;
  const need = args.moveBeforeResumeMs ?? MOVE_BEFORE_RESUME_MS;
  return args.movingMs >= need;
}
