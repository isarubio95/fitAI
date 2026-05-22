import { useEffect, useState } from "react";

const MD_QUERY = "(min-width: 768px)";

function pickSlot(mobileId: string | null, desktopId: string | null): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const isDesktop = window.matchMedia(MD_QUERY).matches;
  const primaryId = isDesktop ? desktopId : mobileId;
  const fallbackId = isDesktop ? mobileId : desktopId;
  if (primaryId) {
    const el = document.getElementById(primaryId);
    if (el) return el;
  }
  if (fallbackId) return document.getElementById(fallbackId);
  return null;
}

/** Resuelve el contenedor de acciones según viewport (p. ej. header móvil vs flotante escritorio). */
export function useLayoutActionSlot(mobileId: string | null, desktopId: string | null) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => setSlot(pickSlot(mobileId, desktopId));
    sync();

    const mq = window.matchMedia(MD_QUERY);
    const onMq = () => sync();
    mq.addEventListener("change", onMq);
    window.addEventListener("resize", onMq);

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("resize", onMq);
      observer.disconnect();
    };
  }, [mobileId, desktopId]);

  return slot;
}
