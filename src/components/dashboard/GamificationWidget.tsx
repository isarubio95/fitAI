import { useId } from "react";
import { useProfileStats, xpProgress } from "@/hooks/useGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_CARD } from "@/lib/pageStyles";

function StreakFireLabel({ weeks }: { weeks: number }) {
  const uid = useId().replace(/:/g, "");
  const unit = weeks === 1 ? "semana" : "semanas";
  const label = `${weeks} ${unit}`;

  if (weeks <= 0) {
    return (
      <div className="flex items-center gap-1.5" aria-label="Sin racha semanal">
        <Flame className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      </div>
    );
  }

  const fillId = `streak-fire-fill-${uid}`;

  return (
    <div className="streak-fire flex items-center gap-1.5" aria-label={`Racha de ${label}`}>
      <span className="streak-fire-mark relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="streak-fire-glow" aria-hidden />
        <svg width={0} height={0} aria-hidden className="absolute">
          <defs>
            <linearGradient id={fillId} x1="0.32" y1="1" x2="0.68" y2="0">
              <stop offset="0%" stopColor="var(--fire-ember)" />
              <stop offset="28%" stopColor="var(--fire-edge)" />
              <stop offset="58%" stopColor="var(--fire-mid)" />
              <stop offset="82%" stopColor="var(--fire-core)" />
              <stop offset="100%" stopColor="var(--fire-tip)" />
            </linearGradient>
          </defs>
        </svg>
        <Flame
          className="relative h-5 w-5 text-chart-fatigue"
          fill={`url(#${fillId})`}
          stroke={`url(#${fillId})`}
          strokeWidth={1.6}
        />
      </span>
      <span className="streak-fire-text text-sm font-semibold tabular-nums">{label}</span>
    </div>
  );
}

type GamificationWidgetProps = {
  /** Si se omite, usa el usuario autenticado (como en el dashboard). */
  userId?: string;
  /** Padding del contenido. Por defecto el del dashboard (`py-6`). */
  contentClassName?: string;
  className?: string;
};

export function GamificationWidget({ userId, contentClassName, className }: GamificationWidgetProps) {
  const { data: stats, isLoading } = useProfileStats(userId);
  const bodyClass = cn("space-y-3 p-0 px-5 py-6", contentClassName);
  const cardClass = cn(PAGE_CARD, className);

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <CardContent className={bodyClass}>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const { level, progress, needed, percent } = xpProgress(stats.xp_total);

  return (
    <Card className={cardClass}>
      <CardContent className={bodyClass}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">Nivel {level}</span>
          <StreakFireLabel weeks={stats.racha_actual} />
        </div>

        <div className="space-y-1.5">
          <Progress value={percent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {progress} / {needed} XP
            </span>
            <span>Nivel {level + 1}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
