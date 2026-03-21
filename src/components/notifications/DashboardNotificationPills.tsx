import { X, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { cn } from "@/lib/utils";
import type { InAppNotificationItem } from "@/types/inAppNotification";

function Pill({ item, onDismiss }: { item: InAppNotificationItem; onDismiss: (id: string) => void }) {
  const Icon = item.kind === "action" ? Zap : Info;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border px-3 py-2.5 sm:max-w-sm sm:flex-initial",
        item.kind === "action"
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-muted/40",
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            item.kind === "action" ? "text-primary" : "text-muted-foreground",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{item.title}</p>
          {item.body ? (
            <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">{item.body}</p>
          ) : null}
        </div>
        {item.dismissable ? (
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background/80 hover:text-foreground"
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
          variant={item.kind === "action" ? "default" : "secondary"}
          className="h-8 w-full text-xs"
          onClick={item.accion.onClick}
        >
          {item.accion.etiqueta}
        </Button>
      ) : null}
    </div>
  );
}

export function DashboardNotificationPills() {
  const { topItems, dismiss, unreadCount } = useInAppNotifications();

  if (unreadCount === 0) return null;

  return (
    <section className="space-y-2 px-6 md:px-0" aria-label="Avisos">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avisos</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {topItems.map((item) => (
          <Pill key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </section>
  );
}
