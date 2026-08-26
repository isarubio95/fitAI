import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CHART_AREA_OPACITY, chartAxis, chartColors, chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import type { TrainingLoadData } from "@/hooks/useTrainingLoad";
import { cn } from "@/lib/utils";
import { DetailDrawerShell, DetailSection } from "./DetailDrawerShell";
import { FitnessFatigueBars } from "./FitnessFatigueBars";
import { FormHero } from "./FormHero";
import { TrainingLoadChart } from "./TrainingLoadChart";
import { FORM_SCALE_MAX, FORM_SCALE_MIN, FORM_ZONES, getFormZone } from "./formZones";
import { formatAxisValue, formatNumber, formatSigned, MINUS } from "./format";

/** Semanas del desglose gym vs cardio. */
const WEEK_COUNT = 8;
const WEEKLY_CHART_HEIGHT = 150;

function MetricCell({
  label,
  hint,
  value,
  delta,
  color,
}: {
  label: string;
  hint: string;
  value: string;
  delta: number | null;
  color: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-card p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 text-2xl font-light leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {delta == null ? hint : `${formatSigned(delta)} en 7 días`}
      </p>
    </div>
  );
}

/** Suma la carga de fuerza y cardio en bloques de 7 días, del más antiguo al más reciente. */
function buildWeeklyLoad(points: TrainingLoadData["points"]) {
  const rows: { label: string; fuerza: number; cardio: number }[] = [];
  const tail = points.slice(-WEEK_COUNT * 7);
  for (let start = 0; start + 7 <= tail.length; start += 7) {
    const week = tail.slice(start, start + 7);
    rows.push({
      label: format(parseISO(week[0].date), "d MMM", { locale: es }),
      fuerza: Math.round(week.reduce((acc, p) => acc + p.loadStrength, 0)),
      cardio: Math.round(week.reduce((acc, p) => acc + p.loadCardio, 0)),
    });
  }
  return rows;
}

export function FormDetailDrawer({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TrainingLoadData;
}) {
  const points = data.points;
  const totals = data.totals;
  const zone = getFormZone(totals.form);

  const lastDate = points.length ? points[points.length - 1].date : null;
  const deltas = useMemo(() => {
    if (points.length < 8) return { fitness: null, fatigue: null, form: null };
    const now = points[points.length - 1];
    const before = points[points.length - 8];
    return {
      fitness: now.fitness - before.fitness,
      fatigue: now.fatigue - before.fatigue,
      form: now.form - before.form,
    };
  }, [points]);

  const weekly = useMemo(() => buildWeeklyLoad(points), [points]);
  const weeklyMax = useMemo(
    () => weekly.reduce((max, row) => Math.max(max, row.fuerza + row.cardio), 0),
    [weekly],
  );
  const hasWeeklyLoad = weeklyMax > 0;

  return (
    <DetailDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title="Forma"
      description={
        lastDate
          ? `Actualizado el ${format(parseISO(lastDate), "d 'de' MMMM", { locale: es })}`
          : undefined
      }
    >
      <div className="space-y-7">
        <div className="rounded-2xl bg-card px-4 pb-4 pt-5">
          <FormHero form={totals.form} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MetricCell
            label="Fitness"
            hint="Adaptación (CTL)"
            value={formatNumber(totals.fitness)}
            delta={deltas.fitness}
            color={chartColors.fitness}
          />
          <MetricCell
            label="Fatiga"
            hint="Cansancio (ATL)"
            value={formatNumber(totals.fatigue)}
            delta={deltas.fatigue}
            color={chartColors.fatigue}
          />
          <MetricCell
            label="Forma"
            hint="Frescura (TSB)"
            value={formatSigned(totals.form)}
            delta={deltas.form}
            color={zone.color}
          />
        </div>

        <DetailSection title="Fitness frente a fatiga" hint="La diferencia entre ambas es tu forma.">
          <FitnessFatigueBars fitness={totals.fitness} fatigue={totals.fatigue} />
        </DetailSection>

        <DetailSection title="Histórico" hint="Arrastra sobre el gráfico para ver un día concreto.">
          <TrainingLoadChart points={points} />
        </DetailSection>

        {hasWeeklyLoad && (
          <DetailSection
            title="Carga semanal"
            hint={`De dónde viene la carga en las últimas ${weekly.length} semanas.`}
          >
            <div className="rounded-xl bg-card p-4">
              <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: chartColors.fitness }}
                  />
                  Fuerza
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: chartColors.fresh }}
                  />
                  Cardio
                </span>
              </div>
              <ResponsiveContainer width="100%" height={WEEKLY_CHART_HEIGHT}>
                <BarChart
                  data={weekly}
                  margin={{ top: 4, right: chartYAxis.marginRight, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke={chartAxis.grid}
                    strokeOpacity={chartAxis.gridOpacity}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={6}
                    interval={0}
                    tick={{ fill: chartAxis.tick, fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    orientation={chartYAxis.orientation}
                    width={chartYAxis.width}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={0}
                    tick={<ChartYAxisTick />}
                    tickFormatter={(value) => formatAxisValue(value as number)}
                  />
                  <Bar
                    dataKey="fuerza"
                    stackId="carga"
                    fill={chartColors.fitness}
                    isAnimationActive={false}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="cardio"
                    stackId="carga"
                    fill={chartColors.fresh}
                    isAnimationActive={false}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DetailSection>
        )}

        <DetailSection title="Las cinco zonas" hint="Dónde caes hoy y qué significa cada tramo.">
          <ul className="space-y-1.5">
            {FORM_ZONES.map((item) => {
              const isActive = item.key === zone.key;
              const from = item.min <= FORM_SCALE_MIN ? null : item.min;
              const to = item.max >= FORM_SCALE_MAX ? null : item.max;
              const range =
                from == null
                  ? `${MINUS}∞ … ${formatSigned(to ?? 0)}`
                  : to == null
                    ? `${formatSigned(from)} … +∞`
                    : `${formatSigned(from)} … ${formatSigned(to)}`;
              return (
                <li
                  key={item.key}
                  className={cn(
                    "flex items-start gap-3 rounded-xl bg-card p-3",
                    isActive && "ring-1",
                  )}
                  style={isActive ? { boxShadow: `inset 0 0 0 1px ${item.color}` } : undefined}
                >
                  <span
                    aria-hidden
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: item.color,
                      opacity: isActive ? 1 : CHART_AREA_OPACITY * 3,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-2 text-sm">
                      <span className={cn("font-medium", isActive && "text-foreground")}>
                        {item.label}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {range}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.advice}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </DetailSection>

        <DetailSection title="¿Cómo se calcula?">
          <div className="space-y-3 rounded-xl bg-card p-4 text-sm">
            <p className="text-muted-foreground">
              Modelo Banister/Coggan: cada sesión suma minutos × esfuerzo (1–10). Si no indicas el
              esfuerzo, se estima con pulso, potencia o el RIR de las series. Fitness acumula a ~42
              días; Fatiga a ~7; Forma = Fitness − Fatiga.
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
                Gym y cardio usan la misma regla, así el gráfico no mezcla unidades distintas.
              </p>
            </div>
          </div>
        </DetailSection>
      </div>
    </DetailDrawerShell>
  );
}
