import { useCallback, useMemo } from "react";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import { cn } from "@/lib/utils";
import { MuscleBodyMap } from "./MuscleBodyMap";
import { getHeatLevel, heatLevelToLoad } from "./bodyMapPaths";

type WorkoutMuscleMiniMapProps = {
  groupSets: Record<MainMuscleGroup, number>;
  maxSets: number;
  className?: string;
};

export function WorkoutMuscleMiniMap({ groupSets, maxSets, className }: WorkoutMuscleMiniMapProps) {
  const effectiveMax = Math.max(1, maxSets);

  const getLevel = useCallback(
    (group: MainMuscleGroup) => heatLevelToLoad(getHeatLevel(groupSets[group] ?? 0, effectiveMax)),
    [groupSets, effectiveMax],
  );

  const ariaLabel = useMemo(() => {
    const parts = (Object.entries(groupSets) as [MainMuscleGroup, number][])
      .filter(([, sets]) => sets > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([group, sets]) => `${group}: ${sets} series`);
    return parts.length > 0 ? `Grupos musculares trabajados: ${parts.join(", ")}` : "Sin grupos musculares registrados";
  }, [groupSets]);

  return (
    <div className={cn(className)} aria-label={ariaLabel} role="img">
      <MuscleBodyMap getLevel={getLevel} className="w-full" />
    </div>
  );
}
