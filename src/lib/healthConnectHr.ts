import { Health } from "@capgo/capacitor-health";
import { Capacitor } from "@capacitor/core";
import type { HeartRateSample } from "@/lib/heartRateMetrics";

const HC_HR_ENABLED_KEY = "fitai_hc_hr_enabled";

export type HealthConnectHrAvailability =
  | "unsupported"
  | "unavailable"
  | "needs_update"
  | "ready";

function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/** Preferencia UI local; el permiso real lo decide Health Connect. */
export function getHcHrEnabledFlag(): boolean {
  try {
    return localStorage.getItem(HC_HR_ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setHcHrEnabledFlag(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(HC_HR_ENABLED_KEY, "1");
    else localStorage.removeItem(HC_HR_ENABLED_KEY);
  } catch {
    // ignore
  }
}

export async function getHealthConnectHrAvailability(): Promise<HealthConnectHrAvailability> {
  if (!isAndroidNative()) return "unsupported";
  try {
    const result = await Health.isAvailable();
    if (result.available) return "ready";
    const reason = (result.reason ?? "").toLowerCase();
    if (reason.includes("update") || reason.includes("install")) return "needs_update";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export async function isHealthConnectHrAvailable(): Promise<boolean> {
  return (await getHealthConnectHrAvailability()) === "ready";
}

export async function hasHrPermission(): Promise<boolean> {
  if (!(await isHealthConnectHrAvailable())) return false;
  try {
    const status = await Health.checkAuthorization({ read: ["heartRate"] });
    return status.readAuthorized.includes("heartRate");
  } catch {
    return false;
  }
}

export async function requestHrPermission(): Promise<boolean> {
  if (!(await isHealthConnectHrAvailable())) return false;
  try {
    const status = await Health.requestAuthorization({ read: ["heartRate"] });
    const ok = status.readAuthorized.includes("heartRate");
    setHcHrEnabledFlag(ok);
    return ok;
  } catch {
    setHcHrEnabledFlag(false);
    return false;
  }
}

export async function openHealthConnectHrSettings(): Promise<void> {
  if (!isAndroidNative()) return;
  try {
    await Health.openHealthConnectSettings();
  } catch {
    // ignore
  }
}

/**
 * Lee samples de FC en [startMs, endMs] desde Health Connect.
 * `limit: 0` pide todos los samples del intervalo (sin tope de 100).
 */
export async function readHeartRateSamples(startMs: number, endMs: number): Promise<HeartRateSample[]> {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return [];
  if (!(await hasHrPermission())) return [];

  try {
    const { samples } = await Health.readSamples({
      dataType: "heartRate",
      startDate: new Date(startMs).toISOString(),
      endDate: new Date(endMs).toISOString(),
      limit: 0,
      ascending: true,
    });

    const out: HeartRateSample[] = [];
    for (const s of samples) {
      const t = Date.parse(s.startDate);
      const bpm = s.value;
      if (!Number.isFinite(t) || !Number.isFinite(bpm) || bpm <= 0) continue;
      out.push({ t, bpm: Math.round(bpm) });
    }
    return out;
  } catch {
    return [];
  }
}

/** Marca procedencia en `cardio_track.fuente` sin romper valores existentes. */
export function appendHealthConnectFuente(fuente: string | null | undefined): string {
  const base = (fuente ?? "").trim() || "gps-web";
  if (base.includes("health-connect")) return base;
  return `${base}+health-connect`;
}
