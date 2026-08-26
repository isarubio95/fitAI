import { ArrowLeft } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

/**
 * Carcasa a pantalla completa de los detalles de forma y fatiga.
 * Mismo patrón que `LogrosDrawer`: drawer izquierdo sin bordes ni radios, con
 * la cabecera respetando el safe area. El botón atrás del sistema ya lo cierra
 * porque `Drawer` integra `useBackCloseLayer`.
 */
export function DetailDrawerShell({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="left"
        overlayClassName="z-[120]"
        className="z-[125] flex h-full max-h-dvh w-full max-w-none flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none dark:bg-card"
      >
        <div className={cn("min-h-0 flex-1 overflow-y-auto bg-background", drawerSafeAreaBottom)}>
          <DrawerHeader className="sticky top-0 z-10 border-b border-border/40 bg-card px-4 pb-3 pt-[calc(1.75rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
            <div className="flex items-center gap-2">
              <DrawerClose asChild>
                <button
                  type="button"
                  aria-label="Volver"
                  className="touch-styled -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </DrawerClose>
              <div className="min-w-0">
                <DrawerTitle className="text-lg font-semibold leading-tight">{title}</DrawerTitle>
                {description && (
                  <DrawerDescription className="text-xs">{description}</DrawerDescription>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4">{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Bloque titulado dentro de un detalle. */
export function DetailSection({
  title,
  hint,
  className,
  children,
}: {
  title?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || hint) && (
        <div className="space-y-0.5">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
