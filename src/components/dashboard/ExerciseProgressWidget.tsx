import { useState, useRef, useCallback } from "react";
import { useExerciseWithHistory, useExerciseHistory } from "@/hooks/useExerciseProgress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

const SWIPE_THRESHOLD = 50;

export function ExerciseProgressWidget() {
  const { data: exercises, isLoading: loadingExercises } = useExerciseWithHistory();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedExercise = exercises?.[selectedIndex];
  const { data: history, isLoading: loadingHistory } = useExerciseHistory(selectedExercise?.id);

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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Progreso 1RM
            </span>
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
        <Select
          value={selectedExercise?.id}
          onValueChange={(val) => {
            const idx = exercises.findIndex((e) => e.id === val);
            if (idx >= 0) setSelectedIndex(idx);
          }}
        >
          <SelectTrigger className="w-full border-none px-0 py-0 h-auto text-base font-semibold shadow-none focus:ring-0">
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
          ) : !history || history.length < 2 ? (
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
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(d) => format(new Date(d), "d MMM", { locale: es })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="oneRepMax"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#progressGradient)"
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
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
      <p className="text-primary font-semibold">1RM: {data.oneRepMax} kg</p>
      <p className="text-muted-foreground">Peso real: {data.weight} kg</p>
    </div>
  );
}
