import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeHeading, shortestAngleDelta, smoothHeading } from "@/lib/mapHeading";

/** Cadencia máxima de publicación: la brújula emite a ~60 Hz y no hace falta re-renderizar tanto. */
const PUBLISH_INTERVAL_MS = 120;
/** Por debajo de este giro se considera temblor de sensor. */
const MIN_PUBLISH_DELTA_DEG = 1.5;

type OrientationEventWithCompass = DeviceOrientationEvent & {
  /** Solo en Safari/iOS: rumbo brújula ya calculado (0 = norte). */
  webkitCompassHeading?: number | null;
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

function requiresPermission(): boolean {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  return (
    typeof (DeviceOrientationEvent as DeviceOrientationEventWithPermission).requestPermission ===
    "function"
  );
}

function screenAngle(): number {
  if (typeof window === "undefined") return 0;
  const angle = window.screen?.orientation?.angle;
  return typeof angle === "number" ? angle : 0;
}

/** Rumbo brújula del borde superior de la pantalla, o null si el evento no es absoluto. */
function readHeading(event: OrientationEventWithCompass): number | null {
  const compass = event.webkitCompassHeading;
  if (compass != null && Number.isFinite(compass)) {
    return normalizeHeading(compass + screenAngle());
  }
  if (event.alpha == null || !Number.isFinite(event.alpha)) return null;
  // Sin brújula absoluta alpha es relativo al arranque de la app: no sirve para orientar el mapa.
  if (event.type === "deviceorientation" && !event.absolute) return null;
  return normalizeHeading(360 - event.alpha + screenAngle());
}

/**
 * Rumbo de la brújula del dispositivo, suavizado y limitado en frecuencia.
 * Devuelve null mientras no haya lecturas absolutas (navegador sin sensor, permiso pendiente...).
 */
export function useDeviceHeading({ enabled }: { enabled: boolean }) {
  const [heading, setHeading] = useState<number | null>(null);
  const [granted, setGranted] = useState(() => !requiresPermission());

  const smoothedRef = useRef<number | null>(null);
  const publishedRef = useRef<number | null>(null);
  const lastPublishAtRef = useRef(0);

  const requestPermission = useCallback(async () => {
    const request = (DeviceOrientationEvent as DeviceOrientationEventWithPermission)
      .requestPermission;
    if (typeof request !== "function") {
      setGranted(true);
      return true;
    }
    try {
      const state = await request();
      const ok = state === "granted";
      setGranted(ok);
      return ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !granted || typeof window === "undefined") return;

    // `deviceorientationabsolute` es el único que da norte real en Chrome/Android.
    const eventName =
      "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";

    const onOrientation = (event: Event) => {
      const next = readHeading(event as OrientationEventWithCompass);
      if (next == null) return;

      const smoothed = smoothHeading(smoothedRef.current, next);
      smoothedRef.current = smoothed;

      const now = Date.now();
      if (now - lastPublishAtRef.current < PUBLISH_INTERVAL_MS) return;
      const published = publishedRef.current;
      if (published != null && Math.abs(shortestAngleDelta(published, smoothed)) < MIN_PUBLISH_DELTA_DEG) {
        return;
      }
      lastPublishAtRef.current = now;
      publishedRef.current = smoothed;
      setHeading(smoothed);
    };

    window.addEventListener(eventName, onOrientation);
    return () => {
      window.removeEventListener(eventName, onOrientation);
      smoothedRef.current = null;
      publishedRef.current = null;
      lastPublishAtRef.current = 0;
      setHeading(null);
    };
  }, [enabled, granted]);

  return { heading, requestPermission };
}
