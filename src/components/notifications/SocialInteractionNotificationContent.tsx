import type { ReactNode } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { navigateFromInAppToast } from "@/lib/inAppToastNavigation";
import {
  socialInteractionAuthorName,
  socialInteractionCommentPreview,
  socialInteractionTargetLabel,
  socialInteractionTitle,
} from "@/lib/socialInteractionNotification";
import { cn } from "@/lib/utils";
import type {
  SocialInteractionTargetType,
  SocialInteractionType,
} from "@/types/inAppNotification";

function initialsFromUsername(username?: string | null) {
  return username?.trim()?.[0]?.toUpperCase() || "U";
}

type Props = {
  interaction: SocialInteractionType;
  targetType: SocialInteractionTargetType;
  targetId: string;
  targetTitle: string;
  autorId: string;
  username: string | null;
  avatarUrl: string | null;
  texto: string | null;
  /** Pills del dashboard: avatar algo más pequeño. */
  compact?: boolean;
  onAfterOpenProfile?: () => void;
  className?: string;
  /** P. ej. botón descartar en la esquina superior derecha. */
  trailing?: ReactNode;
};

export function SocialInteractionNotificationContent({
  interaction,
  targetType,
  targetId,
  targetTitle,
  username,
  avatarUrl,
  texto,
  compact,
  onAfterOpenProfile,
  className,
  trailing,
}: Props) {
  const avatar = useUserAvatar([avatarUrl]);
  const displayName = socialInteractionAuthorName(username);

  const HeaderIcon = interaction === "like" ? Heart : MessageCircle;
  const commentPreview = socialInteractionCommentPreview(texto);
  const detail =
    interaction === "like"
      ? `Le gusta ${socialInteractionTargetLabel(targetType)}: ${targetTitle}`
      : commentPreview
        ? `${commentPreview} en ${targetTitle}`
        : `Ha comentado en ${targetTitle}`;

  const openTarget = () => {
    navigateFromInAppToast({
      type: "activity",
      targetType,
      targetId,
      openComments: interaction === "comment",
    });
    onAfterOpenProfile?.();
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-start gap-3 px-1.5">
        <HeaderIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="min-w-0 flex-1 text-[15px] font-semibold leading-tight">
          {socialInteractionTitle(interaction)}
        </p>
        {trailing ? <div className="-mr-1 -mt-0.5 flex shrink-0">{trailing}</div> : null}
      </div>

      <button
        type="button"
        onClick={openTarget}
        className="-m-1 flex min-w-0 items-center gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className={cn("shrink-0", compact ? "h-10 w-10" : "h-11 w-11")}>
          {avatar.src ? (
            <AvatarImage src={avatar.src} alt="" className="object-cover" onError={avatar.onError} />
          ) : null}
          <AvatarFallback className="text-xs font-semibold">
            {initialsFromUsername(username)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{detail}</p>
        </div>
      </button>
    </div>
  );
}
