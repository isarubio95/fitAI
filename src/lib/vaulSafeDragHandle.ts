import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import type { PointerEvent as ReactPointerEvent } from "react";

type DragHandleProps = DraggableSyntheticListeners & Partial<DraggableAttributes>;

/**
 * Vaul arranca el swipe del drawer en el `pointerdown` del panel, y solo mira
 * `data-vaul-no-drag` más tarde. Si el mango de dnd-kit no corta esa burbuja,
 * reordenar un ejercicio mueve el sheet entero.
 */
export function vaulSafeDragHandleProps(dragHandleProps?: DragHandleProps) {
  if (!dragHandleProps) return undefined;

  return {
    ...dragHandleProps,
    "data-vaul-no-drag": true as const,
    onPointerDown: (event: ReactPointerEvent) => {
      const inherited = dragHandleProps.onPointerDown as
        | ((event: ReactPointerEvent) => void)
        | undefined;
      inherited?.(event);
      event.stopPropagation();
    },
  };
}
