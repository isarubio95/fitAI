import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ROUTINE_ICON_OPTIONS, resolveRoutineIcon, type RoutineIconKey } from "@/lib/routineIcons";

interface RoutineIconPickerProps {
  value: RoutineIconKey;
  onChange: (key: RoutineIconKey) => void;
  label?: string;
}

function RoutineIconGrid({
  value,
  onChange,
}: {
  value: RoutineIconKey;
  onChange: (key: RoutineIconKey) => void;
}) {
  return (
    <div className="grid w-full grid-cols-6 gap-x-1 gap-y-2.5">
      {ROUTINE_ICON_OPTIONS.map((opt) => {
        const isSelected = value === opt.key;
        const Icon = opt.Icon;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            aria-pressed={isSelected}
            title={opt.label}
            aria-label={opt.label}
            className={cn(
              "flex h-10 w-10 items-center justify-center transition-colors outline-none focus:outline-none focus-visible:outline-none",
              isSelected ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

export function RoutineIconPicker({ value, onChange, label = "Icono" }: RoutineIconPickerProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <RoutineIconGrid value={value} onChange={onChange} />
    </div>
  );
}

/** Cajón cuadrado con flecha; al pulsar abre la rejilla de iconos (p. ej. entrenamiento activo). */
export function WorkoutIconPickerTrigger({
  value,
  onChange,
  disabled,
}: {
  value: RoutineIconKey;
  onChange: (key: RoutineIconKey) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = resolveRoutineIcon(value);

  const handleSelect = (key: RoutineIconKey) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Cambiar icono del entrenamiento"
          aria-expanded={open}
          className={cn(
            "touch-styled relative flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-input bg-background transition-colors",
            "hover:bg-accent/55 active:scale-[0.97]",
            "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "data-[state=open]:border-input data-[state=open]:bg-background data-[state=open]:ring-0 data-[state=open]:ring-offset-0",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
          <ChevronDown
            className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 text-muted-foreground/90"
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(92vw,16.5rem)] border-input bg-background p-3 shadow-md"
        align="start"
        side="bottom"
      >
        <RoutineIconGrid value={value} onChange={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
