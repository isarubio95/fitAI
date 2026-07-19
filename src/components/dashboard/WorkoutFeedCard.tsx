import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutDetailsContent } from "@/components/dashboard/WorkoutDetailsSheet";
import { formatActivityRelativeDate } from "@/lib/formatActivityRelativeDate";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { cn } from "@/lib/utils";
import type { ActividadWithDetails } from "@/types/workout";

/** Card exterior del feed: plena en móvil, redondeada con borde en escritorio. */
export const COMMUNITY_CARD_CLASS =
  "w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20";

/** Card interior compacta del entrenamiento: plana, sin borde, con hover. */
export const WORKOUT_COMPACT_CARD_CLASS =
  "w-full max-w-none overflow-hidden border-0 rounded-none transition-colors hover:bg-muted/30";

export type WorkoutFeedCardAuthor = {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
};

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
}: WorkoutFeedCardBodyProps) {
  return (
    <>
      {author ? (
        <button
          type="button"
          onClick={() => onSelectAuthor?.(author.id)}
          className="-m-1 mb-4 flex w-full min-w-0 items-center gap-3 rounded-lg pt-2 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Ver perfil de ${author.username ?? "usuario"}`}
        >
          <CommunityAvatar
            avatarUrl={author.avatar_url}
            username={author.username}
            className="h-9 w-9 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{author.username}</p>
            {workout.fecha ? (
              <time dateTime={workout.fecha} className="block text-xs text-muted-foreground">
                {formatActivityRelativeDate(workout.fecha)}
              </time>
            ) : null}
          </div>
        </button>
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
      <CardContent className="space-y-4 px-6 py-4">
        <WorkoutFeedCardBody {...bodyProps} />
      </CardContent>
    </Card>
  );
}
