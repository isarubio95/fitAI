import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { PAGE_CARD, PAGE_CARD_STACK_GAP, PAGE_STACK_TOP } from "@/lib/pageStyles";
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

          {/*
            `surface-region-page` es la excepción que devuelve a las cards su
            radio y su superficie dentro de un drawer (ver `drawer.tsx`), así
            que las secciones se ven igual que las cards de cualquier página.
            Las cards tienen que ser hijas directas de este contenedor.
          */}
          <div
            className={cn(
              "surface-region-page mx-auto flex w-full max-w-2xl flex-col bg-background px-3 pb-10",
              PAGE_CARD_STACK_GAP,
              PAGE_STACK_TOP,
            )}
          >
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Sección de un detalle: una card con el mismo criterio que el resto de páginas. */
export function DetailSection({
  title,
  hint,
  contentClassName,
  children,
}: {
  title?: string;
  hint?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={PAGE_CARD}>
      {(title || hint) && (
        <CardHeader className="px-5 pb-3 pt-5">
          {title && (
            <CardTitle asChild className="text-base font-bold">
              <h3>{title}</h3>
            </CardTitle>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </CardHeader>
      )}
      <CardContent className={cn("px-5 pb-5", !title && !hint && "pt-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
