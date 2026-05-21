import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolume, type TimePeriod } from "@/hooks/useMuscleVolume";
import { MuscleDetailSheet } from "./MuscleDetailSheet";
import { MuscleBodyMap, MuscleMapLegend } from "./MuscleBodyMap";
import { heatLevelToLoad } from "./bodyMapPaths";
import type { MainMuscleGroup } from "@/constants/muscleGroups";

const HEATMAP_PERIOD_STORAGE_KEY = "gym-log.dashboard.heatmap-period";

function loadHeatmapPeriod(): TimePeriod {
  try {
    const raw = localStorage.getItem(HEATMAP_PERIOD_STORAGE_KEY);
    if (raw === "week" || raw === "month") return raw;
    return "month";
  } catch {
    return "month";
  }
}

function saveHeatmapPeriod(period: TimePeriod) {
  try {
    localStorage.setItem(HEATMAP_PERIOD_STORAGE_KEY, period);
  } catch {
    // ignore
  }
}

function getHeatLevel(sets: number, max: number): number {
  if (sets === 0 || max === 0) return 0;
  if (sets >= max) return 4;
  const ratio = sets / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  group: string;
  sets: number;
}

export function BodyHeatmap() {
  const [period, setPeriod] = useState<TimePeriod>(loadHeatmapPeriod);
  const [selectedGroup, setSelectedGroup] = useState<MainMuscleGroup | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, group: "", sets: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useMuscleVolume(period);

  useEffect(() => {
    saveHeatmapPeriod(period);
  }, [period]);

  const groupVolume = data?.groupVolume ?? {};
  const specificVolume = data?.specificVolume ?? {};
  const maxVol = data?.maxGroupVolume ?? 0;
  const effectiveMax = period === "month" ? Math.max(maxVol, 36) : Math.max(maxVol, 6);

  const handleMouseMove = (group: MainMuscleGroup, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 25,
      group,
      sets: groupVolume[group] || 0,
    });
  };

  const handleMouseLeave = () => setTooltip((t) => ({ ...t, visible: false }));

  return (
    <>
      <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
        <CardHeader className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle asChild className="text-base font-bold">
              <h2>Carga Muscular</h2>
            </CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
              <TabsList className="h-9 rounded-full p-1">
                <TabsTrigger value="month" className="rounded-full px-4 text-xs data-[state=active]:shadow-xs">
                  Mes
                </TabsTrigger>
                <TabsTrigger value="week" className="rounded-full px-4 text-xs data-[state=active]:shadow-xs">
                  Semana
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="relative px-6 pb-8 pt-0" ref={containerRef}>
          {isLoading ? (
            <Skeleton className="mx-auto h-[320px] w-full max-w-70 rounded-xl" />
          ) : (
            <div className="space-y-5">
              <MuscleBodyMap
                getLevel={(group) => {
                  const sets = groupVolume[group] || 0;
                  return heatLevelToLoad(getHeatLevel(sets, effectiveMax));
                }}
                onZoneClick={setSelectedGroup}
                onZoneHover={handleMouseMove}
                onZoneLeave={handleMouseLeave}
              />

              {tooltip.visible && (
                <div
                  className="pointer-events-none absolute z-50 flex flex-col justify-center rounded-xl border border-border/20 bg-card px-3 py-2 shadow-md transition-all duration-100 ease-out"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <span className="block text-[13px] font-semibold leading-tight">{tooltip.group}</span>
                  <span className="block text-[11px] font-medium leading-tight text-muted-foreground">
                    {tooltip.sets} series
                  </span>
                </div>
              )}

              <MuscleMapLegend period={period} />
            </div>
          )}
        </CardContent>
      </Card>

      <MuscleDetailSheet
        open={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
        group={selectedGroup}
        specificVolume={specificVolume}
      />
    </>
  );
}
