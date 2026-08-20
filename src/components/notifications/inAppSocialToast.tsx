import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { socialInteractionToastMessage } from "@/lib/socialInteractionNotification";
import { navigateFromInAppToast } from "@/lib/inAppToastNavigation";
import type { SocialInteractionReceivedRow } from "@/hooks/useMySocialInteractionsReceived";

function initialsFromUsername(username?: string | null) {
  return username?.trim()?.[0]?.toUpperCase() || "U";
}

function InAppPersonToastContent({
  avatarUrl,
  username,
  message,
  toastId,
  onOpen,
}: {
  avatarUrl: string | null;
  username: string | null;
  message: string;
  toastId: string | number;
  onOpen: () => void;
}) {
  const avatar = useUserAvatar([avatarUrl]);

  return (
    <button
      type="button"
      onClick={() => {
        toast.dismiss(toastId);
        onOpen();
      }}
      className="touch-styled flex w-full items-center gap-3 text-left"
    >
      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-success">
        {avatar.src ? (
          <AvatarImage src={avatar.src} alt="" className="object-cover" onError={avatar.onError} />
        ) : null}
        <AvatarFallback className="bg-success/25 text-[10px] font-semibold text-success-foreground">
          {initialsFromUsername(username)}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-success-foreground">
        {message}
      </p>
    </button>
  );
}

const SOCIAL_TOAST_DURATION_MS = 10_000;

const socialToastOptions = {
  duration: SOCIAL_TOAST_DURATION_MS,
  unstyled: true,
  className: "social-in-app-toast flex w-full cursor-pointer items-center rounded-2xl px-4 py-3",
  style: {
    border: "1px solid hsl(var(--success))",
    borderLeft: "4px solid hsl(var(--success))",
    boxShadow: "none",
    outline: "none",
    background: "hsl(var(--success-muted))",
    color: "hsl(var(--success-foreground))",
  },
} as const;

export function notifySocialInteractionToast(
  row: Pick<
    SocialInteractionReceivedRow,
    "interaction" | "targetType" | "targetId" | "username" | "avatarUrl"
  >,
) {
  const toastId = `social-${row.interaction}-${row.targetType}-${row.targetId}`;
  toast(
    <InAppPersonToastContent
      avatarUrl={row.avatarUrl}
      username={row.username}
      message={socialInteractionToastMessage(row)}
      toastId={toastId}
      onOpen={() =>
        navigateFromInAppToast({
          type: "activity",
          targetType: row.targetType,
          targetId: row.targetId,
          openComments: row.interaction === "comment",
        })
      }
    />,
    { ...socialToastOptions, id: toastId },
  );
}

export function notifyNewFollowerToast(params: {
  seguidorId: string;
  username: string | null;
  avatarUrl: string | null;
}) {
  const label = params.username?.trim() || "Alguien";
  const toastId = `follower-${params.seguidorId}`;
  toast(
    <InAppPersonToastContent
      avatarUrl={params.avatarUrl}
      username={params.username}
      message={`${label} te ha empezado a seguir`}
      toastId={toastId}
      onOpen={() => navigateFromInAppToast({ type: "profile", userId: params.seguidorId })}
    />,
    { ...socialToastOptions, id: toastId },
  );
}
