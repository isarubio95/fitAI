import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ActivitySocialActions,
  type ActivitySocialStatsProps,
} from "@/components/community/ActivitySocialActions";
import { WorkoutDetailsContent } from "@/components/dashboard/WorkoutDetailsSheet";
import { GymStartMetaRow } from "@/components/dashboard/GymStartMetaRow";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { cn } from "@/lib/utils";
import type { ActividadWithDetails } from "@/types/workout";

/** Card exterior del feed: plena en móvil, redondeada con borde en escritorio. */
export const COMMUNITY_CARD_CLASS =
  "w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20";

/** Card interior compacta del entrenamiento: plana, sin borde ni sombra, con hover. */
export const WORKOUT_COMPACT_CARD_CLASS =
  "w-full max-w-none overflow-hidden border-0 rounded-none shadow-none transition-colors hover:bg-muted/30";

export type WorkoutFeedCardAuthor = {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
};

/** Stats de like/comentario inyectados desde el padre (batch). */
export type WorkoutFeedCardSocial = Omit<
  ActivitySocialStatsProps,
  "kind" | "targetId" | "ownerId" | "className"
>;

function initialsFromUsername(username?: string | null) {
  return username?.trim()?.[0]?.toUpperCase() || "U";
}

export function CommunityAvatar({
  avatarUrl,
  username,
  className,
}: {
  avatarUrl?: string | null;
  username?: string | null;
  className: string;
}) {
  const avatar = useUserAvatar([avatarUrl]);
  return (
    <Avatar className={className}>
      {avatar.src ? <AvatarImage src={avatar.src} alt="" onError={avatar.onError} /> : null}
      <AvatarFallback>{initialsFromUsername(username)}</AvatarFallback>
    </Avatar>
  );
}

type WorkoutFeedCardBodyProps = {
  workout: ActividadWithDetails;
  author?: WorkoutFeedCardAuthor;
  onSelectWorkout: (workoutId: string) => void;
  onSelectAuthor?: (authorId: string) => void;
  social?: WorkoutFeedCardSocial | null;
};

/**
 * Cuerpo de la tarjeta de entrenamiento del feed: fila de autor opcional +
 * resumen compacto pulsable. Cuando hay autor, la fecha va en la fila del autor
 * (se oculta en el resumen); sin autor, la fecha se muestra dentro del resumen.
 */
export function WorkoutFeedCardBody({
  workout,
  author,
  onSelectWorkout,
  onSelectAuthor,
  social,
}: WorkoutFeedCardBodyProps) {
  const showSocial = !!social && workout.es_publica;
  const ownerId = author?.id ?? workout.usuario_id;

  return (
    <>
      {author ? (
        <div className="mb-4 flex items-start gap-3">
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
            {workout.fecha || workout.gimnasio_nombre ? (
              <GymStartMetaRow
                dateTime={workout.fecha}
                gymName={workout.gimnasio_nombre}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onSelectWorkout(workout.id)}
        aria-label={`Ver detalle de ${workout.titulo}`}
      >
        <Card className={WORKOUT_COMPACT_CARD_CLASS}>
          <WorkoutDetailsContent workout={workout} variant="compact" hideDate={!!author} />
        </Card>
      </button>

      {showSocial ? (
        <ActivitySocialActions
          kind="gym"
          targetId={workout.id}
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
      ) : null}
    </>
  );
}

type WorkoutFeedCardProps = WorkoutFeedCardBodyProps & {
  className?: string;
};

/** Tarjeta de entrenamiento completa del feed (Comunidad y drawer de perfil). */
export function WorkoutFeedCard({ className, ...bodyProps }: WorkoutFeedCardProps) {
  return (
    <Card className={cn(COMMUNITY_CARD_CLASS, className)}>
      <CardContent className="space-y-4 px-6 pb-4 pt-6">
        <WorkoutFeedCardBody {...bodyProps} />
      </CardContent>
    </Card>
  );
}
