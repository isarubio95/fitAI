import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMeasurements } from "@/hooks/useMeasurements";
import { useDailyHealth } from "@/hooks/useDailyHealth";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useCardioHistory } from "@/hooks/useCardioSessions";
import { computeCardioSessionMetrics } from "@/lib/cardioSessionDisplay";
import {
  dayKey,
  formatHealthDelta,
  formatSleepHours,
  healthDeltaClass,
  healthDeltaTone,
  HEALTH_CHART_TITLE,
  HEALTH_EMPTY_COPY,
  HEALTH_METRIC_LABEL,
  type HealthMetric,
} from "@/lib/healthMetrics";
import { HealthLogDrawer } from "@/components/health/HealthLogDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Scale, TrendingUp, TrendingDown, Plus, Flame, Heart, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_CARD, PAGE_CARD_STACK_GAP, PAGE_STACK_INSET, PAGE_STACK_TOP } from "@/lib/pageStyles";
import { Skeleton } from "@/components/ui/skeleton";
import {
  healthFabBottomClass,
  healthPageBottomPad,
  useActiveSessionFabOffset,
} from "@/hooks/useActiveSessionFabOffset";

const chartConfig = {
  peso: { label: "Peso (kg)", color: "hsl(var(--primary))" },
  ingeridas: { label: "Ingeridas", color: "hsl(var(--primary))" },
  quemadas: { label: "Quemadas en cardio", color: "hsl(var(--muted-foreground))" },
  reposo: { label: "FC reposo", color: "hsl(var(--primary))" },
  sesion: { label: "FC sesión", color: "hsl(var(--muted-foreground))" },
  horas: { label: "Horas", color: "hsl(var(--primary))" },
  calidad: { label: "Calidad", color: "hsl(var(--primary))" },
};

function latestWith<T>(
  rows: T[],
  pick: (row: T) => number | null,
  dateOf: (row: T) => string,
): { value: number; prev: number | null; date: string } | null {
  const values = rows
    .map((row) => {
      const value = pick(row);
      return value != null ? { value, date: dateOf(row) } : null;
    })
    .filter((item): item is { value: number; date: string } => item != null);
  if (values.length === 0) return null;
  return { value: values[0].value, prev: values[1]?.value ?? null, date: values[0].date };
}

