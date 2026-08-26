import { Progress } from "@/components/ui/progress";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";
import { cn } from "@/lib/utils";

/**
 * Desglose de series por músculo específico dentro de un grupo.
 * Lo usan el acordeón del detalle de fatiga y cualquier vista que necesite
 * bajar del grupo principal al músculo concreto.
 */
export function MuscleSpecificBreakdown({
  group,
  specificVolume,
  className,
}: {
  group: MainMuscleGroup;
  specificVolume: Record<string, number>;
  className?: string;
}) {
  const muscles = MUSCLE_GROUPS[group];
  const maxSets = Math.max(1, ...muscles.map((m) => specificVolume[m] || 0));

  return (
    <div className={cn("space-y-3", className)}>
      {muscles.map((muscle) => {
        const sets = specificVolume[muscle] || 0;
        return (
          <div key={muscle} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <span className="min-w-0 truncate font-medium">{muscle}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{sets} series</span>
            </div>
            <Progress value={(sets / maxSets) * 100} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}
