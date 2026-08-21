import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import {
  createGpsMotionTrackerState,
  haversineM,
  reduceGpsMotion,
  toMotionSnapshot,
  type GpsMotionSnapshot,
  type GpsMotionTrackerState,
} from "@/lib/cardioGpsMotion";
import {
  MAX_TRACK_POINTS_DRAFT,
  prepareTrackPointsForStorage,
} from "@/lib/cardioTrackPoints";
import { resolveRecordedDistanceM } from "@/lib/cardioRouteProgress";
import {
  addNativeCardioTrackListener,
  buildNativeCardioTrackConfig,
  clearNativeCardioTrack,
  getNativeCardioTrackSnapshot,
  isNativeCardioTrackingAvailable,
  setNativeCardioAutoPauseEnabled,
  startNativeCardioTracking,
  stopNativeCardioTracking,
  type NativeCardioTrackPoint,
  type NativeCardioTrackUpdate,
} from "@/lib/nativeCardioTracker";

export const CARDIO_GPS_DRAFT_STORAGE_KEY = "gym-log-activeCardioDraft";

export type CardioGpsPoint = {
  lat: number;
  lng: number;
  timestamp_utc: string;
  elevacion_m?: number | null;
};

export { haversineM };

const EMPTY_MOTION: GpsMotionSnapshot = {
  speedMps: null,
  isStationary: false,
  isMoving: false,
  stationaryMs: 0,
  movingMs: 0,
};

/** Estado que solo existe cuando graba el servicio nativo (Android). */
export type NativeRecorderState = {
  paused: boolean;
  pauseSource: "manual" | "auto" | null;
  pausedAccumMs: number;
  autoPauseEnabled: boolean;
};

function toGpsPoint(p: NativeCardioTrackPoint): CardioGpsPoint {
  return {
    lat: p.lat,
    lng: p.lng,
    timestamp_utc: p.timestamp_utc,
    elevacion_m: p.elevacion_m ?? null,
  };
}

type Options = {
  sessionId: string | null;
  /** Si es false, se detiene watchPosition y no se añaden puntos. */
  recording: boolean;
  /** Escucha GPS sin grabar (p. ej. pantalla de setup antes de iniciar). */
  preview?: boolean;
  minIntervalMs?: number;
  minDeltaM?: number;
  maxAccuracyM?: number;
  /** Título y arranque para la notificación del servicio nativo. */
  title?: string;
  startedAtMs?: number;
  autoPauseEnabled?: boolean;
};

