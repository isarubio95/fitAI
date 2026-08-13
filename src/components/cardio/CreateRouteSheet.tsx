import { Suspense, lazy, useCallback, useMemo, useRef, useState, type DragEvent } from "react";
import { FileUp, Loader2, PencilLine, Route, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
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
import { snapProfileForDiscipline } from "@/lib/routeSnapping";
import type { SelectedCardioRoute } from "@/types/cardio";
import { cn } from "@/lib/utils";

const RouteDrawMap = lazy(() =>
  import("@/components/cardio/RouteDrawMap").then((m) => ({ default: m.RouteDrawMap })),
);
const CardioRouteMap = lazy(() =>
  import("@/components/cardio/CardioRouteMap").then((m) => ({ default: m.CardioRouteMap })),
);

type Mode = "draw" | "import";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  defaultDisciplinaId = null,
  defaultDisciplinaCodigo = null,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const createRoute = useCreateCardioRoute();
  const [mode, setMode] = useState<Mode>("draw");
  const [nombre, setNombre] = useState("");
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

  useBackCloseLayer({ open, onOpenChange, kind: "sheet" });

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

  const reset = useCallback(() => {
    setNombre("");
    setImported(null);
    setImportError(null);
    setImporting(false);
    setDragActive(false);
    drawing.clear();
  }, [drawing]);

  const close = useCallback(() => {
    onOpenChange(false);
    reset();
  }, [onOpenChange, reset]);

  const onPickFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setImporting(true);
      setImportError(null);
      try {
        const route = await parseRouteFile(file);
        setImported(route);
        setNombre((current) => current || route.nombre || "");
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

  if (!open) return null;

  const namePlaceholder = points.length >= 2 ? defaultRouteNameFromPoints(points) : "Mi ruta";

  return (
    <div
      // `pointer-events-auto`: se abre desde un drawer que bloquea el body al cerrarse.
      className="pointer-events-auto fixed inset-0 z-130 flex flex-col bg-card text-card-foreground"
      role="dialog"
      aria-modal="true"
      aria-label="Nueva ruta"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
          <p className="truncate text-base font-semibold tracking-tight">Nueva ruta</p>
          <p className="text-xs text-muted-foreground">
            Trázala en el mapa o importa un archivo GPS
          </p>
        </div>
      </header>

      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as Mode)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 px-4 pt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="gap-1.5">
              <PencilLine className="h-4 w-4" />
              Dibujar
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="draw"
          className="mt-3 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
        >
          <div className="min-h-0 flex-1 overflow-hidden border-y border-border/60">
            <Suspense fallback={<MapFallback />}>
              <RouteDrawMap
                className="h-full w-full"
                waypoints={drawing.waypoints}
                path={drawing.path}
                onAddPoint={drawing.addPoint}
                onMoveWaypoint={drawing.moveWaypointTo}
                onUndo={drawing.undo}
                onClear={drawing.clear}
                onCloseLoop={drawing.closeLoop}
                canUndo={drawing.canUndo}
                canCloseLoop={drawing.canCloseLoop}
                routing={drawing.routing}
              />
            </Suspense>
          </div>

          <div className="shrink-0 space-y-2 px-4 pt-3">
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
            {drawing.snapUnavailable && drawing.snapEnabled ? (
              <p className="text-xs text-amber-500">
                No se pudo calcular el camino de algún tramo: quedó en línea recta.
              </p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent
          value="import"
          className="mt-3 min-h-0 flex-1 overflow-y-auto data-[state=inactive]:hidden"
        >
          <div className="space-y-3 px-4">
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
        </TabsContent>
      </Tabs>

      <div className="shrink-0 space-y-3 border-t border-border/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="space-y-1.5">
          <Label htmlFor="route-name" className="text-xs text-muted-foreground">
            Nombre
          </Label>
          <Input
            id="route-name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={namePlaceholder}
            maxLength={120}
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
    </div>
  );
}
