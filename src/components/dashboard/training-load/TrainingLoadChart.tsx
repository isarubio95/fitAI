import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_AREA_OPACITY, chartAxis, chartColors, chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TrainingLoadPoint } from "@/hooks/useTrainingLoad";
import {
  ChartScrubLayer,
  ChartScrubStat,
  ChartScrubSummary,
  CHART_SCRUB_CURSOR,
} from "@/components/dashboard/chartScrub";
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
  { key: "1m", label: "1 mes", days: 30, deltaDays: 7 },
  { key: "2m", label: "2 meses", days: 60, deltaDays: 14 },
  { key: "6m", label: "6 meses", days: 180, deltaDays: 30 },
  { key: "1y", label: "1 año", days: 365, deltaDays: 90 },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
const TRAINING_LOAD_RANGE_STORAGE_KEY = "gym-log.training-load.range";
const X_AXIS_HEIGHT = 28;
// Altura del gráfico (ResponsiveContainer) para alinear con `ExerciseProgressWidget` (1RM).
const CHART_HEIGHT = 190;
/** Gutter derecho del área de trazado: margen SVG + ancho del eje Y. */
const CHART_RIGHT_GUTTER = chartYAxis.marginRight + chartYAxis.width;
/** Alto reservado encima del gráfico: lo comparten la tendencia y el resumen por día. */
const CHART_HEADLINE_BLOCK = "mb-3.5";

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

/**
 * Histórico Banister con pills de rango y resumen por día al arrastrar.
 * Vive en el detalle de Forma; el dashboard solo muestra los anillos.
 */
export function TrainingLoadChart({ points }: { points: readonly TrainingLoadPoint[] }) {
  const [range, setRange] = useState<RangeKey>(loadSavedRange);

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

  const selectedRange = useMemo(
    () => RANGE_OPTIONS.find((option) => option.key === range) ?? RANGE_OPTIONS[0],
    [range],
  );
  const selectedRangeDays = selectedRange.days;
  const chartData = useMemo<ChartRow[]>(
    () =>
      points.slice(-selectedRangeDays).map((point) => ({
        ...point,
        gapFatigue: point.form < 0 ? [point.fitness, point.fatigue] : null,
        gapFresh: point.form > 0 ? [point.fatigue, point.fitness] : null,
      })),
    [points, selectedRangeDays],
  );
  const chartDates = useMemo(() => chartData.map((row) => row.date), [chartData]);
  const xAxisTicks = useMemo(
    () => getTrainingLoadXTicks(chartDates, selectedRangeDays),
    [chartDates, selectedRangeDays],
  );

  const yScale = useMemo(() => {
    let max = 0;
    for (const row of chartData) max = Math.max(max, row.fitness, row.fatigue);
    return getTrainingLoadYScale(max);
  }, [chartData]);

  const lastRow = chartData[chartData.length - 1];
  const chartBlockRef = useRef<HTMLDivElement>(null);
  const [scrubRow, setScrubRow] = useState<ChartRow | null>(null);
  /** El resumen por día solo aparece mientras el dedo o el ratón recorren el gráfico. */
  const [isScrubbing, setIsScrubbing] = useState(false);
  const handleScrubIndex = useCallback(
    (index: number) => {
      const row = chartData[index];
      if (row) setScrubRow(row);
    },
    [chartData],
  );

  useEffect(() => {
    setScrubRow(null);
    setIsScrubbing(false);
  }, [range]);

  useEffect(() => {
    if (!isScrubbing) return;
    const hideIfOutside = (event: Event) => {
      if (chartBlockRef.current?.contains(event.target as Node)) return;
      setIsScrubbing(false);
    };
    document.addEventListener("pointerdown", hideIfOutside);
    return () => document.removeEventListener("pointerdown", hideIfOutside);
  }, [isScrubbing]);

  const displayRow = scrubRow ?? lastRow;
  const displayZone = getFormZone(displayRow?.form ?? 0);

  /** Cuánto se ha movido la forma en la ventana propia del rango elegido. */
  const formDelta = useMemo(() => {
    const window = chartData.slice(-(selectedRange.deltaDays + 1));
    if (window.length < 2) return null;
    return window[window.length - 1].form - window[0].form;
  }, [chartData, selectedRange.deltaDays]);

  return (
    <div className="space-y-4">
      <Tabs value={range} onValueChange={handleRangeChange} className="w-full">
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

      {isScrubbing && displayRow ? (
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
      ) : (
        /* Mismo alto que el resumen por día para que el gráfico no salte al pasar por encima. */
        <div className={CHART_HEADLINE_BLOCK}>
          {formDelta != null && (
            <p className="text-[14px] text-muted-foreground">
              <span className="text-foreground">Forma</span>{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatSigned(formDelta)} puntos
              </span>{" "}
              en los últimos {selectedRange.deltaDays} días
            </p>
          )}
        </div>
      )}

      {/*
        `data-vaul-no-drag`: dentro de un drawer, el arrastre horizontal del scrub
        competiría con el gesto de cierre de vaul y el detalle se cerraría al
        recorrer el gráfico.
      */}
      <div ref={chartBlockRef} data-vaul-no-drag className="relative">
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
              width={chartYAxis.width}
              domain={yScale.domain}
              ticks={yScale.ticks}
              interval={0}
              axisLine={false}
              tickLine={false}
              tickMargin={0}
              tick={<ChartYAxisTick />}
              tickFormatter={(value) => formatAxisValue(value as number)}
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
              activeDot={false}
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
              activeDot={false}
              isAnimationActive={false}
            />
            {isScrubbing && displayRow && (
              <>
                <ReferenceLine
                  x={displayRow.date}
                  stroke={CHART_SCRUB_CURSOR.stroke}
                  strokeWidth={CHART_SCRUB_CURSOR.strokeWidth}
                  strokeOpacity={CHART_SCRUB_CURSOR.strokeOpacity}
                  ifOverflow="visible"
                />
                <ReferenceDot
                  x={displayRow.date}
                  y={displayRow.fitness}
                  r={4}
                  fill={chartColors.fitness}
                  stroke={chartAxis.surface}
                  strokeWidth={2}
                />
                <ReferenceDot
                  x={displayRow.date}
                  y={displayRow.fatigue}
                  r={4}
                  fill={chartColors.fatigue}
                  stroke={chartAxis.surface}
                  strokeWidth={2}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        <ChartScrubLayer
          count={chartData.length}
          marginLeft={0}
          marginRight={CHART_RIGHT_GUTTER}
          onIndex={handleScrubIndex}
          onActiveChange={setIsScrubbing}
        />
      </div>
    </div>
  );
}
