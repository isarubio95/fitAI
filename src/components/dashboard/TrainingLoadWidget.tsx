import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { cn } from "@/lib/utils";
import { useTrainingLoad, type TrainingLoadData, type TrainingLoadPoint } from "@/hooks/useTrainingLoad";

function formatNumber(n: number) {
  return Math.round(n).toLocaleString("es-ES");
}

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatSignedPoints(value: number) {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded} pts`;
  return `${rounded} pts`;
}

function getFatigueLabel(score: number) {
  if (score >= 95) return "Muy alta";
  if (score >= 70) return "Alta";
  if (score >= 45) return "Media";
  return "Baja";
}

function getFatigueClass(score: number) {
  if (score >= 95) return "text-red-500";
  if (score >= 70) return "text-amber-500";
  if (score >= 45) return "text-emerald-500";
  return "text-sky-500";
}

const RANGE_OPTIONS = [
  { key: "1m", label: "1 mes", days: 30 },
  { key: "2m", label: "2 meses", days: 60 },
  { key: "6m", label: "6 meses", days: 180 },
  { key: "1y", label: "1 año", days: 365 },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
const TRAINING_LOAD_RANGE_STORAGE_KEY = "gym-log.training-load.range";
const TRAINING_LOAD_DATA_STORAGE_KEY = "gym-log.training-load.data.v1";

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

function loadCachedTrainingLoadData(): TrainingLoadData | null {
  try {
    const raw = localStorage.getItem(TRAINING_LOAD_DATA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrainingLoadData;
    if (!parsed?.points?.length) return null;
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

type TrainingLoadTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: TrainingLoadPoint }>;
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
  const resolvedPoints = resolvedData?.points ?? [];
  const chartData = useMemo(
    () => resolvedPoints.slice(-selectedRangeDays),
    [resolvedPoints, selectedRangeDays],
  );
  const totals = resolvedData?.totals ?? { fatigueScore: 0, fatigueTrend: 0 };
  const fatigueLabel = getFatigueLabel(totals.fatigueScore);
  const fatigueClass = getFatigueClass(totals.fatigueScore);
  const fatigueDeltaPeriod = useMemo(
    () => (chartData.length < 2 ? 0 : chartData[chartData.length - 1].fatigueScore - chartData[0].fatigueScore),
    [chartData],
  );
  const fatigueDeltaPeriodPct = useMemo(() => {
    if (chartData.length < 2) return 0;
    if (chartData[0].fatigueScore <= 0) {
      return fatigueDeltaPeriod > 0 ? 100 : 0;
    }
    return (fatigueDeltaPeriod / chartData[0].fatigueScore) * 100;
  }, [chartData, fatigueDeltaPeriod]);

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
      <CardHeader className="space-y-3 px-6 pt-8 pb-3">
        <div className="flex items-center gap-1.5 pb-1">
          <CardTitle asChild className="text-base">
            <h2>Forma y fatiga</h2>
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="touch-styled h-6 w-6 rounded-full transition-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-100"
              >
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm" side="bottom" align="start">
              <p className="mb-1 font-semibold">¿Cómo leer este gráfico?</p>
              <p className="mb-3 text-muted-foreground">
                Convertimos cada día en puntos de fatiga usando tu volumen registrado y un decaimiento diario para que la curva suba al entrenar y baje al recuperar.
              </p>
              <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                <p>
                  <strong>Puntos diarios:</strong> dependen de la carga de fuerza y cardio que ya registras.
                </p>
                <p>
                  <strong>Fatiga:</strong> acumula puntos al entrenar y se reduce con los días suaves/descanso.
                </p>
                <p>
                  <strong>Tendencia:</strong> suavizado de la fatiga (visible en las métricas y al tocar un punto del gráfico).
                </p>
                <p className="pt-1 text-muted-foreground">
                  Sirve para controlar bloques de carga y evitar pasar muchos días en fatiga alta.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={cn(
                filterPillBase,
                "h-7 px-3 py-0 text-xs",
                range === option.key ? filterPillActive : filterPillInactive,
              )}
              onClick={() => setRange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-muted/40 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">Fatiga hoy</p>
            {showDynamicSkeleton ? (
              <Skeleton className="mx-auto h-5 w-16" />
            ) : (
              <p className="text-sm font-semibold">{formatNumber(totals.fatigueScore)}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted/40 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">Tendencia</p>
            {showDynamicSkeleton ? (
              <Skeleton className="mx-auto h-5 w-16" />
            ) : (
              <p className="text-sm font-semibold">{formatNumber(totals.fatigueTrend)}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted/40 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">Estado</p>
            {showDynamicSkeleton ? (
              <Skeleton className="mx-auto h-5 w-16" />
            ) : (
              <p className={`text-sm font-semibold ${fatigueClass}`}>{fatigueLabel}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pt-0">
        {showDynamicSkeleton ? (
          <Skeleton className="h-[180px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fatigueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.45}
                  vertical={false}
                  horizontal
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickMargin={10}
                  minTickGap={34}
                  tickFormatter={(d) => formatXAxisTickLabel(d, selectedRangeDays)}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  width={36}
                  tickFormatter={(v) => `${Math.round(v as number)}`}
                />
                <Tooltip content={TrainingLoadTooltip} />
                <Area
                  type="monotone"
                  dataKey="fatigueScore"
                  isAnimationActive={false}
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#fatigueGradient)"
                  dot={(props) => {
                    const row = props?.payload as TrainingLoadPoint | undefined;
                    const dotKey = `fatigue-dot-${String(props?.index ?? "unknown")}`;
                    if (!row || row.load <= 0) {
                      return (
                        <circle
                          key={dotKey}
                          cx={props.cx}
                          cy={props.cy}
                          r={0}
                          fill="none"
                          stroke="none"
                        />
                      );
                    }
                    return (
                      <circle
                        key={dotKey}
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill="hsl(var(--accent))"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{
                    r: 5,
                    fill: "hsl(var(--accent))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                  name="Fatiga"
                />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
          {showDynamicSkeleton ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <span>
              Cambio del periodo:{" "}
              <span className={fatigueDeltaPeriod >= 0 ? "text-emerald-500" : "text-red-500"}>
                {formatSignedPoints(fatigueDeltaPeriod)}
              </span>{" "}
              (<span className={fatigueDeltaPeriodPct >= 0 ? "text-emerald-500" : "text-red-500"}>
                {formatSignedPercent(fatigueDeltaPeriodPct)}
              </span>
              )
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TrainingLoadTooltip({ active, payload }: TrainingLoadTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as TrainingLoadPoint | undefined;
  if (!row) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">{format(new Date(row.date), "d MMM yyyy", { locale: es })}</p>
      <p className="text-muted-foreground">Carga: {formatNumber(row.load)}</p>
      <p className="text-accent-foreground">Fatiga: {formatNumber(row.fatigueScore)}</p>
      <p className="text-primary">Tendencia: {formatNumber(row.fatigueTrend)}</p>
    </div>
  );
}
