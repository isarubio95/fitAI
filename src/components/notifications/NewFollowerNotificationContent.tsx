import type { ReactNode } from "react";
import { User, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import { useFollows } from "@/hooks/useFollows";
import { cn } from "@/lib/utils";

function initialsFromUsername(username?: string | null) {
  if (!username) return "U";
  const parts = username.trim().split(/[\s_\\-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

type Props = {
  seguidorId: string;
  username: string | null;
  avatarUrl: string | null;
  /** Pills del dashboard: avatar algo más pequeño. */
  compact?: boolean;
  onAfterOpenProfile?: () => void;
  className?: string;
  /** P. ej. botón descartar a la derecha del botón Seguir. */
  trailing?: ReactNode;
};

export function NewFollowerNotificationContent({
  seguidorId,
  username,
  avatarUrl,
  compact,
  onAfterOpenProfile,
  className,
  trailing,
}: Props) {
  const { openUserProfile } = useProfileDrawer();
  const { followingIds, toggleFollow, isToggling } = useFollows();
  const displayName = username?.trim() || "Usuario";
  const isFollowing = followingIds.has(seguidorId);

  const openProfile = () => {
    openUserProfile(seguidorId);
    onAfterOpenProfile?.();
  };

  const HeaderIcon = username?.trim() ? UserPlus : User;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-start gap-2">
        <HeaderIcon
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-sm font-semibold leading-tight">Nuevo seguidor</p>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={openProfile}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring -m-1 p-1"
        >
          <Avatar className={cn("shrink-0", compact ? "h-10 w-10" : "h-11 w-11")}>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" className="object-cover" /> : null}
            <AvatarFallback className="text-xs font-semibold">{initialsFromUsername(username)}</AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">{displayName}</p>
        </button>

        <Button
          type="button"
          size="sm"
          variant={isFollowing ? "secondary" : "default"}
          className="h-9 shrink-0 self-center gap-1.5 px-3"
          disabled={isToggling.has(seguidorId)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void toggleFollow(seguidorId);
          }}
        >
          {isToggling.has(seguidorId) ? (
            "…"
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
        {trailing ? <div className="flex shrink-0 self-center">{trailing}</div> : null}
      </div>
    </div>
  );
}
