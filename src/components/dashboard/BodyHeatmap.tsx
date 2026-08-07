import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabsList, pillTabsListClass, pillTabsTriggerClass, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { useMuscleVolume, type TimePeriod } from "@/hooks/useMuscleVolume";
import { useMuscleFatigue } from "@/hooks/useMuscleFatigue";
import { MuscleDetailSheet } from "./MuscleDetailSheet";
import { MuscleBodyMap, MuscleMapLegend } from "./MuscleBodyMap";
import { getHeatLevel, heatLevelToLoad } from "./bodyMapPaths";
import type { MainMuscleGroup } from "@/constants/muscleGroups";

const HEATMAP_PERIOD_STORAGE_KEY = "gym-log.dashboard.heatmap-period";
const HEATMAP_MODE_STORAGE_KEY = "gym-log.dashboard.heatmap-mode";
const HEATMAP_DATA_CACHE_STORAGE_KEY = "gym-log.dashboard.heatmap-data.v1";
const HEATMAP_FATIGUE_CACHE_STORAGE_KEY = "gym-log.dashboard.heatmap-fatigue.v1";

type HeatmapMode = "volume" | "fatigue";

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

function loadHeatmapMode(): HeatmapMode {
  try {
    const raw = localStorage.getItem(HEATMAP_MODE_STORAGE_KEY);
    if (raw === "volume" || raw === "fatigue") return raw;
  } catch {
    // ignore
  }
  return "volume";
}

