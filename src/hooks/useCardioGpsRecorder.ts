import { useCallback, useEffect, useRef, useState } from "react";

export const CARDIO_GPS_DRAFT_STORAGE_KEY = "gym-log-activeCardioDraft";

export type CardioGpsPoint = {
  lat: number;
  lng: number;
  timestamp_utc: string;
  elevacion_m?: number | null;
};

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

function totalPathLengthM(points: CardioGpsPoint[]): number {
  let t = 0;
  for (let i = 1; i < points.length; i++) t += haversineM(points[i - 1], points[i]);
  return t;
}

type Options = {
  sessionId: string | null;
  /** Si es false, se detiene watchPosition y no se añaden puntos. */
  recording: boolean;
  minIntervalMs?: number;
  minDeltaM?: number;
  maxAccuracyM?: number;
};

export function useCardioGpsRecorder({
  sessionId,
  recording,
  minIntervalMs = 4000,
  minDeltaM = 6,
  maxAccuracyM = 85,
}: Options) {
  const [points, setPoints] = useState<CardioGpsPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  const lastAcceptedRef = useRef<{ t: number; lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    try {
      const raw = localStorage.getItem(CARDIO_GPS_DRAFT_STORAGE_KEY);
      if (!raw) {
        setPoints([]);
        lastAcceptedRef.current = null;
        return;
      }
      const parsed = JSON.parse(raw) as { sessionId?: string; points?: CardioGpsPoint[] };
      if (parsed.sessionId !== sessionId || !Array.isArray(parsed.points)) {
        setPoints([]);
        lastAcceptedRef.current = null;
        return;
      }
      setPoints(parsed.points);
      const last = parsed.points[parsed.points.length - 1];
      if (last) {
        const ts = Date.parse(last.timestamp_utc);
        if (!Number.isNaN(ts)) lastAcceptedRef.current = { t: ts, lat: last.lat, lng: last.lng };
      }
    } catch {
      /* ignore */
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(CARDIO_GPS_DRAFT_STORAGE_KEY, JSON.stringify({ sessionId, points }));
      } catch {
        /* ignore */
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [sessionId, points]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(CARDIO_GPS_DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setPoints([]);
    lastAcceptedRef.current = null;
    setError(null);
    setDenied(false);
  }, []);

  useEffect(() => {
    const clearWatch = () => {
      if (watchIdRef.current != null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    if (!sessionId || !recording) {
      clearWatch();
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Tu navegador no permite geolocalización.");
      return;
    }

    setError(null);
    setDenied(false);

    const geo = navigator.geolocation;
    const wid = geo.watchPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy } = pos.coords;
        if (accuracy != null && accuracy > maxAccuracyM) return;
        const now = Date.now();
        const lat = latitude;
        const lng = longitude;
        const last = lastAcceptedRef.current;
        if (last) {
          const dt = now - last.t;
          const dM = haversineM(last, { lat, lng });
          if (dt < minIntervalMs && dM < minDeltaM) return;
        }
        const point: CardioGpsPoint = {
          lat,
          lng,
          timestamp_utc: new Date(now).toISOString(),
          elevacion_m: altitude != null && Number.isFinite(altitude) ? altitude : null,
        };
        lastAcceptedRef.current = { t: now, lat, lng };
        setPoints((prev) => [...prev, point]);
      },
      (err) => {
        if (err.code === 1) setDenied(true);
        setError(err.message || "Error de geolocalización");
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 25000 },
    );
    watchIdRef.current = wid;
    return clearWatch;
  }, [sessionId, recording, minIntervalMs, minDeltaM, maxAccuracyM]);

  const distanceM = totalPathLengthM(points);

  return { points, distanceM, error, denied, clearDraft };
}
