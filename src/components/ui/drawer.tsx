import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";

/**
 * Fix para un bug conocido de Vaul con el teclado virtual en móvil.
 *
 * Vaul escucha `visualViewport.resize` para reposicionar el drawer cuando
 * aparece el teclado y ajusta `style.height` y `style.bottom` inline. Su
 * handler solo ejecuta la lógica si el elemento activo es un input o su
 * flag interno `keyboardIsOpen.current` está activo. Sin embargo, acciones
 * como tocar fuera del drawer (Radix llama a `onPointerDownOutside`, que
 * pone `keyboardIsOpen.current = false`), un `blur` inesperado por scroll
 * dentro del drawer, o simplemente que el evento `resize` no se vuelva a
 * disparar al cerrar el teclado en ciertos navegadores, dejan los estilos
 * inline puestos y el drawer recortado. Solo se arregla al reabrirlo.
 *
 * Red de seguridad: si algo deja `height`/`bottom` inline en el panel (p. ej.
 * versiones anteriores de Vaul o `repositionInputs` activado en un drawer),
 * los limpiamos cuando no hay foco en un campo editable. No usamos
 * `innerHeight - visualViewport.height`: en Android esa diferencia suele ser
 * grande siempre (barra de navegación), y el parche anterior no llegaba a ejecutar.
 */
let vaulKeyboardFixInstalled = false;
function isEditableField(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const t = el.tagName;
  if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return true;
  return el.isContentEditable;
}

function installVaulKeyboardFix() {
  if (vaulKeyboardFixInstalled) return;
  if (typeof window === "undefined") return;
  vaulKeyboardFixInstalled = true;

  let raf = 0;

  const resetOpenDrawers = () => {
    if (isEditableField(document.activeElement)) return;
    const drawers = document.querySelectorAll<HTMLElement>(
      "[data-vaul-drawer][data-vaul-drawer-visible='true']",
    );
    drawers.forEach((el) => {
      if (el.style.height) el.style.height = "";
      if (el.style.bottom) el.style.bottom = "";
    });
  };

  const scheduleReset = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(resetOpenDrawers);
  };

  window.visualViewport?.addEventListener("resize", scheduleReset);
  window.visualViewport?.addEventListener("scroll", scheduleReset);
  document.addEventListener(
    "focusout",
    () => {
      window.setTimeout(scheduleReset, 150);
    },
    true,
  );
}

const Drawer = ({
  open,
  onOpenChange,
  shouldScaleBackground = false,
  /** Evita que Vaul ajuste height/bottom con el teclado (bug en Android: viewport visual ≠ innerHeight). */
  repositionInputs = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  useBackCloseLayer({ open: !!open, onOpenChange, kind: "drawer" });
  React.useEffect(() => {
    installVaulKeyboardFix();
  }, []);
  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={shouldScaleBackground}
      repositionInputs={repositionInputs}
      {...props}
    />
  );
};
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      // Atenuado ligero + desenfoque: sensación nativa (iOS/Android) en lugar de un negro pesado.
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px] supports-backdrop-filter:bg-black/30 dark:bg-black/55 dark:supports-backdrop-filter:bg-black/45",
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

type DrawerSide = "left" | "right" | "top" | "bottom";

const DrawerSideContext = React.createContext<DrawerSide | undefined>(undefined);

/** Padding inferior con safe-area para contenido scrolleable o footers de drawers en móvil. */
export const drawerSafeAreaBottom = "pb-[max(1rem,env(safe-area-inset-bottom,0px))]" as const;

/** Radio estilo sheet iOS: curva abierta y pronunciada (~56px). */
export const drawerSheetRadiusTop = "rounded-t-[1rem]" as const;
export const drawerSheetRadiusBottom = "rounded-b-[1rem]" as const;

/** true dentro de `DrawerContent` (p. ej. ExerciseCard sin bordes redondeados). */
export const DrawerInContentContext = React.createContext(false);

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  side?: DrawerSide;
  /** Clases extra para el overlay (p. ej. z-index en drawers anidados). */
  overlayClassName?: string;
}

