import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { buildNotificationFeed } from "@/lib/notificationFeed";
import { cn } from "@/lib/utils";
import { NotificationFeedRow } from "@/components/notifications/NotificationFeedRow";
import { InAppNotificationItemMotion } from "@/components/notifications/InAppNotificationItemMotion";

export function InAppNotificationsBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, dismissMany, markAllRead } = useInAppNotifications();

  const sections = useMemo(() => buildNotificationFeed(items), [items]);
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
        <Bell
          className="text-current"
          fill={unreadCount > 0 ? "currentColor" : "none"}
          aria-hidden
        />
        {unreadCount > 0 ? (
          <span className="absolute right-[-2.5px] top-[0.5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-solid px-1 text-[10px] font-bold leading-none text-primary-foreground">
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
          <DrawerHeader className="shrink-0 px-6 pb-3 pt-[calc(1.25rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
            <div className="flex items-center justify-between gap-3">
              <DrawerTitle className="text-2xl font-semibold tracking-tight">Notificaciones</DrawerTitle>
              {dismissableCount > 0 ? (
                <button
                  type="button"
                  className="shrink-0 text-sm font-medium text-primary transition-opacity hover:opacity-80"
                  onClick={() => markAllRead()}
                >
                  Marcar leídas
                </button>
              ) : null}
            </div>
          </DrawerHeader>

          <div className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6", drawerSafeAreaBottom)}>
            {sections.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay novedades por ahora.</p>
            ) : (
              sections.map((section) => (
                <section key={section.key} className="pt-4">
                  <h3 className="border-b border-border/60 pb-2 text-sm text-muted-foreground">
                    {section.label}
                  </h3>
                  <AnimatePresence initial={false} mode="popLayout">
                    {section.entries.map((entry) => (
                      <InAppNotificationItemMotion key={entry.id} className="border-b border-border/60">
                        <NotificationFeedRow
                          entry={entry}
                          onRead={dismissMany}
                          onNavigate={() => setOpen(false)}
                        />
                      </InAppNotificationItemMotion>
                    ))}
                  </AnimatePresence>
                </section>
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
