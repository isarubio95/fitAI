import { useCallback, useMemo } from "react";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import { cn } from "@/lib/utils";
import { MuscleBodyMap, type MuscleBodyMapSize } from "./MuscleBodyMap";
import {
  getHeatLevel,
  heatLevelToLoad,
  ROUTINE_MUSCLE_COLORS,
  type MuscleLoadLevel,
} from "./bodyMapPaths";

type WorkoutMuscleMiniMapProps = {
  groupSets: Partial<Record<MainMuscleGroup, number>>;
  maxSets: number;
  className?: string;
  size?: MuscleBodyMapSize;
  /** `routine`: verde pleno si el grupo tiene series; sin escala relativa. */
  variant?: "scaled" | "routine";
};

export function WorkoutMuscleMiniMap({
  groupSets,
  maxSets,
  className,
  size = "default",
  variant = "scaled",
}: WorkoutMuscleMiniMapProps) {
  const effectiveMax = Math.max(1, maxSets);

  const getLevel = useCallback(
    (group: MainMuscleGroup): MuscleLoadLevel => {
      const sets = groupSets[group] ?? 0;
      if (variant === "routine") return sets > 0 ? "high" : "none";
      return heatLevelToLoad(getHeatLevel(sets, effectiveMax));
    },
    [groupSets, effectiveMax, variant],
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
      <MuscleBodyMap
        getLevel={getLevel}
        colors={variant === "routine" ? ROUTINE_MUSCLE_COLORS : undefined}
        size={size}
        className={cn("w-full", size === "compact" && "h-full")}
      />
    </div>
  );
}
