import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLayoutActionSlot } from "@/hooks/useLayoutActionSlot";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMeasurements, type MedidaInsert } from "@/hooks/useMeasurements";
import { useDailyHealth, type SaludDiariaPatch } from "@/hooks/useDailyHealth";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useCardioHistory } from "@/hooks/useCardioSessions";
import { computeCardioSessionMetrics } from "@/lib/cardioSessionDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Scale, TrendingUp, TrendingDown, CalendarIcon,
  Plus, Flame, Heart, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";

type HealthMetric = "peso" | "calorias" | "fc" | "sueno";

const METRIC_OPTIONS: { key: HealthMetric; label: string }[] = [
  { key: "peso", label: "Peso" },
  { key: "calorias", label: "Calorías" },
  { key: "fc", label: "FC" },
  { key: "sueno", label: "Sueño" },
];

const numericFields = [
  { key: "peso", label: "Peso (kg)", step: "0.1" },
  { key: "grasa", label: "% Grasa", step: "0.1" },
  { key: "cintura", label: "Cintura (cm)", step: "0.1" },
  { key: "pecho", label: "Pecho (cm)", step: "0.1" },
  { key: "brazo", label: "Brazo (cm)", step: "0.1" },
  { key: "pierna", label: "Pierna (cm)", step: "0.1" },
] as const;

const chartConfig = {
  peso: { label: "Peso (kg)", color: "hsl(var(--primary))" },
  ingeridas: { label: "Ingeridas", color: "hsl(var(--primary))" },
  quemadas: { label: "Quemadas", color: "hsl(var(--muted-foreground))" },
  reposo: { label: "Reposo", color: "hsl(var(--primary))" },
  sesion: { label: "Sesión", color: "hsl(var(--muted-foreground))" },
  horas: { label: "Horas", color: "hsl(var(--primary))" },
};

function dayKey(value: string | Date) {
  return format(typeof value === "string" ? new Date(value) : value, "yyyy-MM-dd");
}

function parseOptionalNumber(raw: string | undefined, min?: number, max?: number): number | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  if (min != null && n < min) return null;
  if (max != null && n > max) return null;
  return n;
}

