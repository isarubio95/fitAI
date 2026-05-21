import { cn } from "@/lib/utils";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import {
  BACK_BODY_MAP_VIEWBOX,
  BACK_ZONES,
  FRONT_BODY_MAP_VIEWBOX,
  FRONT_ZONES,
  type BodyMapZone,
} from "./bodyMapZones";
import { LOAD_COLORS, type MuscleLoadLevel } from "./bodyMapPaths";

export type { MuscleLoadLevel };

const FILL_COLOR: Record<MuscleLoadLevel, string> = {
  none: "hsl(var(--muted-foreground) / 0.16)",
  light: "hsl(var(--primary) / 0.3)",
  moderate: "hsl(var(--primary) / 0.55)",
  high: "hsl(var(--primary) / 0.9)",
};

const BODY_OUTLINE_FILTER = "drop-shadow(0 0 1px hsl(var(--foreground) / 0.55))";

interface MuscleBodyMapProps {
  getLevel: (group: MainMuscleGroup) => MuscleLoadLevel;
  onZoneClick?: (group: MainMuscleGroup) => void;
  onZoneHover?: (group: MainMuscleGroup, event: React.MouseEvent) => void;
  onZoneLeave?: () => void;
  className?: string;
}

function zoneFillColor(zone: BodyMapZone, getLevel: (group: MainMuscleGroup) => MuscleLoadLevel): string {
  if (!zone.group) return FILL_COLOR.none;
  return FILL_COLOR[getLevel(zone.group)];
}

function BodyView({
  zones,
  viewBox,
  viewKey,
  ariaLabel,
  getLevel,
  onZoneClick,
  onZoneHover,
  onZoneLeave,
}: {
  zones: BodyMapZone[];
  viewBox: string;
  viewKey: string;
  ariaLabel: string;
  getLevel: (group: MainMuscleGroup) => MuscleLoadLevel;
  onZoneClick?: (group: MainMuscleGroup) => void;
  onZoneHover?: (group: MainMuscleGroup, event: React.MouseEvent) => void;
  onZoneLeave?: () => void;
}) {
  const neutral = zones.filter((z) => !z.group);
  const muscles = zones.filter((z) => z.group);
  const interactive = Boolean(onZoneClick || onZoneHover);

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={viewBox}
        className="h-auto w-full max-w-[126px] sm:max-w-[140px]"
        style={{ filter: BODY_OUTLINE_FILTER }}
        role="img"
        aria-label={ariaLabel}
      >
        <g>
          {[...neutral, ...muscles].map((zone, i) => {
            const isMuscle = Boolean(zone.group);

            return (
              <path
                key={`${viewKey}-${zone.group ?? "neutral"}-${i}`}
                d={zone.d}
                stroke="transparent"
                strokeWidth={0}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={cn(
                  "transition-colors duration-300",
                  isMuscle && interactive && "cursor-pointer hover:brightness-[0.97] dark:hover:brightness-110",
                )}
                style={{ fill: zoneFillColor(zone, getLevel) }}
                onClick={isMuscle && onZoneClick ? () => onZoneClick(zone.group!) : undefined}
                onMouseMove={
                  isMuscle && onZoneHover ? (e) => onZoneHover(zone.group!, e) : undefined
                }
                onMouseLeave={onZoneLeave}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function MuscleBodyMap({
  getLevel,
  onZoneClick,
  onZoneHover,
  onZoneLeave,
  className,
}: MuscleBodyMapProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full items-end",
        className,
      )}
    >
      <div className="flex w-1/2 justify-center">
        <BodyView
          zones={FRONT_ZONES}
          viewBox={FRONT_BODY_MAP_VIEWBOX}
          viewKey="front"
          ariaLabel="Vista frontal del cuerpo"
          getLevel={getLevel}
          onZoneClick={onZoneClick}
          onZoneHover={onZoneHover}
          onZoneLeave={onZoneLeave}
        />
      </div>
      <div className="flex w-1/2 justify-center">
        <BodyView
          zones={BACK_ZONES}
          viewBox={BACK_BODY_MAP_VIEWBOX}
          viewKey="back"
          ariaLabel="Vista trasera del cuerpo"
          getLevel={getLevel}
          onZoneClick={onZoneClick}
          onZoneHover={onZoneHover}
          onZoneLeave={onZoneLeave}
        />
      </div>
    </div>
  );
}

export function MuscleMapLegend({
  period,
  className,
}: {
  period: "week" | "month";
  className?: string;
}) {
  const items: { level: MuscleLoadLevel; label: string }[] = [
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
              style={{ backgroundColor: LOAD_COLORS[level] }}
            />
            {label}
          </span>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground/80">
        {period === "week" ? "Semana actual" : "Mes actual"}
      </p>
    </div>
  );
}
