import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Reset scroll on route change (including querystring).
    // Nota: además de window, algunas pantallas pueden tener scroll interno (main o ScrollArea).
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
      document.body?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });

      const main = document.querySelector("main");
      if (main && "scrollTo" in main) (main as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "auto" });

      // Radix ScrollArea viewport (shadcn): resetea scroll si existe.
      document.querySelectorAll("[data-radix-scroll-area-viewport]").forEach((el) => {
        if ("scrollTo" in el) (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    };

    // Dos ticks para cubrir transiciones/montajes de layout.
    reset();
    requestAnimationFrame(reset);
  }, [location.pathname, location.search]);

  return null;
}

