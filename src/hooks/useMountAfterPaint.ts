import { startTransition, useEffect, useState } from "react";

/**
 * `false` en el primer render y `true` en cuanto el navegador ha pintado.
 *
 * Sirve para que un bloque caro (gráficas, widgets bajo el pliegue) no entre en
 * el mismo commit que el resto de la pantalla. React pinta primero lo ligero y
 * monta el bloque después, en `startTransition`, de modo que ese trabajo se
 * reparte en tramos cortos en vez de bloquear el hilo principal de una vez.
 */
export function useMountAfterPaint() {
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => startTransition(() => setPainted(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  return painted;
}
