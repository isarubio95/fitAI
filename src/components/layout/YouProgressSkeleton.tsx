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
  PROGRESS_CARD_HEADER,
  PROGRESS_CHART_HEIGHT,
  YOU_PROGRESS_PAGE,
  YOU_PROGRESS_STACK,
} from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
import { DEFAULT_YOU_PROGRESS_PERIOD, YOU_PROGRESS_PERIODS } from "@/lib/youProgressPeriod";

/**
 * Silueta de Progreso: pills, veredicto y cards de gráfico, para que el
 * fallback de Suspense no descuadre al cargar.
 */

function PeriodPillsSkeleton() {
  return (
    <Tabs value={DEFAULT_YOU_PROGRESS_PERIOD} className="pointer-events-none w-full" aria-hidden>
      <AnimatedTabsList value={DEFAULT_YOU_PROGRESS_PERIOD} className={cn(pillTabsListClass, "w-full")}>
        {YOU_PROGRESS_PERIODS.map((opt) => (
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

function ChartSummarySkeleton({ stats }: { stats: readonly string[] }) {
  return (
    <div className="mb-3.5 min-h-13">
      <Skeleton className="h-4 w-24" />
      <div className="mt-1 flex flex-wrap gap-x-7 gap-y-1">
        {stats.map((label) => (
          <div key={label} className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
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
          <h3>{title}</h3>
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

/** Contenido above-the-fold: pills + veredicto + Constancia + Volumen. */
export function YouProgressAboveFoldSkeleton() {
  return (
    <>
      <div className="flex w-full flex-col gap-3 md:gap-3.5">
        <PeriodPillsSkeleton />
        <div className="space-y-1.5 px-1">
          <Skeleton className="h-8 w-[min(100%,22rem)]" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <ChartCardSkeleton title="Constancia" stats={["Gym", "Cardio", "Sesiones"]} />
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
