import { Suspense, lazy, useMemo } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  COMMUNITY_CARD_CLASS,
  CommunityAvatar,
  WORKOUT_COMPACT_CARD_CLASS,
  type WorkoutFeedCardAuthor,
} from "@/components/dashboard/WorkoutFeedCard";
import { CardioStartMetaRow } from "@/components/cardio/CardioStartMetaRow";
import { formatActivityAbsoluteDate } from "@/lib/formatActivityRelativeDate";
import {
  computeCardioSessionMetrics,
  extractCardioTrackPointsForFeed,
  sessionHasRoute,
  type CardioSesionWithDetails,
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
import { cn } from "@/lib/utils";

const CardioRouteMap = lazy(() =>
  import("@/components/cardio/CardioRouteMap").then((m) => ({ default: m.CardioRouteMap })),
);

type CardioFeedCardBodyProps = {
  session: CardioSesionWithDetails;
  author?: WorkoutFeedCardAuthor;
  onSelectSession: (sessionId: string) => void;
  onSelectAuthor?: (authorId: string) => void;
};

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0 text-left">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function CardioFeedCompactContent({
  session,
  hideDate,
}: {
  session: CardioSesionWithDetails;
  hideDate?: boolean;
}) {
  const metrics = useMemo(() => computeCardioSessionMetrics(session), [session]);
  const hasRoute = sessionHasRoute(session);
  const mapPoints = useMemo(
    () => (hasRoute ? extractCardioTrackPointsForFeed(session) : []),
    [hasRoute, session],
  );
  const Icon = resolveCardioSessionIcon(session);

  const paceOrSpeed =
    metrics.paceKind === "500m"
      ? formatPaceSec500m(metrics.paceSec)
      : metrics.paceKind === "km"
        ? formatPaceSecKm(metrics.paceSec)
        : metrics.speedMps != null
          ? formatSpeedKmh(metrics.speedMps)
          : null;

  return (
    <CardContent className="space-y-3 p-0">
      <div className="min-w-0 space-y-1 px-6">
        <p className="truncate text-base font-semibold leading-tight">{session.titulo}</p>
        {!hideDate && session.fecha_inicio ? (
          <time dateTime={session.fecha_inicio} className="block text-xs text-muted-foreground">
            {formatActivityAbsoluteDate(session.fecha_inicio)}
          </time>
        ) : null}
        {/* Si no hay autor, el momento va aquí y debajo icono + ubicación. */}
        {!hideDate ? <CardioStartMetaRow session={session} /> : null}
      </div>

      <div className="flex flex-wrap items-start gap-x-8 gap-y-2 px-6">
        <MetricCell label="Tiempo" value={formatCardioDuration(metrics.durationSec)} />
        <MetricCell
          label="Distancia"
          value={metrics.distanceM > 0 ? formatCardioDistanceM(metrics.distanceM) : "—"}
        />
        <MetricCell
          label={metrics.paceKind || metrics.speedMps != null ? (metrics.paceKind ? "Ritmo" : "Velocidad") : "Desnivel"}
          value={
            paceOrSpeed && paceOrSpeed !== "—"
              ? paceOrSpeed
              : metrics.elevationM > 0
                ? `↑${formatCardioElevationM(metrics.elevationM)}`
                : "—"
          }
        />
      </div>

      {metrics.fcMedia != null || metrics.fcMax != null ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 text-xs tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <Heart className="h-3 w-3" />
            {metrics.fcMedia != null ? (
              <span>
                Media <span className="font-semibold text-foreground">{metrics.fcMedia}</span> bpm
              </span>
            ) : null}
          </span>
          {metrics.fcMax != null ? (
            <span>
              Máx <span className="font-semibold text-foreground">{metrics.fcMax}</span> bpm
            </span>
          ) : null}
        </p>
      ) : null}

      {hasRoute ? (
        <div className="overflow-hidden">
          <Suspense fallback={<div className="h-56 w-full animate-pulse bg-muted/40" />}>
            <CardioRouteMap points={mapPoints} interactive={false} className="h-56 w-full" />
          </Suspense>
        </div>
      ) : (
        <div className="mx-6 flex items-center gap-4 rounded-xl bg-muted/30 px-4 py-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 text-foreground shadow-sm">
            <Icon className="h-7 w-7" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Sin recorrido GPS</p>
            <p className="mt-1 text-sm text-muted-foreground">Sesión sin mapa de ruta.</p>
          </div>
        </div>
      )}
    </CardContent>
  );
}

export function CardioFeedCardBody({
  session,
  author,
  onSelectSession,
  onSelectAuthor,
}: CardioFeedCardBodyProps) {
  return (
    <>
      {author ? (
        <div className="mb-4 flex items-start gap-3 px-6">
          <button
            type="button"
            onClick={() => onSelectAuthor?.(author.id)}
            className="shrink-0 self-start rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Ver perfil de ${author.username ?? "usuario"}`}
          >
            <CommunityAvatar
              avatarUrl={author.avatar_url}
              username={author.username}
              className="h-9 w-9"
            />
          </button>
          {/* -mt-0.5: la caja tipográfica deja aire sobre el glifo; sin esto el username parece más bajo que el avatar */}
          <div className="-mt-0.5 flex min-w-0 flex-1 flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onSelectAuthor?.(author.id)}
              className="block w-full truncate text-left text-sm font-semibold leading-none outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {author.username}
            </button>
            {session.fecha_inicio ? (
              <time
                dateTime={session.fecha_inicio}
                className="block text-xs leading-none text-muted-foreground"
              >
                {formatActivityAbsoluteDate(session.fecha_inicio)}
              </time>
            ) : null}
            <CardioStartMetaRow session={session} />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onSelectSession(session.id)}
        aria-label={`Ver detalle de ${session.titulo}`}
      >
        <Card className={WORKOUT_COMPACT_CARD_CLASS}>
          <CardioFeedCompactContent session={session} hideDate={!!author} />
        </Card>
      </button>
    </>
  );
}

type CardioFeedCardProps = CardioFeedCardBodyProps & {
  className?: string;
};

export function CardioFeedCard({ className, ...bodyProps }: CardioFeedCardProps) {
  return (
    <Card className={cn(COMMUNITY_CARD_CLASS, className)}>
      <CardContent className="space-y-4 px-0 pb-4 pt-6">
        <CardioFeedCardBody {...bodyProps} />
      </CardContent>
    </Card>
  );
}
