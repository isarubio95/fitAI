import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { DragOverlay } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

/**
 * `DragOverlay` renderizado en un portal a `document.body`.
 *
 * Sin overlay, dnd-kit mueve la propia fila con un `transform`, y eso la deja a
 * merced de los contenedores con overflow que la envuelven (el área scrollable
 * de un drawer, o un simple `overflow-x-hidden` en una página, que según la
 * spec de CSS fuerza `overflow-y` a `auto`). El área de scroll de un
 * contenedor solo crece hacia el final, nunca hacia el inicio: cualquier
 * desplazamiento hacia arriba se recorta y la tarjeta arrastrada desaparece.
 * Un `z-index` no puede evitarlo, porque el recorte no es un problema de orden
 * de pintado.
 *
 * El overlay es `position: fixed`, así que queda fuera de esos contenedores. El
 * portal a `document.body` es imprescindible: Vaul aplica `transform` al
 * contenido del drawer y eso lo convertiría en el bloque contenedor del
 * `fixed`, descolocando el overlay.
 *
 * `children` debe ser el contenido de la fila arrastrada mientras haya arrastre
 * y `null` el resto del tiempo.
 */
export function SortableDragOverlay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <DragOverlay
      // Por encima del drawer (z-50) y de cualquier chrome flotante.
      zIndex={999}
      dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      {children ? (
        <div
          className={cn(
            "pointer-events-none h-full overflow-hidden rounded-xl bg-card shadow-2xl ring-1 ring-primary/40",
            className,
          )}
        >
          {children}
        </div>
      ) : null}
    </DragOverlay>,
    document.body,
  );
}
