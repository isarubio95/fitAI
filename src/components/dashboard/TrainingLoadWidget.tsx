import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { cn } from "@/lib/utils";
import { getFormClass, getFormLabel } from "@/lib/trainingLoad";
import { useTrainingLoad, type TrainingLoadData, type TrainingLoadPoint } from "@/hooks/useTrainingLoad";

function formatNumber(n: number) {
  return Math.round(n).toLocaleString("es-ES");
}

function formatSigned(value: number) {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

const RANGE_OPTIONS = [
  { key: "1m", label: "1 mes", days: 30 },
  { key: "2m", label: "2 meses", days: 60 },
  { key: "6m", label: "6 meses", days: 180 },
  { key: "1y", label: "1 año", days: 365 },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
const TRAINING_LOAD_RANGE_STORAGE_KEY = "gym-log.training-load.range";
const TRAINING_LOAD_DATA_STORAGE_KEY = "gym-log.training-load.data.v2";

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
  const totals = resolvedData?.totals ?? { fitness: 0, fatigue: 0, form: 0 };
  const formLabel = getFormLabel(totals.form);
  const formClass = getFormClass(totals.form);
  const formDeltaPeriod = useMemo(
    () => (chartData.length < 2 ? 0 : chartData[chartData.length - 1].form - chartData[0].form),
    [chartData],
  );

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
            <p className="text-[11px] text-muted-foreground">Fitness</p>
            {showDynamicSkeleton ? (
              <Skeleton className="mx-auto h-5 w-16" />
            ) : (
              <p className="text-sm font-semibold text-sky-500">{formatNumber(totals.fitness)}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted/40 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">Fatiga</p>
            {showDynamicSkeleton ? (
              <Skeleton className="mx-auto h-5 w-16" />
            ) : (
              <p className="text-sm font-semibold text-amber-500">{formatNumber(totals.fatigue)}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted/40 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">Forma</p>
            {showDynamicSkeleton ? (
              <Skeleton className="mx-auto h-5 w-16" />
            ) : (
              <p className={`text-sm font-semibold ${formClass}`}>
                {formatSigned(totals.form)} · {formLabel}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pt-0">
        {showDynamicSkeleton ? (
          <Skeleton className="h-[180px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="fitness"
                name="Fitness"
                stroke="hsl(199 89% 48%)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="fatigue"
                name="Fatiga"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="form"
                name="Forma"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Fitness
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Fatiga
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Forma
            </span>
          </div>
          {showDynamicSkeleton ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <span>
              Cambio forma:{" "}
              <span className={formDeltaPeriod >= 0 ? "text-emerald-500" : "text-red-500"}>
                {formatSigned(formDeltaPeriod)}
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TrainingLoadTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as TrainingLoadPoint | undefined;
  if (!row) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">{format(new Date(row.date), "d MMM yyyy", { locale: es })}</p>
      <p className="text-muted-foreground">
        Carga: {formatNumber(row.load)} (F {formatNumber(row.loadStrength)} · C{" "}
        {formatNumber(row.loadCardio)})
      </p>
      <p className="text-sky-500">Fitness: {formatNumber(row.fitness)}</p>
      <p className="text-amber-500">Fatiga: {formatNumber(row.fatigue)}</p>
      <p className="text-accent-foreground">
        Forma: {formatSigned(row.form)} · {getFormLabel(row.form)}
      </p>
    </div>
  );
}
