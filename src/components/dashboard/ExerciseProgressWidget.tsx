import { useState, useRef, useCallback, useMemo } from "react";
import { useExerciseWithHistory, useExerciseHistory } from "@/hooks/useExerciseProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

const SWIPE_THRESHOLD = 50;

function formatWeight(value: number) {
  const n = Number(value);
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function getNiceStep(range: number) {
  if (range <= 10) return 2.5;
  if (range <= 30) return 5;
  if (range <= 80) return 10;
  if (range <= 200) return 25;
  return 50;
}

function getUniformYScale(history: { oneRepMax: number }[], tickCount = 5) {
  if (!history.length) {
    const ticks = [0, 12.5, 25, 37.5, 50];
    return { domain: [ticks[0], ticks[ticks.length - 1]] as [number, number], ticks };
  }

  const values = history.map((d) => d.oneRepMax);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rawRange = Math.max(1, max - min);
  const step = getNiceStep(rawRange);
  const minDomain = Math.max(0, Math.floor((min - step) / step) * step);
  const maxDomain = Math.ceil((max + step) / step) * step;
  const finalStep = (maxDomain - minDomain) / (tickCount - 1);

  const ticks = Array.from({ length: tickCount }, (_, i) => minDomain + i * finalStep);
  return { domain: [minDomain, maxDomain] as [number, number], ticks };
}

export function ExerciseProgressWidget() {
  const { data: exercises, isLoading: loadingExercises } = useExerciseWithHistory();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedExercise = exercises?.[selectedIndex];
  const { data: historyData, isLoading: loadingHistory } = useExerciseHistory(selectedExercise?.id);
  const history = historyData?.history;
  const lastRecord = historyData?.lastRecord;
  const yScale = useMemo(() => getUniformYScale(history ?? []), [history]);

  // Swipe handling
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [swiping, setSwiping] = useState(false);

  const goNext = useCallback(() => {
    if (exercises && selectedIndex < exercises.length - 1) {
      setSelectedIndex((i) => i + 1);
    }
  }, [exercises, selectedIndex]);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIndex((i) => i - 1);
    }
  }, [selectedIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    else if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
    touchDeltaX.current = 0;
    setSwiping(false);
  };

  if (loadingExercises) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!exercises?.length) return null;

  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < exercises.length - 1;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CardTitle asChild className="text-base font-bold">
              <h2>Fuerza Máxima</h2>
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="group h-6 w-6 rounded-full hover:bg-transparent focus-visible:bg-transparent"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-150 group-hover:text-foreground group-focus-visible:text-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 text-sm" side="bottom" align="start">
                <p className="font-semibold mb-1">¿Qué es el 1RM Estimado?</p>
                <p className="text-muted-foreground mb-3">
                  Es el peso máximo teórico que podrías levantar a una sola repetición. 
                  El cálculo toma automáticamente tu <strong>mejor serie efectiva del día</strong>, ignorando calentamientos o series de fatiga.
                </p>
                {lastRecord ? (
                  <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                    <p className="font-medium">Tu mejor serie registrada:</p>
                    <p className="text-muted-foreground">Moviste: {formatWeight(lastRecord.weight)}kg × {lastRecord.reps} reps</p>
                    <p className="text-primary font-semibold">Tu 1RM teórico es: {formatWeight(lastRecord.oneRepMax)}kg</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {Number(lastRecord.weight).toFixed(2)} × (1 + 0.0333 × {lastRecord.reps})
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                    <p className="text-muted-foreground">Aquí verás el cálculo cuando registres tu primer entrenamiento.</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      Peso × (1 + 0.0333 × Reps)
                    </p>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="p-0.5 disabled:opacity-20 transition-opacity"
              aria-label="Ejercicio anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{selectedIndex + 1}/{exercises.length}</span>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="p-0.5 disabled:opacity-20 transition-opacity"
              aria-label="Siguiente ejercicio"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="touch-pan-y"
        >
          {loadingHistory ? (
            <Skeleton className="h-40 w-full" />
          ) : !history || history.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground text-center px-4">
              Sigue entrenando para ver tu progreso 💪
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(d) => format(new Date(d), "d MMM", { locale: es })}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  domain={yScale.domain}
                  ticks={yScale.ticks}
                  interval={0}
                  tickFormatter={(v) => formatWeight(Math.max(0, v as number))}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="oneRepMax"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#progressGradient)"
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <Select
          value={selectedExercise?.id}
          onValueChange={(val) => {
            const idx = exercises.findIndex((e) => e.id === val);
            if (idx >= 0) setSelectedIndex(idx);
          }}
        >
          <SelectTrigger className="mt-3 h-10 w-full rounded-lg border border-emerald-600/20 bg-linear-to-b from-[#ecfdf5] to-[#d1fae5] px-3 text-sm font-medium text-emerald-800 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.65)] transition-colors hover:border-emerald-600/35 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-0 data-[state=open]:border-emerald-600/45 dark:border-emerald-500/20 dark:bg-linear-to-b dark:from-[#1b2220] dark:to-[#151b18] dark:text-emerald-200 dark:shadow-[0_4px_12px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.03)] dark:hover:border-emerald-400/30 dark:hover:text-emerald-100 dark:data-[state=open]:border-emerald-400/35 dark:focus-visible:ring-emerald-400/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60 rounded-lg border border-emerald-600/20 bg-popover text-emerald-900 shadow-[0_10px_24px_rgba(0,0,0,0.12)] will-change-transform data-[state=open]:animation-duration-[260ms] data-[state=closed]:animation-duration-[180ms] data-[state=open]:[animation-timing-function:cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:[animation-timing-function:cubic-bezier(0.4,0,1,1)] data-[state=open]:zoom-in-99 data-[state=closed]:zoom-out-99 data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0 dark:border-emerald-500/20 dark:bg-[#18201d] dark:text-emerald-100 dark:shadow-[0_10px_24px_rgba(0,0,0,0.4)]">
            {exercises.map((ex) => (
              <SelectItem
                key={ex.id}
                value={ex.id}
                className="rounded-md focus:bg-emerald-600/10 focus:text-emerald-900 data-highlighted:bg-emerald-600/10 data-highlighted:text-emerald-900 dark:focus:bg-emerald-500/15 dark:focus:text-emerald-50 dark:data-highlighted:bg-emerald-500/15 dark:data-highlighted:text-emerald-50"
              >
                {ex.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">
        {format(new Date(data.date), "d MMM yyyy", { locale: es })}
      </p>
      <p className="text-primary font-semibold">1RM: {formatWeight(data.oneRepMax)} kg</p>
      <p className="text-muted-foreground">Real: {formatWeight(data.weight)}kg × {data.reps} reps</p>
    </div>
  );
}
