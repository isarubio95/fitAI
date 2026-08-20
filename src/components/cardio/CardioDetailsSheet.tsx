import { Suspense, lazy, useMemo, useState } from "react";
import { Heart, MapPinned } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCardioSessionById } from "@/hooks/useCardioSessions";
import {
  defaultRouteNameFromSession,
  useSaveCardioRouteFromSession,
} from "@/hooks/useSavedCardioRoutes";
import { useToast } from "@/hooks/use-toast";
import { firstNested } from "@/lib/firstNested";
import {
  computeCardioSessionMetrics,
  extractCardioTrackPoints,
  sessionHasRoute,
} from "@/lib/cardioSessionDisplay";
import {
  formatCardioDistanceM,
  formatCardioDuration,
  formatCardioElevationM,
  formatPaceSec500m,
  formatPaceSecKm,
  formatSpeedKmh,
} from "@/lib/cardioFormat";
import { resolveCardioSessionIcon } from "@/lib/cardioIcons";
import { formatActivityAbsoluteDate } from "@/lib/formatActivityRelativeDate";
import { CardioStartMetaRow } from "@/components/cardio/CardioStartMetaRow";
import { cn } from "@/lib/utils";

const CardioRouteMap = lazy(() =>
  import("@/components/cardio/CardioRouteMap").then((m) => ({ default: m.CardioRouteMap })),
);

type CardioDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
};

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0 rounded-xl bg-muted/40 px-3 py-3 text-left">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function CardioDetailsSheet({ open, onOpenChange, sessionId }: CardioDetailsSheetProps) {
  const { data: session, isLoading } = useCardioSessionById(open ? sessionId : null);
  const saveRoute = useSaveCardioRouteFromSession();
  const { toast } = useToast();
  const [savingRoute, setSavingRoute] = useState(false);

  const metrics = useMemo(
    () => (session ? computeCardioSessionMetrics(session) : null),
    [session],
  );
  const hasRoute = session ? sessionHasRoute(session) : false;
  const mapPoints = useMemo(
    () => (session && hasRoute ? extractCardioTrackPoints(session) : []),
    [session, hasRoute],
  );
  const Icon = session ? resolveCardioSessionIcon(session) : null;
  const running = session ? firstNested(session.cardio_sesion_running) : null;
  const cycling = session ? firstNested(session.cardio_sesion_cycling) : null;

  const onSaveRoute = async () => {
    if (!session || !hasRoute) return;
    setSavingRoute(true);
    try {
      await saveRoute.mutateAsync({
        session,
        nombre: defaultRouteNameFromSession(session),
      });
      toast({ title: "Ruta guardada", description: "La encontrarás junto al Play al iniciar cardio." });
    } catch (err) {
      toast({
        title: "No se pudo guardar la ruta",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSavingRoute(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "flex max-h-[92dvh] flex-col gap-0 overflow-hidden bg-card p-0",
          drawerSafeAreaBottom,
        )}
      >
        <DrawerHeader className="shrink-0 border-b border-border bg-card px-6 pb-4 pt-4 text-left">
          {isLoading || !session || !metrics || !Icon ? (
            <>
              <DrawerTitle>Cardio</DrawerTitle>
              <DrawerDescription className="sr-only">Cargando sesión</DrawerDescription>
              <Skeleton className="mt-2 h-6 w-2/3" />
            </>
          ) : (
            <>
              <div className="min-w-0 space-y-1">
                <DrawerTitle className="text-lg leading-tight">{session.titulo}</DrawerTitle>
                <DrawerDescription className={session.fecha_inicio ? "mt-0 sr-only" : "sr-only"}>
                  {session.fecha_inicio
                    ? formatActivityAbsoluteDate(session.fecha_inicio)
                    : "Detalle de cardio"}
                </DrawerDescription>
                <CardioStartMetaRow session={session} dateTime={session.fecha_inicio} />
              </div>
            </>
          )}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-card py-4">
          {isLoading || !session || !metrics ? (
            <div className="space-y-3 px-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start gap-2 px-4">
                <StatBlock label="Tiempo" value={formatCardioDuration(metrics.durationSec)} />
                <StatBlock
                  label="Distancia"
                  value={metrics.distanceM > 0 ? formatCardioDistanceM(metrics.distanceM) : "—"}
                />
                <StatBlock
                  label="Desnivel"
                  value={metrics.elevationM > 0 ? `↑${formatCardioElevationM(metrics.elevationM)}` : "—"}
                />
                {metrics.paceKind === "km" ? (
                  <StatBlock label="Ritmo" value={formatPaceSecKm(metrics.paceSec)} />
                ) : null}
                {metrics.paceKind === "500m" ? (
                  <StatBlock label="Ritmo" value={formatPaceSec500m(metrics.paceSec)} />
                ) : null}
                {metrics.speedMps != null ? (
                  <StatBlock label="Velocidad" value={formatSpeedKmh(metrics.speedMps)} />
                ) : null}
                {metrics.fcMedia != null ? (
                  <StatBlock label="FC media" value={`${metrics.fcMedia} bpm`} />
                ) : null}
                {metrics.fcMax != null ? (
                  <StatBlock label="FC máx" value={`${metrics.fcMax} bpm`} />
                ) : null}
                {metrics.calorias != null ? (
                  <StatBlock label="Calorías" value={`${Math.round(metrics.calorias)}`} />
                ) : null}
              </div>

              {(metrics.fcMedia != null || metrics.fcMax != null) && (
                <p className="flex items-center gap-2 px-6 text-sm tabular-nums text-muted-foreground">
                  <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  {metrics.fcMedia != null ? (
                    <span>
                      Media <span className="font-semibold text-foreground">{metrics.fcMedia}</span> bpm
                    </span>
                  ) : null}
                  {metrics.fcMax != null ? (
                    <span>
                      · Máx <span className="font-semibold text-foreground">{metrics.fcMax}</span> bpm
                    </span>
                  ) : null}
                </p>
              )}

              {hasRoute ? (
                <div className="overflow-hidden">
                  <Suspense fallback={<div className="map-route-skeleton relative h-64 w-full" aria-hidden />}>
                    <CardioRouteMap
                      points={mapPoints}
                      interactive
                      cameraKey={session.id}
                      className="h-64 w-full"
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="mx-6 flex items-center gap-4 rounded-2xl bg-muted/30 px-4 py-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-sm">
                    {Icon ? <Icon className="h-8 w-8" aria-hidden /> : null}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Sin recorrido GPS</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Métricas de la sesión (estilo indoor / sin mapa).
                    </p>
                  </div>
                </div>
              )}

              {running ? (
                <div className="mx-6 rounded-xl border border-border/40 p-3 text-sm">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Running
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {running.cadencia_media_spm != null ? (
                      <li>
                        Cadencia:{" "}
                        <span className="font-medium text-foreground">
                          {running.cadencia_media_spm} spm
                        </span>
                      </li>
                    ) : null}
                    {running.zancada_media_cm != null ? (
                      <li>
                        Zancada:{" "}
                        <span className="font-medium text-foreground">
                          {running.zancada_media_cm} cm
                        </span>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {cycling ? (
                <div className="mx-6 rounded-xl border border-border/40 p-3 text-sm">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cycling
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {cycling.potencia_media_w != null ? (
                      <li>
                        Potencia media:{" "}
                        <span className="font-medium text-foreground">
                          {cycling.potencia_media_w} W
                        </span>
                      </li>
                    ) : null}
                    {cycling.potencia_normalizada_w != null ? (
                      <li>
                        Potencia NP:{" "}
                        <span className="font-medium text-foreground">
                          {cycling.potencia_normalizada_w} W
                        </span>
                      </li>
                    ) : null}
                    {cycling.cadencia_media_rpm != null ? (
                      <li>
                        Cadencia:{" "}
                        <span className="font-medium text-foreground">
                          {cycling.cadencia_media_rpm} rpm
                        </span>
                      </li>
                    ) : null}
                    {cycling.tipo_bici ? (
                      <li>
                        Bici: <span className="font-medium text-foreground">{cycling.tipo_bici}</span>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {session.comentarios?.trim() ? (
                <div className="mx-6 rounded-xl bg-muted/30 p-3 text-left">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Notas
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{session.comentarios.trim()}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {hasRoute && session ? (
          <div className="shrink-0 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              className="w-full"
              variant="secondary"
              disabled={savingRoute || saveRoute.isPending}
              onClick={() => void onSaveRoute()}
            >
              <MapPinned className="h-4 w-4" />
              {savingRoute || saveRoute.isPending ? "Guardando…" : "Guardar ruta"}
            </Button>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
