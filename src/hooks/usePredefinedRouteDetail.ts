import { useQuery } from "@tanstack/react-query";
import {
  loadPredefinedRouteAsSelected,
  type PredefinedRouteSummary,
} from "@/lib/predefinedCardioRoutes";

export function predefinedRouteQueryKey(tourId: string) {
  return ["predefinedCardioRoute", tourId] as const;
}

/** Carga (y cachea) el GPX de una ruta predefinida para preview y selección. */
export function usePredefinedRouteDetail(tour: PredefinedRouteSummary | null, enabled = true) {
  return useQuery({
    queryKey: tour ? predefinedRouteQueryKey(tour.id) : ["predefinedCardioRoute", "none"],
    enabled: !!tour && enabled,
    staleTime: 1000 * 60 * 60,
    queryFn: () => {
      if (!tour) throw new Error("Ruta predefinida no disponible");
      return loadPredefinedRouteAsSelected(tour);
    },
  });
}
