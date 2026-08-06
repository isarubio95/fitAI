import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGpsMotionTrackerState,
  haversineM,
  reduceGpsMotion,
  toMotionSnapshot,
  type GpsMotionSnapshot,
  type GpsMotionTrackerState,
} from "@/lib/cardioGpsMotion";

export const CARDIO_GPS_DRAFT_STORAGE_KEY = "gym-log-activeCardioDraft";

export type CardioGpsPoint = {
  lat: number;
  lng: number;
  timestamp_utc: string;
  elevacion_m?: number | null;
};

export { haversineM };

function totalPathLengthM(points: CardioGpsPoint[]): number {
  let t = 0;
  for (let i = 1; i < points.length; i++) t += haversineM(points[i - 1], points[i]);
  return t;
}

const EMPTY_MOTION: GpsMotionSnapshot = {
  speedMps: null,
  isStationary: false,
  isMoving: false,
  stationaryMs: 0,
  movingMs: 0,
};

type Options = {
  sessionId: string | null;
  /** Si es false, se detiene watchPosition y no se añaden puntos. */
  recording: boolean;
  /** Escucha GPS sin grabar (p. ej. pantalla de setup antes de iniciar). */
  preview?: boolean;
  minIntervalMs?: number;
  minDeltaM?: number;
  maxAccuracyM?: number;
};

export function useCardioGpsRecorder({
  sessionId,
  recording,
  preview = false,
  minIntervalMs = 4000,
  minDeltaM = 6,
  maxAccuracyM = 85,
}: Options) {
  const [points, setPoints] = useState<CardioGpsPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [hasFix, setHasFix] = useState(false);
  const [motion, setMotion] = useState<GpsMotionSnapshot>(EMPTY_MOTION);

  const lastAcceptedRef = useRef<{ t: number; lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const motionTrackerRef = useRef<GpsMotionTrackerState>(createGpsMotionTrackerState());

  const resetMotion = useCallback(() => {
    motionTrackerRef.current = createGpsMotionTrackerState();
    setMotion(EMPTY_MOTION);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      resetMotion();
      return;
    }
    try {
      const raw = localStorage.getItem(CARDIO_GPS_DRAFT_STORAGE_KEY);
      if (!raw) {
        setPoints([]);
        lastAcceptedRef.current = null;
        resetMotion();
        return;
      }
      const parsed = JSON.parse(raw) as { sessionId?: string; points?: CardioGpsPoint[] };
      if (parsed.sessionId !== sessionId || !Array.isArray(parsed.points)) {
        setPoints([]);
        lastAcceptedRef.current = null;
        resetMotion();
        return;
      }
      setPoints(parsed.points);
      if (parsed.points.length > 0) setHasFix(true);
      const last = parsed.points[parsed.points.length - 1];
      if (last) {
        const ts = Date.parse(last.timestamp_utc);
        if (!Number.isNaN(ts)) lastAcceptedRef.current = { t: ts, lat: last.lat, lng: last.lng };
      }
      resetMotion();
    } catch {
      /* ignore */
    }
  }, [sessionId, resetMotion]);

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
    setHasFix(false);
    resetMotion();
  }, [resetMotion]);

  useEffect(() => {
    const clearWatch = () => {
      if (watchIdRef.current != null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    const shouldWatch = preview || (Boolean(sessionId) && recording);
    if (!shouldWatch) {
      clearWatch();
      if (!preview && !recording) {
        setHasFix(false);
        resetMotion();
      }
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Tu navegador no permite geolocalización.");
      setHasFix(false);
      return;
    }

    setError(null);
    setDenied(false);

    const geo = navigator.geolocation;
    const wid = geo.watchPosition(
      (pos) => {
        setHasFix(true);
        setError(null);
        setDenied(false);

        const { latitude, longitude, altitude, accuracy, speed } = pos.coords;
        const now = Date.now();
        const lat = latitude;
        const lng = longitude;

        // Motion también en preview (p. ej. autopausa / reanudación).
        motionTrackerRef.current = reduceGpsMotion(
          motionTrackerRef.current,
          {
            lat,
            lng,
            t: now,
            accuracy,
            deviceSpeedMps: speed,
          },
          { maxAccuracyM },
        );
        setMotion(toMotionSnapshot(motionTrackerRef.current, now));

        if (!sessionId || !recording) return;

        if (accuracy != null && accuracy > maxAccuracyM) return;
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
        setHasFix(false);
        if (err.code === 1) setDenied(true);
        setError(err.message || "Error de geolocalización");
        resetMotion();
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 25000 },
    );
    watchIdRef.current = wid;
    return clearWatch;
  }, [sessionId, recording, preview, minIntervalMs, minDeltaM, maxAccuracyM, resetMotion]);

  // Refresca stationaryMs/movingMs aunque el GPS no emita (umbrales por reloj).
  useEffect(() => {
    const shouldWatch = preview || (Boolean(sessionId) && recording);
    if (!shouldWatch) return;
    const id = window.setInterval(() => {
      const tracker = motionTrackerRef.current;
      if (tracker.stationarySince == null && tracker.movingSince == null) return;
      setMotion(toMotionSnapshot(tracker, Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionId, recording, preview]);

  const distanceM = totalPathLengthM(points);

  return { points, distanceM, error, denied, hasFix, motion, clearDraft };
}
