import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { ELEVATION_MIN_STEP_M } from "@/lib/cardioFormat";
import {
  IDLE_BEFORE_PAUSE_MS,
  IDLE_SPEED_M_S,
  MOVE_BEFORE_RESUME_MS,
  START_GRACE_MS,
  readCardioAutoPauseEnabled,
} from "@/lib/cardioGpsMotion";
import { MAX_TRACK_POINTS_DRAFT, MIN_POINT_SPACING_M } from "@/lib/cardioTrackPoints";
import { LiveSession, type NativeCardioTrackConfig, type NativeCardioTrackUpdate } from "@/lib/liveSessionPlugin";

export type {
  NativeCardioMotion,
  NativeCardioTrackConfig,
  NativeCardioTrackPoint,
  NativeCardioTrackUpdate,
} from "@/lib/liveSessionPlugin";

/**
 * Android records the cardio track in a foreground service: the WebView gets suspended when
 * the screen locks, so `navigator.geolocation` cannot be the recorder. On any other platform
 * the hook falls back to `watchPosition`.
 */
export function isNativeCardioTrackingAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/**
 * The native recorder gets every threshold from here, so cardioGpsMotion.ts and
 * cardioTrackPoints.ts remain the only place these numbers are defined.
 */
export function buildNativeCardioTrackConfig(overrides?: {
  minIntervalMs?: number;
  minDeltaM?: number;
  maxAccuracyM?: number;
  autoPauseEnabled?: boolean;
}): NativeCardioTrackConfig {
  return {
    minIntervalMs: overrides?.minIntervalMs ?? 4000,
    minDeltaM: overrides?.minDeltaM ?? 6,
    maxAccuracyM: overrides?.maxAccuracyM ?? 85,
    idleSpeedMps: IDLE_SPEED_M_S,
    idleBeforePauseMs: IDLE_BEFORE_PAUSE_MS,
    moveBeforeResumeMs: MOVE_BEFORE_RESUME_MS,
    startGraceMs: START_GRACE_MS,
    minSpacingM: MIN_POINT_SPACING_M,
    maxPoints: MAX_TRACK_POINTS_DRAFT,
    elevationMinStepM: ELEVATION_MIN_STEP_M,
    autoPauseEnabled: overrides?.autoPauseEnabled ?? readCardioAutoPauseEnabled(),
  };
}

async function safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isNativeCardioTrackingAvailable()) return null;
  try {
    return await fn();
  } catch (error) {
    console.warn("[CardioTracker]", error);
    return null;
  }
}

export async function startNativeCardioTracking(options: {
  sessionId: string;
  title?: string;
  startedAtMs?: number;
  config: NativeCardioTrackConfig;
}): Promise<boolean> {
  const result = await safeCall(() => LiveSession.startTracking(options));
  return result?.ok === true;
}

export async function stopNativeCardioTracking(): Promise<void> {
  await safeCall(() => LiveSession.stopTracking());
}

export async function getNativeCardioTrackSnapshot(): Promise<NativeCardioTrackUpdate | null> {
  return safeCall(() => LiveSession.getTrackSnapshot());
}

export async function setNativeCardioPaused(
  paused: boolean,
  source: "manual" | "auto" = "manual",
): Promise<void> {
  await safeCall(() => LiveSession.setPaused({ paused, source }));
}

export async function setNativeCardioAutoPauseEnabled(enabled: boolean): Promise<void> {
  await safeCall(() => LiveSession.setAutoPauseEnabled({ enabled }));
}

export async function clearNativeCardioTrack(sessionId?: string): Promise<void> {
  await safeCall(() => LiveSession.clearTrack({ sessionId }));
}

export async function addNativeCardioTrackListener(
  listener: (update: NativeCardioTrackUpdate) => void,
): Promise<PluginListenerHandle | null> {
  return safeCall(() => LiveSession.addListener("cardioTrackUpdate", listener));
}
