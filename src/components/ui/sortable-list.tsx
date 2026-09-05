import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  measureGap,
  offsetForIndex,
  resolveDropIndex,
  restingTop,
  type SortableMetrics,
} from "@/lib/sortableGeometry";
import {
  dragEnd as hapticDragEnd,
  dragOver as hapticDragOver,
  dragStart as hapticDragStart,
} from "@/lib/haptics";

/**
 * Lista ordenable por arrastre.
 *
 * Está escrita a mano, en vez de sobre dnd-kit, por tres motivos que se notan
 * en el gesto:
 *
 * 1. **Alturas dispares.** Una ficha de ejercicio mide desde 120 px hasta más
 *    de 600 px según las series. Aquí el desplazamiento de cada fila se calcula
 *    con la geometría real medida, así que al soltar no salta nada: la fila ya
 *    estaba pintada exactamente en su posición final.
 * 2. **Recorte por overflow.** La fila en el aire se pinta en un portal a
 *    `document.body` con `position: fixed`, fuera del `overflow-y-auto` del
 *    drawer que si no la recortaría en cuanto subiera.
 * 3. **Coste de render.** Durante el arrastre no se re-renderiza ninguna fila:
 *    los desplazamientos se escriben en el `style` de cada nodo. React solo
 *    interviene al levantar y al soltar, dos veces por gesto.
 *
 * Coordenadas: la geometría se congela al levantar y vive en el espacio de
 * *contenido* del contenedor de scroll (client + scrollTop), de modo que el
 * autoscroll no invalida las medidas ni provoca reordenaciones fantasma. El
 * overlay, al ser `fixed`, se posiciona en coordenadas de viewport.
 */

/** Zona desde el borde del scroll donde empieza el autoscroll. */
const EDGE_ZONE_PX = 88;
/** Velocidad máxima de autoscroll, en px por frame. */
const MAX_SCROLL_SPEED = 18;
/** Curva compartida por el desplazamiento de filas y la animación de soltar. */
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const SHIFT_TRANSITION = `transform 240ms ${EASE}`;
const DROP_MS = 260;
/** Holgura para que la fila levantada no llegue a tocar los bordes del scroll. */
const EDGE_PADDING = 6;
/** Cuánto "flota" la fila levantada. */
const LIFT_SCALE = 1.02;

type Phase = "dragging" | "dropping";
type Mode = "pointer" | "keyboard";

/** Geometría congelada al levantar la fila. No se vuelve a medir. */
type Snapshot = SortableMetrics & {
  ids: string[];
  /** Top del contenedor de la lista, en el mismo espacio que `tops`. */
  listTop: number;
  activeLeft: number;
  activeWidth: number;
  /** Distancia del puntero al borde superior de la fila al agarrarla. */
  grabOffsetY: number;
};

type DragState = {
  id: string;
  from: number;
  to: number;
  height: number;
  width: number;
  mode: Mode;
  phase: Phase;
};

export type SortableHandleProps = {
  ref: (node: HTMLElement | null) => void;
  onPointerDown: (event: ReactPointerEvent) => void;
  onKeyDown: (event: ReactKeyboardEvent) => void;
  onContextMenu: (event: { preventDefault: () => void }) => void;
  role: "button";
  tabIndex: number;
  "aria-label": string;
  "aria-roledescription": string;
  "aria-pressed": boolean;
  "data-vaul-no-drag": true;
  style: CSSProperties;
};

type SortableContextValue = {
  registerItem: (id: string, node: HTMLElement | null) => void;
  registerHandle: (id: string, node: HTMLElement | null) => void;
  registerAnchor: (node: HTMLElement | null, anchorId: string) => void;
  startPointerDrag: (id: string, event: ReactPointerEvent) => void;
  handleKeyDown: (id: string, event: ReactKeyboardEvent) => void;
  labelOf: (id: string) => string;
  activeId: string | null;
  keyboardId: string | null;
  disabled: boolean;
};

const SortableListContext = createContext<SortableContextValue | null>(null);

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

