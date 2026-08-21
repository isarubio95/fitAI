import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const RPE_HINTS: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Suave",
  4: "Moderado",
  5: "Algo duro",
  6: "Duro",
  7: "Muy duro",
  8: "Muy duro+",
  9: "Casi máximo",
  10: "Máximo",
};

function rpeToneClass(n: number | null) {
  if (n == null) return "text-muted-foreground";
  if (n <= 3) return "text-emerald-600 dark:text-emerald-400";
  if (n <= 6) return "text-amber-600 dark:text-amber-400";
  if (n <= 8) return "text-orange-600 dark:text-orange-400";
  return "text-rose-600 dark:text-rose-400";
}

function rpeFillClass(n: number | null) {
  if (n == null) return "bg-muted-foreground/25";
  if (n <= 3) return "bg-emerald-500";
  if (n <= 6) return "bg-amber-500";
  if (n <= 8) return "bg-orange-500";
  return "bg-rose-500";
}

function rpeThumbClass(n: number | null) {
  if (n == null) return "bg-muted-foreground";
  if (n <= 3) return "bg-emerald-500";
  if (n <= 6) return "bg-amber-500";
  if (n <= 8) return "bg-orange-500";
  return "bg-rose-500";
}

type SessionRpePickerProps = {
  value: number | null;
  onChange: (rpe: number) => void;
  disabled?: boolean;
  id?: string;
};

export function SessionRpePicker({ value, onChange, disabled, id }: SessionRpePickerProps) {
  const shown = value ?? 1;
  const selected = value != null;

  const commit = (n: number) => {
    if (!Number.isFinite(n) || n < 1 || n > 10) return;
    onChange(Math.round(n));
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p id={id} className="text-sm font-medium">
            ¿Qué tan duro se sintió?
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {selected ? RPE_HINTS[value] : "Desliza para indicar el esfuerzo. Opcional."}
          </p>
        </div>
        <p
          className={cn(
            "font-mono text-[1.75rem] font-semibold leading-none tabular-nums",
            rpeToneClass(value),
          )}
          aria-hidden
        >
          {selected ? value : "—"}
        </p>
      </div>

      <SliderPrimitive.Root
        min={1}
        max={10}
        step={1}
        value={[shown]}
        disabled={disabled}
        onValueChange={([n]) => commit(n)}
        onValueCommit={([n]) => commit(n)}
        aria-labelledby={id}
        className={cn(
          "relative flex w-full touch-none select-none items-center py-1",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range
            className={cn("absolute h-full rounded-full transition-colors", rpeFillClass(value))}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={
            selected ? `Esfuerzo ${value}, ${RPE_HINTS[value]}` : "Esfuerzo percibido, sin marcar"
          }
          className={cn(
            "touch-styled block size-6 rounded-full border-[3px] border-background shadow-md",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none",
            rpeThumbClass(value),
          )}
        />
      </SliderPrimitive.Root>

      <div className="flex justify-between px-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={cn("w-4 text-center transition-colors", value === n && rpeToneClass(n))}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
