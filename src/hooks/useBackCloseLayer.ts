import { useEffect, useId, useMemo, useRef } from "react";

type LayerEntry = {
  id: string;
  /**
   * Identificador de la entrada de historial de *esta* apertura. `id` viene de
   * `useId`, que es estable por posición: una capa reabierta lo repite y podría
   * confundirse con una entrada antigua. Este contador lo hace único siempre.
   */
  stateId: string;
  close: () => void;
  /** href en el momento de abrir, para no deshacer una navegación posterior. */
  href: string;
  /** true si la capa se cerró por `popstate` (el navegador ya consumió la entrada). */
  popped: boolean;
};

let nextStateId = 0;

const LAYER_STATE_KEY = "__gym_log_overlay_layer__";
const layerStack: LayerEntry[] = [];
let popstateBound = false;

/** Número de entradas de capa empujadas; sirve para detectar carreras. */
let pushCount = 0;

/**
 * `popstate` pendientes que provienen de un `history.back()` nuestro y que, por
 * tanto, no deben cerrar ninguna capa. Se limpia solo a los 400 ms: si el back
 * no llegara a generar evento (porque no había nada que sacar), el contador no
 * puede quedarse comiéndose el siguiente "atrás" de verdad del usuario.
 */
let pendingSelfBacks = 0;
let pendingSelfBacksTimer: number | null = null;

function consumeOwnEntry() {
  pendingSelfBacks += 1;
  if (pendingSelfBacksTimer !== null) window.clearTimeout(pendingSelfBacksTimer);
  pendingSelfBacksTimer = window.setTimeout(() => {
    pendingSelfBacks = 0;
    pendingSelfBacksTimer = null;
  }, 400);
  window.history.back();
}

/**
 * Marca de la entrada de historial en la que estamos ahora mismo. Si tras un
 * `popstate` coincide con la capa que está en la cima de la pila, significa que
 * la entrada consumida era de una capa que ya se había cerrado (el
 * `history.back()` programático de un cierre con la X), no un "atrás" del
 * usuario, y no hay que cerrar nada.
 */
function currentLayerStateId(): string | null {
  const state = window.history.state as Record<string, unknown> | null;
  const id = state?.[LAYER_STATE_KEY];
  return typeof id === "string" ? id : null;
}

function isMobileLikeEnvironment() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const small = window.matchMedia?.("(max-width: 768px)")?.matches ?? false;
  return coarse || small;
}

function bindPopstateOnce() {
  if (popstateBound || typeof window === "undefined") return;
  window.addEventListener("popstate", () => {
    // Eco de nuestro propio back() al limpiar una entrada huérfana: nunca debe
    // cerrar una capa, porque para cuando llega puede haber otra ya abierta.
    if (pendingSelfBacks > 0) {
      pendingSelfBacks -= 1;
      return;
    }
    const top = layerStack[layerStack.length - 1];
    if (!top) return;
    // Hemos aterrizado justo en la entrada de la capa que sigue abierta: el
    // back venía de consumir la entrada de una capa ya cerrada, no del usuario.
    if (currentLayerStateId() === top.stateId) return;
    top.popped = true;
    top.close();
  });
  popstateBound = true;
}

function upsertLayer(entry: LayerEntry) {
  const idx = layerStack.findIndex((x) => x.id === entry.id);
  if (idx >= 0) layerStack[idx] = entry;
  else layerStack.push(entry);
}

function findLayer(id: string) {
  return layerStack.find((x) => x.id === id);
}

function removeLayer(id: string) {
  const idx = layerStack.findIndex((x) => x.id === id);
  if (idx >= 0) layerStack.splice(idx, 1);
}

export function useBackCloseLayer({
  open,
  onOpenChange,
  kind,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  kind: "sheet" | "dialog" | "alert-dialog" | "popover" | "drawer";
}) {
  const reactId = useId();
  const id = useMemo(() => `${kind}:${reactId}`, [kind, reactId]);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open) {
      removeLayer(id);
      return;
    }
    if (!isMobileLikeEnvironment()) return;
    if (!onOpenChangeRef.current) return;

    bindPopstateOnce();
    const href = window.location.href;
    const stateId = `${id}#${nextStateId++}`;
    upsertLayer({
      id,
      stateId,
      href,
      popped: false,
      close: () => onOpenChangeRef.current?.(false),
    });
    window.history.pushState({ [LAYER_STATE_KEY]: stateId }, "", href);
    pushCount += 1;

    return () => {
      const entry = findLayer(id);
      removeLayer(id);
      if (!entry || entry.popped) return;

      // La capa se cerró con la X o programáticamente: hay que consumir la
      // entrada que empujamos, o el siguiente "atrás" del usuario no haría nada.
      //
      // Pero no aquí mismo. Una capa se cierra a menudo para abrir otra — el
      // menú "Registrar" cerrándose para dar paso al drawer de entreno es el
      // caso típico— y el `history.back()` es asíncrono: si entre la llamada y
      // el `popstate` la nueva capa ya ha empujado su entrada, el evento acaba
      // cerrando *esa*. Por eso se aplaza un turno y se cancela si algo ha
      // cambiado mientras tanto.
      const pushCountAtClose = pushCount;
      window.setTimeout(() => {
        // Se abrió otra capa: su entrada está por encima de la huérfana y un
        // back() se llevaría la suya. Se deja estar: cuesta una pulsación de
        // más, no cerrar algo que el usuario acaba de abrir.
        if (pushCount !== pushCountAtClose) return;
        if (layerStack.length > 0) return;
        // Hubo una navegación por encima; un back() la desharía a ella.
        if (window.location.href !== entry.href) return;

        consumeOwnEntry();
      }, 0);
    };
  }, [open, id]);
}
