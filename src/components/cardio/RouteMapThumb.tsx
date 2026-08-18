import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { downsampleRoutePoints, type RouteThumbPoint } from "@/lib/routeMapThumb";
import {
  getRouteThumbSnapshot,
  routeThumbCacheKey,
  subscribeRouteThumbCache,
} from "@/lib/routeMapThumbCache";
import { MAP_COLORS } from "@/lib/stravaDarkMapStyle";
import { cn } from "@/lib/utils";

type Props = {
  points?: RouteThumbPoint[] | null;
  /** Mientras se cargan puntos (p. ej. GPX predefinido). */
  loading?: boolean;
  className?: string;
};

function ThumbPlaceholder({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}
      aria-hidden
    >
      <div className="map-route-skeleton absolute inset-0" />
      {label ? <span className="relative z-10 text-xs text-white/40">{label}</span> : null}
    </div>
  );
}

/**
 * Miniatura del mapa real: captura vía renderer singleton.
 * Arranca en cuanto hay puntos (sin esperar al viewport) y escucha el prefetch.
 */
export function RouteMapThumb({ points, loading = false, className }: Props) {
  const mapPoints = useMemo(() => {
    if (!points?.length) return [];
    return downsampleRoutePoints(points, 120);
  }, [points]);

  const cacheKey = useMemo(() => routeThumbCacheKey(mapPoints), [mapPoints]);
  const readyForMap = !loading && mapPoints.length >= 2;

  const [snapshot, setSnapshot] = useState<string | null>(() =>
    readyForMap ? (getRouteThumbSnapshot(cacheKey) ?? null) : null,
  );

  useEffect(() => {
    setSnapshot(getRouteThumbSnapshot(cacheKey) ?? null);
  }, [cacheKey]);

  useEffect(() => {
    return subscribeRouteThumbCache(() => {
      const hit = getRouteThumbSnapshot(cacheKey);
      if (hit) setSnapshot(hit);
    });
  }, [cacheKey]);

  useEffect(() => {
    if (!readyForMap || snapshot) return;

    let cancelled = false;
    void import("@/lib/routeMapThumbRenderer")
      .then(({ requestRouteThumbSnapshot }) =>
        requestRouteThumbSnapshot(cacheKey, mapPoints, () => cancelled, "high"),
      )
      .then((url) => {
        if (cancelled || !url) return;
        setSnapshot(url);
      });

    return () => {
      cancelled = true;
    };
  }, [readyForMap, snapshot, cacheKey, mapPoints]);

  return (
    <div
      className={cn(
        "pointer-events-none h-full w-full overflow-hidden",
        className,
      )}
      style={{ background: MAP_COLORS.land }}
      aria-hidden
    >
      {loading || !readyForMap ? (
        <ThumbPlaceholder label={!loading && !readyForMap ? "Sin trazado" : undefined} />
      ) : snapshot ? (
        <img src={snapshot} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <Skeleton className="h-full w-full rounded-none" />
      )}
    </div>
  );
}
