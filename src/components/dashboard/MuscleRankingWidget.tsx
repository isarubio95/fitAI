import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useMuscleStatistics, type MuscleStatistics } from "@/hooks/useMuscleStatistics";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";
import { Flame, Snowflake } from "lucide-react";

export function MuscleRankingWidget() {
  const { data, isLoading } = useMuscleStatistics();
  const [detailGroup, setDetailGroup] = useState<MainMuscleGroup | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const maxCount = Math.max(1, ...data.topGroups.map((g) => g.count));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top 5 */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-primary" /> Más Entrenados
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            {data.topGroups.map(({ group, count }) => (
              <RankRow
                key={group}
                group={group}
                count={count}
                max={maxCount}
                variant="hot"
                onClick={() => setDetailGroup(group)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Bottom 5 */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Snowflake className="h-4 w-4 text-muted-foreground" /> Menos Entrenados
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            {data.bottomGroups.map(({ group, count }) => (
              <RankRow
                key={group}
                group={group}
                count={count}
                max={maxCount}
                variant="cold"
                onClick={() => setDetailGroup(group)}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Sheet */}
      <Sheet open={!!detailGroup} onOpenChange={(open) => !open && setDetailGroup(null)}>
        <SheetContent side="bottom" className="max-h-[70dvh] overflow-y-auto">
          {detailGroup && (
            <DetailContent group={detailGroup} data={data} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ── Row ── */
function RankRow({
  group, count, max, variant, onClick,
}: {
  group: MainMuscleGroup;
  count: number;
  max: number;
  variant: "hot" | "cold";
  onClick: () => void;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/50 cursor-pointer"
    >
      <span className="text-sm font-medium flex-1 truncate">{group}</span>
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{count}s</span>
      <Progress
        value={pct}
        className={`h-2 w-20 ${variant === "cold" ? "[&>div]:bg-muted-foreground" : ""}`}
      />
    </button>
  );
}

/* ── Detail Sheet Content ── */
function DetailContent({ group, data }: { group: MainMuscleGroup; data: MuscleStatistics }) {
  const subCounts = data.subGroupCounts[group];
  const muscles = MUSCLE_GROUPS[group];
  const groupTotal = data.mainGroupCounts[group] || 1;

  return (
    <>
      <SheetHeader>
        <SheetTitle>Detalle de {group}</SheetTitle>
      </SheetHeader>
      <div className="space-y-3 py-4">
        {muscles.map((muscle) => {
          const count = subCounts[muscle] || 0;
          const pct = (count / groupTotal) * 100;
          return (
            <div key={muscle} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{muscle}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{count} series</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </div>
    </>
  );
}
