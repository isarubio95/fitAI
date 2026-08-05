import { BleClient, type BleDevice } from "@capacitor-community/bluetooth-le";
import { Capacitor } from "@capacitor/core";

/** Servicio GATT Heart Rate (0x180D). */
export const HEART_RATE_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
/** Característica Heart Rate Measurement (0x2A37). */
export const HEART_RATE_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";

export const HR_DEVICE_STORAGE_KEY = "gym-log-bleHeartRateDevice";

export type SavedHrDevice = {
  deviceId: string;
  name: string;
};

export type HrConnectionState = "idle" | "connecting" | "connected" | "disconnected";

export function isAndroidBleAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/** Parsea el payload BLE Heart Rate Measurement (Bluetooth SIG). */
export function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const rate16Bits = (flags & 0x1) !== 0;
  if (rate16Bits) {
    return value.getUint16(1, true);
  }
  return value.getUint8(1);
}

export function loadSavedHrDevice(): SavedHrDevice | null {
  try {
    const raw = localStorage.getItem(HR_DEVICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedHrDevice;
    if (!parsed?.deviceId || typeof parsed.deviceId !== "string") return null;
    return {
      deviceId: parsed.deviceId,
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : "Sensor FC",
    };
  } catch {
    return null;
  }
}

export function saveHrDevice(device: SavedHrDevice): void {
  try {
    localStorage.setItem(HR_DEVICE_STORAGE_KEY, JSON.stringify(device));
  } catch {
    /* ignore quota */
  }
}

export function clearSavedHrDevice(): void {
  try {
    localStorage.removeItem(HR_DEVICE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (!isAndroidBleAvailable()) {
    throw new Error("La FC en vivo solo está disponible en la app Android.");
  }
  if (initialized) return;
  await BleClient.initialize({ androidNeverForLocation: true });
  await BleClient.setDisplayStrings({
    scanning: "Buscando sensores…",
    cancel: "Cancelar",
    availableDevices: "Sensores de pulsaciones",
    noDeviceFound: "No se encontró ningún sensor",
  });
  initialized = true;
}

export async function pickHeartRateDevice(): Promise<BleDevice> {
  await ensureInitialized();
  const enabled = await BleClient.isEnabled();
  if (!enabled) {
    try {
      await BleClient.requestEnable();
    } catch {
      throw new Error("Activa el Bluetooth para conectar un sensor.");
    }
  }
  return BleClient.requestDevice({
    services: [HEART_RATE_SERVICE],
  });
}

export async function connectHeartRateDevice(
  deviceId: string,
  onDisconnect: (deviceId: string) => void,
): Promise<void> {
  await ensureInitialized();
  await BleClient.connect(deviceId, onDisconnect, { timeout: 15000 });
}

export async function startHeartRateNotifications(
  deviceId: string,
  onBpm: (bpm: number) => void,
): Promise<void> {
  await BleClient.startNotifications(deviceId, HEART_RATE_SERVICE, HEART_RATE_MEASUREMENT, (value) => {
    const bpm = parseHeartRate(value);
    if (Number.isFinite(bpm) && bpm > 0 && bpm < 300) {
      onBpm(bpm);
    }
  });
}

export async function stopHeartRateNotifications(deviceId: string): Promise<void> {
  try {
    await BleClient.stopNotifications(deviceId, HEART_RATE_SERVICE, HEART_RATE_MEASUREMENT);
  } catch {
    /* already stopped / disconnected */
  }
}

export async function disconnectHeartRateDevice(deviceId: string): Promise<void> {
  try {
    await stopHeartRateNotifications(deviceId);
  } finally {
    try {
      await BleClient.disconnect(deviceId);
    } catch {
      /* ignore */
    }
  }
}

/** Intenta recuperar un dispositivo ya conocido (último guardado). */
export async function resolveKnownDevice(deviceId: string): Promise<BleDevice | null> {
  await ensureInitialized();
  try {
    const devices = await BleClient.getDevices([deviceId]);
    return devices[0] ?? null;
  } catch {
    return null;
  }
}
