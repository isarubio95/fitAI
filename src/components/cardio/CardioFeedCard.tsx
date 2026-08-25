import { Suspense, lazy, useMemo } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ActivitySocialActions,
  type ActivitySocialStatsProps,
} from "@/components/community/ActivitySocialActions";
import {
  COMMUNITY_CARD_CLASS,
  CommunityAvatar,
  FEED_CARD_CONTENT_CLASS,
  WORKOUT_COMPACT_CARD_CLASS,
  type WorkoutFeedCardAuthor,
} from "@/components/dashboard/WorkoutFeedCard";
import { CardioStartMetaRow } from "@/components/cardio/CardioStartMetaRow";
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
  social?: CardioFeedCardSocial | null;
};

/** Stats de like/comentario inyectados desde el padre (batch). */
export type CardioFeedCardSocial = Omit<
  ActivitySocialStatsProps,
  "kind" | "targetId" | "ownerId" | "className"
>;

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
      <div className="min-w-0 space-y-1 px-5">
        <p className="truncate text-base font-semibold leading-tight">{session.titulo}</p>
        {/* Si no hay autor: fecha (+ icono alineado si no hay ciudad) / icono + ubicación. */}
        {!hideDate ? (
          <CardioStartMetaRow session={session} dateTime={session.fecha_inicio} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-start gap-x-8 gap-y-2 px-5">
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
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 text-xs tabular-nums text-muted-foreground">
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
          <Suspense fallback={<div className="map-route-skeleton relative h-56 w-full" aria-hidden />}>
            <CardioRouteMap points={mapPoints} interactive={false} className="h-56 w-full" />
          </Suspense>
        </div>
      ) : (
        <div className="mx-5 flex items-center gap-4 px-0 py-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-foreground">
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
  social,
}: CardioFeedCardBodyProps) {
  const showSocial = !!social;
  const ownerId = author?.id ?? session.usuario_id;

  return (
    <>
      {author ? (
        <div className="mb-4 flex items-start gap-3 px-5">
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
            <CardioStartMetaRow session={session} dateTime={session.fecha_inicio} />
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

      {showSocial ? (
        <div className="px-5">
          <ActivitySocialActions
            kind="cardio"
            targetId={session.id}
            ownerId={ownerId}
            likeCount={social.likeCount}
            liked={social.liked}
            commentCount={social.commentCount}
            commented={social.commented}
            onToggleLike={social.onToggleLike}
            isTogglingLike={social.isTogglingLike}
            defaultCommentsOpen={social.defaultCommentsOpen}
            className="pt-1"
          />
        </div>
      ) : null}
    </>
  );
}

type CardioFeedCardProps = CardioFeedCardBodyProps & {
  className?: string;
};

export function CardioFeedCard({ className, ...bodyProps }: CardioFeedCardProps) {
  return (
    <Card className={cn(COMMUNITY_CARD_CLASS, className)}>
      <CardContent className={FEED_CARD_CONTENT_CLASS}>
        <CardioFeedCardBody {...bodyProps} />
      </CardContent>
    </Card>
  );
}
