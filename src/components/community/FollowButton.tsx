import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { cn } from "@/lib/utils";

type FollowButtonProps = {
  userId: string;
  size?: "default" | "sm";
  className?: string;
};

export function FollowButton({ userId, size = "default", className }: FollowButtonProps) {
  const { user } = useAuth();
  const { followingIds, toggleFollow, isToggling, isFetched } = useFollows();

  if (!user || user.id === userId) return null;

  const isFollowing = followingIds.has(userId);
  const pending = isToggling.has(userId);

  return (
    <Button
      type="button"
      size={size}
      variant={isFollowing ? "secondary" : "default"}
      disabled={pending || !isFetched}
      aria-pressed={isFollowing}
      aria-busy={pending}
      aria-label={isFollowing ? "Dejar de seguir" : "Seguir"}
      className={cn(
        "shrink-0",
        isFollowing && "bg-border hover:bg-border/80 dark:hover:bg-border/90",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleFollow(userId);
      }}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <span className="flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 shrink-0" />
          Siguiendo
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <UserPlus className="h-4 w-4 shrink-0" />
          Seguir
        </span>
      )}
    </Button>
  );
}
