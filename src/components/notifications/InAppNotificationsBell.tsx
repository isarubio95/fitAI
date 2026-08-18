import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { cn } from "@/lib/utils";
import {
  isNewFollowerNotification,
  isSocialInteractionNotification,
  type InAppNotificationItem,
} from "@/types/inAppNotification";
import { NewFollowerNotificationContent } from "@/components/notifications/NewFollowerNotificationContent";
import { SocialInteractionNotificationContent } from "@/components/notifications/SocialInteractionNotificationContent";
import { InAppNotificationItemMotion } from "@/components/notifications/InAppNotificationItemMotion";

function DismissButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground [&_svg]:opacity-80 hover:[&_svg]:opacity-100"
      aria-label="Descartar"
      onClick={onClick}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

const notificationCardClass =
  "rounded-xl border border-border/60 bg-card px-3 py-3 text-left";

function NotificationRow({
  item,
  onDismiss,
  onAfterPrimaryAction,
}: {
  item: InAppNotificationItem;
  onDismiss: (id: string) => void;
  onAfterPrimaryAction?: () => void;
}) {
  if (isNewFollowerNotification(item)) {
    return (
      <div className={notificationCardClass}>
        <NewFollowerNotificationContent
          seguidorId={item.seguidorId}
          username={item.username}
          avatarUrl={item.avatarUrl}
          onAfterOpenProfile={onAfterPrimaryAction}
          trailing={
            item.dismissable ? <DismissButton onClick={() => onDismiss(item.id)} /> : null
          }
        />
      </div>
    );
  }

  if (isSocialInteractionNotification(item)) {
    return (
      <div className={notificationCardClass}>
        <SocialInteractionNotificationContent
          interaction={item.interaction}
          targetType={item.targetType}
          targetTitle={item.targetTitle}
          autorId={item.autorId}
          username={item.username}
          avatarUrl={item.avatarUrl}
          texto={item.texto}
          onAfterOpenProfile={onAfterPrimaryAction}
          trailing={
            item.dismissable ? <DismissButton onClick={() => onDismiss(item.id)} /> : null
          }
        />
      </div>
    );
  }

  return (
    <div className={notificationCardClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{item.title}</p>
          {item.body ? (
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{item.body}</p>
          ) : null}
        </div>
        {item.dismissable ? <DismissButton onClick={() => onDismiss(item.id)} /> : null}
      </div>
      {item.accion ? (
        <Button
          type="button"
          size="sm"
          className="mt-3 w-full sm:w-auto"
          variant={item.kind === "action" ? "default" : "secondary"}
          onClick={() => {
            item.accion?.onClick();
            onAfterPrimaryAction?.();
          }}
        >
          {item.accion.etiqueta}
        </Button>
      ) : null}
    </div>
  );
}

export function InAppNotificationsBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, dismiss, markAllRead } = useInAppNotifications();

  const dismissableCount = items.filter((i) => i.dismissable).length;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-11 w-11 shrink-0 rounded-full bg-transparent text-muted-foreground transition-colors hover:bg-transparent active:bg-transparent focus-visible:bg-transparent hover:text-foreground/58 dark:text-foreground dark:hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5",
          className,
        )}
        aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount})` : "Notificaciones"}
        onClick={() => setOpen(true)}
      >
        <Bell className="text-current" />
        {unreadCount > 0 ? (
          <span className="absolute right-[-2.5px] top-[0.5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      <Drawer direction="right" open={open} onOpenChange={setOpen}>
        <DrawerContent
          side="right"
          overlayClassName="z-[110]"
          className="z-[115] flex h-full max-h-dvh w-full flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none"
        >
          <DrawerHeader className="shrink-0 border-b border-border/60 px-6 pb-4 pt-[calc(1.25rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
            <DrawerTitle className="text-lg">Notificaciones</DrawerTitle>
            {dismissableCount > 0 ? (
              <button
                type="button"
                className="mt-2 w-fit text-xs font-medium text-primary hover:underline"
                onClick={() => {
                  markAllRead();
                  setOpen(false);
                }}
              >
                Marcar todas como leídas
              </button>
            ) : null}
          </DrawerHeader>

          <div className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4", drawerSafeAreaBottom)}>
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay novedades por ahora.</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((item) => (
                    <InAppNotificationItemMotion key={item.id}>
                      <NotificationRow
                        item={item}
                        onDismiss={dismiss}
                        onAfterPrimaryAction={() => setOpen(false)}
                      />
                    </InAppNotificationItemMotion>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