/** Aceleración progresiva del autoscroll: nada de saltos al rozar el borde. */
const easeEdge = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c;
};

function findScrollHost(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el && el !== document.body && el !== document.documentElement) {
    const overflowY = getComputedStyle(el).overflowY;
    const scrollable = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
    if (scrollable && el.scrollHeight > el.clientHeight + 2) return el;
    el = el.parentElement;
  }
  return null;
}

const hostScrollTop = (host: HTMLElement | null) => (host ? host.scrollTop : window.scrollY);

const hostViewport = (host: HTMLElement | null) => {
  if (!host) return { top: 0, bottom: window.innerHeight };
  const rect = host.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
};

const scrollHostBy = (host: HTMLElement | null, dy: number) => {
  if (host) host.scrollTop += dy;
  else window.scrollBy(0, dy);
};

export interface SortableListProps {
  /** Ids en el mismo orden en que se pintan las filas. */
  items: string[];
  /** `from` y `to` son índices sobre `items`, con semántica de `arrayMove`. */
  onReorder: (from: number, to: number) => void;
  /** Copia inerte de la fila, para pintarla flotando mientras se arrastra. */
  renderOverlay: (id: string) => ReactNode;
  /** Nombre de la fila para los anuncios de lector de pantalla. */
  getItemLabel?: (id: string) => string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function SortableList({
  items,
  onReorder,
  renderOverlay,
  getItemLabel,
  disabled = false,
  className,
  children,
}: SortableListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayCardRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef(new Map<string, HTMLElement>());
  const handlesRef = useRef(new Map<string, HTMLElement>());
  const anchorsRef = useRef(new Map<HTMLElement, string>());
  const hostRef = useRef<HTMLElement | null>(null);
  const snapshotRef = useRef<Snapshot | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pointerRef = useRef({ y: 0, id: -1, moved: false });
  const rafRef = useRef<number | null>(null);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const labelOf = useCallback(
    (id: string) => getItemLabel?.(id) ?? `elemento ${itemsRef.current.indexOf(id) + 1}`,
    [getItemLabel],
  );

  const registerItem = useCallback((id: string, node: HTMLElement | null) => {
    if (node) nodesRef.current.set(id, node);
    else nodesRef.current.delete(id);
  }, []);

  const registerHandle = useCallback((id: string, node: HTMLElement | null) => {
    if (node) handlesRef.current.set(id, node);
    else handlesRef.current.delete(id);
  }, []);

  const registerAnchor = useCallback((node: HTMLElement | null, anchorId: string) => {
    // `ref(null)` llega sin referencia al nodo anterior, así que los nodos
    // muertos se descartan por barrido al recorrer el mapa.
    if (node) anchorsRef.current.set(node, anchorId);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const paintOffsets = useCallback((from: number, to: number, animate: boolean) => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return;
    const offsets = new Map<string, number>();
    snapshot.ids.forEach((id, index) => {
      const dy = offsetForIndex(snapshot, from, to, index);
      offsets.set(id, dy);
      const node = nodesRef.current.get(id);
      if (!node) return;
      node.style.transition = animate ? SHIFT_TRANSITION : "none";
      // Siempre con transform, aunque sea cero: crea contexto de apilamiento y
      // mantiene las filas por encima del indicador de destino.
      node.style.transform = `translate3d(0, ${dy}px, 0)`;
    });

    // Las cabeceras de grupo viajan con la fila a la que preceden; si no, se
    // quedarían clavadas mientras la superserie se abre.
    anchorsRef.current.forEach((anchorId, node) => {
      if (!node.isConnected) {
        anchorsRef.current.delete(node);
        return;
      }
      const dy = offsets.get(anchorId) ?? 0;
      node.style.transition = animate ? SHIFT_TRANSITION : "none";
      node.style.transform = `translate3d(0, ${dy}px, 0)`;
    });

    const indicator = indicatorRef.current;
    if (indicator) {
      const top = restingTop(snapshot, from, to) - snapshot.listTop;
      indicator.style.transition = animate ? SHIFT_TRANSITION : "none";
      indicator.style.transform = `translate3d(0, ${top}px, 0)`;
    }
  }, []);

  const clearInlineStyles = useCallback(() => {
    nodesRef.current.forEach((node) => {
      node.style.transition = "";
      node.style.transform = "";
      node.style.willChange = "";
    });
    anchorsRef.current.forEach((_, node) => {
      node.style.transition = "";
      node.style.transform = "";
    });
  }, []);

  /** Mide todas las filas. Devuelve `null` si la lista no está lista para medir. */
  const takeSnapshot = useCallback((id: string, pointerY: number | null): Snapshot | null => {
    const ids = itemsRef.current;
    if (ids.length < 2 || !ids.includes(id)) return null;

    const host = findScrollHost(containerRef.current);
    hostRef.current = host;
    const scrollTop = hostScrollTop(host);
    const viewportTop = hostViewport(host).top;
    const toContent = (clientTop: number) => clientTop - viewportTop + scrollTop;

    const tops: number[] = [];
    const heights: number[] = [];
    for (const itemId of ids) {
      const node = nodesRef.current.get(itemId);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      tops.push(toContent(rect.top));
      heights.push(rect.height);
    }

    const gap = measureGap(tops, heights);

    const activeRect = nodesRef.current.get(id)!.getBoundingClientRect();
    const listTop = containerRef.current
      ? toContent(containerRef.current.getBoundingClientRect().top)
      : tops[0];

    return {
      ids: [...ids],
      tops,
      heights,
      gap,
      listTop,
      activeLeft: activeRect.left,
      activeWidth: activeRect.width,
      grabOffsetY: pointerY == null ? activeRect.height / 2 : pointerY - activeRect.top,
    };
  }, []);

  const resetDrag = useCallback(() => {
    if (dropTimerRef.current) {
      clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }
    dragRef.current = null;
    snapshotRef.current = null;
  }, []);

  /** Un solo bucle: autoscroll, posición del overlay y cálculo del destino. */
  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const state = dragRef.current;
    const snapshot = snapshotRef.current;
    if (!state || !snapshot || state.phase !== "dragging" || state.mode !== "pointer") return;

    const host = hostRef.current;
    const view = hostViewport(host);
    const pointerY = pointerRef.current.y;

    let speed = 0;
    if (!pointerRef.current.moved) {
      // Sin movimiento no hay autoscroll: si no, agarrar un mango que caiga
      // cerca del borde arrancaría un desplazamiento que nadie ha pedido.
    } else if (pointerY < view.top + EDGE_ZONE_PX) {
      speed = -easeEdge((view.top + EDGE_ZONE_PX - pointerY) / EDGE_ZONE_PX) * MAX_SCROLL_SPEED;
    } else if (pointerY > view.bottom - EDGE_ZONE_PX) {
      speed = easeEdge((pointerY - (view.bottom - EDGE_ZONE_PX)) / EDGE_ZONE_PX) * MAX_SCROLL_SPEED;
    }
    if (speed !== 0) scrollHostBy(host, speed);

    // La ficha no se sale del área visible de la lista: al llegar al borde se
    // queda pegada a él y lo que se mueve es el scroll.
    const rawTop = pointerY - snapshot.grabOffsetY;
    const minTop = view.top + EDGE_PADDING;
    const maxTop = view.bottom - state.height - EDGE_PADDING;
    const clientTop = maxTop >= minTop ? clamp(rawTop, minTop, maxTop) : rawTop;

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.transform = `translate3d(${snapshot.activeLeft}px, ${clientTop}px, 0)`;
    }

    const projectedTop = clientTop - view.top + hostScrollTop(host);
    const from = state.from;
    const target = resolveDropIndex(snapshot, from, projectedTop);

    if (target !== state.to) {
      state.to = target;
      paintOffsets(from, target, true);
      hapticDragOver();
    }
  }, [paintOffsets]);

  const finishDrag = useCallback(
    (commit: boolean) => {
      const state = dragRef.current;
      const snapshot = snapshotRef.current;
      if (!state || state.phase !== "dragging") return;
      stopLoop();

      const { from, to, id, mode } = state;
      const total = snapshot?.ids.length ?? itemsRef.current.length;
      const willMove = commit && to !== from;
      hapticDragEnd();
      setAnnouncement(
        willMove
          ? `${labelOf(id)} colocado en la posición ${to + 1} de ${total}.`
          : `${labelOf(id)} vuelve a su posición.`,
      );

      if (mode === "keyboard") {
        clearInlineStyles();
        resetDrag();
        setDrag(null);
        if (willMove) onReorder(from, to);
        // El mango puede haber cambiado de sitio en el DOM: recuperamos el foco.
        requestAnimationFrame(() => handlesRef.current.get(id)?.focus());
        return;
      }

      const next: DragState = { ...state, to: willMove ? to : from, phase: "dropping" };
      dragRef.current = next;
      setDrag(next);
      if (willMove) onReorder(from, to);
    },
    [clearInlineStyles, labelOf, onReorder, resetDrag, stopLoop],
  );

  /**
   * Al soltar, la lista ya se ha repintado con el orden nuevo. Medimos dónde ha
   * quedado la fila real y llevamos el overlay hasta ahí. Como los
   * desplazamientos reproducían la geometría exacta, limpiarlos no mueve nada.
   */
  useLayoutEffect(() => {
    if (!drag || drag.phase !== "dropping") return;
    clearInlineStyles();
    if (indicatorRef.current) {
      indicatorRef.current.style.transition = `opacity ${DROP_MS}ms ${EASE}`;
      indicatorRef.current.style.opacity = "0";
    }

    const overlay = overlayRef.current;
    const target = nodesRef.current.get(drag.id);
    if (!overlay || !target) {
      resetDrag();
      setDrag(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    overlay.style.transition = `transform ${DROP_MS}ms ${EASE}`;
    overlay.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    if (overlayCardRef.current) overlayCardRef.current.style.transform = "scale(1)";

    dropTimerRef.current = setTimeout(() => {
      dropTimerRef.current = null;
      resetDrag();
      setDrag(null);
    }, DROP_MS);
  }, [drag, clearInlineStyles, resetDrag]);

  /** Coloca overlay e indicador antes del primer pintado del arrastre. */
  useLayoutEffect(() => {
    if (!drag || drag.phase !== "dragging") return;
    const snapshot = snapshotRef.current;
    if (!snapshot) return;
    const view = hostViewport(hostRef.current);
    const clientTop = snapshot.tops[drag.from] - hostScrollTop(hostRef.current) + view.top;

    const overlay = overlayRef.current;
    const card = overlayCardRef.current;
    if (overlay && drag.mode === "pointer") {
      overlay.style.transition = "none";
      overlay.style.transform = `translate3d(${snapshot.activeLeft}px, ${clientTop}px, 0)`;
    }
    if (card && drag.mode === "pointer") {
      card.style.transition = "none";
      card.style.transform = "scale(1)";
      // Reflow: sin él el navegador colapsa ambos estados y no hay despegue.
      void card.offsetHeight;
      card.style.transition = `transform 180ms ${EASE}`;
      card.style.transform = `scale(${LIFT_SCALE})`;
    }
    if (indicatorRef.current) {
      indicatorRef.current.style.opacity = "";
    }
    paintOffsets(drag.from, drag.to, false);
  }, [drag, paintOffsets]);

  const startPointerDrag = useCallback(
    (id: string, event: ReactPointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      // Vaul decide si arrastra el drawer en el propio `pointerdown`, antes de
      // mirar `data-vaul-no-drag`: hay que cortar la burbuja pase lo que pase.
      event.stopPropagation();
      if (disabled) return;
      // Un arrastre nuevo durante la animación de soltar: la cortamos en seco.
      if (dragRef.current) {
        if (dragRef.current.phase !== "dropping") return;
        resetDrag();
      }

      const snapshot = takeSnapshot(id, event.clientY);
      if (!snapshot) return;
      const from = snapshot.ids.indexOf(id);

      event.preventDefault();
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // Sin captura seguimos vivos: las escuchas están en `window`.
      }

      snapshotRef.current = snapshot;
      pointerRef.current = { y: event.clientY, id: event.pointerId, moved: false };
      nodesRef.current.forEach((node) => {
        node.style.willChange = "transform";
      });

      const state: DragState = {
        id,
        from,
        to: from,
        height: snapshot.heights[from],
        width: snapshot.activeWidth,
        mode: "pointer",
        phase: "dragging",
      };
      dragRef.current = state;
      setDrag(state);
      hapticDragStart();
      setAnnouncement(`${labelOf(id)} levantado. Arrastra para reordenar.`);
      stopLoop();
      rafRef.current = requestAnimationFrame(loop);
    },
    [disabled, labelOf, loop, resetDrag, stopLoop, takeSnapshot],
  );

  const handleKeyDown = useCallback(
    (id: string, event: ReactKeyboardEvent) => {
      if (disabled) return;
      const state = dragRef.current;
      const lifted = !!state && state.mode === "keyboard" && state.id === id && state.phase === "dragging";

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (lifted) {
          finishDrag(true);
          return;
        }
        if (state) return;
        const snapshot = takeSnapshot(id, null);
        if (!snapshot) return;
        const from = snapshot.ids.indexOf(id);
        snapshotRef.current = snapshot;
        const next: DragState = {
          id,
          from,
          to: from,
          height: snapshot.heights[from],
          width: snapshot.activeWidth,
          mode: "keyboard",
          phase: "dragging",
        };
        dragRef.current = next;
        setDrag(next);
        hapticDragStart();
        setAnnouncement(
          `${labelOf(id)} levantado. Muévelo con las flechas y suéltalo con Enter.`,
        );
        return;
      }

      if (!lifted || !state) return;
      const snapshot = snapshotRef.current;
      if (!snapshot) return;

      if (event.key === "Escape") {
        event.preventDefault();
        finishDrag(false);
        return;
      }
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      event.preventDefault();
      const total = snapshot.ids.length;
      const next = clamp(state.to + (event.key === "ArrowDown" ? 1 : -1), 0, total - 1);
      if (next === state.to) return;
      state.to = next;
      paintOffsets(state.from, next, true);
      // En teclado no hay overlay flotante: la propia fila se desplaza.
      const node = nodesRef.current.get(id);
      if (node) {
        const dy = restingTop(snapshot, state.from, next) - snapshot.tops[state.from];
        node.style.transition = SHIFT_TRANSITION;
        node.style.transform = `translate3d(0, ${dy}px, 0)`;
      }
      hapticDragOver();
      setAnnouncement(`${labelOf(id)}, posición ${next + 1} de ${total}.`);
    },
    [disabled, finishDrag, labelOf, paintOffsets, takeSnapshot],
  );

  // Escuchas globales del arrastre por puntero: en `window`, para no perder el
  // gesto si el mango se desmonta a mitad.
  useEffect(() => {
    if (!drag || drag.phase !== "dragging" || drag.mode !== "pointer") return;

    const matches = (event: PointerEvent) =>
      pointerRef.current.id === -1 || event.pointerId === pointerRef.current.id;
    const onMove = (event: PointerEvent) => {
      if (!matches(event)) return;
      if (event.clientY !== pointerRef.current.y) pointerRef.current.moved = true;
      pointerRef.current.y = event.clientY;
    };
    const onUp = (event: PointerEvent) => {
      if (matches(event)) finishDrag(true);
    };
    const onCancel = (event: PointerEvent) => {
      if (matches(event)) finishDrag(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishDrag(false);
    };
    // El navegador no debe desplazar la página con la fila en el aire.
    const blockTouch = (event: TouchEvent) => event.preventDefault();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchmove", blockTouch, { passive: false });

    const { body } = document;
    const prevUserSelect = body.style.userSelect;
    const prevCursor = body.style.cursor;
    body.style.userSelect = "none";
    body.style.cursor = "grabbing";

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchmove", blockTouch);
      body.style.userSelect = prevUserSelect;
      body.style.cursor = prevCursor;
    };
  }, [drag, finishDrag]);

  useEffect(
    () => () => {
      stopLoop();
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    },
    [stopLoop],
  );

  const context = useMemo<SortableContextValue>(
    () => ({
      registerItem,
      registerHandle,
      registerAnchor,
      startPointerDrag,
      handleKeyDown,
      labelOf,
      activeId: drag?.mode === "pointer" ? drag.id : null,
      keyboardId: drag?.mode === "keyboard" ? drag.id : null,
      disabled,
    }),
    [
      registerItem,
      registerHandle,
      registerAnchor,
      startPointerDrag,
      handleKeyDown,
      labelOf,
      drag,
      disabled,
    ],
  );

  // Overlay e indicador se mantienen montados durante la animación de soltar,
  // para poder llevar la ficha hasta su sitio y difuminar el hueco.
  const floating = !!drag && drag.mode === "pointer";

  return (
    <SortableListContext.Provider value={context}>
      <div ref={containerRef} className={cn("relative", className)}>
        {floating ? (
          <div
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-0 z-0 rounded-xl border border-dashed border-primary/30 bg-primary/[0.05]"
            style={{ height: drag.height }}
          />
        ) : null}
        {children}
      </div>

      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>

      {floating && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={overlayRef}
              aria-hidden
              inert
              className="pointer-events-none fixed left-0 top-0 z-[999]"
              style={{ width: drag.width, height: drag.height }}
            >
              <div
                ref={overlayCardRef}
                className={cn(
                  "h-full w-full overflow-hidden rounded-xl bg-card",
                  "shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)] ring-1 ring-primary/25",
                )}
              >
                {renderOverlay(drag.id)}
              </div>
            </div>,
            document.body,
          )
        : null}
    </SortableListContext.Provider>
  );
}

