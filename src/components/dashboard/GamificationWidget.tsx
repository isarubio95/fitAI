import { useProfileStats, xpProgress } from "@/hooks/useGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Shield, Zap } from "lucide-react";

export function GamificationWidget() {
  const { data: stats, isLoading } = useProfileStats();

  if (isLoading) {
    return (
      <Card className="w-full rounded-none border-x-0 md:rounded-2xl md:border-x">
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const { level, progress, needed, percent } = xpProgress(stats.xp_total);
  const hasStreak = stats.racha_actual > 0;

  return (
    <Card className="w-full rounded-none border-x-0 md:rounded-2xl md:border-x">
      <CardContent className="space-y-3 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Nivel {level}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame
              className={`h-5 w-5 transition-colors ${
                hasStreak ? "text-orange-500" : "text-muted-foreground"
              }`}
              fill={hasStreak ? "currentColor" : "none"}
            />
            <span className={`font-semibold text-sm ${hasStreak ? "text-orange-500" : "text-muted-foreground"}`}>
              {stats.racha_actual}
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
