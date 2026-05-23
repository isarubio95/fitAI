import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SegmentedToggleOption = {
  value: string;
  label: string;
};

/** Opciones estándar Mes/Semana para calendario, heatmap muscular, etc. */
export const MONTH_WEEK_TOGGLE_OPTIONS = [
  { value: "month", label: "Mes" },
  { value: "week", label: "Semana" },
] as const satisfies readonly SegmentedToggleOption[];

interface SegmentedToggleProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedToggleOption[];
  className?: string;
}

export function SegmentedToggle({
  value,
  onValueChange,
  options,
  className,
}: SegmentedToggleProps) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = 100 / Math.max(options.length, 1);

  return (
    <div
      role="tablist"
      aria-label="Selector segmentado"
      className={cn(
        "relative inline-flex h-9 w-fit min-w-[148px] items-center rounded-xl border border-border/60 bg-muted/45 p-0.5 shadow-[inset_0_1px_1px_hsl(var(--foreground)/0.05)] backdrop-blur supports-backdrop-filter:bg-background/55",
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className="absolute bottom-0.5 top-0.5 rounded-lg border border-border/60 bg-background shadow-[0_6px_18px_-12px_hsl(var(--foreground)/0.45)]"
        style={{ width: `calc(${segmentWidth}% - 0.25rem)` }}
        animate={{
          left: `calc(${activeIndex * segmentWidth}% + 0.125rem)`,
        }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      />

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative z-10 inline-flex h-7 flex-1 items-center justify-center rounded-lg px-3 text-xs font-semibold tracking-[0.01em] transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
