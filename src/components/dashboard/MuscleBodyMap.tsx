import { memo, useMemo, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import {
  BACK_BODY_MAP_VIEWBOX,
  BACK_ZONES,
  FRONT_BODY_MAP_VIEWBOX,
  FRONT_ZONES,
  type BodyMapZone,
} from "./bodyMapZones";
import { FATIGUE_COLORS, LOAD_COLORS, type MuscleLoadLevel } from "./bodyMapPaths";

export type { MuscleLoadLevel };

/** Mismo tono que `Skeleton` (`bg-muted`) */
const SKELETON_FILL = "hsl(var(--muted))";

const BODY_MAP_SVG_CLASS = "h-auto w-full max-w-[126px] sm:max-w-[140px]";
const BODY_MAP_COMPACT_SVG_CLASS = "h-full w-auto max-h-full max-w-full";

export type MuscleBodyMapSize = "default" | "compact";

export interface MuscleBodyMapProps {
  getLevel: (group: MainMuscleGroup) => MuscleLoadLevel;
  /** Paleta de relleno; por defecto volumen (primary). */
  colors?: Record<MuscleLoadLevel, string>;
  isLoading?: boolean;
  onZoneClick?: (group: MainMuscleGroup) => void;
  onZoneHover?: (group: MainMuscleGroup, event: React.MouseEvent<SVGPathElement>) => void;
  onZoneLeave?: () => void;
  className?: string;
  size?: MuscleBodyMapSize;
}

function zoneFillColor(
  zone: BodyMapZone,
  getLevel: (group: MainMuscleGroup) => MuscleLoadLevel,
  colors: Record<MuscleLoadLevel, string>,
  isLoading: boolean,
): string {
  if (isLoading && zone.group) return SKELETON_FILL;
  if (!zone.group) return colors.none;
  return colors[getLevel(zone.group)];
}

interface BodyViewProps {
  zones: BodyMapZone[];
  viewBox: string;
  viewKey: string;
  ariaLabel: string;
  svgSizeClass: string;
  getLevel: (group: MainMuscleGroup) => MuscleLoadLevel;
  colors: Record<MuscleLoadLevel, string>;
  isLoading: boolean;
  onZoneClick?: (group: MainMuscleGroup) => void;
  onZoneHover?: (group: MainMuscleGroup, event: MouseEvent<SVGPathElement>) => void;
  onZoneLeave?: () => void;
}

const BodyView = memo(function BodyView({
  zones,
  viewBox,
  viewKey,
  ariaLabel,
  svgSizeClass,
  getLevel,
  colors,
  isLoading,
  onZoneClick,
  onZoneHover,
  onZoneLeave,
}: BodyViewProps) {
  const [neutral, muscles] = useMemo(() => {
    const neutralZones = zones.filter((z) => !z.group);
    const muscleZones = zones.filter((z) => z.group);
    return [neutralZones, muscleZones];
  }, [zones]);
  const interactive = !isLoading && Boolean(onZoneClick || onZoneHover);

  return (
    <div className="flex h-full min-w-0 items-center justify-center">
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className={cn("block", svgSizeClass)}
        role="img"
        aria-label={ariaLabel}
        aria-busy={isLoading}
      >
        <g>
          {[...neutral, ...muscles].map((zone, i) => {
            const isMuscle = Boolean(zone.group);

            return (
              <path
                key={`${viewKey}-${zone.group ?? "neutral"}-${i}`}
                d={zone.d}
                stroke="none"
                className={cn(
                  isMuscle && isLoading && "animate-pulse",
                  !isLoading && "transition-colors duration-300",
                  isMuscle && interactive && "cursor-pointer hover:brightness-[0.97] dark:hover:brightness-110",
                )}
                style={{ fill: zoneFillColor(zone, getLevel, colors, isLoading) }}
                onClick={isMuscle && interactive && onZoneClick ? () => onZoneClick(zone.group!) : undefined}
                onMouseMove={
                  isMuscle && interactive && onZoneHover ? (e) => onZoneHover(zone.group!, e) : undefined
                }
                onMouseLeave={interactive ? onZoneLeave : undefined}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
});

export function MuscleBodyMap({
  getLevel,
  colors = LOAD_COLORS,
  isLoading = false,
  onZoneClick,
  onZoneHover,
  onZoneLeave,
  className,
  size = "default",
}: MuscleBodyMapProps) {
  const compact = size === "compact";
  const interactiveClick = compact ? undefined : onZoneClick;
  const interactiveHover = compact ? undefined : onZoneHover;
  const interactiveLeave = compact ? undefined : onZoneLeave;

  return (
    <div
      className={cn(
        "flex w-full min-w-0",
        compact ? "h-full items-stretch justify-center gap-0.5" : "items-end justify-around",
        (isLoading || compact) && "pointer-events-none",
        className,
      )}
      data-loading={isLoading || undefined}
    >
      <div className={cn("flex min-w-0 justify-center", compact ? "h-full w-1/2" : "w-[45%]")}>
        <BodyView
          zones={FRONT_ZONES}
          viewBox={FRONT_BODY_MAP_VIEWBOX}
          viewKey="front"
          ariaLabel="Vista frontal del cuerpo"
          svgSizeClass={compact ? BODY_MAP_COMPACT_SVG_CLASS : BODY_MAP_SVG_CLASS}
          getLevel={getLevel}
          colors={colors}
          isLoading={isLoading}
          onZoneClick={interactiveClick}
          onZoneHover={interactiveHover}
          onZoneLeave={interactiveLeave}
        />
      </div>
      <div className={cn("flex min-w-0 justify-center", compact ? "h-full w-1/2" : "w-[45%]")}>
        <BodyView
          zones={BACK_ZONES}
          viewBox={BACK_BODY_MAP_VIEWBOX}
          viewKey="back"
          ariaLabel="Vista trasera del cuerpo"
          svgSizeClass={compact ? BODY_MAP_COMPACT_SVG_CLASS : BODY_MAP_SVG_CLASS}
          getLevel={getLevel}
          colors={colors}
          isLoading={isLoading}
          onZoneClick={interactiveClick}
          onZoneHover={interactiveHover}
          onZoneLeave={interactiveLeave}
        />
      </div>
    </div>
  );
}

export function MuscleMapLegend({
  period,
  className,
  variant = "volume",
}: {
  period: "week" | "month";
  className?: string;
  variant?: "volume" | "fatigue";
}) {
  const palette = variant === "fatigue" ? FATIGUE_COLORS : LOAD_COLORS;
  const items: { level: MuscleLoadLevel; label: string }[] =
    variant === "fatigue"
      ? [
          { level: "none", label: "Recuperado" },
          { level: "light", label: "Ligera" },
          { level: "moderate", label: "Moderada" },
          { level: "high", label: "Alta" },
        ]
      : [
          { level: "none", label: "Sin carga" },
          { level: "light", label: period === "week" ? "1–2 series" : "1–9 series" },
          { level: "moderate", label: period === "week" ? "3–4 series" : "10–18 series" },
          { level: "high", label: period === "week" ? "5+ series" : "19+ series" },
        ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {items.map(({ level, label }) => (
          <span
            key={level}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
          >
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-sm border border-border/50"
              style={{ backgroundColor: palette[level] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
