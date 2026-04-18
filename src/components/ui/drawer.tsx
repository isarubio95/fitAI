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
  <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

type DrawerSide = "left" | "right" | "top" | "bottom";

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  side?: DrawerSide;
}

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = "bottom", ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "drawer-mobile-scrollbars-hidden fixed z-50 flex border bg-background",
        side === "bottom" &&
          "inset-x-0 bottom-0 mt-24 max-h-lvh flex-col rounded-t-[10px] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2",
        side === "top" &&
          "inset-x-0 top-0 mb-24 max-h-lvh flex-col rounded-b-[10px] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2",
        side === "left" && "inset-y-0 left-0 h-lvh w-[92vw] max-w-md flex-col border-r border-l-0 border-t-0 border-b-0",
        side === "right" && "inset-y-0 right-0 h-lvh w-[92vw] max-w-md flex-col border-l border-r-0 border-t-0 border-b-0",
        className,
      )}
      {...props}
    >
      <DrawerPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </DrawerPrimitive.Close>
      {(side === "bottom" || side === "top") && <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />}
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
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
