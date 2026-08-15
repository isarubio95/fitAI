import type { QueryClient } from "@tanstack/react-query";
import { predefinedRouteQueryKey } from "@/hooks/usePredefinedRouteDetail";
import {
  loadPredefinedRouteAsSelected,
  type PredefinedRouteSummary,
} from "@/lib/predefinedCardioRoutes";
import { downsampleRoutePoints } from "@/lib/routeMapThumb";
import {
  getRouteThumbSnapshot,
  routeThumbCacheKey,
} from "@/lib/routeMapThumbCache";
import { prefetchRouteThumbSnapshot } from "@/lib/routeMapThumbRenderer";
import type { CardioRutaWithPoints, SelectedCardioRoute } from "@/types/cardio";

const GPX_STALE_MS = 1000 * 60 * 60;

function pointsFromSelected(route: SelectedCardioRoute) {
  return downsampleRoutePoints(
    route.points.map((p) => ({ lat: p.lat, lng: p.lng })),
    120,
  );
}

function pointsFromMine(route: CardioRutaWithPoints) {
  return downsampleRoutePoints(
    [...(route.cardio_ruta_punto ?? [])]
      .sort((a, b) => a.orden - b.orden)
      .map((p) => ({ lat: p.lat, lng: p.lng })),
    120,
  );
}

/** Carga GPX + captura de mapa para un lote (prioridad baja, en background). */
export async function prefetchPredefinedRouteThumbs(
  tours: PredefinedRouteSummary[],
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all(
    tours.map(async (tour) => {
      try {
        const selected = await queryClient.fetchQuery({
          queryKey: predefinedRouteQueryKey(tour.id),
          queryFn: () => loadPredefinedRouteAsSelected(tour),
          staleTime: GPX_STALE_MS,
        });
        const points = pointsFromSelected(selected);
        const key = routeThumbCacheKey(points);
        if (getRouteThumbSnapshot(key)) return;
        await prefetchRouteThumbSnapshot(key, points);
      } catch {
        /* ignore: el listado reintentará al montar la tarjeta */
      }
    }),
  );
}

export async function prefetchMineRouteThumbs(routes: CardioRutaWithPoints[]): Promise<void> {
  await Promise.all(
    routes.map(async (route) => {
      const points = pointsFromMine(route);
      const key = routeThumbCacheKey(points);
      if (points.length < 2 || getRouteThumbSnapshot(key)) return;
      await prefetchRouteThumbSnapshot(key, points);
    }),
  );
}
