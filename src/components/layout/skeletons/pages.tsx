import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, startOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronLeft, ChevronRight, Flame, Heart, Moon, Pencil, Play, Plus, Scale, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";
import { gymDirectoryPageHeightClass } from "@/components/gym/GymDirectoryExplorer";
import { LibraryExercisesSkeleton } from "@/components/layout/LibraryExercisesSkeleton";
import { YouProgressSkeleton } from "@/components/layout/YouProgressSkeleton";
import {
  CommunitySearchCardSkeleton,
  ExerciseProgressCardSkeleton,
  FeedListSkeleton,
  GamificationCardSkeleton,
  PageBusy,
  RoutinesCardListSkeleton,
  RoutinesFabSkeleton,
  RoutinesToolbarSkeleton,
  TrainingLoadPairSkeleton,
} from "@/components/layout/skeletons/blocks";
import {
  APP_PAGE_SHELL,
  APP_PAGE_STACK,
  CARDIO_ROUTINES_PAGE,
  PAGE_CARD,
  PAGE_CARD_STACK_GAP,
  PAGE_STACK_INSET,
  ROUTINES_PAGE,
  YOU_ACTIVITIES_PAGE,
  YOU_HEALTH_PAGE,
} from "@/lib/pageStyles";
import { healthPageBottomPad } from "@/hooks/useActiveSessionFabOffset";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { HEALTH_CHART_TITLE, HEALTH_METRIC_LABEL } from "@/lib/healthMetrics";
import { normalizeYouTab } from "@/lib/youPageTabs";
import { CALENDAR_DAY_CELL_SHAPE } from "@/lib/calendarDayDisplay";
import { cn } from "@/lib/utils";

const CALENDAR_DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const DEFAULT_DASHBOARD_WIDGET_ORDER = ["calendar", "training-load", "gamification", "progress"] as const;
const LEGACY_DASHBOARD_WIDGET_ORDER = ["calendar", "gamification", "progress", "training-load"];

function resolveDashboardWidgetOrder(saved: unknown): string[] {
  if (!Array.isArray(saved)) return [...DEFAULT_DASHBOARD_WIDGET_ORDER];
  const validItems = saved.filter(
    (w): w is string => typeof w === "string" && (DEFAULT_DASHBOARD_WIDGET_ORDER as readonly string[]).includes(w),
  );
  const missing = DEFAULT_DASHBOARD_WIDGET_ORDER.filter((w) => !validItems.includes(w));
  const merged = [...validItems, ...missing];
  if (merged.every((id, i) => id === LEGACY_DASHBOARD_WIDGET_ORDER[i])) {
    return [...DEFAULT_DASHBOARD_WIDGET_ORDER];
  }
  return merged;
}

function loadDashboardWidgetOrder(): string[] {
  try {
    const saved = localStorage.getItem("dashboard-widget-order");
    if (!saved) return [...DEFAULT_DASHBOARD_WIDGET_ORDER];
    return resolveDashboardWidgetOrder(JSON.parse(saved));
  } catch {
    return [...DEFAULT_DASHBOARD_WIDGET_ORDER];
  }
}


const HEALTH_SUMMARY = [
  { key: "peso" as const, label: HEALTH_METRIC_LABEL.peso, Icon: Scale },
  { key: "calorias" as const, label: HEALTH_METRIC_LABEL.calorias, Icon: Flame },
  { key: "fc" as const, label: HEALTH_METRIC_LABEL.fc, Icon: Heart },
  { key: "sueno" as const, label: HEALTH_METRIC_LABEL.sueno, Icon: Moon },
];

function calendarDaysForMonth(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const allDays = eachDayOfInterval({ start, end });
  const startDow = (getDay(start) + 6) % 7;
  const prefix = Array.from({ length: startDow }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() - (startDow - i));
    return d;
  });
  const endDow = (getDay(end) + 6) % 7;
  const suffix = Array.from({ length: 6 - endDow }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  return [...prefix, ...allDays, ...suffix];
}

