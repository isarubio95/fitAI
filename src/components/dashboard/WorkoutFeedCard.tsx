import { Card, CardContent } from "@/components/ui/card";
import {
  ActivitySocialActions,
  type ActivitySocialStatsProps,
} from "@/components/community/ActivitySocialActions";
import { WorkoutDetailsContent } from "@/components/dashboard/WorkoutDetailsSheet";
import { GymStartMetaRow } from "@/components/dashboard/GymStartMetaRow";
import { UserAvatar as CommunityAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import type { ActividadWithDetails } from "@/types/workout";
import { PAGE_CARD } from "@/lib/pageStyles";

/** Card exterior del feed: superficie de página compartida. */
export const COMMUNITY_CARD_CLASS = PAGE_CARD;

/** Card interior compacta: transparente para heredar el fondo de la card exterior (sin corte de color). */
export const WORKOUT_COMPACT_CARD_CLASS =
  "w-full max-w-none overflow-hidden rounded-none border-0 bg-transparent shadow-none";

/** Padding del CardContent exterior: el cuerpo pinta px-6 por tramo para poder ir a sangre (mapa). */
export const FEED_CARD_CONTENT_CLASS = "space-y-4 px-0 pb-4 pt-6";

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

export { CommunityAvatar };

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
        <div className="px-6">
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
        </div>
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
      <CardContent className={FEED_CARD_CONTENT_CLASS}>
        <WorkoutFeedCardBody {...bodyProps} />
      </CardContent>
    </Card>
  );
}