function useSortableContext() {
  const context = useContext(SortableListContext);
  if (!context) {
    throw new Error("Los elementos ordenables deben vivir dentro de <SortableList>.");
  }
  return context;
}

/**
 * Conecta una fila a la lista: `setNodeRef` va en el contenedor de la fila y
 * `handleProps` en el mango de arrastre.
 */
export function useSortableItem(id: string, options?: { label?: string }) {
  const {
    registerItem,
    registerHandle,
    startPointerDrag,
    handleKeyDown,
    labelOf,
    activeId,
    keyboardId,
    disabled,
  } = useSortableContext();

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => registerItem(id, node),
    [registerItem, id],
  );

  const isDragging = activeId === id;
  const isKeyboardDragging = keyboardId === id;
  const label = options?.label ?? labelOf(id);

  const handleProps = useMemo<SortableHandleProps>(
    () => ({
      ref: (node: HTMLElement | null) => registerHandle(id, node),
      onPointerDown: (event: ReactPointerEvent) => startPointerDrag(id, event),
      onKeyDown: (event: ReactKeyboardEvent) => handleKeyDown(id, event),
      onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
      role: "button" as const,
      tabIndex: disabled ? -1 : 0,
      "aria-label": `Reordenar ${label}`,
      "aria-roledescription": "Elemento reordenable",
      "aria-pressed": isKeyboardDragging,
      // Vaul arranca su swipe en el `pointerdown` del panel: sin esta marca,
      // reordenar dentro de un drawer arrastraría el drawer entero.
      "data-vaul-no-drag": true as const,
      style: { touchAction: "none" as const },
    }),
    [registerHandle, id, startPointerDrag, handleKeyDown, disabled, label, isKeyboardDragging],
  );

  return { setNodeRef, handleProps, isDragging, isKeyboardDragging, disabled };
}

/**
 * Ancla un bloque no arrastrable (la cabecera de una superserie) a la fila que
 * le sigue, para que acompañe su desplazamiento durante el arrastre.
 */
export function useSortableAnchor(anchorId: string) {
  const { registerAnchor } = useSortableContext();
  return useCallback(
    (node: HTMLElement | null) => registerAnchor(node, anchorId),
    [registerAnchor, anchorId],
  );
}