function formatSleepHours(min: number) {
  const hours = min / 60;
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`;
}

function latestWith<T>(
  rows: T[],
  pick: (row: T) => number | null,
): { value: number; prev: number | null } | null {
  const values = rows.map(pick).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return { value: values[0], prev: values[1] ?? null };
}

const YouHealth = () => {
  const { user } = useAuth();
  const { data: medidas, isLoading: loadingMedidas, addMeasurement, isAdding } = useMeasurements();
  const { data: daily, isLoading: loadingDaily, upsertDailyHealth, isSaving } = useDailyHealth();
  const { data: workouts } = useWorkoutHistory();
  const { data: cardio } = useCardioHistory();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [metric, setMetric] = useState<HealthMetric>("peso");
  const mobileActionsSlot = useLayoutActionSlot("section-pills-actions-slot", null);
  const desktopCreateSlot = useLayoutActionSlot(null, "desktop-floating-create-slot");

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
      navigate(location.pathname, { replace: true, state: { tab: location.state?.tab } });
    }
  }, [location.state, location.pathname, navigate]);

  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [calidad, setCalidad] = useState<number | null>(null);

  const isLoading = loadingMedidas || loadingDaily;
  const saving = isAdding || isSaving;

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

  const weightLatest = latestWith(medidas ?? [], (m) => m.peso);
  const kcalLatest = latestWith(daily ?? [], (r) => r.calorias);
  const sleepLatest = latestWith(daily ?? [], (r) => r.sueno_min);
  const restHrLatest = latestWith(daily ?? [], (r) => r.fc_reposo);
  const currentRestHr = restHrLatest?.value ?? perfilPhysio?.fc_reposo ?? null;
  const prevRestHr = restHrLatest?.prev ?? null;

  const summaryCards: {
    key: HealthMetric;
    label: string;
    value: string;
    delta: number | null;
    deltaLabel?: string;
    icon: typeof Scale;
    hint?: string;
  }[] = [
    {
      key: "peso",
      label: "Peso",
      value: weightLatest ? `${weightLatest.value} kg` : "—",
      delta: weightLatest && weightLatest.prev != null ? weightLatest.value - weightLatest.prev : null,
      deltaLabel: "kg",
      icon: Scale,
    },
    {
      key: "calorias",
      label: "Calorías",
      value: kcalLatest ? `${kcalLatest.value} kcal` : "—",
      delta: kcalLatest && kcalLatest.prev != null ? kcalLatest.value - kcalLatest.prev : null,
      icon: Flame,
      hint: Object.keys(burnedByDate).length > 0 ? "Ingesta diaria" : undefined,
    },
    {
      key: "fc",
      label: "FC reposo",
      value: currentRestHr != null ? `${currentRestHr} lpm` : "—",
      delta: restHrLatest && prevRestHr != null ? restHrLatest.value - prevRestHr : null,
      icon: Heart,
      hint: perfilPhysio?.fc_max != null ? `Máx. ${perfilPhysio.fc_max}` : undefined,
    },
    {
      key: "sueno",
      label: "Sueño",
      value: sleepLatest ? formatSleepHours(sleepLatest.value) : "—",
      delta: sleepLatest && sleepLatest.prev != null ? (sleepLatest.value - sleepLatest.prev) / 60 : null,
      deltaLabel: "h",
      icon: Moon,
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
          };
        });
    }

    return [...(daily ?? [])]
      .filter((r) => r.sueno_min != null)
      .reverse()
      .map((r) => ({
        date: format(new Date(r.fecha), "d MMM", { locale: es }),
        peso: null,
        ingeridas: null,
        quemadas: null,
        reposo: null,
        sesion: null,
        horas: Number(((r.sueno_min ?? 0) / 60).toFixed(2)),
      }));
  }, [metric, medidas, daily, burnedByDate, sessionHrByDate]);

  const chartHasData = chartData.length > 1;

  const resetForm = () => {
    setFormValues({});
    setCalidad(null);
    setFormDate(new Date());
  };

  const handleSubmit = async () => {
    try {
      const fecha = format(formDate, "yyyy-MM-dd");
      const notas = formValues.saludNotas?.trim() || null;
      const medidaPayload: Omit<MedidaInsert, "usuario_id"> = {
        fecha,
        notas,
      };
      let hasMedida = false;
      for (const f of numericFields) {
        const n = parseOptionalNumber(formValues[f.key]);
        medidaPayload[f.key] = n;
        if (n != null) hasMedida = true;
      }

      const calorias = parseOptionalNumber(formValues.calorias, 0);
      const suenoHoras = parseOptionalNumber(formValues.suenoHoras, 0, 24);
      const fcReposo = parseOptionalNumber(formValues.fcReposo, 30, 120);
      const suenoMin = suenoHoras != null ? Math.round(suenoHoras * 60) : null;
      const hasSalud =
        calorias != null || suenoMin != null || calidad != null || fcReposo != null;

      if (!hasMedida && !hasSalud) {
        toast({ title: "Añade al menos un dato", variant: "destructive" });
        return;
      }

      if (hasMedida) await addMeasurement(medidaPayload);
      if (hasSalud) {
        const patch: SaludDiariaPatch = { fecha };
        if (calorias != null) patch.calorias = calorias;
        if (suenoMin != null) patch.sueno_min = suenoMin;
        if (calidad != null) patch.calidad_sueno = calidad;
        if (fcReposo != null) patch.fc_reposo = fcReposo;
        if (notas) patch.notas = notas;
        await upsertDailyHealth(patch);
      }

      setSheetOpen(false);
      resetForm();
      toast({ title: "Registro guardado" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const cardClass =
    "w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20";

  const registerButton = (className?: string) => (
    <Button
      type="button"
      variant="new"
      onClick={() => setSheetOpen(true)}
      title="Registrar salud"
      aria-label="Registrar salud"
      className={className}
    >
      <span className="whitespace-nowrap">Registrar</span>
      <Plus className="shrink-0" />
    </Button>
  );

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-card max-md:-mb-24 max-md:pb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8 md:pt-3">
    <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP)}>
      {mobileActionsSlot && createPortal(registerButton(), mobileActionsSlot)}
      {desktopCreateSlot && createPortal(registerButton("shadow-lg"), desktopCreateSlot)}

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent side="bottom" className={cn("max-h-[85lvh] overflow-y-auto", drawerSafeAreaBottom)}>
          <DrawerHeader>
            <DrawerTitle>Registrar salud</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(formDate, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={(d) => d && setFormDate(d)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <p className="text-sm font-medium">Medidas</p>
            <div className="grid grid-cols-2 gap-3">
              {numericFields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <Input
                    type="number"
                    step={f.step}
                    inputMode="decimal"
                    placeholder="–"
                    value={formValues[f.key] ?? ""}
                    onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <p className="text-sm font-medium">Día a día</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Calorías ingeridas</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="kcal"
                  value={formValues.calorias ?? ""}
                  onChange={(e) => setFormValues((v) => ({ ...v, calorias: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sueño (horas)</label>
                <Input
                  type="number"
                  step="0.25"
                  inputMode="decimal"
                  placeholder="7.5"
                  value={formValues.suenoHoras ?? ""}
                  onChange={(e) => setFormValues((v) => ({ ...v, suenoHoras: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">FC reposo (lpm)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="60"
                  value={formValues.fcReposo ?? ""}
                  onChange={(e) => setFormValues((v) => ({ ...v, fcReposo: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Calidad del sueño</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCalidad((cur) => (cur === n ? null : n))}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md border text-sm",
                        calidad === n
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notas</label>
              <Textarea
                placeholder="Observaciones opcionales…"
                value={formValues.saludNotas ?? ""}
                onChange={(e) => setFormValues((v) => ({ ...v, saludNotas: e.target.value }))}
                rows={2}
              />
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Card className={cardClass}>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-0">
            {summaryCards.map((card, i) => {
              const Icon = card.icon;
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
                  onClick={() => setMetric(card.key)}
                  className={cn("space-y-1 px-6 py-8 text-left transition-colors", cellBorder, metric === card.key && "bg-primary/5")}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xl font-bold leading-none">{isLoading ? "–" : card.value}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">{card.label}</p>
                      {card.hint && <p className="text-[10px] text-muted-foreground/80 mt-0.5">{card.hint}</p>}
                    </div>
                    {card.delta != null && (
                      <Badge variant="secondary" className={cn("text-[10px] gap-0.5", card.delta <= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {card.delta <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {card.delta > 0 ? "+" : ""}
                        {card.deltaLabel === "h" ? card.delta.toFixed(1) : card.deltaLabel === "kg" ? card.delta.toFixed(1) : Math.round(card.delta)}
                        {card.deltaLabel ? ` ${card.deltaLabel}` : ""}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto px-4 py-2 md:px-0">
        {METRIC_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setMetric(opt.key)}
            className={cn(filterPillBase, "whitespace-nowrap", metric === opt.key ? filterPillActive : filterPillInactive)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {chartHasData && (
        <Card className={cardClass}>
          <CardContent className="px-6 py-8">
            <h2 className="text-sm font-semibold mb-3">
              {metric === "peso" && "Evolución del peso"}
              {metric === "calorias" && "Calorías"}
              {metric === "fc" && "Frecuencia cardíaca"}
              {metric === "sueno" && "Sueño"}
            </h2>
            <ChartContainer config={chartConfig} className="aspect-2/1 w-full">
              <ComposedChart data={chartData} margin={{ top: 4, right: chartYAxis.marginRight, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
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
                  <Area type="monotone" dataKey="peso" isAnimationActive={false} stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#healthGrad)" />
                )}
                {metric === "calorias" && (
                  <>
                    <Area type="monotone" dataKey="ingeridas" isAnimationActive={false} stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#healthGrad)" connectNulls />
                    <Line type="monotone" dataKey="quemadas" isAnimationActive={false} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls />
                  </>
                )}
                {metric === "fc" && (
                  <>
                    <Area type="monotone" dataKey="reposo" isAnimationActive={false} stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#healthGrad)" connectNulls />
                    <Line type="monotone" dataKey="sesion" isAnimationActive={false} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls />
                  </>
                )}
                {metric === "sueno" && (
                  <Area type="monotone" dataKey="horas" isAnimationActive={false} stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#healthGrad)" />
                )}
              </ComposedChart>
            </ChartContainer>
            {metric === "calorias" && (
              <p className="mt-2 text-[11px] text-muted-foreground">Línea continua: ingesta. Discontinua: quemadas en cardio (si las registraste).</p>
            )}
            {metric === "fc" && (
              <p className="mt-2 text-[11px] text-muted-foreground">Reposo diario frente a la media de tus sesiones.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  );
};

export default YouHealth;
