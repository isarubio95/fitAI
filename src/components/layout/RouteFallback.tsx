import { PageRouteFallback } from "@/components/layout/skeletons/pages";

/**
 * Silueta de la ruta actual mientras carga el chunk.
 *
 * Cada página tiene su propio esqueleto (calendario, feed, catálogo…): un
 * bloque genérico descuadraba el layout al hidratar.
 */
export function RouteFallback({ pathname, tab = "" }: { pathname: string; tab?: string }) {
  return <PageRouteFallback pathname={pathname} tab={tab} />;
}
