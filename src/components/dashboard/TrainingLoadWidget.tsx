import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Flame, Info, Scale, TrendingUp } from "lucide-react";
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

function clampPct(value: number) {
  return Math.max(0, Math.min(100, value));
}

/** Barra horizontal 0→100% sobre un fondo muted. */
function LoadBar({
  pct,
  barClassName,
  "aria-label": ariaLabel,
}: {
  pct: number;
  barClassName: string;
  "aria-label": string;
}) {
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", barClassName)}
        style={{ width: `${clampPct(pct)}%` }}
      />
    </div>
  );
}

/**
 * Barra bipolar centrada en 0: izquierda = Forma negativa (más fatiga),
 * derecha = Forma positiva (más fresco).
 */
function FormBalanceBar({
  form,
  scale,
  barClassName,
}: {
  form: number;
  scale: number;
  barClassName: string;
}) {
  const half = Math.max(scale, 1);
  const pctOfHalf = clampPct((Math.abs(form) / half) * 100);
  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
      role="meter"
      aria-valuenow={Math.round(form)}
      aria-valuemin={-Math.round(half)}
      aria-valuemax={Math.round(half)}
      aria-label="Forma (Fitness menos Fatiga)"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      {form < 0 ? (
        <div
          className={cn("absolute inset-y-0 right-1/2 rounded-l-full transition-[width] duration-300", barClassName)}
          style={{ width: `${pctOfHalf / 2}%` }}
        />
      ) : form > 0 ? (
        <div
          className={cn("absolute inset-y-0 left-1/2 rounded-r-full transition-[width] duration-300", barClassName)}
          style={{ width: `${pctOfHalf / 2}%` }}
        />
      ) : null}
    </div>
  );
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
  /** Misma escala para Fitness y Fatiga → se ve de dónde sale la diferencia. */
  const compareScale = Math.max(totals.fitness, totals.fatigue, 1);
  const formScale = Math.max(Math.abs(totals.form), compareScale * 0.35, 25);
  const fitnessPct = (totals.fitness / compareScale) * 100;
  const fatiguePct = (totals.fatigue / compareScale) * 100;
  const yDomain = useMemo((): [number, number] => {
    if (!chartData.length) return [0, 25];
    let min = 0;
    let max = 0;
    for (const row of chartData) {
      min = Math.min(min, row.fitness, row.fatigue, row.form);
      max = Math.max(max, row.fitness, row.fatigue, row.form);
    }
    const pad = Math.max((max - min) * 0.08, 5);
    const niceMin = Math.floor((min - (min < 0 ? pad : 0)) / 25) * 25;
    const niceMax = Math.ceil((max + pad) / 25) * 25;
    return [Math.min(niceMin, 0), Math.max(niceMax, 25)];
  }, [chartData]);

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
        <div className="space-y-3 rounded-xl bg-muted/40 p-3">
          {showDynamicSkeleton ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-sky-500" aria-hidden />
                    Fitness
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-sky-500">
                    {formatNumber(totals.fitness)}
                  </p>
                </div>
                <LoadBar pct={fitnessPct} barClassName="bg-sky-500" aria-label="Fitness" />
                <p className="text-[10px] text-muted-foreground">Adaptación a largo plazo (~42 días)</p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span aria-hidden>−</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                    Fatiga
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-amber-500">
                    {formatNumber(totals.fatigue)}
                  </p>
                </div>
                <LoadBar pct={fatiguePct} barClassName="bg-amber-500" aria-label="Fatiga" />
                <p className="text-[10px] text-muted-foreground">Cansancio reciente (~7 días)</p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span aria-hidden>=</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Scale className="h-3.5 w-3.5 text-accent-foreground" aria-hidden />
                    Forma
                  </p>
                  <p className={cn("text-sm font-semibold tabular-nums", formClass)}>
                    {formatSigned(totals.form)}
                    <span className="ml-1.5 font-medium">· {formLabel}</span>
                  </p>
                </div>
                <FormBalanceBar
                  form={totals.form}
                  scale={formScale}
                  barClassName={
                    totals.form >= 0 ? "bg-emerald-500" : "bg-amber-500"
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Forma = Fitness − Fatiga
                  {totals.form < 0
                    ? " · más fatiga que forma acumulada"
                    : totals.form > 0
                      ? " · más fresco que fatigado"
                      : " · en equilibrio"}
                </p>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pt-0">
        {showDynamicSkeleton ? (
          <Skeleton className="h-[180px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
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
                domain={yDomain}
                allowDataOverflow={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                width={44}
                tickCount={6}
                tickFormatter={(v) => {
                  const n = Math.round(v as number);
                  // Evitar que el "-" se confunda / se recorte en ticks negativos.
                  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
                }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeOpacity={0.9} />
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
