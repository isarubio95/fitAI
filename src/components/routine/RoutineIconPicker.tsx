import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ROUTINE_ICON_OPTIONS, type RoutineIconKey } from "@/lib/routineIcons";

interface RoutineIconPickerProps {
  value: RoutineIconKey;
  onChange: (key: RoutineIconKey) => void;
  label?: string;
}

export function RoutineIconPicker({ value, onChange, label = "Icono" }: RoutineIconPickerProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
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
    </div>
  );
}
