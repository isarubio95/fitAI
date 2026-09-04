import { Skeleton } from "@/components/ui/skeleton";

/**
 * Relleno mientras carga el chunk de una página.
 *
 * Antes era `null`: la pantalla se quedaba en blanco, incluidos header y bottom
 * nav, y parecía que la app se había caído. Con la precarga de `preloadRoute`
 * casi nunca llega a verse, pero en la primera visita fría sí, y una silueta
 * mantiene la sensación de continuidad en lugar de un salto a vacío.
 */
export function RouteFallback() {
  return (
    <div className="flex w-full flex-col gap-4 px-4 py-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
