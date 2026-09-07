import { Activity, Layers, Timer, Weight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PAGE_CARD,
  PAGE_CARD_STACK_GAP,
  PROGRESS_CARD_HEADER,
  PROGRESS_CHART_HEIGHT,
  YOU_PROGRESS_PAGE,
  YOU_PROGRESS_STACK,
} from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

/**
 * Silueta de Progreso: mismas pills, grid 2×2 y cards de gráfico que
 * WorkoutHistory, para que el fallback de Suspense no descuadre al cargar.
 *
 * Las etiquetas e iconos son fijos (igual que en el pintado con datos en vuelo);
 * solo pulsan los valores y el área del chart.
 */

/** Mismas keys/labels y valor inicial (`4w`) que WorkoutHistory. */
const PERIOD_OPTIONS = [
  { key: "7d", label: "7 días" },
  { key: "4w", label: "4 sem." },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
] as const;
const DEFAULT_PERIOD = "4w";

const KPI_SKELETONS: { label: string; Icon: LucideIcon }[] = [
  { label: "Sesiones", Icon: Activity },
  { label: "Volumen de fuerza", Icon: Weight },
  { label: "Tiempo cardio", Icon: Timer },
  { label: "Series", Icon: Layers },
];

function PeriodPillsSkeleton() {
  return (
    <Tabs value={DEFAULT_PERIOD} className="pointer-events-none w-full" aria-hidden>
      <AnimatedTabsList value={DEFAULT_PERIOD} className={cn(pillTabsListClass, "w-full")}>
        {PERIOD_OPTIONS.map((opt) => (
          <TabsTrigger
            key={opt.key}
            value={opt.key}
            tabIndex={-1}
            className={cn(pillTabsTriggerClass, "min-w-0 flex-1")}
          >
            {opt.label}
          </TabsTrigger>
        ))}
      </AnimatedTabsList>
    </Tabs>
  );
}

function KpiCardSkeleton({ label, Icon }: { label: string; Icon: LucideIcon }) {
  return (
    <Card className={PAGE_CARD}>
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-inset ring-primary/15">
            <Icon className="size-4 text-primary" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <p className="text-xs font-semibold">{label}</p>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSummarySkeleton({ stats }: { stats: readonly string[] }) {
  return (
    <div className="mb-3.5 min-h-13">
      <Skeleton className="h-4 w-24" />
      <div className="mt-1 flex flex-wrap gap-x-7 gap-y-1">
        {stats.map((label) => (
          <div key={label} className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <Skeleton className="h-[18px] w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCardSkeleton({
  title,
  stats,
}: {
  title: string;
  stats: readonly string[];
}) {
  return (
    <Card className={PAGE_CARD}>
      <CardHeader className={PROGRESS_CARD_HEADER}>
        <CardTitle asChild className="text-base">
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        <ChartSummarySkeleton stats={stats} />
        <Skeleton
          className="w-full rounded-md"
          style={{ height: PROGRESS_CHART_HEIGHT }}
        />
      </CardContent>
    </Card>
  );
}

/** Contenido above-the-fold: pills + KPIs + Constancia + Volumen. */
export function YouProgressAboveFoldSkeleton() {
  return (
    <>
      <div className="flex w-full flex-col gap-3 md:gap-3.5">
        <PeriodPillsSkeleton />
        <div className={cn("grid grid-cols-2", PAGE_CARD_STACK_GAP)}>
          {KPI_SKELETONS.map((kpi) => (
            <KpiCardSkeleton key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>
      <ChartCardSkeleton title="Constancia" stats={["Sesiones", "Gym", "Cardio"]} />
      <ChartCardSkeleton title="Volumen de fuerza" stats={["Volumen"]} />
    </>
  );
}

export function YouProgressSkeleton() {
  return (
    <div className={YOU_PROGRESS_PAGE} aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div className={YOU_PROGRESS_STACK}>
        <YouProgressAboveFoldSkeleton />
      </div>
    </div>
  );
}
