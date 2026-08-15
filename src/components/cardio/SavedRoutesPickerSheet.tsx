import { Bookmark, Loader2, PencilLine, Plus, Route, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CreateRouteSheet, type CreateRouteMode } from "@/components/cardio/CreateRouteSheet";
import { RouteMapThumb } from "@/components/cardio/RouteMapThumb";
import {
  routeToSelected,
  useDeleteSavedCardioRoute,
  useSavedCardioRoutes,
} from "@/hooks/useSavedCardioRoutes";
import { usePredefinedCardioRoutes } from "@/hooks/usePredefinedCardioRoutes";
import {
  predefinedRouteQueryKey,
  usePredefinedRouteDetail,
} from "@/hooks/usePredefinedRouteDetail";
import { usePagedWindow } from "@/hooks/usePagedWindow";
import {
  komootSportsForDiscipline,
  loadPredefinedRouteAsSelected,
  predefinedRouteId,
  type PredefinedRouteSummary,
} from "@/lib/predefinedCardioRoutes";
import { formatCardioDistanceM, formatCardioElevationM } from "@/lib/cardioFormat";
import {
  prefetchMineRouteThumbs,
  prefetchPredefinedRouteThumbs,
} from "@/lib/prefetchRouteThumbs";
import type { CardioRutaWithPoints, SelectedCardioRoute } from "@/types/cardio";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

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

type TabId = "predefined" | "mine";

