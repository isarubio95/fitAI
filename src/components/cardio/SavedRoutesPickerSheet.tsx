import { Plus, Route, Trash2 } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateRouteSheet } from "@/components/cardio/CreateRouteSheet";
import {
  routeToSelected,
  useDeleteSavedCardioRoute,
  useSavedCardioRoutes,
} from "@/hooks/useSavedCardioRoutes";
import { formatCardioDistanceM, formatCardioElevationM } from "@/lib/cardioFormat";
import type { SelectedCardioRoute } from "@/types/cardio";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRouteId?: string | null;
  onSelect: (route: SelectedCardioRoute) => void;
  onClear?: () => void;
  /** Disciplina del setup de cardio: se asocia a las rutas creadas aquí. */
  disciplinaId?: string | null;
  disciplinaCodigo?: string | null;
};

export function SavedRoutesPickerSheet({
  open,
  onOpenChange,
  selectedRouteId,
  onSelect,
  onClear,
  disciplinaId = null,
  disciplinaCodigo = null,
}: Props) {
  const { data: routes, isLoading } = useSavedCardioRoutes();
  const deleteRoute = useDeleteSavedCardioRoute();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const justCreatedRef = useRef(false);

  /** El editor es a pantalla completa: cierra el drawer para no competir por el foco. */
  const openCreate = () => {
    setCreateOpen(true);
    onOpenChange(false);
  };

  const onDelete = async (rutaId: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteRoute.mutateAsync(rutaId);
      if (selectedRouteId === rutaId) onClear?.();
      toast({ title: "Ruta eliminada" });
    } catch (err) {
      toast({
        title: "No se pudo eliminar",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className={cn(
            "z-120 flex max-h-[75dvh] flex-col gap-0 overflow-hidden bg-card p-0",
            drawerSafeAreaBottom,
          )}
          overlayClassName="z-120"
        >
          <DrawerHeader className="shrink-0 border-b border-border text-left">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <DrawerTitle>Rutas guardadas</DrawerTitle>
                <DrawerDescription>
                  Elige una ruta para verla en el mapa y seguir el progreso.
                </DrawerDescription>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 gap-1.5 rounded-full"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4" />
                Crear ruta
              </Button>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : !routes?.length ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Route className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">
                  Aún no tienes rutas. Traza una en el mapa, importa un archivo GPS o guárdala
                  desde el detalle de una sesión de cardio con GPS en Comunidad.
                </p>
                <Button type="button" className="gap-1.5" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Crear ruta
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedRouteId && onClear ? (
                  <li>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto w-full justify-start rounded-xl px-3 py-3"
                      onClick={() => {
                        onClear();
                        onOpenChange(false);
                      }}
                    >
                      Quitar ruta seleccionada
                    </Button>
                  </li>
                ) : null}
                {routes.map((route) => {
                  const selected = route.id === selectedRouteId;
                  const distance =
                    route.distancia_total_m != null && route.distancia_total_m > 0
                      ? formatCardioDistanceM(route.distancia_total_m)
                      : null;
                  const elev =
                    route.elevacion_positiva_m != null && route.elevacion_positiva_m > 0
                      ? `↑${formatCardioElevationM(route.elevacion_positiva_m)}`
                      : null;
                  return (
                    <li key={route.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                          selected
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/60 bg-muted/30 hover:bg-muted/50",
                        )}
                        onClick={() => {
                          onSelect(routeToSelected(route));
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/80">
                          <Route className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{route.nombre}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                            {[distance, elev].filter(Boolean).join(" · ") || "Sin métricas"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 shrink-0"
                          aria-label="Eliminar ruta"
                          onClick={(e) => void onDelete(route.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <CreateRouteSheet
        open={createOpen}
        onOpenChange={(next) => {
          setCreateOpen(next);
          if (next) return;
          // Cancelar devuelve al listado; tras guardar, la ruta ya queda seleccionada.
          if (!justCreatedRef.current) onOpenChange(true);
          justCreatedRef.current = false;
        }}
        defaultDisciplinaId={disciplinaId}
        defaultDisciplinaCodigo={disciplinaCodigo}
        onCreated={(route) => {
          justCreatedRef.current = true;
          onSelect(route);
        }}
      />
    </>
  );
}
