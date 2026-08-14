import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { FileUp, Loader2, Route, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouteDraft } from "@/hooks/useRouteDraft";
import {
  defaultRouteNameFromPoints,
  useCreateCardioRoute,
  type NewCardioRoutePoint,
} from "@/hooks/useSavedCardioRoutes";
import { useToast } from "@/hooks/use-toast";
import {
  elevationGainM,
  formatCardioDistanceM,
  formatCardioElevationM,
} from "@/lib/cardioFormat";
import { polylineLengthM } from "@/lib/cardioRouteProgress";
import { ROUTE_FILE_ACCEPT, parseRouteFile, type ImportedRoute } from "@/lib/routeFileImport";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import {
  snapProfileForDiscipline,
  type SnapSurface,
} from "@/lib/routeSnapping";
import type { SelectedCardioRoute } from "@/types/cardio";
import { cn } from "@/lib/utils";

const SURFACE_OPTIONS: { value: SnapSurface; label: string }[] = [
  { value: "any", label: "Todos" },
  { value: "dirt", label: "Tierra" },
  { value: "asphalt", label: "Asfalto" },
];

const RouteDrawMap = lazy(() =>
  import("@/components/cardio/RouteDrawMap").then((m) => ({ default: m.RouteDrawMap })),
);
const CardioRouteMap = lazy(() =>
  import("@/components/cardio/CardioRouteMap").then((m) => ({ default: m.CardioRouteMap })),
);

export type CreateRouteMode = "draw" | "import";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cómo se abre el editor: dibujar en mapa o importar archivo. */
  initialMode?: CreateRouteMode;
  /** Disciplina con la que se asocia la ruta creada (la del setup de cardio). */
  defaultDisciplinaId?: string | null;
  /** Código de la disciplina: decide el perfil de enrutado (a pie / bici). */
  defaultDisciplinaCodigo?: string | null;
  onCreated?: (route: SelectedCardioRoute) => void;
};

