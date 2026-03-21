import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-56 rounded-none md:rounded-xl" />
        <Skeleton className="h-56 rounded-none md:rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Top 5 */}
        <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
          <CardHeader className="px-6 pt-8 pb-4">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <Flame className="h-4 w-4 text-primary" /> Más Entrenados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 px-6 pb-8 pt-0">
            {data.topGroups.map(({ group, count }, i) => (
              <RankRow
                key={group}
                rank={i + 1}
                group={group}
                count={count}
                onClick={() => setDetailGroup(group)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Bottom 5 */}
        <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
          <CardHeader className="px-6 pt-8 pb-4">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <Snowflake className="h-4 w-4 text-muted-foreground" /> Menos Entrenados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 px-6 pb-8 pt-0">
            {data.bottomGroups.map(({ group, count }, i) => (
              <RankRow
                key={group}
                rank={i + 1}
                group={group}
                count={count}
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
  rank, group, count, onClick,
}: {
  rank: number;
  group: MainMuscleGroup;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between text-sm rounded-lg transition-colors hover:bg-accent/50 text-left"
    >
      <span className="truncate text-muted-foreground">
        <span className="font-medium text-foreground mr-1.5">{rank}.</span>
        {group}
      </span>
      <Badge variant="secondary" className="shrink-0 ml-2">
        {count}×
      </Badge>
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