function saveHeatmapMode(mode: HeatmapMode) {
  try {
    localStorage.setItem(HEATMAP_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  group: MainMuscleGroup | "";
  sets: number;
  fatigue: number;
  daysToBaseline: number;
}

interface CachedHeatmapSnapshot {
  period: TimePeriod;
  timestamp: number;
  payload: {
    groupVolume: Record<string, number>;
    specificVolume: Record<string, number>;
    maxGroupVolume: number;
  };
}

interface CachedFatigueSnapshot {
  period: TimePeriod;
  timestamp: number;
  payload: {
    groupFatigue: Record<string, number>;
    daysToBaseline: Record<string, number>;
    maxGroupFatigue: number;
  };
}

function loadCachedHeatmap(period: TimePeriod): CachedHeatmapSnapshot["payload"] | null {
  try {
    const raw = localStorage.getItem(HEATMAP_DATA_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedHeatmapSnapshot;
    if (parsed.period !== period) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function saveCachedHeatmap(period: TimePeriod, payload: CachedHeatmapSnapshot["payload"]): void {
  try {
    const snapshot: CachedHeatmapSnapshot = {
      period,
      timestamp: Date.now(),
      payload,
    };
    localStorage.setItem(HEATMAP_DATA_CACHE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore
  }
}

function loadCachedFatigue(period: TimePeriod): CachedFatigueSnapshot["payload"] | null {
  try {
    const raw = localStorage.getItem(HEATMAP_FATIGUE_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedFatigueSnapshot;
    if (parsed.period !== period) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function saveCachedFatigue(period: TimePeriod, payload: CachedFatigueSnapshot["payload"]): void {
  try {
    const snapshot: CachedFatigueSnapshot = {
      period,
      timestamp: Date.now(),
      payload,
    };
    localStorage.setItem(HEATMAP_FATIGUE_CACHE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore
  }
}

export function BodyHeatmap() {
  const [period, setPeriod] = useState<TimePeriod>(loadHeatmapPeriod);
  const [mode, setMode] = useState<HeatmapMode>(loadHeatmapMode);
  const [selectedGroup, setSelectedGroup] = useState<MainMuscleGroup | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    group: "",
    sets: 0,
    fatigue: 0,
    daysToBaseline: 0,
  });
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useMuscleVolume(period);
  const { data: fatigueData, isLoading: fatigueLoading } = useMuscleFatigue(period);

  useEffect(() => {
    saveHeatmapPeriod(period);
  }, [period]);

  useEffect(() => {
    saveHeatmapMode(mode);
  }, [mode]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    saveCachedHeatmap(period, {
      groupVolume: data.groupVolume ?? {},
      specificVolume: data.specificVolume ?? {},
      maxGroupVolume: data.maxGroupVolume ?? 0,
    });
  }, [data, period]);

  useEffect(() => {
    if (!fatigueData) return;
    saveCachedFatigue(period, {
      groupFatigue: fatigueData.groupFatigue ?? {},
      daysToBaseline: fatigueData.daysToBaseline ?? {},
      maxGroupFatigue: fatigueData.maxGroupFatigue ?? 0,
    });
  }, [fatigueData, period]);

  const cachedData = useMemo(() => loadCachedHeatmap(period), [period]);
  const cachedFatigue = useMemo(() => loadCachedFatigue(period), [period]);
  const resolvedData = useMemo(
    () =>
      data ?? {
        groupVolume: cachedData?.groupVolume ?? {},
        specificVolume: cachedData?.specificVolume ?? {},
        maxGroupVolume: cachedData?.maxGroupVolume ?? 0,
      },
    [cachedData, data],
  );
  const resolvedFatigue = useMemo(
    () =>
      fatigueData ?? {
        groupFatigue: cachedFatigue?.groupFatigue ?? {},
        daysToBaseline: cachedFatigue?.daysToBaseline ?? {},
        maxGroupFatigue: cachedFatigue?.maxGroupFatigue ?? 0,
      },
    [cachedFatigue, fatigueData],
  );

  const isMapLoading =
    mode === "volume" ? isLoading && !data : fatigueLoading && !fatigueData;
  const isUsingOfflineFallback =
    mode === "volume"
      ? !data && !isLoading && Object.keys(resolvedData.groupVolume).length > 0
      : !fatigueData && !fatigueLoading && Object.keys(resolvedFatigue.groupFatigue).length > 0;

  const groupVolume = resolvedData.groupVolume;
  const specificVolume = resolvedData.specificVolume;
  const groupFatigue = resolvedFatigue.groupFatigue;
  const daysToBaseline = resolvedFatigue.daysToBaseline;

  const effectiveMax = useMemo(() => {
    if (mode === "fatigue") {
      return Math.max(resolvedFatigue.maxGroupFatigue ?? 0, 8);
    }
    const minThreshold = period === "month" ? 36 : 6;
    return Math.max(resolvedData.maxGroupVolume ?? 0, minThreshold);
  }, [mode, period, resolvedData.maxGroupVolume, resolvedFatigue.maxGroupFatigue]);

  const handleMouseMove = useCallback(
    (group: MainMuscleGroup, e: React.MouseEvent<SVGPathElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 25,
        group,
        sets: groupVolume[group] || 0,
        fatigue: groupFatigue[group] || 0,
        daysToBaseline: daysToBaseline[group] || 0,
      });
    },
    [daysToBaseline, groupFatigue, groupVolume],
  );

  const handleMouseLeave = useCallback(
    () => setTooltip((t) => ({ ...t, visible: false })),
    [],
  );

  const getLevelForGroup = useCallback(
    (group: MainMuscleGroup) => {
      if (mode === "fatigue") {
        const score = groupFatigue[group] || 0;
        return heatLevelToLoad(getHeatLevel(score, effectiveMax));
      }
      const sets = groupVolume[group] || 0;
      return heatLevelToLoad(getHeatLevel(sets, effectiveMax));
    },
    [effectiveMax, groupFatigue, groupVolume, mode],
  );

  const handlePeriodChange = useCallback((value: string) => {
    if (value === "week" || value === "month") {
      setPeriod(value);
    }
  }, []);

  const handleModeChange = useCallback((value: string) => {
    if (value === "volume" || value === "fatigue") {
      setMode(value);
    }
  }, []);

  return (
    <>
      <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
        <CardHeader className="space-y-3 px-6 pt-8 pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle asChild className="text-base font-bold">
              <h2>Carga Muscular</h2>
            </CardTitle>
            <Tabs value={mode} onValueChange={handleModeChange}>
              <AnimatedTabsList value={mode} className={pillTabsListClass}>
                <TabsTrigger value="volume" className={pillTabsTriggerClass}>
                  Volumen
                </TabsTrigger>
                <TabsTrigger value="fatigue" className={pillTabsTriggerClass}>
                  Fatiga
                </TabsTrigger>
              </AnimatedTabsList>
            </Tabs>
          </div>
          {mode === "volume" && (
            <div className="flex justify-end">
              <Tabs value={period} onValueChange={handlePeriodChange}>
                <AnimatedTabsList value={period} className={pillTabsListClass}>
                  <TabsTrigger value="month" className={pillTabsTriggerClass}>
                    Mes
                  </TabsTrigger>
                  <TabsTrigger value="week" className={pillTabsTriggerClass}>
                    Semana
                  </TabsTrigger>
                </AnimatedTabsList>
              </Tabs>
            </div>
          )}
        </CardHeader>

        <CardContent className="relative px-6 pt-0" ref={containerRef}>
          <div className="space-y-5">
            {isUsingOfflineFallback && !isOnline && (
              <p className="text-center text-xs text-muted-foreground">
                Mostrando datos guardados sin conexión.
              </p>
            )}
            {mode === "fatigue" && (
              <p className="text-center text-xs text-muted-foreground">
                Fatiga local por grupo (decay ~4 días). Más intenso = más recuperación pendiente.
              </p>
            )}
            <MuscleBodyMap
              getLevel={getLevelForGroup}
              isLoading={isMapLoading}
              onZoneClick={setSelectedGroup}
              onZoneHover={handleMouseMove}
              onZoneLeave={handleMouseLeave}
            />

            {tooltip.visible && !isMapLoading && (
              <div
                className="pointer-events-none absolute z-50 flex flex-col justify-center rounded-xl border border-border/20 bg-card px-3 py-2 shadow-md transition-all duration-100 ease-out"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                <span className="block text-[13px] font-semibold leading-tight">{tooltip.group}</span>
                {mode === "fatigue" ? (
                  <>
                    <span className="block text-[11px] font-medium leading-tight text-muted-foreground">
                      Fatiga {Math.round(tooltip.fatigue)}
                    </span>
                    <span className="block text-[11px] font-medium leading-tight text-muted-foreground">
                      ~{tooltip.daysToBaseline}d a baseline
                    </span>
                  </>
                ) : (
                  <span className="block text-[11px] font-medium leading-tight text-muted-foreground">
                    {tooltip.sets} series
                  </span>
                )}
              </div>
            )}

            {mode === "volume" && <MuscleMapLegend period={period} />}
          </div>
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
