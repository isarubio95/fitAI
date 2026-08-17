import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoPoint } from "@/lib/gimnasioSearch";

export function useBrowserLocation(auto = false) {
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDenied(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({ lat: position.coords.latitude, lng: position.coords.longitude });
        setDenied(false);
        setLoading(false);
      },
      () => {
        setDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    if (auto) request();
  }, [auto, request]);

  return { point, loading, denied, request };
}
