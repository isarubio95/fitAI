import { useQuery } from "@tanstack/react-query";
import {
  geocodeCacheKey,
  reverseGeocodeCityRegion,
} from "@/lib/reverseGeocode";

/** Etiqueta «Ciudad, Región» del punto de partida (cache 7 días). */
export function useStartLocationLabel(lat: number | null, lng: number | null) {
  const enabled = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  return useQuery({
    queryKey: ["startLocationLabel", enabled ? geocodeCacheKey(lat!, lng!) : null],
    enabled,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 14 * 24 * 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const result = await reverseGeocodeCityRegion(lat!, lng!);
      return result?.label ?? null;
    },
  });
}
