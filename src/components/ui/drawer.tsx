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

/** true dentro de `DrawerContent` (p. ej. ExerciseCard sin bordes redondeados). */
export const DrawerInContentContext = React.createContext(false);

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  side?: DrawerSide;
  /** Clases extra para el overlay (p. ej. z-index en drawers anidados). */
  overlayClassName?: string;
}

function isDraggablePillTarget(target: EventTarget | null) {
  return target instanceof Element && !!target.closest("[data-draggable-pill]");
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
        if (isDraggablePillTarget(e.target)) e.preventDefault();
        onPointerDownOutside?.(e);
      }}
      onInteractOutside={(e) => {
        if (isDraggablePillTarget(e.target)) e.preventDefault();
        onInteractOutside?.(e);
      }}
      className={cn(
        "drawer-mobile-scrollbars-hidden fixed z-50 flex bg-background",
        "**:data-[slot=card]:rounded-none! **:data-drawer-section:rounded-none!",
        "[&_[data-slot=card]:first-child]:border-t-0!",
        side === "bottom" &&
          "inset-x-0 bottom-0 mt-24 max-h-lvh flex-col rounded-t-2xl border-x-0 border-t border-b-0 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.35)] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2 md:border md:border-x",
        side === "top" &&
          "inset-x-0 top-0 mb-24 max-h-lvh flex-col rounded-b-2xl border-x-0 border-b border-t-0 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2 md:border md:border-x",
        side === "left" &&
          "inset-y-0 left-0 h-lvh w-[92vw] max-w-md flex-col border-x-0 border-t-0 border-b-0 md:border-r",
        side === "right" &&
          "inset-y-0 right-0 h-lvh w-[92vw] max-w-md flex-col border-x-0 border-t-0 border-b-0 md:border-l",
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

const DrawerHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const side = React.useContext(DrawerSideContext);
  const showEdgeHandle = side === "bottom" || side === "top";

  return (
    <div className={cn("grid gap-1.5 pt-2.5 pb-4 px-4 text-center sm:text-left", className)} {...props}>
      {showEdgeHandle && side === "bottom" && <DrawerGrabber className="mb-2" />}
      {children}
      {showEdgeHandle && side === "top" && <DrawerGrabber className="mt-2" />}
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
};
