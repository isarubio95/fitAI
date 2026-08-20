import { Bookmark, Loader2, PencilLine, Plus, Route, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { RouteListFiltersBar } from "@/components/cardio/RouteListFiltersBar";
import { RouteMapThumb } from "@/components/cardio/RouteMapThumb";
import {
  attachCardioRutaPreviews,
  fetchCardioRutaAsSelected,
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
import {
  applyRouteListFilters,
  DEFAULT_ROUTE_LIST_FILTERS,
  type RouteListFilters,
} from "@/lib/routeListFilters";
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

const ROUTE_THUMB_BOX = "relative min-h-28 w-36 shrink-0 self-stretch overflow-hidden";

function RouteListCardSkeleton() {
  return (
    <div className="flex w-full overflow-hidden rounded-xl border border-border/40 bg-card">
      <Skeleton className="h-28 w-36 shrink-0 rounded-none" />
      <div className="min-w-0 flex-1 space-y-2 p-3">
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function routeListCardClass(selected: boolean) {
  return cn(
    "w-full max-w-none overflow-hidden rounded-xl border bg-card shadow-none transition-colors hover:border-primary/50",
    selected ? "border-primary/50" : "border-border/40",
  );
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
      className="h-auto w-full justify-start rounded-xl border-border/40 bg-card px-3 py-3"
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
      <div
        className={cn(
          routeListCardClass(selected),
          "cursor-pointer",
          disabled && !selecting && "opacity-60",
        )}
        onClick={disabled ? undefined : onSelect}
      >
        <div className="flex min-h-28 items-stretch">
          <div className={ROUTE_THUMB_BOX}>
            <RouteMapThumb
              className="absolute inset-0 h-full w-full"
              points={data?.points}
              loading={isLoading}
            />
            {selecting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 items-center p-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{tour.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {routeMetaLine(tour.distanceM, tour.elevationUpM)}
                  {tour.visitors > 0 ? ` · ${tour.visitors} visitas` : ""}
                </p>
              </div>
              <button
                type="button"
                className="touch-styled inline-flex size-5 shrink-0 self-start items-center justify-center p-0 text-muted-foreground"
                aria-label="Guardar ruta"
                onClick={(e) => e.stopPropagation()}
              >
                <Bookmark className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function MineRouteCard({
  route,
  selected,
  selecting,
  previewLoading,
  onSelect,
  onDelete,
}: {
  route: CardioRutaWithPoints;
  selected: boolean;
  selecting: boolean;
  previewLoading: boolean;
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
      <div className={routeListCardClass(selected)}>
        <div className="flex min-h-28 items-stretch">
          <button
            type="button"
            className="touch-styled flex min-h-28 min-w-0 flex-1 items-stretch p-0 text-left"
            onClick={onSelect}
            disabled={selecting}
          >
            <div className={ROUTE_THUMB_BOX}>
              <RouteMapThumb
                className="absolute inset-0 h-full w-full"
                points={points}
                loading={previewLoading && points.length < 2}
              />
              {selecting ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 items-center p-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{route.nombre}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {routeMetaLine(route.distancia_total_m, route.elevacion_positiva_m)}
                </p>
              </div>
            </div>
          </button>
          <div className="flex shrink-0 items-center pr-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 text-destructive"
              aria-label="Eliminar ruta"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
  const [filters, setFilters] = useState<RouteListFilters>(DEFAULT_ROUTE_LIST_FILTERS);
  const [loadingPredefinedId, setLoadingPredefinedId] = useState<string | null>(null);
  const [loadingMineId, setLoadingMineId] = useState<string | null>(null);
  const justCreatedRef = useRef(false);
  const predefinedScrollRef = useRef<HTMLDivElement>(null);
  const mineScrollRef = useRef<HTMLDivElement>(null);

  const hasPredefinedSports = komootSportsForDiscipline(disciplinaCodigo).length > 0;
  const showCyclingSportFilter = disciplinaCodigo === "cycling";

  const myRoutes = useMemo(() => {
    const list = savedRoutes ?? [];
    if (!disciplinaId) return list;
    return list.filter(
      (r) => r.cardio_disciplina_id == null || r.cardio_disciplina_id === disciplinaId,
    );
  }, [savedRoutes, disciplinaId]);

  const predefinedFiltered = useMemo(() => {
    const list = predefinedRoutes ?? [];
    return applyRouteListFilters(
      list.map((t) => ({
        ...t,
        name: t.name,
        distanceM: t.distanceM,
        elevationUpM: t.elevationUpM,
      })),
      filters,
      {
        useDifficulty: true,
        useSport: showCyclingSportFilter,
        usePopularity: true,
      },
    );
  }, [predefinedRoutes, filters, showCyclingSportFilter]);

  const myRoutesFiltered = useMemo(() => {
    return applyRouteListFilters(
      myRoutes.map((r) => ({
        ...r,
        name: r.nombre,
        distanceM: r.distancia_total_m,
        elevationUpM: r.elevacion_positiva_m,
      })),
      filters,
      { useDifficulty: false, useSport: false, usePopularity: false },
    );
  }, [myRoutes, filters]);

  const filtersResetKey = [
    filters.q,
    filters.distance,
    filters.difficulty,
    filters.sort,
    filters.sport,
  ].join("|");

  const predefinedPage = usePagedWindow(predefinedFiltered, {
    pageSize: PAGE_SIZE,
    resetKey: `${disciplinaCodigo ?? "none"}:${open ? "1" : "0"}:${filtersResetKey}`,
  });
  const minePage = usePagedWindow(myRoutesFiltered, {
    pageSize: PAGE_SIZE,
    resetKey: `${disciplinaId ?? "none"}:${open ? "1" : "0"}:${filtersResetKey}`,
  });

  const minePreviewSlice = useMemo(() => {
    const end = Math.min(minePage.visibleCount + PAGE_SIZE, myRoutesFiltered.length);
    return myRoutesFiltered.slice(0, end);
  }, [minePage.visibleCount, myRoutesFiltered]);

  const minePreviewQuery = useQuery({
    queryKey: ["savedCardioRoutePreviews", minePreviewSlice.map((r) => r.id).join(",")],
    enabled: open && tab === "mine" && minePreviewSlice.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: () => attachCardioRutaPreviews(minePreviewSlice),
  });

  const minePreviewById = useMemo(
    () => new Map((minePreviewQuery.data ?? []).map((r) => [r.id, r])),
    [minePreviewQuery.data],
  );

  // Precarga el lote visible + el siguiente (10+10) para que al hacer scroll ya estén las capturas.
  useEffect(() => {
    if (!open || tab !== "predefined" || predefinedFiltered.length === 0) return;
    const end = Math.min(predefinedPage.visibleCount + PAGE_SIZE, predefinedFiltered.length);
    void prefetchPredefinedRouteThumbs(predefinedFiltered.slice(0, end), queryClient);
  }, [open, tab, predefinedFiltered, predefinedPage.visibleCount, queryClient]);

  useEffect(() => {
    if (!open || tab !== "mine" || !minePreviewQuery.data?.length) return;
    void prefetchMineRouteThumbs(minePreviewQuery.data);
  }, [open, tab, minePreviewQuery.data]);

  useEffect(() => {
    if (!open) setFilters(DEFAULT_ROUTE_LIST_FILTERS);
  }, [open]);

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

  const onSelectMine = async (route: CardioRutaWithPoints) => {
    if (selectedRouteId === route.id && onClear) {
      onClear();
      onOpenChange(false);
      return;
    }
    if (loadingMineId) return;
    setLoadingMineId(route.id);
    try {
      onSelect(await fetchCardioRutaAsSelected(route));
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudo cargar la ruta",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoadingMineId(null);
    }
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
      <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          side="right"
          className={cn(
            "z-120 flex h-full max-h-dvh w-full max-w-none flex-col gap-0 overflow-hidden border-0 bg-background p-0 shadow-none",
            drawerSafeAreaBottom,
          )}
          overlayClassName="z-120"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DrawerHeader className="shrink-0 border-b border-border px-4 pt-[calc(1.25rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
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

            <div className="shrink-0">
              <RouteListFiltersBar
                value={filters}
                onChange={setFilters}
                showDifficulty={tab === "predefined"}
                showSport={tab === "predefined" && showCyclingSportFilter}
              />
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
                <div className="space-y-2.5">
                  <RouteListCardSkeleton />
                  <RouteListCardSkeleton />
                </div>
              ) : predefinedError ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No se pudo cargar el catálogo de rutas.
                </p>
              ) : !(predefinedRoutes?.length) ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No hay rutas predefinidas para este deporte.
                </p>
              ) : !predefinedFiltered.length ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Ninguna ruta coincide con estos filtros.
                </p>
              ) : (
                <>
                  <ul className="space-y-2.5">
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
                <div className="space-y-2.5">
                  <RouteListCardSkeleton />
                  <RouteListCardSkeleton />
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
              ) : !myRoutesFiltered.length ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Ninguna ruta coincide con estos filtros.
                </p>
              ) : (
                <>
                  <ul className="space-y-2.5">
                    {selectedRouteId && onClear ? (
                      <li>
                        <ClearSelectedButton onClear={onClear} onOpenChange={onOpenChange} />
                      </li>
                    ) : null}
                    {minePage.visible.map((route) => {
                      const hydrated = minePreviewById.get(route.id) ?? route;
                      return (
                      <MineRouteCard
                        key={route.id}
                        route={hydrated}
                        selected={route.id === selectedRouteId}
                        selecting={loadingMineId === route.id}
                        previewLoading={minePreviewQuery.isFetching}
                        onSelect={() => void onSelectMine(hydrated)}
                        onDelete={(e) => void onDelete(route.id, e)}
                      />
                      );
                    })}
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
