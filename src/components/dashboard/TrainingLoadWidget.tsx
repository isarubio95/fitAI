import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_AREA_OPACITY, chartAxis, chartColors, chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTrainingLoad, type TrainingLoadData, type TrainingLoadPoint } from "@/hooks/useTrainingLoad";
import {
  ChartScrubStat,
  ChartScrubSummary,
  ChartScrubSync,
  CHART_SCRUB_CURSOR,
  CHART_SCRUB_TOOLTIP_WRAPPER,
} from "@/components/dashboard/chartScrub";
import {
  FitnessFatigueBars,
  FormEquation,
} from "@/components/dashboard/training-load/FitnessFatigueBars";
import { FormScale } from "@/components/dashboard/training-load/FormScale";
import { getFormZone } from "@/components/dashboard/training-load/formZones";
import {
  formatAxisValue,
  formatNumber,
  formatSigned,
  formatTrainingLoadXTick,
  getTrainingLoadXTicks,
  getTrainingLoadYScale,
} from "@/components/dashboard/training-load/format";

const RANGE_OPTIONS = [
  { key: "1m", label: "1 mes", days: 30 },
  { key: "2m", label: "2 meses", days: 60 },
  { key: "6m", label: "6 meses", days: 180 },
  { key: "1y", label: "1 año", days: 365 },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
const TRAINING_LOAD_RANGE_STORAGE_KEY = "gym-log.training-load.range";
const TRAINING_LOAD_DATA_STORAGE_KEY = "gym-log.training-load.data.v2";
const X_AXIS_HEIGHT = 28;
// Altura del gráfico (ResponsiveContainer) para alinear con `ExerciseProgressWidget` (1RM).
const CHART_HEIGHT = 190;

function isValidRangeKey(value: string): value is RangeKey {
  return RANGE_OPTIONS.some((option) => option.key === value);
}

function loadSavedRange(): RangeKey {
  try {
    const raw = localStorage.getItem(TRAINING_LOAD_RANGE_STORAGE_KEY);
    if (raw && isValidRangeKey(raw)) return raw;
  } catch {
    // ignore
  }
  return "1m";
}

function isTrainingLoadData(value: unknown): value is TrainingLoadData {
  if (!value || typeof value !== "object") return false;
  const v = value as TrainingLoadData;
  return Array.isArray(v.points) && !!v.totals && typeof v.totals.fitness === "number";
}

function loadCachedTrainingLoadData(): TrainingLoadData | null {
  try {
    const raw = localStorage.getItem(TRAINING_LOAD_DATA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isTrainingLoadData(parsed) || !parsed.points.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedTrainingLoadData(payload: TrainingLoadData): void {
  try {
    localStorage.setItem(TRAINING_LOAD_DATA_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function DayAxisTick({
  x,
  y,
  payload,
  rangeDays,
}: {
  x?: string | number;
  y?: string | number;
  payload?: { value?: string };
  rangeDays: number;
}) {
  const dateValue = payload?.value;
  const xNum = typeof x === "number" ? x : Number(x);
  const yNum = typeof y === "number" ? y : Number(y);
  if (!Number.isFinite(xNum) || !Number.isFinite(yNum) || !dateValue) return null;

  return (
    <text
      x={xNum}
      y={yNum + 12}
      textAnchor="middle"
      fill={chartAxis.tick}
      fontSize={11}
    >
      {formatTrainingLoadXTick(dateValue, rangeDays)}
    </text>
  );
}

type ChartRow = TrainingLoadPoint & {
  /** Brecha sombreada entre ambas curvas: [abajo, arriba]. */
  gapFatigue: [number, number] | null;
  gapFresh: [number, number] | null;
};

export function TrainingLoadWidget() {
  const { data, isLoading, isFetching } = useTrainingLoad();
  const [cachedData, setCachedData] = useState<TrainingLoadData | null>(loadCachedTrainingLoadData);
  const [range, setRange] = useState<RangeKey>(loadSavedRange);
  // Nota: se elimina el “modo explicar” del gráfico.

  useEffect(() => {
    if (data?.points?.length) {
      setCachedData(data);
      saveCachedTrainingLoadData(data);
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(TRAINING_LOAD_RANGE_STORAGE_KEY, range);
    } catch {
      // ignore
    }
  }, [range]);

  const handleRangeChange = useCallback((value: string) => {
    if (isValidRangeKey(value)) setRange(value);
  }, []);

  const resolvedData = data?.points?.length ? data : cachedData;
  const showDynamicSkeleton = isFetching && !!resolvedData;
  const selectedRangeDays = useMemo(
    () => RANGE_OPTIONS.find((option) => option.key === range)?.days ?? 30,
    [range],
  );
  const resolvedPoints = useMemo(() => resolvedData?.points ?? [], [resolvedData]);
  const chartData = useMemo<ChartRow[]>(
    () =>
      resolvedPoints.slice(-selectedRangeDays).map((point) => ({
        ...point,
        gapFatigue: point.form < 0 ? [point.fitness, point.fatigue] : null,
        gapFresh: point.form > 0 ? [point.fatigue, point.fitness] : null,
      })),
    [resolvedPoints, selectedRangeDays],
  );
  const chartDates = useMemo(() => chartData.map((row) => row.date), [chartData]);
  const xAxisTicks = useMemo(
    () => getTrainingLoadXTicks(chartDates, selectedRangeDays),
    [chartDates, selectedRangeDays],
  );
  const totals = resolvedData?.totals ?? { fitness: 0, fatigue: 0, form: 0 };
  const zone = getFormZone(totals.form);

  const yScale = useMemo(() => {
    let max = 0;
    for (const row of chartData) max = Math.max(max, row.fitness, row.fatigue);
    return getTrainingLoadYScale(max);
  }, [chartData]);

  const lastRow = chartData[chartData.length - 1];
  const lastIndex = chartData.length > 0 ? chartData.length - 1 : undefined;
  const [scrubRow, setScrubRow] = useState<ChartRow | null>(null);
  const handleScrubPoint = useCallback((point: ChartRow | undefined) => {
    setScrubRow(point ?? null);
  }, []);

  useEffect(() => {
    setScrubRow(null);
  }, [range]);

  const displayRow = scrubRow ?? lastRow;
  const displayZone = displayRow ? getFormZone(displayRow.form) : zone;

  if (isLoading && !resolvedData) {
    return (
      <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
        <CardHeader className="px-6 pt-8 pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!resolvedData?.points?.length) return null;

  return (
    <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
      <CardHeader className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle asChild className="text-base font-bold">
            <h2>Forma y fatiga</h2>
          </CardTitle>
          <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="touch-styled h-6 w-6 rounded-full transition-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-100"
                    aria-label="Cómo se calcula la forma"
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 text-sm" side="bottom" align="end">
                  <p className="mb-1 font-semibold">¿Cómo se calcula?</p>
                  <p className="mb-3 text-muted-foreground">
                    Modelo Banister/Coggan: cada día suma carga de fuerza (volumen × RIR y FC si hay) y
                    cardio (TRIMP por FC o TSS por potencia). Fitness acumula a ~42 días; Fatiga a ~7;
                    Forma = Fitness − Fatiga.
                  </p>
                  <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                    <p>
                      <strong>Fitness:</strong> adaptación a largo plazo (CTL).
                    </p>
                    <p>
                      <strong>Fatiga:</strong> cansancio reciente (ATL).
                    </p>
                    <p>
                      <strong>Forma:</strong> frescura relativa; positiva = más fresco.
                    </p>
                    <p className="pt-1 text-muted-foreground">
                      Con sensor de FC, el esfuerzo relativo ≈ Edwards TRIMP (tiempo en zonas).
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pt-0">
        {showDynamicSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <FitnessFatigueBars
              fitness={totals.fitness}
              fatigue={totals.fatigue}
            />
            <FormEquation
              fitness={totals.fitness}
              fatigue={totals.fatigue}
              form={totals.form}
              formColor={zone.color}
            />
            <FormScale form={totals.form} />
          </>
        )}

        <Tabs value={range} onValueChange={handleRangeChange} className="w-full pt-1">
          <AnimatedTabsList value={range} className={cn(pillTabsListClass, "w-full")}>
            {RANGE_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.key}
                value={option.key}
                className={cn(pillTabsTriggerClass, "min-w-0 flex-1 px-2")}
              >
                {option.label}
              </TabsTrigger>
            ))}
          </AnimatedTabsList>
        </Tabs>

        {showDynamicSkeleton ? (
          <Skeleton className="h-[190px] w-full" />
        ) : (
          <>
            {displayRow && (
              <ChartScrubSummary date={displayRow.date}>
                <ChartScrubStat
                  label="Fitness"
                  value={formatNumber(displayRow.fitness)}
                  color={chartColors.fitness}
                />
                <ChartScrubStat
                  label="Fatiga"
                  value={formatNumber(displayRow.fatigue)}
                  color={chartColors.fatigue}
                />
                <ChartScrubStat
                  label="Forma"
                  value={`${formatSigned(displayRow.form)} · ${displayZone.label}`}
                  color={displayZone.color}
                />
                <ChartScrubStat
                  label="Carga"
                  value={`${formatNumber(displayRow.load)} (F ${formatNumber(displayRow.loadStrength)} · C ${formatNumber(displayRow.loadCardio)})`}
                />
              </ChartScrubSummary>
            )}
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <ComposedChart
                key={range}
                data={chartData}
                margin={{ top: 12, right: chartYAxis.marginRight, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={chartAxis.grid}
                  strokeOpacity={chartAxis.gridOpacity}
                  vertical={false}
                  horizontal
                  horizontalValues={yScale.ticks}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  height={X_AXIS_HEIGHT}
                  tickMargin={4}
                  ticks={xAxisTicks}
                  interval={0}
                  tick={(props) => <DayAxisTick {...props} rangeDays={selectedRangeDays} />}
                />
                <YAxis
                  type="number"
                  orientation={chartYAxis.orientation}
                  domain={yScale.domain}
                  ticks={yScale.ticks}
                  interval={0}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={0}
                  tick={<ChartYAxisTick fontSize={12} />}
                  width={chartYAxis.width}
                  tickFormatter={formatAxisValue}
                />
                <Tooltip
                  active
                  defaultIndex={lastIndex}
                  cursor={false}
                  isAnimationActive={false}
                  wrapperStyle={CHART_SCRUB_TOOLTIP_WRAPPER}
                  content={<ChartScrubSync onPoint={handleScrubPoint} />}
                />
                <Area
                  dataKey="gapFatigue"
                  name="Forma"
                  stroke="none"
                  fill={chartColors.danger}
                  fillOpacity={CHART_AREA_OPACITY}
                  connectNulls={false}
                  isAnimationActive={false}
                  activeDot={false}
                  legendType="none"
                  tooltipType="none"
                />
                <Area
                  dataKey="gapFresh"
                  name="Forma"
                  stroke="none"
                  fill={chartColors.positive}
                  fillOpacity={CHART_AREA_OPACITY}
                  connectNulls={false}
                  isAnimationActive={false}
                  activeDot={false}
                  legendType="none"
                  tooltipType="none"
                />
                <Line
                  type="monotone"
                  dataKey="fitness"
                  name="Fitness"
                  stroke={chartColors.fitness}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: chartAxis.surface, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  name="Fatiga"
                  stroke={chartColors.fatigue}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 4, stroke: chartAxis.surface, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                {displayRow && (
                  <ReferenceLine
                    x={displayRow.date}
                    stroke={CHART_SCRUB_CURSOR.stroke}
                    strokeWidth={CHART_SCRUB_CURSOR.strokeWidth}
                    strokeOpacity={CHART_SCRUB_CURSOR.strokeOpacity}
                    ifOverflow="visible"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: chartColors.fitness }}
              aria-hidden
            />{" "}
            Fitness
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-4 rounded-full"
              style={{
                backgroundImage: `repeating-linear-gradient(to right, ${chartColors.fatigue} 0 5px, transparent 5px 8px)`,
              }}
              aria-hidden
            />{" "}
            Fatiga
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ backgroundColor: chartColors.danger, opacity: 0.55 }}
              aria-hidden
            />{" "}
            Forma
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