function loadDashboardCalendarView(): "month" | "week" {
  try {
    const raw = localStorage.getItem("gym-log.dashboard.calendar-view");
    if (raw === "month" || raw === "week") return raw;
  } catch {
    // ignore
  }
  return "month";
}

function DashboardCalendarSkeleton() {
  const view = loadDashboardCalendarView();
  const now = new Date();
  const month = startOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const periodLabel =
    view === "month"
      ? format(month, "MMMM yyyy", { locale: es })
      : `${format(weekStart, "d", { locale: es })} - ${format(addDays(weekStart, 6), "d 'de' MMMM", { locale: es })}`;
  const days = view === "month" ? calendarDaysForMonth(month) : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <Card className={PAGE_CARD}>
      <CardHeader className="space-y-3 px-5 pt-6 pb-4">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-base font-semibold capitalize">
            {periodLabel}
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </span>
          <div className="flex items-center">
            <span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <Tabs value={view} className="pointer-events-none" aria-hidden>
            <AnimatedTabsList value={view} className={pillTabsListClass}>
              <TabsTrigger value="month" tabIndex={-1} className={pillTabsTriggerClass}>
                Mes
              </TabsTrigger>
              <TabsTrigger value="week" tabIndex={-1} className={pillTabsTriggerClass}>
                Semana
              </TabsTrigger>
            </AnimatedTabsList>
          </Tabs>
          <Button
            variant="secondary"
            size="sm"
            tabIndex={-1}
            className="pointer-events-none rounded-full bg-background"
          >
            <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
              <span className="invisible inline-flex items-center gap-2" aria-hidden>
                <Pencil className="h-4 w-4" />
                Editar plan
              </span>
              <span className="inline-flex items-center justify-center gap-2">
                <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-16" />
              </span>
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-5 pt-0">
        <div className="w-full">
          <div className="mb-1 grid grid-cols-7 px-2 text-center text-xs font-medium text-muted-foreground">
            {CALENDAR_DAY_LABELS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-b-xl bg-transparent">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 px-2">
                {week.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative flex aspect-square w-full items-center justify-center p-1",
                      view === "month" && !isSameMonth(day, month) && "opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "calendar-day-skeleton relative flex size-full items-center justify-center overflow-hidden border border-transparent bg-muted/60 text-xs font-semibold opacity-85 dark:bg-muted/45",
                        CALENDAR_DAY_CELL_SHAPE,
                      )}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  const order = loadDashboardWidgetOrder();
  return (
    <PageBusy className={APP_PAGE_SHELL}>
      <div className={APP_PAGE_STACK}>
        {order.map((id) => {
          if (id === "calendar") return <DashboardCalendarSkeleton key={id} />;
          if (id === "training-load") return <TrainingLoadPairSkeleton key={id} />;
          if (id === "gamification") return <GamificationCardSkeleton key={id} />;
          if (id === "progress") return <ExerciseProgressCardSkeleton key={id} />;
          return null;
        })}
      </div>
    </PageBusy>
  );
}

export function CommunitySkeleton() {
  return (
    <PageBusy className={APP_PAGE_SHELL}>
      <section className={APP_PAGE_STACK}>
        <CommunitySearchCardSkeleton />
        <FeedListSkeleton count={4} showAuthor showSocial ariaLabel="Cargando el feed" />
      </section>
    </PageBusy>
  );
}

export function RoutinesSkeleton() {
  return (
    <PageBusy className={ROUTINES_PAGE}>
      <RoutinesToolbarSkeleton />
      <RoutinesCardListSkeleton />
      <RoutinesFabSkeleton />
    </PageBusy>
  );
}

