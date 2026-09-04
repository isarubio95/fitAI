import { QueryClient } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

/**
 * Cliente único de React Query.
 *
 * Vive aquí y no en App.tsx para que módulos que no están bajo el provider
 * (como el listener de sesión de `useAuth`) puedan tirar la caché sin depender
 * del contexto de React.
 *
 * Sin `defaultOptions` el `staleTime` global era 0: cada montaje y cada cambio
 * de tab relanzaba todas las queries que no lo declaran a mano (unas 56), lo
 * que hacía que navegar se sintiera como recargar. Los ~38 hooks que ya fijan
 * su propio `staleTime` siguen mandando sobre estos valores.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000,
      // En nativo la app no tiene "ventana" en el sentido web: volver de
      // segundo plano dispara focus y provocaba una tormenta de refetch.
      refetchOnWindowFocus: !isNative,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
    },
  },
});
