import { useEffect, useState } from "react";

/**
 * Pestaña que se pinta como activa, adelantándose a la URL.
 *
 * Las pestañas de sección viven en la query string, y react-router envuelve ese
 * cambio en `startTransition`: React no pinta nada hasta que el panel nuevo está
 * renderizado, así que ni el subrayado se movía y el toque parecía no responder.
 *
 * El `set` que devuelve es una actualización urgente (se llama desde el handler
 * del click), de modo que el subrayado se mueve en el frame siguiente mientras
 * el contenido sigue montándose en segundo plano. Cuando la URL llega al mismo
 * valor, el adelanto se descarta y vuelve a mandar la URL.
 */
export function useOptimisticTab<T extends string>(urlTab: T) {
  const [tapped, setTapped] = useState<T | null>(null);

  useEffect(() => {
    setTapped(null);
  }, [urlTab]);

  return [tapped ?? urlTab, setTapped] as const;
}