function shouldIgnoreDrawerOutside(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest(
      "[data-draggable-pill], [data-radix-popper-content-wrapper], [data-slot=popover-content]",
    )
  );
}

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = "bottom", overlayClassName, onPointerDownOutside, onInteractOutside, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay className={overlayClassName} />
    <DrawerPrimitive.Content
      ref={ref}
      onPointerDownOutside={(e) => {
        if (shouldIgnoreDrawerOutside(e.target)) e.preventDefault();
        onPointerDownOutside?.(e);
      }}
      onInteractOutside={(e) => {
        if (shouldIgnoreDrawerOutside(e.target)) e.preventDefault();
        onInteractOutside?.(e);
      }}
      className={cn(
        "drawer-mobile-scrollbars-hidden fixed z-50 flex bg-background",
        // Cards a sangre (logger, sheets): sin radio. Excepción: lista tipo
        // página (`.surface-region-page`) — mismas esquinas que Comunidad.
        "**:data-[slot=card]:rounded-none! **:data-drawer-section:rounded-none!",
        "[&_.surface-region-page>[data-slot=card]]:rounded-2xl! md:[&_.surface-region-page>[data-slot=card]]:rounded-3xl! [&_.surface-region-page>[data-slot=card]]:border-t!",
        "[&_[data-slot=card]:first-child]:border-t-0!",
        side === "bottom" &&
          cn(
            "inset-x-0 bottom-0 mt-24 max-h-lvh flex-col border-x-0 border-t border-b-0 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.35)] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2 md:border md:border-x",
            drawerSheetRadiusTop,
          ),
        side === "top" &&
          cn(
            "inset-x-0 top-0 mb-24 max-h-lvh flex-col border-x-0 border-b border-t-0 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2 md:border md:border-x",
            drawerSheetRadiusBottom,
          ),
        side === "left" &&
          // overflow-hidden (no overflow-x-hidden): un solo eje hidden
          // computa el otro a auto y el panel se vuelve un scrollport extra.
          "inset-y-0 left-0 h-dvh max-h-dvh w-[92vw] max-w-md flex-col overflow-hidden border-x-0 border-t-0 border-b-0 md:border-r",
        side === "right" &&
          "inset-y-0 right-0 h-dvh max-h-dvh w-[92vw] max-w-md flex-col overflow-hidden border-x-0 border-t-0 border-b-0 md:border-l",
        className,
      )}
      {...props}
    >
      <DrawerInContentContext.Provider value={true}>
        <DrawerSideContext.Provider value={side}>{children}</DrawerSideContext.Provider>
      </DrawerInContentContext.Provider>
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

/**
 * Grabber nativo: usa el `Handle` de Vaul para tener un área de arrastre amplia
 * (hit-area invisible mayor que el indicador visible) y un indicador fino estilo
 * iOS/Android en vez de una barra gruesa.
 */
const DrawerGrabber = ({ className }: { className?: string }) => (
  <DrawerPrimitive.Handle
    // `!` para vencer los estilos base que Vaul inyecta en runtime (color/tamaño fijos)
    // y así respetar el tema claro/oscuro con el color `bg-muted` habitual del drawer.
    className={cn("mx-auto h-1.25! w-11! shrink-0 rounded-full!", className)}
  />
);

/** Anula el cromado 32×5 px de Vaul para usar `Handle` como superficie de arrastre. */
const drawerHandleResetClassName =
  "mx-0! rounded-none! bg-transparent! opacity-100! shadow-none! hover:opacity-100! active:opacity-100!";

type DrawerDragHandleProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Handle> & {
  /** Cubre al padre (`absolute inset-0`). El padre debe ser `relative`. */
  overlay?: boolean;
};

/**
 * `Handle` de Vaul sin el indicador visual. Con `handleOnly`, solo estas
 * superficies (y el grabber) inician el arrastre. Los controles interactivos
 * deben marcarse con `data-vaul-no-drag` y `pointer-events-auto`.
 */
const DrawerDragHandle = ({
  className,
  overlay = false,
  preventCycle = true,
  ...props
}: DrawerDragHandleProps) => (
  <DrawerPrimitive.Handle
    preventCycle={preventCycle}
    className={cn(
      drawerHandleResetClassName,
      overlay
        ? "pointer-events-auto absolute! inset-0! z-0 h-full! w-full! max-w-none! cursor-grab active:cursor-grabbing"
        : "relative h-auto! w-auto! max-w-none! [&_[data-vaul-handle-hitarea]]:contents",
      className,
    )}
    {...(overlay ? { "data-drawer-header-drag-overlay": "" } : {})}
    {...props}
  />
);
DrawerDragHandle.displayName = "DrawerDragHandle";

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Todo el header arrastra el sheet (como el grabber), salvo elementos con
   * `pointer-events-auto` + `data-vaul-no-drag` (botones, etc.).
   */
  dragEntireHeader?: boolean;
}

const DrawerHeader = ({
  className,
  children,
  dragEntireHeader = false,
  ...props
}: DrawerHeaderProps) => {
  const side = React.useContext(DrawerSideContext);
  const showEdgeHandle = side === "bottom" || side === "top";

  return (
    <div
      className={cn(
        "grid gap-1.5 pt-2.5 pb-4 px-4 text-center sm:text-left",
        dragEntireHeader && "relative pointer-events-none",
        className,
      )}
      {...(dragEntireHeader ? { "data-drawer-header-drag": "" } : {})}
      {...props}
    >
      {dragEntireHeader ? <DrawerDragHandle overlay /> : null}
      {showEdgeHandle && side === "bottom" && (
        <DrawerGrabber className={cn("mb-2", dragEntireHeader && "relative z-1")} />
      )}
      {dragEntireHeader ? <div className="relative z-1">{children}</div> : children}
      {showEdgeHandle && side === "top" && (
        <DrawerGrabber className={cn("mt-2", dragEntireHeader && "relative z-1")} />
      )}
    </div>
  );
};
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-3 px-4 pt-4", drawerSafeAreaBottom, className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerDragHandle,
};
