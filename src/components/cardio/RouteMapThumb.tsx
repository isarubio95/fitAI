import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { acquireMapThumbSlot } from "@/lib/mapThumbSlots";
import { downsampleRoutePoints, type RouteThumbPoint } from "@/lib/routeMapThumb";
import { MAP_COLORS } from "@/lib/stravaDarkMapStyle";
import { cn } from "@/lib/utils";

const CardioRouteMap = lazy(() =>
  import("@/components/cardio/CardioRouteMap").then((m) => ({ default: m.CardioRouteMap })),
);

type Props = {
  points?: RouteThumbPoint[] | null;
  /** Mientras se cargan puntos (p. ej. GPX predefinido). */
  loading?: boolean;
  className?: string;
};

function ThumbPlaceholder({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      className={cn("relative flex h-44 w-full items-center justify-center overflow-hidden", className)}
      aria-hidden
    >
      <div className="map-route-skeleton absolute inset-0" />
      {label ? <span className="relative z-10 text-xs text-white/40">{label}</span> : null}
    </div>
  );
}

/**
 * Miniatura con el mapa real (MapLibre).
 * Solo monta cuando está en vista, tiene tamaño real y hay cupo WebGL libre.
 */
export function RouteMapThumb({ points, loading = false, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hasSize, setHasSize] = useState(false);
  const [hasSlot, setHasSlot] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { root: null, rootMargin: "120px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      setHasSize(el.clientWidth > 8 && el.clientHeight > 8);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !hasSize || loading) {
      setHasSlot(false);
      return;
    }

    let cancelled = false;
    let release: (() => void) | null = null;

    void acquireMapThumbSlot().then((rel) => {
      if (cancelled) {
        rel();
        return;
      }
      release = rel;
      setHasSlot(true);
    });

    return () => {
      cancelled = true;
      setHasSlot(false);
      release?.();
    };
  }, [inView, hasSize, loading]);

  const mapPoints = useMemo(() => {
    if (!points?.length) return [];
    return downsampleRoutePoints(points, 120);
  }, [points]);

  const readyForMap = !loading && mapPoints.length >= 2;
  const showMap = readyForMap && inView && hasSize && hasSlot;

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none h-44 w-full overflow-hidden rounded-t-xl [transform:translateZ(0)]",
        className,
      )}
      style={{ background: MAP_COLORS.land }}
      aria-hidden
    >
      {loading || !readyForMap ? (
        <ThumbPlaceholder label={!loading && !readyForMap ? "Sin trazado" : undefined} />
      ) : showMap ? (
        <Suspense fallback={<ThumbPlaceholder />}>
          <CardioRouteMap
            points={mapPoints}
            interactive={false}
            className="h-44 w-full overflow-hidden rounded-t-xl"
          />
        </Suspense>
      ) : (
        <Skeleton className="h-44 w-full rounded-none" />
      )}
    </div>
  );
}
