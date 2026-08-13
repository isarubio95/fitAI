import { Capacitor } from "@capacitor/core";
import { isLiveSessionNotificationEnabled } from "@/lib/notificationPreferences";
import { LiveSession } from "@/lib/liveSessionPlugin";

export type {
  LiveSessionKind,
  LiveSessionPayload,
  LiveSessionUpdate,
} from "@/lib/liveSessionPlugin";

import type { LiveSessionPayload, LiveSessionUpdate } from "@/lib/liveSessionPlugin";

function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function safeCall(fn: () => Promise<unknown>): Promise<void> {
  if (!isNativeAndroid()) return;
  try {
    await fn();
  } catch (error) {
    console.warn("[LiveSession]", error);
  }
}

async function safeCallIfLiveEnabled(fn: () => Promise<unknown>): Promise<void> {
  if (!isLiveSessionNotificationEnabled()) return;
  await safeCall(fn);
}

export async function startLiveWorkout(
  payload: Omit<LiveSessionPayload, "kind"> & { kind?: "workout" },
): Promise<void> {
  await safeCallIfLiveEnabled(() =>
    LiveSession.start({
      kind: "workout",
      title: payload.title || "Entrenamiento",
      ...payload,
    }),
  );
}

export async function updateLiveWorkout(
  payload: Omit<LiveSessionUpdate, "kind"> & { kind?: "workout" },
): Promise<void> {
  await safeCallIfLiveEnabled(() => LiveSession.update({ kind: "workout", ...payload }));
}

export async function stopLiveWorkout(): Promise<void> {
  await safeCall(() => LiveSession.stop({ kind: "workout" }));
}

export async function startLiveCardio(
  payload: Omit<LiveSessionPayload, "kind"> & { kind?: "cardio" },
): Promise<void> {
  await safeCallIfLiveEnabled(() =>
    LiveSession.start({
      kind: "cardio",
      title: payload.title || "Cardio",
      ...payload,
    }),
  );
}

export async function updateLiveCardio(
  payload: Omit<LiveSessionUpdate, "kind"> & { kind?: "cardio" },
): Promise<void> {
  await safeCallIfLiveEnabled(() => LiveSession.update({ kind: "cardio", ...payload }));
}

export async function stopLiveCardio(): Promise<void> {
  await safeCall(() => LiveSession.stop({ kind: "cardio" }));
}

export async function stopAllLiveSessions(): Promise<void> {
  await safeCall(() => LiveSession.stopAll());
}

/** Helpers for building gym notification fields from logger state. */
export function formatSetLabel(setIndex: number): string {
  return `Serie ${setIndex + 1}`;
}

export function formatDistanceLabel(distanceM: number): string {
  if (!Number.isFinite(distanceM) || distanceM <= 0) return "";
  if (distanceM < 1000) return `${Math.round(distanceM)} m`;
  return `${(distanceM / 1000).toFixed(2)} km`;
}
