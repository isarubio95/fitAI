import { Heart, Info, MessageCircle, UserPlus, Zap, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileDrawer } from "@/components/layout/profileDrawerContext";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { navigateFromInAppToast } from "@/lib/inAppToastNavigation";
import {
  formatNotificationTimestamp,
  notificationEntryAction,
  notificationEntryDetail,
  type NotificationFeedEntry,
} from "@/lib/notificationFeed";
import { cn } from "@/lib/utils";

function initialsFromUsername(username?: string | null) {
  const clean = username?.trim();
  if (!clean) return "U";
  return clean.slice(0, 2).toUpperCase();
}

function UnreadDot() {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full bg-primary-solid"
      aria-label="Sin leer"
    />
  );
}

function KindIcon({ Icon, label }: { Icon: LucideIcon; label: string }) {
  return (
    <Icon
      className="h-4 w-4 shrink-0 fill-current text-primary-solid"
      aria-label={label}
    />
  );
}

function StandardIcon({ entry }: { entry: Extract<NotificationFeedEntry, { type: "standard" }> }) {
  const Icon = entry.item.kind === "action" ? Zap : Info;
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary dark:bg-primary/16">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

type Props = {
  entry: NotificationFeedEntry;
  /** Marca como leída la fila completa (todas las notificaciones que agrupa). */
  onRead: (ids: string[]) => void;
  /** Cierra el panel tras navegar. */
  onNavigate?: () => void;
};

export function NotificationFeedRow({ entry, onRead, onNavigate }: Props) {
  const { openUserProfile } = useProfileDrawer();
  const avatarUrl = entry.type === "standard" ? null : entry.avatarUrl;
  const avatar = useUserAvatar([avatarUrl]);

  const username = entry.type === "standard" ? null : entry.username?.trim() || "Usuario";
  const action = notificationEntryAction(entry);
  const detail = notificationEntryDetail(entry);
  const timestamp = formatNotificationTimestamp(entry.createdAt);

  const openEntry = () => {
    if (entry.type === "follower") {
      openUserProfile(entry.seguidorId);
    } else if (entry.type === "social") {
      const target = entry.targets[0];
      if (target) {
        navigateFromInAppToast({
          type: "activity",
          targetType: target.targetType,
          targetId: target.targetId,
          openComments: entry.interaction === "comment",
        });
      }
    } else if (entry.item.accion) {
      entry.item.accion.onClick();
    }
    onRead(entry.ids);
    onNavigate?.();
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={openEntry}
        className="-mx-2 -my-1 flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {entry.type === "standard" ? (
          <StandardIcon entry={entry} />
        ) : (
          <Avatar className="h-11 w-11 shrink-0">
            {avatar.src ? (
              <AvatarImage src={avatar.src} alt="" className="object-cover" onError={avatar.onError} />
            ) : null}
            <AvatarFallback className="bg-muted text-xs font-semibold">
              {initialsFromUsername(username)}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug">
            {username ? <span className="font-semibold text-foreground">{username} </span> : null}
            <span
              className={cn(
                entry.type === "standard"
                  ? "font-medium"
                  : "font-normal text-muted-foreground",
                entry.type === "follower" && "whitespace-nowrap",
              )}
            >
              {action}
            </span>
            {timestamp ? (
              <span className="text-muted-foreground"> · {timestamp}</span>
            ) : null}
          </p>
          {detail ? (
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
              {detail}
            </p>
          ) : null}
        </div>

      </button>

      {entry.type === "follower" ? (
        <KindIcon Icon={UserPlus} label="Nuevo seguidor" />
      ) : entry.type === "social" ? (
        <KindIcon
          Icon={entry.interaction === "like" ? Heart : MessageCircle}
          label={entry.interaction === "like" ? "Me gusta" : "Comentario"}
        />
      ) : (
        <UnreadDot />
      )}
    </div>
  );
}
