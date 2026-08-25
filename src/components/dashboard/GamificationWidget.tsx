import { useProfileStats, xpProgress } from "@/hooks/useGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_CARD } from "@/lib/pageStyles";

type GamificationWidgetProps = {
  /** Si se omite, usa el usuario autenticado (como en el dashboard). */
  userId?: string;
  /** Padding del contenido. Por defecto el del dashboard (`py-6`). */
  contentClassName?: string;
};

export function GamificationWidget({ userId, contentClassName }: GamificationWidgetProps) {
  const { data: stats, isLoading } = useProfileStats(userId);
  const bodyClass = cn("space-y-3 p-0 px-6 py-6", contentClassName);

  if (isLoading) {
    return (
      <Card className={PAGE_CARD}>
        <CardContent className={bodyClass}>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const { level, progress, needed, percent } = xpProgress(stats.xp_total);
  const hasStreak = stats.racha_actual > 0;

  return (
    <Card className={PAGE_CARD}>
      <CardContent className={bodyClass}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">Nivel {level}</span>
          <div className="flex items-center gap-1.5">
            <Flame
              className={`h-5 w-5 transition-colors ${
                hasStreak ? "text-orange-500" : "text-muted-foreground"
              }`}
              fill={hasStreak ? "currentColor" : "none"}
            />
            <span className={`font-semibold text-sm ${hasStreak ? "text-orange-500" : "text-muted-foreground"}`}>
              {stats.racha_actual} {stats.racha_actual === 1 ? "semana" : "semanas"}
            </span>
          </div>
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