function CreateRouteMenuButton({
  onChoose,
  size = "sm",
  className,
}: {
  onChoose: (mode: CreateRouteMode) => void;
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    // modal={false}: el focus trap del Drawer no traga el menú.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" size={size} className={cn("gap-1.5", className)}>
          <Plus className="h-4 w-4" />
          Crear ruta
        </Button>
      </DropdownMenuTrigger>
      {/* Por encima del drawer de rutas (z-120). */}
      <DropdownMenuContent align="end" className="z-[140] flex w-44 flex-col gap-1 bg-popover">
        <DropdownMenuItem onClick={() => onChoose("draw")}>
          <PencilLine className="mr-2 h-4 w-4" /> Dibujar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChoose("import")}>
          <Upload className="mr-2 h-4 w-4" /> Importar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function routeMetaLine(distanceM: number | null | undefined, elevM: number | null | undefined) {
  const distance =
    distanceM != null && distanceM > 0 ? formatCardioDistanceM(distanceM) : null;
  const elev =
    elevM != null && elevM > 0 ? `↑${formatCardioElevationM(elevM)}` : null;
  return [distance, elev].filter(Boolean).join(" · ") || "Sin métricas";
}

function ClearSelectedButton({
  onClear,
  onOpenChange,
}: {
  onClear: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
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
  );
}

function InfiniteLoadSentinel({
  rootRef,
  hasMore,
  onLoadMore,
}: {
  rootRef: RefObject<HTMLElement | null>;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root, rootMargin: "240px 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [rootRef, hasMore, onLoadMore]);

  if (!hasMore) return null;
  return (
    <div ref={targetRef} className="flex justify-center py-3" aria-hidden>
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function PredefinedRouteCard({
  tour,
  selected,
  selecting,
  disabled,
  onSelect,
}: {
  tour: PredefinedRouteSummary;
  selected: boolean;
  selecting: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const { data, isLoading } = usePredefinedRouteDetail(tour, true);

  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "w-full overflow-hidden rounded-xl border text-left transition-colors",
          selected
            ? "border-primary/50 bg-primary/10"
            : "border-border/60 bg-muted/30 hover:bg-muted/50",
          disabled && !selecting && "opacity-60",
        )}
        onClick={onSelect}
      >
        <div className="relative overflow-hidden rounded-t-[0.7rem]">
          <RouteMapThumb points={data?.points} loading={isLoading} />
          {selecting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : null}
        </div>
        <div className="flex items-start gap-3 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/80">
            <Bookmark className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold leading-snug">{tour.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {routeMetaLine(tour.distanceM, tour.elevationUpM)}
              {tour.visitors > 0 ? ` · ${tour.visitors} visitas` : ""}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}

function MineRouteCard({
  route,
  selected,
  onSelect,
  onDelete,
}: {
  route: CardioRutaWithPoints;
  selected: boolean;
  onSelect: () => void;
  onDelete: (e: MouseEvent) => void;
}) {
  const points = useMemo(
    () =>
      [...(route.cardio_ruta_punto ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .map((p) => ({ lat: p.lat, lng: p.lng })),
    [route.cardio_ruta_punto],
  );

  return (
    <li>
      <div
        className={cn(
          "overflow-hidden rounded-xl border transition-colors",
          selected
            ? "border-primary/50 bg-primary/10"
            : "border-border/60 bg-muted/30 hover:bg-muted/50",
        )}
      >
        <button type="button" className="block w-full overflow-hidden text-left" onClick={onSelect}>
          <div className="overflow-hidden rounded-t-[0.7rem]">
            <RouteMapThumb points={points} />
          </div>
        </button>
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={onSelect}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/80">
              <Route className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">{route.nombre}</p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {routeMetaLine(route.distancia_total_m, route.elevacion_positiva_m)}
              </p>
            </div>
          </button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0"
            aria-label="Eliminar ruta"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function SavedRoutesPickerSheet({
  open,
  onOpenChange,
  selectedRouteId,
  onSelect,
  onClear,
  disciplinaId = null,
  disciplinaCodigo = null,
}: Props) {
  const queryClient = useQueryClient();
  const { data: savedRoutes, isLoading: savedLoading } = useSavedCardioRoutes();
  const {
    data: predefinedRoutes,
    isLoading: predefinedLoading,
    isError: predefinedError,
  } = usePredefinedCardioRoutes(disciplinaCodigo);
  const deleteRoute = useDeleteSavedCardioRoute();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateRouteMode>("draw");
  const [tab, setTab] = useState<TabId>("predefined");
  const [loadingPredefinedId, setLoadingPredefinedId] = useState<string | null>(null);
  const justCreatedRef = useRef(false);
  const predefinedScrollRef = useRef<HTMLDivElement>(null);
  const mineScrollRef = useRef<HTMLDivElement>(null);

  const hasPredefinedSports = komootSportsForDiscipline(disciplinaCodigo).length > 0;

  const myRoutes = useMemo(() => {
    const list = savedRoutes ?? [];
    if (!disciplinaId) return list;
    return list.filter(
      (r) => r.cardio_disciplina_id == null || r.cardio_disciplina_id === disciplinaId,
    );
  }, [savedRoutes, disciplinaId]);

  const predefinedList = predefinedRoutes ?? [];
  const predefinedPage = usePagedWindow(predefinedList, {
    pageSize: PAGE_SIZE,
    resetKey: `${disciplinaCodigo ?? "none"}:${open ? "1" : "0"}`,
  });
  const minePage = usePagedWindow(myRoutes, {
    pageSize: PAGE_SIZE,
    resetKey: `${disciplinaId ?? "none"}:${open ? "1" : "0"}`,
  });

  // Precarga el lote visible + el siguiente (10+10) para que al hacer scroll ya estén las capturas.
  useEffect(() => {
    if (!open || tab !== "predefined" || predefinedList.length === 0) return;
    const end = Math.min(predefinedPage.visibleCount + PAGE_SIZE, predefinedList.length);
    void prefetchPredefinedRouteThumbs(predefinedList.slice(0, end), queryClient);
  }, [open, tab, predefinedList, predefinedPage.visibleCount, queryClient]);

  useEffect(() => {
    if (!open || tab !== "mine" || myRoutes.length === 0) return;
    const end = Math.min(minePage.visibleCount + PAGE_SIZE, myRoutes.length);
    void prefetchMineRouteThumbs(myRoutes.slice(0, end));
  }, [open, tab, myRoutes, minePage.visibleCount]);

  /** El editor es otro drawer a pantalla completa: cierra el listado para no competir por el foco. */
  const openCreate = (mode: CreateRouteMode) => {
    setCreateMode(mode);
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

  const onSelectMine = (route: CardioRutaWithPoints) => {
    if (selectedRouteId === route.id && onClear) {
      onClear();
      onOpenChange(false);
      return;
    }
    onSelect(routeToSelected(route));
    onOpenChange(false);
  };

  const onSelectPredefined = async (tour: PredefinedRouteSummary) => {
    if (selectedRouteId === predefinedRouteId(tour.id) && onClear) {
      onClear();
      onOpenChange(false);
      return;
    }
    if (loadingPredefinedId) return;

    const cached = queryClient.getQueryData<SelectedCardioRoute>(
      predefinedRouteQueryKey(tour.id),
    );
    if (cached) {
      onSelect(cached);
      onOpenChange(false);
      return;
    }

    setLoadingPredefinedId(tour.id);
    try {
      const selected = await queryClient.fetchQuery({
        queryKey: predefinedRouteQueryKey(tour.id),
        queryFn: () => loadPredefinedRouteAsSelected(tour),
        staleTime: 1000 * 60 * 60,
      });
      onSelect(selected);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudo cargar la ruta",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoadingPredefinedId(null);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          side="bottom"
          className={cn(
            "z-120 mt-0 flex h-dvh max-h-dvh min-h-0 flex-col gap-0 overflow-hidden rounded-none bg-card p-0",
            drawerSafeAreaBottom,
          )}
          overlayClassName="z-120"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DrawerHeader className="shrink-0 border-b border-border text-left">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <DrawerTitle>Rutas</DrawerTitle>
                <DrawerDescription>Elige una ruta para seguirla en el mapa.</DrawerDescription>
              </div>
              <CreateRouteMenuButton onChoose={openCreate} className="shrink-0 rounded-full" />
            </div>
          </DrawerHeader>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabId)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0 border-b border-border px-4 py-2">
              <AnimatedTabsList value={tab} className={cn(pillTabsListClass, "w-full")}>
                <TabsTrigger value="predefined" className={cn(pillTabsTriggerClass, "flex-1")}>
                  Predefinidas
                </TabsTrigger>
                <TabsTrigger value="mine" className={cn(pillTabsTriggerClass, "flex-1")}>
                  Mis rutas
                </TabsTrigger>
              </AnimatedTabsList>
            </div>

            <TabsContent
              value="predefined"
              ref={predefinedScrollRef}
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 py-3 data-[state=inactive]:hidden"
            >
              {!hasPredefinedSports ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Bookmark className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">
                    No hay rutas predefinidas para este deporte. Prueba running, walking o cycling.
                  </p>
                </div>
              ) : predefinedLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-52 w-full rounded-xl" />
                  <Skeleton className="h-52 w-full rounded-xl" />
                </div>
              ) : predefinedError ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No se pudo cargar el catálogo de rutas.
                </p>
              ) : !predefinedList.length ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No hay rutas predefinidas para este deporte.
                </p>
              ) : (
                <>
                  <ul className="space-y-3">
                    {selectedRouteId && onClear ? (
                      <li>
                        <ClearSelectedButton onClear={onClear} onOpenChange={onOpenChange} />
                      </li>
                    ) : null}
                    {predefinedPage.visible.map((tour) => {
                      const id = predefinedRouteId(tour.id);
                      return (
                        <PredefinedRouteCard
                          key={tour.id}
                          tour={tour}
                          selected={id === selectedRouteId}
                          selecting={loadingPredefinedId === tour.id}
                          disabled={!!loadingPredefinedId}
                          onSelect={() => void onSelectPredefined(tour)}
                        />
                      );
                    })}
                  </ul>
                  <InfiniteLoadSentinel
                    rootRef={predefinedScrollRef}
                    hasMore={predefinedPage.hasMore}
                    onLoadMore={predefinedPage.loadMore}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent
              value="mine"
              ref={mineScrollRef}
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 py-3 data-[state=inactive]:hidden"
            >
              {savedLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-52 w-full rounded-xl" />
                  <Skeleton className="h-52 w-full rounded-xl" />
                </div>
              ) : !myRoutes.length ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Route className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">
                    Aún no tienes rutas para este deporte. Traza una en el mapa, importa un archivo
                    GPS o guárdala desde el detalle de una sesión.
                  </p>
                  <CreateRouteMenuButton onChoose={openCreate} size="default" />
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {selectedRouteId && onClear ? (
                      <li>
                        <ClearSelectedButton onClear={onClear} onOpenChange={onOpenChange} />
                      </li>
                    ) : null}
                    {minePage.visible.map((route) => (
                      <MineRouteCard
                        key={route.id}
                        route={route}
                        selected={route.id === selectedRouteId}
                        onSelect={() => onSelectMine(route)}
                        onDelete={(e) => void onDelete(route.id, e)}
                      />
                    ))}
                  </ul>
                  <InfiniteLoadSentinel
                    rootRef={mineScrollRef}
                    hasMore={minePage.hasMore}
                    onLoadMore={minePage.loadMore}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>

      <CreateRouteSheet
        open={createOpen}
        initialMode={createMode}
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