const YouHealth = () => {
  const { user } = useAuth();
  const {
    data: medidas,
    isPending: loadingMedidas,
    isError: errorMedidas,
    refetch: refetchMedidas,
  } = useMeasurements();
  const {
    data: daily,
    isPending: loadingDaily,
    isError: errorDaily,
    refetch: refetchDaily,
  } = useDailyHealth();
  const { data: workouts, isPending: loadingWorkouts } = useWorkoutHistory();
  const { data: cardio, isPending: loadingCardio } = useCardioHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [metric, setMetric] = useState<HealthMetric>("peso");
  const fabOffset = useActiveSessionFabOffset();

  const { data: perfilPhysio } = useQuery({
    queryKey: ["perfilPhysio", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("fc_max, fc_reposo")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (location.state?.action === "new") {
      setSheetOpen(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  const isLoading = loadingMedidas || loadingDaily || loadingWorkouts || loadingCardio;
  const isCoreError = errorMedidas || errorDaily;

  const burnedByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of cardio ?? []) {
      const kcal = computeCardioSessionMetrics(s).calorias;
      if (kcal == null) continue;
      const key = dayKey(s.fecha_inicio);
      map[key] = (map[key] ?? 0) + kcal;
    }
    return map;
  }, [cardio]);

  const sessionHrByDate = useMemo(() => {
    const map: Record<string, { sum: number; n: number }> = {};
    const add = (fecha: string, fc: number | null | undefined) => {
      if (fc == null || !Number.isFinite(fc) || fc <= 0) return;
      const key = dayKey(fecha);
      const cur = map[key] ?? { sum: 0, n: 0 };
      cur.sum += fc;
      cur.n += 1;
      map[key] = cur;
    };
    for (const w of workouts ?? []) add(w.fecha, w.fc_media);
    for (const s of cardio ?? []) add(s.fecha_inicio, computeCardioSessionMetrics(s).fcMedia);
    const out: Record<string, number> = {};
    for (const [key, v] of Object.entries(map)) out[key] = Math.round(v.sum / v.n);
    return out;
  }, [workouts, cardio]);

  const weightLatest = latestWith(medidas ?? [], (m) => m.peso, (m) => m.fecha);
  const kcalLatest = latestWith(daily ?? [], (r) => r.calorias, (r) => r.fecha);
  const sleepLatest = latestWith(daily ?? [], (r) => r.sueno_min, (r) => r.fecha);
  const restHrLatest = latestWith(daily ?? [], (r) => r.fc_reposo, (r) => r.fecha);
  const currentRestHr = restHrLatest?.value ?? perfilPhysio?.fc_reposo ?? null;
  const prevRestHr = restHrLatest?.prev ?? null;
  const sleepQualityRow = (daily ?? []).find((row) => row.calidad_sueno != null);
  const sleepQuality = sleepLatest
    ? (daily ?? []).find((row) => row.sueno_min != null)?.calidad_sueno ?? null
    : sleepQualityRow?.calidad_sueno ?? null;

  const summaryCards: {
    key: HealthMetric;
    label: string;
    value: string;
    delta: number | null;
    deltaLabel?: "kg" | "h";
    icon: typeof Scale;
    hint?: string;
    recordedOn?: string;
  }[] = [
    {
      key: "peso",
      label: HEALTH_METRIC_LABEL.peso,
      value: weightLatest ? `${weightLatest.value} kg` : "—",
      delta: weightLatest && weightLatest.prev != null ? weightLatest.value - weightLatest.prev : null,
      deltaLabel: "kg",
      icon: Scale,
      recordedOn: weightLatest?.date,
    },
    {
      key: "calorias",
      label: HEALTH_METRIC_LABEL.calorias,
      value: kcalLatest ? `${kcalLatest.value} kcal` : "—",
      delta: kcalLatest && kcalLatest.prev != null ? kcalLatest.value - kcalLatest.prev : null,
      icon: Flame,
      hint: Object.keys(burnedByDate).length > 0 ? "Ingesta diaria" : undefined,
      recordedOn: kcalLatest?.date,
    },
    {
      key: "fc",
      label: HEALTH_METRIC_LABEL.fc,
      value: currentRestHr != null ? `${currentRestHr} lpm` : "—",
      delta: restHrLatest && prevRestHr != null ? restHrLatest.value - prevRestHr : null,
      icon: Heart,
      hint: perfilPhysio?.fc_max != null ? `Máx. ${perfilPhysio.fc_max}` : undefined,
      recordedOn: restHrLatest?.date,
    },
    {
      key: "sueno",
      label: HEALTH_METRIC_LABEL.sueno,
      value: sleepLatest
        ? formatSleepHours(sleepLatest.value)
        : sleepQuality != null
          ? `${sleepQuality}/5`
          : "—",
      delta: sleepLatest && sleepLatest.prev != null ? (sleepLatest.value - sleepLatest.prev) / 60 : null,
      deltaLabel: "h",
      icon: Moon,
      hint:
        sleepLatest && sleepQuality != null
          ? `Calidad ${sleepQuality}/5`
          : sleepQuality != null
            ? "Calidad"
            : undefined,
      recordedOn: sleepLatest?.date ?? sleepQualityRow?.fecha,
    },
  ];

  const chartData = useMemo(() => {
    if (metric === "peso") {
      return [...(medidas ?? [])]
        .filter((m) => m.peso !== null)
        .reverse()
        .map((m) => ({
          date: format(new Date(m.fecha), "d MMM", { locale: es }),
          peso: m.peso,
          ingeridas: null,
          quemadas: null,
          reposo: null,
          sesion: null,
          horas: null,
          calidad: null,
        }));
    }

    if (metric === "calorias") {
      const keys = new Set([
        ...(daily ?? []).filter((r) => r.calorias != null).map((r) => r.fecha),
        ...Object.keys(burnedByDate),
      ]);
      return [...keys]
        .sort()
        .map((key) => {
          const row = (daily ?? []).find((r) => r.fecha === key);
          return {
            date: format(new Date(key), "d MMM", { locale: es }),
            peso: null,
            ingeridas: row?.calorias ?? null,
            quemadas: burnedByDate[key] ?? null,
            reposo: null,
            sesion: null,
            horas: null,
            calidad: null,
          };
        });
    }

    if (metric === "fc") {
      const keys = new Set([
        ...(daily ?? []).filter((r) => r.fc_reposo != null).map((r) => r.fecha),
        ...Object.keys(sessionHrByDate),
      ]);
      return [...keys]
        .sort()
        .map((key) => {
          const row = (daily ?? []).find((r) => r.fecha === key);
          return {
            date: format(new Date(key), "d MMM", { locale: es }),
            peso: null,
            ingeridas: null,
            quemadas: null,
            reposo: row?.fc_reposo ?? null,
            sesion: sessionHrByDate[key] ?? null,
            horas: null,
            calidad: null,
          };
        });
    }

    return [...(daily ?? [])]
      .filter((r) => r.sueno_min != null || r.calidad_sueno != null)
      .reverse()
      .map((r) => ({
        date: format(new Date(r.fecha), "d MMM", { locale: es }),
        peso: null,
        ingeridas: null,
        quemadas: null,
        reposo: null,
        sesion: null,
        horas: r.sueno_min != null ? Number((r.sueno_min / 60).toFixed(2)) : null,
        calidad: r.calidad_sueno ?? null,
      }));
  }, [metric, medidas, daily, burnedByDate, sessionHrByDate]);

  const chartHasData = chartData.length > 0;
  const sleepChartKey = chartData.some((row) => row.horas != null) ? "horas" : "calidad";
  const chartTitle =
    metric === "sueno" && sleepChartKey === "calidad"
      ? "Calidad del sueño"
      : HEALTH_CHART_TITLE[metric];
  const emptyCopy = HEALTH_EMPTY_COPY[metric];
  const cardClass = PAGE_CARD;
  const showFab = !isLoading && !isCoreError && chartHasData;

  const retryCore = () => {
    void refetchMedidas();
    void refetchDaily();
  };

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col bg-background max-md:-mb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8",
        healthPageBottomPad(fabOffset),
      )}
    >
      <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET, PAGE_STACK_TOP)}>
        {showFab && (
          <Button
            type="button"
            variant="new"
            onClick={() => setSheetOpen(true)}
            title="Registrar salud"
            aria-label="Registrar salud"
            className={cn("fixed z-40 right-4 shadow-lg md:right-8", healthFabBottomClass(fabOffset))}
          >
            <span className="whitespace-nowrap">Registrar salud</span>
            <Plus className="shrink-0" />
          </Button>
        )}

        <HealthLogDrawer open={sheetOpen} onOpenChange={setSheetOpen} focusMetric={metric} />

        <Card className={cardClass}>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-0">
              {summaryCards.map((card, i) => {
                const Icon = card.icon;
                const selected = metric === card.key;
                const tone = card.delta != null ? healthDeltaTone(card.key, card.delta) : "neutral";
                const cellBorder =
                  i === 0
                    ? "border-r border-b border-black/5 dark:border-white/10"
                    : i === 1
                      ? "border-b border-black/5 dark:border-white/10"
                      : i === 2
                        ? "border-r border-black/5 dark:border-white/10"
                        : "";
                return (
                  <button
                    key={card.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMetric(card.key)}
                    className={cn(
                      "touch-styled space-y-1 px-5 py-8 text-left outline-none transition-colors",
                      "focus:outline-none focus-visible:outline-none",
                      cellBorder,
                      selected && "bg-secondary/60 hover:bg-secondary/60 focus:bg-secondary/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      {isLoading ? (
                        <Skeleton className="h-6 w-16" />
                      ) : (
                        <p className="text-xl font-bold leading-none">{card.value}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                        {!isLoading && card.recordedOn && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(new Date(card.recordedOn), "d MMM", { locale: es })}
                          </p>
                        )}
                        {card.hint && !isLoading && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{card.hint}</p>
                        )}
                      </div>
                      {isLoading ? (
                        <Skeleton className="h-5 w-12 rounded-full" />
                      ) : (
                        card.delta != null && (
                          <Badge variant="secondary" className={cn("gap-0.5 text-xs", healthDeltaClass(tone))}>
                            {card.delta <= 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {formatHealthDelta(card.delta, card.deltaLabel ?? null)}
                          </Badge>
                        )
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {isCoreError ? (
          <Card className={cardClass}>
            <CardContent className="px-5 py-8 text-center">
              <p className="text-sm font-semibold">No se pudo cargar tu salud.</p>
              <p className="mt-1 text-sm text-muted-foreground">Revisa la conexión e inténtalo de nuevo.</p>
              <Button type="button" variant="outline" className="mt-4" onClick={retryCore}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className={cardClass} aria-busy="true" aria-label="Cargando gráfico">
            <CardContent className="px-5 py-8">
              <Skeleton className="mb-3 h-4 w-40" />
              <Skeleton className="aspect-2/1 w-full rounded-xl" />
            </CardContent>
          </Card>
        ) : chartHasData ? (
          <Card className={cardClass}>
            <CardContent className="px-5 py-8">
              <h2 className="mb-3 text-sm font-semibold">{chartTitle}</h2>
              <ChartContainer config={chartConfig} className="aspect-2/1 w-full">
                <ComposedChart data={chartData} margin={{ top: 4, right: chartYAxis.marginRight, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    orientation={chartYAxis.orientation}
                    width={chartYAxis.width}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={0}
                    tick={<ChartYAxisTick />}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {metric === "peso" && (
                    <Area
                      type="monotone"
                      dataKey="peso"
                      isAnimationActive={false}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#healthGrad)"
                      dot={chartData.length === 1 ? { r: 3 } : false}
                    />
                  )}
                  {metric === "calorias" && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="ingeridas"
                        isAnimationActive={false}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#healthGrad)"
                        connectNulls
                        dot={chartData.length === 1 ? { r: 3 } : false}
                      />
                      <Line
                        type="monotone"
                        dataKey="quemadas"
                        isAnimationActive={false}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        connectNulls
                      />
                    </>
                  )}
                  {metric === "fc" && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="reposo"
                        isAnimationActive={false}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#healthGrad)"
                        connectNulls
                        dot={chartData.length === 1 ? { r: 3 } : false}
                      />
                      <Line
                        type="monotone"
                        dataKey="sesion"
                        isAnimationActive={false}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        connectNulls
                      />
                    </>
                  )}
                  {metric === "sueno" && (
                    <Area
                      type="monotone"
                      dataKey={sleepChartKey}
                      isAnimationActive={false}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#healthGrad)"
                      connectNulls
                      dot={chartData.length === 1 ? { r: 3 } : false}
                    />
                  )}
                </ComposedChart>
              </ChartContainer>
              {metric === "calorias" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Continua: ingesta. Discontinua: quemadas en cardio.
                </p>
              )}
              {metric === "fc" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Reposo diario frente a la media de tus sesiones.
                </p>
              )}
              {metric === "sueno" && sleepChartKey === "calidad" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Añade las horas de anoche para ver la evolución en horas.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className={cardClass}>
            <CardContent className="px-5 py-8 text-left">
              <p className="text-sm font-semibold">{emptyCopy.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyCopy.detail}</p>
              <Button type="button" className="mt-4" onClick={() => setSheetOpen(true)}>
                Registrar salud
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default YouHealth;
