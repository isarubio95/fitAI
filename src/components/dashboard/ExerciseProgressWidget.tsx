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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { addDays, format, subDays } from "date-fns";
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

  /** Un solo punto no dibuja trazo en Area; duplicamos en el eje X (misma Y) y guardamos la fecha real para el tooltip. */
  const chartData = useMemo(() => {
    if (!history?.length) return [];
    if (history.length === 1) {
      const p = history[0];
      const d = new Date(p.date);
      return [
        { ...p, date: format(subDays(d, 5), "yyyy-MM-dd"), tooltipDate: p.date },
        { ...p, date: format(addDays(d, 5), "yyyy-MM-dd"), tooltipDate: p.date },
      ];
    }
    return history.map((row) => ({ ...row, tooltipDate: row.date }));
  }, [history]);

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
      <Card className="w-full rounded-none border-x-0 md:rounded-2xl md:border-x">
        <CardHeader className="px-6 pt-8 pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-0">
          <Skeleton className="h-44 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!exercises?.length) return null;

  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < exercises.length - 1;

  return (
    <Card className="w-full rounded-none border-x-0 md:rounded-2xl md:border-x">
      <CardHeader className="px-6 pt-8 pb-4">
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
      <CardContent className="px-6 pb-8 pt-0">
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="touch-pan-y"
        >
          {loadingHistory ? (
            <div className="py-2">
              <Skeleton className="h-44 w-full" />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="py-2">
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground text-center px-4">
                Sigue entrenando para ver tu progreso 💪
              </div>
            </div>
          ) : (
            <div className="py-2">
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
            </div>
          )}
        </div>

        <Select
          value={selectedExercise?.id}
          onValueChange={(val) => {
            const idx = exercises.findIndex((e) => e.id === val);
            if (idx >= 0) setSelectedIndex(idx);
          }}
        >
          <SelectTrigger className={cn(buttonVariants({ variant: "ghost" }), "mt-3 h-10 w-full justify-between text-left")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((ex) => (
              <SelectItem key={ex.id} value={ex.id}>
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
  const when = data.tooltipDate ?? data.date;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">
        {format(new Date(when), "d MMM yyyy", { locale: es })}
      </p>
      <p className="text-primary font-semibold">1RM: {formatWeight(data.oneRepMax)} kg</p>
      <p className="text-muted-foreground">Real: {formatWeight(data.weight)}kg × {data.reps} reps</p>
    </div>
  );
}
