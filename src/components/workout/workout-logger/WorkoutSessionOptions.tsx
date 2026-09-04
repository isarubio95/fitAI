import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
import { useProgressiveOverloadPreferences } from "@/hooks/useProgressiveOverloadPreferences";
import { cn } from "@/lib/utils";

export function WorkoutSessionOptions() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { enabled, setEnabled } = useProgressiveOverloadPreferences();

  useBackCloseLayer({ open, onOpenChange: setOpen, kind: "popover" });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="inline-flex h-8 items-center" data-vaul-no-drag>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
          open && "bg-accent/55 text-foreground",
        )}
        aria-label="Opciones de entrenamiento"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
      {open ? (
        <div
          role="dialog"
          aria-label="Opciones"
          className="absolute inset-x-0 top-full z-[80] mt-2 rounded-xl border border-border/60 bg-popover p-3 text-popover-foreground shadow-md md:inset-x-auto md:left-auto md:right-0 md:w-72"
        >
          <p className="mb-3 text-sm font-medium">Opciones</p>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-none">Sugerencias de progresión</p>
              <p className="text-xs leading-snug text-muted-foreground">
                {enabled
                  ? "Propone peso y reps según tu último entreno."
                  : "Ocultas. Puedes volver a activarlas cuando quieras."}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Mostrar sugerencias de progresión"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
