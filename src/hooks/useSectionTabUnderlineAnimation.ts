import { useCallback, useRef } from "react";

/** Activa la animación de subrayado al cambiar de sección (no en el montaje inicial). */
export function useSectionTabUnderlineAnimation() {
  const animateRef = useRef(false);
  const enableAnimation = useCallback(() => {
    animateRef.current = true;
  }, []);

  return {
    enableAnimation,
    containerProps: animateRef.current ? ({ "data-animate-section-tabs": true } as const) : {},
  };
}