function MapFallback() {
  return (
    <div className="flex h-full min-h-55 w-full items-center justify-center bg-muted/30">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}

function MetricsRow({
  distanceM,
  elevationM,
  pointCount,
}: {
  distanceM: number;
  elevationM: number;
  pointCount: number;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
      <span className="font-semibold text-foreground">
        {distanceM > 0 ? formatCardioDistanceM(distanceM) : "0 m"}
      </span>
      {elevationM > 0 ? <span>↑{formatCardioElevationM(elevationM)}</span> : null}
      <span>
        {pointCount} {pointCount === 1 ? "punto" : "puntos"}
      </span>
    </div>
  );
}

export function CreateRouteSheet({
  open,
  onOpenChange,
  initialMode = "draw",
  defaultDisciplinaId = null,
  defaultDisciplinaCodigo = null,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const createRoute = useCreateCardioRoute();
  const [mode, setMode] = useState<CreateRouteMode>(initialMode);
  const [nombre, setNombre] = useState("");
  /** Si el usuario (o un archivo importado) ya eligió nombre, no lo pisamos con la sugerencia. */
  const [nombreCustom, setNombreCustom] = useState(false);
  const [imported, setImported] = useState<ImportedRoute | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const snapProfile = useMemo(
    () => snapProfileForDiscipline(defaultDisciplinaCodigo),
    [defaultDisciplinaCodigo],
  );
  const drawing = useRouteDraft(snapProfile);

  const importedMetrics = useMemo(() => {
    if (!imported) return { distanceM: 0, elevationM: 0 };
    return {
      distanceM: polylineLengthM(imported.points),
      elevationM: elevationGainM(imported.points),
    };
  }, [imported]);

  const points: NewCardioRoutePoint[] = useMemo(
    () => (mode === "draw" ? drawing.storablePoints : (imported?.points ?? [])),
    [mode, drawing.storablePoints, imported],
  );
  const distanceM = mode === "draw" ? drawing.distanceM : importedMetrics.distanceM;
  const elevationM = mode === "draw" ? drawing.elevationGainM : importedMetrics.elevationM;
  const canSave = points.length >= 2 && !createRoute.isPending;

  const suggestedName = useMemo(
    () => (points.length >= 2 ? defaultRouteNameFromPoints(points) : ""),
    [points],
  );

  // Rellenamos el input con la sugerencia (editable). Solo se actualiza mientras no haya nombre custom.
  useEffect(() => {
    if (nombreCustom) return;
    setNombre(suggestedName);
  }, [suggestedName, nombreCustom]);

  // Al abrir, aplica el modo elegido en el menú de «Crear ruta».
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const reset = useCallback(() => {
    setNombre("");
    setNombreCustom(false);
    setImported(null);
    setImportError(null);
    setImporting(false);
    setDragActive(false);
    drawing.clear();
  }, [drawing]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) reset();
    },
    [onOpenChange, reset],
  );

  const close = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const onPickFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setImporting(true);
      setImportError(null);
      try {
        const route = await parseRouteFile(file);
        setImported(route);
        if (route.nombre) {
          setNombre(route.nombre);
          setNombreCustom(true);
        } else {
          setNombre((current) => {
            // Si el usuario ya escribió algo, lo respetamos; si no, sugerimos por distancia.
            if (current.trim()) return current;
            return defaultRouteNameFromPoints(route.points);
          });
        }
      } catch (err) {
        setImported(null);
        setImportError(err instanceof Error ? err.message : "No se pudo leer el archivo");
      } finally {
        setImporting(false);
      }
    },
    [],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      void onPickFile(e.dataTransfer.files?.[0]);
    },
    [onPickFile],
  );

  const onSave = useCallback(async () => {
    if (points.length < 2) return;
    try {
      const route = await createRoute.mutateAsync({
        points,
        nombre: nombre.trim() || undefined,
        cardio_disciplina_id: defaultDisciplinaId,
      });
      toast({ title: "Ruta guardada", description: route.nombre });
      onCreated?.(route);
      close();
    } catch (err) {
      toast({
        title: "No se pudo guardar la ruta",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  }, [points, createRoute, nombre, defaultDisciplinaId, toast, onCreated, close]);

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        side="bottom"
        className="z-130 mt-0 flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden rounded-none bg-card p-0"
        overlayClassName="z-130"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DrawerHeader className="shrink-0 border-b border-border/60 text-left">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full"
              onClick={close}
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <DrawerTitle className="truncate text-base">Nueva ruta</DrawerTitle>
              <DrawerDescription className="text-xs">
                {mode === "draw"
                  ? "Trázala tocando el mapa"
                  : "Importa un archivo GPS"}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {mode === "draw" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden border-b border-border/60">
              <Suspense fallback={<MapFallback />}>
                <RouteDrawMap
                  className="h-full w-full"
                  waypoints={drawing.waypoints}
                  path={drawing.path}
                  onAddPoint={drawing.addPoint}
                  onMoveWaypoint={drawing.moveWaypointTo}
                  onRemoveWaypoint={drawing.removeWaypointAt}
                  onUndo={drawing.undo}
                  onClear={drawing.clear}
                  onCloseLoop={drawing.closeLoop}
                  canUndo={drawing.canUndo}
                  canCloseLoop={drawing.canCloseLoop}
                  routing={drawing.routing}
                />
              </Suspense>
            </div>

            <div className="shrink-0 space-y-2 px-4 pt-3 pb-3">
              <div className="flex items-center justify-between gap-3">
                <MetricsRow
                  distanceM={distanceM}
                  elevationM={elevationM}
                  pointCount={drawing.waypoints.length}
                />
                {snapProfile ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <Label htmlFor="route-snap" className="text-xs text-muted-foreground">
                      Ajustar a caminos
                    </Label>
                    <Switch
                      id="route-snap"
                      checked={drawing.snapEnabled}
                      onCheckedChange={drawing.setSnapEnabled}
                    />
                  </div>
                ) : null}
              </div>
              {snapProfile && drawing.snapEnabled ? (
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label="Tipo de camino"
                >
                  {SURFACE_OPTIONS.map((option) => {
                    const active = drawing.surfacePreference === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          filterPillBase,
                          "px-3 py-1 text-xs",
                          active ? filterPillActive : filterPillInactive,
                        )}
                        aria-pressed={active}
                        onClick={() => drawing.setSurfacePreference(option.value)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {drawing.snapUnavailable && drawing.snapEnabled ? (
                <p className="text-xs text-amber-500">
                  No se pudo calcular el camino de algún tramo: quedó en línea recta.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-3 px-4 pt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ROUTE_FILE_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  void onPickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />

              {imported ? (
                <>
                  <div className="h-52 overflow-hidden rounded-xl border border-border/60">
                    <Suspense fallback={<MapFallback />}>
                      <CardioRouteMap points={imported.points} className="h-full w-full" interactive />
                    </Suspense>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <MetricsRow
                      distanceM={distanceM}
                      elevationM={elevationM}
                      pointCount={imported.points.length}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar archivo
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-border/70 bg-muted/20",
                  )}
                >
                  {importing ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <FileUp className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {importing ? "Leyendo archivo…" : "Importa un recorrido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Archivos GPX, TCX, KML o GeoJSON de Strava, Garmin, Wikiloc, Komoot…
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={importing}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              )}

              {importError ? <p className="text-xs text-destructive">{importError}</p> : null}
            </div>
          </div>
        )}

        <div className={cn("shrink-0 space-y-3 border-t border-border/60 px-4 pt-3", drawerSafeAreaBottom)}>
          <div className="space-y-1.5">
            <Label htmlFor="route-name" className="text-xs text-muted-foreground">
              Nombre
            </Label>
            <Input
              id="route-name"
              value={nombre}
              onChange={(e) => {
                setNombreCustom(true);
                setNombre(e.target.value);
              }}
              placeholder="Nombre de la ruta"
              maxLength={120}
              autoComplete="off"
              enterKeyHint="done"
            />
          </div>
          <Button
            type="button"
            className="w-full gap-2"
            disabled={!canSave}
            onClick={() => void onSave()}
          >
            {createRoute.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Route className="h-4 w-4" />
            )}
            Guardar ruta
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
