import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearSavedHrDevice,
  connectHeartRateDevice,
  disconnectHeartRateDevice,
  isAndroidBleAvailable,
  loadSavedHrDevice,
  pickHeartRateDevice,
  resolveKnownDevice,
  saveHrDevice,
  startHeartRateNotifications,
  type HrConnectionState,
  type SavedHrDevice,
} from "@/lib/bleHeartRate";
import {
  estimateMaxHeartRate,
  heartRateZone,
  summarizeHeartRate,
  type HeartRateSample,
} from "@/lib/heartRateMetrics";

type Options = {
  /** Si false, no se registran samples (p. ej. pausa). La conexión BLE se mantiene. */
  recording: boolean;
  enabled?: boolean;
};

export function useHeartRateMonitor({ recording, enabled = true }: Options) {
  const [bpm, setBpm] = useState<number | null>(null);
  const [connection, setConnection] = useState<HrConnectionState>("idle");
  const [device, setDevice] = useState<SavedHrDevice | null>(() => loadSavedHrDevice());
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<HeartRateSample[]>([]);
  const [scanning, setScanning] = useState(false);

  const deviceIdRef = useRef<string | null>(null);
  const recordingRef = useRef(recording);
  recordingRef.current = recording;

  const available = isAndroidBleAvailable();

  const { fcMedia, fcMax } = useMemo(() => summarizeHeartRate(samples), [samples]);
  const zone = useMemo(() => {
    if (bpm == null) return null;
    return heartRateZone(bpm, estimateMaxHeartRate());
  }, [bpm]);

  const onSample = useCallback((nextBpm: number) => {
    setBpm(nextBpm);
    setConnection("connected");
    setError(null);
    if (!recordingRef.current) return;
    setSamples((prev) => {
      const last = prev[prev.length - 1];
      // Limitar densidad ~1 Hz
      if (last && Date.now() - last.t < 900) {
        const copy = prev.slice();
        copy[copy.length - 1] = { t: Date.now(), bpm: nextBpm };
        return copy;
      }
      return [...prev, { t: Date.now(), bpm: nextBpm }];
    });
  }, []);

  const teardown = useCallback(async () => {
    const id = deviceIdRef.current;
    deviceIdRef.current = null;
    if (id) {
      await disconnectHeartRateDevice(id);
    }
    setBpm(null);
    setConnection((c) => (c === "idle" ? c : "disconnected"));
  }, []);

  const attachDevice = useCallback(
    async (deviceId: string, name: string) => {
      setError(null);
      setConnection("connecting");
      setScanning(false);

      // Cerrar conexión previa
      if (deviceIdRef.current && deviceIdRef.current !== deviceId) {
        await disconnectHeartRateDevice(deviceIdRef.current);
        deviceIdRef.current = null;
      }

      await connectHeartRateDevice(deviceId, () => {
        if (deviceIdRef.current === deviceId) {
          deviceIdRef.current = null;
          setBpm(null);
          setConnection("disconnected");
          setError("Señal del sensor perdida");
        }
      });

      deviceIdRef.current = deviceId;
      const saved = { deviceId, name };
      saveHrDevice(saved);
      setDevice(saved);

      await startHeartRateNotifications(deviceId, onSample);
      setConnection("connected");
    },
    [onSample],
  );

  const connect = useCallback(async () => {
    if (!available) {
      setError("La FC en vivo solo está disponible en la app Android.");
      return;
    }
    setScanning(true);
    setError(null);
    try {
      const picked = await pickHeartRateDevice();
      const name = picked.name?.trim() || "Sensor FC";
      await attachDevice(picked.deviceId, name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo conectar al sensor";
      // Usuario canceló el picker
      if (/cancel/i.test(msg) || /user.*denied/i.test(msg)) {
        setError(null);
      } else {
        setError(msg);
      }
      setConnection(deviceIdRef.current ? "connected" : device ? "disconnected" : "idle");
    } finally {
      setScanning(false);
    }
  }, [available, attachDevice, device]);

  const reconnect = useCallback(async () => {
    if (!available) {
      setError("La FC en vivo solo está disponible en la app Android.");
      return;
    }
    const saved = device ?? loadSavedHrDevice();
    if (!saved) {
      await connect();
      return;
    }
    setScanning(true);
    setError(null);
    try {
      const known = await resolveKnownDevice(saved.deviceId);
      if (!known) {
        setScanning(false);
        await connect();
        return;
      }
      await attachDevice(saved.deviceId, saved.name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo reconectar";
      setError(msg);
      setConnection("disconnected");
      setScanning(false);
      await connect();
      return;
    } finally {
      setScanning(false);
    }
  }, [available, device, attachDevice, connect]);

  const disconnect = useCallback(async () => {
    await teardown();
    setConnection("idle");
  }, [teardown]);

  const forgetDevice = useCallback(async () => {
    await teardown();
    clearSavedHrDevice();
    setDevice(null);
    setSamples([]);
    setConnection("idle");
    setError(null);
  }, [teardown]);

  const clearSamples = useCallback(() => setSamples([]), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const id = deviceIdRef.current;
      deviceIdRef.current = null;
      if (id) void disconnectHeartRateDevice(id);
    };
  }, []);

  // Reset samples when disabled
  useEffect(() => {
    if (!enabled) {
      void teardown();
    }
  }, [enabled, teardown]);

  return {
    available,
    bpm,
    connection,
    connected: connection === "connected",
    deviceName: device?.name ?? null,
    device,
    error,
    samples,
    fcMedia,
    fcMax,
    zone,
    scanning,
    connecting: connection === "connecting" || scanning,
    connect,
    reconnect,
    disconnect,
    forgetDevice,
    clearSamples,
  };
}