export function useCardioGpsRecorder({
  sessionId,
  recording,
  preview = false,
  minIntervalMs = 4000,
  minDeltaM = 6,
  maxAccuracyM = 85,
  title,
  startedAtMs,
  autoPauseEnabled,
}: Options) {
  const [points, setPoints] = useState<CardioGpsPoint[]>([]);
  /** Último fix conocido, también en preview: el mapa lo necesita antes de empezar a grabar. */
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [hasFix, setHasFix] = useState(false);
  const [motion, setMotion] = useState<GpsMotionSnapshot>(EMPTY_MOTION);
  const [nativeDistanceM, setNativeDistanceM] = useState<number | null>(null);
  const [nativeElevationGainM, setNativeElevationGainM] = useState<number | null>(null);
  const [nativeState, setNativeState] = useState<NativeRecorderState | null>(null);
  /** El servicio nativo no pudo arrancar (p. ej. sin permiso de ubicación precisa). */
  const [nativeUnavailable, setNativeUnavailable] = useState(false);

  const lastAcceptedRef = useRef<{ t: number; lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const motionTrackerRef = useRef<GpsMotionTrackerState>(createGpsMotionTrackerState());

  /**
   * En Android el WebView se suspende al bloquear la pantalla, así que el track lo graba el
   * servicio en primer plano. `preview` sigue siendo true durante una pausa, por lo que el
   * recorder nativo no se detiene al pausar: necesita fixes para poder auto-reanudar.
   */
  const nativeBackend =
    isNativeCardioTrackingAvailable() &&
    !nativeUnavailable &&
    Boolean(sessionId) &&
    (recording || preview);

  const resetMotion = useCallback(() => {
    motionTrackerRef.current = createGpsMotionTrackerState();
    setMotion(EMPTY_MOTION);
  }, []);

  useEffect(() => {
    setNativeUnavailable(false);
  }, [sessionId]);

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
      setPoints(
        parsed.points.length > MAX_TRACK_POINTS_DRAFT
          ? prepareTrackPointsForStorage(parsed.points, MAX_TRACK_POINTS_DRAFT)
          : parsed.points,
      );
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
        const toStore =
          points.length > MAX_TRACK_POINTS_DRAFT
            ? prepareTrackPointsForStorage(points, MAX_TRACK_POINTS_DRAFT)
            : points;
        localStorage.setItem(
          CARDIO_GPS_DRAFT_STORAGE_KEY,
          JSON.stringify({ sessionId, points: toStore }),
        );
        if (toStore.length < points.length) {
          setPoints(toStore);
        }
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
    if (isNativeCardioTrackingAvailable()) {
      void stopNativeCardioTracking();
      void clearNativeCardioTrack(sessionId ?? undefined);
    }
    setPoints([]);
    lastAcceptedRef.current = null;
    setLastPosition(null);
    setError(null);
    setDenied(false);
    setHasFix(false);
    setNativeDistanceM(null);
    setNativeElevationGainM(null);
    setNativeState(null);
    resetMotion();
  }, [resetMotion, sessionId]);

  // ------------------------------------------------------------ backend nativo

  useEffect(() => {
    if (!nativeBackend || !sessionId) return;

    let cancelled = false;
    let trackHandle: PluginListenerHandle | null = null;
    let appHandle: PluginListenerHandle | null = null;

    const applyCommon = (update: NativeCardioTrackUpdate) => {
      setHasFix(update.hasFix);
      setMotion(update.motion);
      setNativeDistanceM(update.distanceM);
      setNativeElevationGainM(update.elevationGainM);
      setNativeState({
        paused: update.paused,
        pauseSource: update.pauseSource,
        pausedAccumMs: update.pausedAccumMs,
        autoPauseEnabled: update.autoPauseEnabled,
      });
      setError(null);
      setDenied(false);
    };

    const resync = async () => {
      const snapshot = await getNativeCardioTrackSnapshot();
      if (cancelled || !snapshot) return;
      applyCommon(snapshot);
      setPoints(snapshot.points.map(toGpsPoint));
    };

    void (async () => {
      trackHandle = await addNativeCardioTrackListener((update) => {
        if (cancelled) return;
        applyCommon(update);
        // El servicio dejó de grabar por su cuenta (p. ej. se apagaron las notificaciones en
        // vivo, que son obligatorias para el GPS en background): degrada a watchPosition.
        if (!update.tracking) {
          // El contador nativo en 0 no debe tapar la distancia de los puntos al caer a web.
          setNativeDistanceM(null);
          setNativeElevationGainM(null);
          setNativeUnavailable(true);
          return;
        }
        // Tras un adelgazado nativo los índices dejan de cuadrar: se pide el buffer entero.
        if (update.resync) {
          void resync();
          return;
        }
        if (update.points.length > 0) {
          setPoints((prev) => [...prev, ...update.points.map(toGpsPoint)]);
        }
      });
      if (cancelled) return;

      const started = await startNativeCardioTracking({
        sessionId,
        title,
        startedAtMs,
        config: buildNativeCardioTrackConfig({
          minIntervalMs,
          minDeltaM,
          maxAccuracyM,
          autoPauseEnabled,
        }),
      });
      if (cancelled) return;
      if (!started) {
        // Sin servicio nativo se cae a watchPosition: peor en background, pero mejor que nada.
        setNativeUnavailable(true);
        return;
      }

      await resync();
      if (cancelled) return;

      // Al volver del bloqueo se recuperan de golpe los puntos grabados en background.
      appHandle = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) void resync();
      });
    })();

    return () => {
      cancelled = true;
      void trackHandle?.remove();
      void appHandle?.remove();
      // Sin stopTracking: cerrar el drawer no debe cortar la grabación. Solo termina en
      // clearDraft() (guardar/descartar) o al parar la sesión en vivo.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeBackend, sessionId]);

  // La preferencia de autopausa puede cambiar en medio de la sesión.
  useEffect(() => {
    if (!nativeBackend || autoPauseEnabled == null) return;
    void setNativeCardioAutoPauseEnabled(autoPauseEnabled);
  }, [nativeBackend, autoPauseEnabled]);

  // -------------------------------------------------------------- backend web

  useEffect(() => {
    const clearWatch = () => {
      if (watchIdRef.current != null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    const shouldWatch = !nativeBackend && (preview || (Boolean(sessionId) && recording));
    if (!shouldWatch) {
      clearWatch();
      if (!nativeBackend && !preview && !recording) {
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

        setLastPosition((prev) => (prev && prev.lat === lat && prev.lng === lng ? prev : { lat, lng }));

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
        setPoints((prev) => {
          const next = [...prev, point];
          if (next.length <= MAX_TRACK_POINTS_DRAFT) return next;
          return prepareTrackPointsForStorage(next, MAX_TRACK_POINTS_DRAFT);
        });
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
  }, [
    sessionId,
    recording,
    preview,
    minIntervalMs,
    minDeltaM,
    maxAccuracyM,
    nativeBackend,
    resetMotion,
  ]);

  // Refresca stationaryMs/movingMs aunque el GPS no emita (umbrales por reloj).
  // En nativo los umbrales los evalúa el servicio, que sí sigue vivo con la pantalla apagada.
  useEffect(() => {
    const shouldTick = !nativeBackend && (preview || (Boolean(sessionId) && recording));
    if (!shouldTick) return;
    const id = window.setInterval(() => {
      const tracker = motionTrackerRef.current;
      if (tracker.stationarySince == null && tracker.movingSince == null) return;
      setMotion(toMotionSnapshot(tracker, Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionId, recording, preview, nativeBackend]);

  const distanceM = useMemo(
    () => resolveRecordedDistanceM(nativeDistanceM, points),
    [nativeDistanceM, points],
  );

  return {
    points,
    /** Posición actual aunque no se esté grabando (mapa de setup). */
    lastPosition,
    distanceM,
    /** null en web: el consumidor lo calcula con elevationGainM(points). */
    elevationGainM: nativeElevationGainM,
    error,
    denied,
    hasFix,
    motion,
    clearDraft,
    /** Activo solo cuando graba el servicio nativo; dueño de la pausa y el cronómetro. */
    nativeState: nativeBackend ? nativeState : null,
  };
}
