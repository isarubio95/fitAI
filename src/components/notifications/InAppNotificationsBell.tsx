import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { cn } from "@/lib/utils";
import type { InAppNotificationItem } from "@/types/inAppNotification";

function NotificationRow({
  item,
  onDismiss,
  onAfterPrimaryAction,
}: {
  item: InAppNotificationItem;
  onDismiss: (id: string) => void;
  onAfterPrimaryAction?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/30 px-3 py-3 text-left",
        item.kind === "action" && "border-primary/25 bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{item.title}</p>
          {item.body ? (
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{item.body}</p>
          ) : null}
        </div>
        {item.dismissable ? (
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Descartar"
            onClick={() => onDismiss(item.id)}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
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
          "relative h-11 w-11 shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5",
          className,
        )}
        aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount})` : "Notificaciones"}
        onClick={() => setOpen(true)}
      >
        <Bell className="text-foreground" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full max-w-full flex-col gap-0 border-0 p-0 shadow-none sm:max-w-md"
        >
          <SheetHeader className="border-b border-border/60 px-6 py-4 text-left">
            <SheetTitle className="text-lg">Notificaciones</SheetTitle>
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
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay novedades por ahora.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onDismiss={dismiss}
                    onAfterPrimaryAction={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
