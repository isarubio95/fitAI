import { TrendingDown, TrendingUp, Minus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OverloadAction, OverloadSuggestion } from "@/lib/progressiveOverload";

export const OVERLOAD_ACTION_STYLES: Record<
  OverloadAction,
  { className: string; Icon: typeof TrendingUp; label: string }
> = {
  increase_weight: {
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Icon: TrendingUp,
    label: "Subir peso",
  },
  increase_reps: {
    className: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    Icon: Repeat,
    label: "Subir reps",
  },
  maintain: {
    className: "border-border bg-muted/50 text-muted-foreground",
    Icon: Minus,
    label: "Mantener",
  },
  deload: {
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Icon: TrendingDown,
    label: "Descarga",
  },
};

export function formatOverloadSuggestion(suggestion: OverloadSuggestion): string {
  const { suggestedWeight, suggestedReps } = suggestion;
  if (suggestedWeight > 0) return `${suggestedWeight} kg × ${suggestedReps} reps`;
  return `${suggestedReps} reps`;
}

interface OverloadSuggestionBannerProps {
  suggestion: OverloadSuggestion;
  onApply?: () => void;
  canApply?: boolean;
}

export function OverloadSuggestionBanner({
  suggestion,
  onApply,
  canApply = false,
}: OverloadSuggestionBannerProps) {
  const style = OVERLOAD_ACTION_STYLES[suggestion.action];
  const { Icon } = style;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
        style.className,
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium">
          {style.label}: {formatOverloadSuggestion(suggestion)}
        </p>
        <p className="opacity-80">{suggestion.reason}</p>
      </div>
      {canApply && onApply && suggestion.action !== "maintain" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 shrink-0 px-2 text-xs"
          onClick={onApply}
        >
          Aplicar
        </Button>
      ) : null}
    </div>
  );
}
