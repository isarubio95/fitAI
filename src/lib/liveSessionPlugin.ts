import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

export type LiveSessionKind = "workout" | "cardio";

export interface LiveSessionPayload {
  kind: LiveSessionKind;
  sessionId: string;
  title?: string;
  exerciseName?: string;
  setLabel?: string;
  distanceLabel?: string;
  paused?: boolean;
  /** Rest countdown is running. */
  resting?: boolean;
  /** Rest just finished (show green full bar + ¡Listo!). */
  restFinished?: boolean;
  /** Epoch ms when the session started (for chronometer). */
  startedAtMs?: number;
  /** Epoch ms when rest ends (countdown chronometer + emptying bar). */
  restEndAtMs?: number;
  /** Total rest duration in seconds (matches RestProgressBar duration). */
  restDurationSec?: number;
  /** Accumulated pause duration in ms (subtracts from chronometer base). */
  pausedAccumMs?: number;
  /** Use location FGS type when GPS cardio is active. */
  wantsLocation?: boolean;
}

export type LiveSessionUpdate = Partial<Omit<LiveSessionPayload, "kind">> & {
  kind: LiveSessionKind;
};

/** Thresholds handed to the native recorder so TS stays the single source of truth. */
export interface NativeCardioTrackConfig {
  minIntervalMs: number;
  minDeltaM: number;
  maxAccuracyM: number;
  idleSpeedMps: number;
  idleBeforePauseMs: number;
  moveBeforeResumeMs: number;
  startGraceMs: number;
  minSpacingM: number;
  maxPoints: number;
  elevationMinStepM: number;
  autoPauseEnabled: boolean;
}

export interface NativeCardioTrackPoint {
  lat: number;
  lng: number;
  timestamp_utc: string;
  /** Epoch ms, same instant as timestamp_utc. */
  t: number;
  elevacion_m: number | null;
}

export interface NativeCardioMotion {
  speedMps: number | null;
  isStationary: boolean;
  isMoving: boolean;
  stationaryMs: number;
  movingMs: number;
}

export interface NativeCardioTrackUpdate {
  sessionId: string;
  title: string;
  tracking: boolean;
  startedAtMs: number;
  distanceM: number;
  elevationGainM: number;
  hasFix: boolean;
  paused: boolean;
  pauseSource: "manual" | "auto" | null;
  pausedAccumMs: number;
  autoPauseEnabled: boolean;
  revision: number;
  totalPoints: number;
  motion: NativeCardioMotion;
  /** Full buffer when `full` is true, otherwise only the points appended since the last event. */
  points: NativeCardioTrackPoint[];
  full: boolean;
  /** The native buffer was thinned: drop the local copy and pull a full snapshot. */
  resync: boolean;
}

export interface LiveSessionPluginApi {
  start(options: LiveSessionPayload): Promise<{ ok: boolean }>;
  update(options: LiveSessionUpdate): Promise<{ ok: boolean }>;
  stop(options: { kind: LiveSessionKind }): Promise<{ ok: boolean }>;
  stopAll(): Promise<{ ok: boolean }>;

  startTracking(options: {
    sessionId: string;
    title?: string;
    startedAtMs?: number;
    config?: NativeCardioTrackConfig;
  }): Promise<{ ok: boolean }>;
  stopTracking(): Promise<{ ok: boolean }>;
  getTrackSnapshot(): Promise<NativeCardioTrackUpdate>;
  setPaused(options: { paused: boolean; source?: "manual" | "auto" }): Promise<{ ok: boolean }>;
  setAutoPauseEnabled(options: { enabled: boolean }): Promise<{ ok: boolean }>;
  clearTrack(options: { sessionId?: string }): Promise<{ ok: boolean }>;

  addListener(
    eventName: "cardioTrackUpdate",
    listener: (update: NativeCardioTrackUpdate) => void,
  ): Promise<PluginListenerHandle>;
}

export const LiveSession = registerPlugin<LiveSessionPluginApi>("LiveSession");
