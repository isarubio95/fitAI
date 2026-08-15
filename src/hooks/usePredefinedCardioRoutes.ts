import { useQuery } from "@tanstack/react-query";
import {
  filterPredefinedByDiscipline,
  loadPredefinedCatalog,
  type PredefinedRouteSummary,
} from "@/lib/predefinedCardioRoutes";

export function usePredefinedCardioRoutes(disciplinaCodigo: string | null | undefined) {
  return useQuery({
    queryKey: ["predefinedCardioRoutes", "la-rioja", disciplinaCodigo ?? "none"],
    enabled: !!disciplinaCodigo,
    staleTime: 1000 * 60 * 60,
    queryFn: async (): Promise<PredefinedRouteSummary[]> => {
      const catalog = await loadPredefinedCatalog();
      return filterPredefinedByDiscipline(catalog.tours ?? [], disciplinaCodigo);
    },
  });
}