export function YouHealthSkeleton() {
  return (
    <PageBusy className={cn(YOU_HEALTH_PAGE, healthPageBottomPad(0))}>
      <div className={APP_PAGE_STACK}>
        <Card className={PAGE_CARD}>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-0">
              {HEALTH_SUMMARY.map((card, i) => {
                const Icon = card.Icon;
                const cellBorder =
                  i === 0
                    ? "border-r border-b border-black/5 dark:border-white/10"
                    : i === 1
                      ? "border-b border-black/5 dark:border-white/10"
                      : i === 2
                        ? "border-r border-black/5 dark:border-white/10"
                        : "";
                return (
                  <div key={card.key} className={cn("space-y-1 px-5 py-8 text-left", cellBorder, i === 0 && "bg-secondary/60")}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className={PAGE_CARD} aria-busy="true" aria-label="Cargando gráfico">
          <CardContent className="px-5 py-8">
            <h2 className="mb-3 text-sm font-semibold">{HEALTH_CHART_TITLE.peso}</h2>
            <Skeleton className="aspect-2/1 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </PageBusy>
  );
}

const ACTIVITY_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "gym", label: "Gym" },
  { id: "cardio", label: "Cardio" },
] as const;

export function YouActivitiesSkeleton() {
  return (
    <PageBusy className={YOU_ACTIVITIES_PAGE}>
      <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET)}>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 md:px-0">
          {ACTIVITY_FILTERS.map((opt) => (
            <span
              key={opt.id}
              className={cn(
                filterPillBase,
                "pointer-events-none whitespace-nowrap",
                opt.id === "all" ? filterPillActive : filterPillInactive,
              )}
            >
              {opt.label}
            </span>
          ))}
        </div>
        <FeedListSkeleton showAuthor showSocial />
      </div>
    </PageBusy>
  );
}

export function GymsSkeleton() {
  return (
    <PageBusy className={gymDirectoryPageHeightClass} label="Cargando gimnasios…">
      <div className="relative h-full min-h-0 w-full">
        <div className="map-route-skeleton absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 md:px-4 md:pt-4">
          <div className="mx-auto max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                readOnly
                tabIndex={-1}
                placeholder="Buscar por nombre o ciudad"
                className="pointer-events-none h-12 pl-9"
              />
            </div>
          </div>
        </div>
      </div>
    </PageBusy>
  );
}

export function CardioRoutineCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <p className="text-xs text-muted-foreground">
              <Skeleton className="inline-block h-3 w-4 align-middle" /> bloques
            </p>
            <div className="flex gap-2">
              <Button size="sm" tabIndex={-1} className="pointer-events-none">
                <Play className="mr-1 h-4 w-4" /> Iniciar
              </Button>
              <Button variant="outline" size="sm" tabIndex={-1} className="pointer-events-none">
                <Pencil className="mr-1 h-4 w-4" /> Editar
              </Button>
              <Button variant="ghost" size="sm" tabIndex={-1} className="pointer-events-none">
                <Trash2 className="mr-1 h-4 w-4" /> Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function CardioRoutinesSkeleton() {
  return (
    <PageBusy className={CARDIO_ROUTINES_PAGE}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rutinas de Cardio</h2>
        <Button tabIndex={-1} className="pointer-events-none">
          <Plus className="mr-1 h-4 w-4" /> Nueva
        </Button>
      </div>
      <CardioRoutineCardsSkeleton />
    </PageBusy>
  );
}

export function PageRouteFallback({ pathname, tab }: { pathname: string; tab: string }) {
  if (pathname === "/") return <DashboardSkeleton />;
  if (pathname === "/community") return <CommunitySkeleton />;
  if (pathname === "/gimnasios") return <GymsSkeleton />;
  if (pathname === "/cardio-routines") return <CardioRoutinesSkeleton />;
  if (pathname === "/evolution") {
    const youTab = normalizeYouTab(tab);
    if (youTab === "health") return <YouHealthSkeleton />;
    if (youTab === "activities") return <YouActivitiesSkeleton />;
    return <YouProgressSkeleton />;
  }
  if (pathname === "/routines") {
    return tab === "ejercicios" ? <LibraryExercisesSkeleton /> : <RoutinesSkeleton />;
  }
  return <DashboardSkeleton />;
}
