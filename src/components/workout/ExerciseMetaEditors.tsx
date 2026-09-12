import { useState, type ReactNode } from "react";
import { Minus, Plus, Timer } from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatMSS } from "@/hooks/useRestTimer";
import { selection } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export const HEADER_META_BADGE_CLASS = "h-7 gap-1 leading-none";

export const REST_MIN_SEC = 0;
export const REST_MAX_SEC = 10 * 60;
export const REST_STEP_SEC = 15;
export const REST_PRESETS_SEC = [45, 60, 90, 120, 180, 240] as const;
export const RIR_OPTIONS = [0, 1, 2, 3, 4] as const;

export function clampRestSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 120;
  return Math.min(REST_MAX_SEC, Math.max(REST_MIN_SEC, Math.round(seconds)));
}

const badgeButtonClass = cn(
  badgeVariants({ variant: "outline" }),
  "touch-styled text-xs",
  HEADER_META_BADGE_CLASS,
  "pointer-events-auto cursor-pointer hover:bg-accent/55 hover:text-accent-foreground",
  "focus:bg-transparent focus-visible:bg-transparent",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

function MetaBadgePopover({
  open,
  onOpenChange,
  label,
  trigger,
  children,
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        aria-label={label}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn("z-popover w-56 p-3", contentClassName)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function RestMetaBadge({
  seconds,
  editable,
  onChange,
}: {
  seconds: number;
  editable?: boolean;
  onChange?: (seconds: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = formatMSS(seconds);
  const body = (
    <>
      <Timer className="h-3 w-3" aria-hidden />
      {label}
    </>
  );

  if (!editable || !onChange) {
    return (
      <Badge variant="outline" className={cn("text-xs", HEADER_META_BADGE_CLASS)}>
        {body}
      </Badge>
    );
  }

  const commit = (next: number) => {
    const clamped = clampRestSeconds(next);
    if (clamped === seconds) return;
    selection();
    onChange(clamped);
  };

  return (
    <MetaBadgePopover
      open={open}
      onOpenChange={setOpen}
      label="Descanso entre series"
      trigger={
        <button
          type="button"
          data-vaul-no-drag
          className={badgeButtonClass}
          aria-label={`Editar descanso, ${label}`}
          title="Editar descanso"
        >
          {body}
        </button>
      }
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">Descanso</p>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          aria-label="Restar 15 segundos"
          disabled={seconds <= REST_MIN_SEC}
          onClick={() => commit(seconds - REST_STEP_SEC)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-14 text-center text-lg font-semibold tabular-nums">{label}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          aria-label="Sumar 15 segundos"
          disabled={seconds >= REST_MAX_SEC}
          onClick={() => commit(seconds + REST_STEP_SEC)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {REST_PRESETS_SEC.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-0 text-xs tabular-nums",
              preset === seconds && "border-primary/40 bg-primary/10 text-foreground",
            )}
            aria-pressed={preset === seconds}
            onClick={() => commit(preset)}
          >
            {formatMSS(preset)}
          </Button>
        ))}
      </div>
    </MetaBadgePopover>
  );
}

export function RirMetaBadge({
  value,
  editable,
  onChange,
}: {
  value: number | null | undefined;
  editable?: boolean;
  onChange?: (rir: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value != null;
  const shown = hasValue ? String(value) : "—";

  if (!editable || !onChange) {
    if (!hasValue) return null;
    return (
      <Badge variant="outline" className={cn("text-xs", HEADER_META_BADGE_CLASS)}>
        🎯 RIR: {shown}
      </Badge>
    );
  }

  return (
    <MetaBadgePopover
      open={open}
      onOpenChange={setOpen}
      label="RIR objetivo"
      contentClassName="w-auto"
      trigger={
        <button
          type="button"
          data-vaul-no-drag
          className={badgeButtonClass}
          aria-label={hasValue ? `Editar RIR, ${value}` : "Editar RIR"}
          title="Editar RIR"
        >
          🎯 RIR: {shown}
        </button>
      }
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">RIR objetivo</p>
      <div className="flex gap-1.5">
        {RIR_OPTIONS.map((n) => (
          <Button
            key={n}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-10 w-10 px-0 tabular-nums",
              value === n && "border-primary/40 bg-primary/10 text-foreground",
            )}
            aria-label={`RIR ${n}`}
            aria-pressed={value === n}
            onClick={() => {
              if (value !== n) {
                selection();
                onChange(n);
              }
              setOpen(false);
            }}
          >
            {n}
          </Button>
        ))}
      </div>
    </MetaBadgePopover>
  );
}
