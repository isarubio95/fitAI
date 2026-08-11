import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { CornerDownRight, Info, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_AREA_OPACITY, chartAxis, chartColors } from "@/lib/chart-colors";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { cn } from "@/lib/utils";
import { useTrainingLoad, type TrainingLoadData, type TrainingLoadPoint } from "@/hooks/useTrainingLoad";
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
const RECENT_WINDOW_DAYS = 7;
const Y_AXIS_WIDTH = 40;
const AXIS_TICK = { fill: chartAxis.tick, fontSize: 12 };

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

function formatXAxisTickLabel(dateValue: string, rangeDays: number) {
  const parsedDate = new Date(dateValue);
  if (rangeDays <= 60) {
    return format(parsedDate, "d", { locale: es });
  }
  return format(parsedDate, "MMM", { locale: es });
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
  const totals = resolvedData?.totals ?? { fitness: 0, fatigue: 0, form: 0 };
  const zone = getFormZone(totals.form);

  const loadDomain = useMemo((): [number, number] => {
    let max = 0;
    for (const row of chartData) max = Math.max(max, row.fitness, row.fatigue);
    return [0, Math.max(Math.ceil((max * 1.08) / 20) * 20, 20)];
  }, [chartData]);

  const formDomain = useMemo((): [number, number] => {
    let min = 0;
    let max = 0;
    for (const row of chartData) {
      min = Math.min(min, row.form);
      max = Math.max(max, row.form);
    }
    const pad = Math.max((max - min) * 0.12, 5);
    return [Math.floor((min - pad) / 20) * 20, Math.ceil((max + pad) / 20) * 20];
  }, [chartData]);

  /** Corte del degradado en el 0 para pintar la forma positiva y negativa distinto. */
  const formZeroOffset = useMemo(() => {
    const [min, max] = formDomain;
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  }, [formDomain]);

  const lastRow = chartData[chartData.length - 1];
  const recent = useMemo(() => {
    if (resolvedPoints.length < 2) return null;
    const last = resolvedPoints[resolvedPoints.length - 1];
    const previous =
      resolvedPoints[Math.max(0, resolvedPoints.length - 1 - RECENT_WINDOW_DAYS)] ?? resolvedPoints[0];
    return { from: previous.form, to: last.form, delta: last.form - previous.form };
  }, [resolvedPoints]);

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
      <CardHeader className="px-6 pt-8 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle asChild className="text-[18px]">
            <h2>Forma y fatiga</h2>
          </CardTitle>
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
            <FitnessFatigueBars fitness={totals.fitness} fatigue={totals.fatigue} />
            <FormEquation
              fitness={totals.fitness}
              fatigue={totals.fatigue}
              form={totals.form}
              formColor={zone.color}
            />
            <FormScale form={totals.form} />
          </>
        )}

        <div className="flex flex-wrap justify-around gap-2 pt-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={cn(
                filterPillBase,
                "h-7 px-4 py-0 text-[13px]",
                range === option.key ? filterPillActive : filterPillInactive,
              )}
              onClick={() => setRange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {showDynamicSkeleton ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <div className="space-y-1">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart
                data={chartData}
                syncId="training-load"
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={chartAxis.grid} vertical={false} horizontal />
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={loadDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={AXIS_TICK}
                  width={Y_AXIS_WIDTH}
                  tickCount={4}
                  tickFormatter={formatAxisValue}
                />
                <Tooltip content={TrainingLoadTooltip} />
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
                  isAnimationActive={false}
                />
                {lastRow && (
                  <ReferenceLine
                    segment={[
                      { x: lastRow.date, y: lastRow.fitness },
                      { x: lastRow.date, y: lastRow.fatigue },
                    ]}
                    stroke={lastRow.form < 0 ? chartColors.danger : chartColors.positive}
                    strokeWidth={2}
                    ifOverflow="visible"
                    label={{
                      value: `brecha ${formatNumber(Math.abs(lastRow.form))}`,
                      position: "left",
                      fill: "hsl(var(--foreground))",
                      fontSize: 13,
                    }}
                  />
                )}
                {lastRow && (
                  <ReferenceDot
                    x={lastRow.date}
                    y={lastRow.fitness}
                    r={4}
                    fill={chartColors.fitness}
                    stroke={chartAxis.surface}
                    strokeWidth={2}
                    ifOverflow="visible"
                  />
                )}
                {lastRow && (
                  <ReferenceDot
                    x={lastRow.date}
                    y={lastRow.fatigue}
                    r={4}
                    fill={chartColors.fatigue}
                    stroke={chartAxis.surface}
                    strokeWidth={2}
                    ifOverflow="visible"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>

            <p
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
              style={{ paddingLeft: Y_AXIS_WIDTH }}
            >
              <CornerDownRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Esa brecha sombreada es exactamente la línea de abajo
            </p>

            <ResponsiveContainer width="100%" height={120}>
              <AreaChart
                data={chartData}
                syncId="training-load"
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="training-load-form-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={0} stopColor={chartColors.positive} stopOpacity={0.4} />
                    <stop
                      offset={formZeroOffset}
                      stopColor={chartColors.positive}
                      stopOpacity={0.1}
                    />
                    <stop offset={formZeroOffset} stopColor={chartColors.danger} stopOpacity={0.1} />
                    <stop offset={1} stopColor={chartColors.danger} stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="training-load-form-stroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={formZeroOffset} stopColor={chartColors.positive} />
                    <stop offset={formZeroOffset} stopColor={chartColors.danger} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartAxis.grid} vertical={false} horizontal />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={AXIS_TICK}
                  tickMargin={8}
                  minTickGap={34}
                  tickFormatter={(d: string) => formatXAxisTickLabel(d, selectedRangeDays)}
                />
                <YAxis
                  domain={formDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={AXIS_TICK}
                  width={Y_AXIS_WIDTH}
                  tickCount={3}
                  tickFormatter={formatAxisValue}
                />
                <ReferenceLine y={0} stroke={chartAxis.tick} strokeDasharray="4 4" />
                <Tooltip content={TrainingLoadTooltip} />
                <Area
                  type="monotone"
                  dataKey="form"
                  name="Forma"
                  baseValue={0}
                  stroke="url(#training-load-form-stroke)"
                  strokeWidth={2}
                  fill="url(#training-load-form-fill)"
                  isAnimationActive={false}
                />
                {lastRow && (
                  <ReferenceDot
                    x={lastRow.date}
                    y={lastRow.form}
                    r={4}
                    fill={lastRow.form < 0 ? chartColors.danger : chartColors.positive}
                    stroke={chartAxis.surface}
                    strokeWidth={2}
                    ifOverflow="visible"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
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
            Forma (la brecha)
          </span>
        </div>

        {recent && !showDynamicSkeleton && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[13px]">
            <span className="text-muted-foreground">Últimos {RECENT_WINDOW_DAYS} días</span>
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              style={{ color: recent.delta >= 0 ? chartColors.positive : chartColors.danger }}
            >
              {recent.delta >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden />
              )}
              {formatSigned(recent.delta)} de forma
              <span className="text-muted-foreground">
                · de {formatSigned(recent.from)} a {formatSigned(recent.to)}
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrainingLoadTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as TrainingLoadPoint | undefined;
  if (!row) return null;
  const zone = getFormZone(row.form);
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{format(new Date(row.date), "d MMM yyyy", { locale: es })}</p>
      <p className="text-muted-foreground">
        Carga: {formatNumber(row.load)} (F {formatNumber(row.loadStrength)} · C{" "}
        {formatNumber(row.loadCardio)})
      </p>
      <p style={{ color: chartColors.fitness }}>Fitness: {formatNumber(row.fitness)}</p>
      <p style={{ color: chartColors.fatigue }}>Fatiga: {formatNumber(row.fatigue)}</p>
      <p style={{ color: zone.color }}>
        Forma: {formatSigned(row.form)} · {zone.label}
      </p>
    </div>
  );
}
