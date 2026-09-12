import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Flame, Heart, MapPin, MessageCircle, Play, Plus, Share2, Snowflake, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ZONE_GAUGE_ASPECT_RATIO } from "@/components/dashboard/training-load/ZoneGauge";
import {
  PAGE_CARD,
  PAGE_CARD_STACK_GAP,
  PAGE_STACK_INSET,
  PROGRESS_CARD_HEADER,
  PROGRESS_CHART_HEIGHT,
} from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

const FEED_CARD_CONTENT_CLASS = "space-y-4 px-0 pb-4 pt-6";

/** Silueta del mapa corporal del feed (max-w 126px × viewBox 638×1283). */
export const FEED_MUSCLE_MAP_HEIGHT = 253;

export function PageBusy({
  className,
  label = "Cargando…",
  children,
}: {
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function FeedMetricSkeleton({
  label,
  align = "center",
}: {
  label: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("shrink-0", align === "left" ? "text-left" : "text-center")}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <Skeleton className="mt-0.5 h-[18px] w-10" />
    </div>
  );
}

function FeedAuthorRowSkeleton() {
  return (
    <div className="mb-4 flex items-start gap-3 px-5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="-mt-0.5 flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
        <p className="flex min-w-0 items-center gap-1.5">
          <MapPin
            className="h-3 w-3 shrink-0 text-muted-foreground"
            aria-hidden
            strokeWidth={1.75}
          />
          <Skeleton className="h-3 w-44" />
        </p>
      </div>
    </div>
  );
}

function FeedSocialRowSkeleton() {
  return (
    <div className="px-5">
      <div className="pt-1">
        <div className="flex w-full items-center -mt-2">
          <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 px-3 text-muted-foreground">
            <Heart className="h-[1.15rem] w-[1.15rem]" />
            <span className="text-sm font-medium tabular-nums">0</span>
          </span>
          <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 px-3 text-muted-foreground">
            <MessageCircle className="h-[1.15rem] w-[1.15rem]" />
            <span className="text-sm font-medium tabular-nums">0</span>
          </span>
          <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 px-3 text-muted-foreground">
            <Share2 className="h-[1.15rem] w-[1.15rem]" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeedCardSkeleton({
  variant = "gym",
  showAuthor = true,
  showSocial = false,
}: {
  variant?: "gym" | "cardio";
  showAuthor?: boolean;
  showSocial?: boolean;
}) {
  return (
    <Card className={PAGE_CARD}>
      <CardContent className={FEED_CARD_CONTENT_CLASS}>
        {showAuthor ? <FeedAuthorRowSkeleton /> : null}
        <div className="space-y-3 p-0">
          <div className="min-w-0 space-y-1 px-5">
            <Skeleton className="h-5 w-3/5" />
          </div>
          {variant === "gym" ? (
            <div className="flex flex-wrap items-start gap-x-8 gap-y-2 px-5">
              <FeedMetricSkeleton label="Tiempo" />
              <FeedMetricSkeleton label="Ejercicios" />
              <FeedMetricSkeleton label="Series" />
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-x-8 gap-y-2 px-5">
              <FeedMetricSkeleton label="Tiempo" align="left" />
              <FeedMetricSkeleton label="Distancia" align="left" />
              <FeedMetricSkeleton label="Ritmo" align="left" />
            </div>
          )}
          {variant === "gym" ? (
            <div className="px-5">
              <Skeleton
                className="mx-auto w-full max-w-[280px] rounded-xl"
                style={{ height: FEED_MUSCLE_MAP_HEIGHT }}
              />
            </div>
          ) : (
            <div className="map-route-skeleton relative h-56 w-full" aria-hidden />
          )}
        </div>
        {showSocial ? <FeedSocialRowSkeleton /> : null}
      </CardContent>
    </Card>
  );
}

export function FeedListSkeleton({
  count = 5,
  showAuthor = true,
  showSocial = false,
  ariaLabel = "Cargando actividades",
}: {
  count?: number;
  showAuthor?: boolean;
  showSocial?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div
      className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton
          key={i}
          variant={i % 2 === 0 ? "gym" : "cardio"}
          showAuthor={showAuthor}
          showSocial={showSocial}
        />
      ))}
    </div>
  );
}

export function RoutineCardSkeleton() {
  return (
    <Card className="relative w-full overflow-hidden rounded-xl border border-border/40 bg-card shadow-none">
      <CardContent className="p-0">
        <div className="flex items-stretch gap-1 px-2 py-3 min-[361px]:px-3">
          <Skeleton className="h-[5.25rem] w-24 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 self-center">
            <div className="mb-0.5 flex min-w-0 items-center gap-2">
              <Skeleton className="h-5 w-36" />
              <Badge
                variant="secondary"
                className="shrink-0 border-0 bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/70"
              >
                <Skeleton className="h-2.5 w-10" />
              </Badge>
            </div>
            <Skeleton className="mt-1 h-4 w-44" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 text-muted-foreground">
            <span className="inline-flex h-11 w-11 items-center justify-center">
              <Play className="h-6 w-6 fill-current" />
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center">
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function loadRoutinesSortShortLabel(): string {
  try {
    const raw = localStorage.getItem("gym-log.routines.sort");
    if (!raw) return "Recientes";
    const parsed = JSON.parse(raw) as { sortMode?: string; sortDir?: string };
    if (parsed.sortMode === "date") return parsed.sortDir === "asc" ? "Antiguas" : "Recientes";
    if (parsed.sortMode === "name") return parsed.sortDir === "desc" ? "Z-A" : "A-Z";
    if (parsed.sortMode === "lastUsed") return parsed.sortDir === "asc" ? "Hace más" : "Recién usadas";
    if (parsed.sortMode === "duration") return parsed.sortDir === "asc" ? "Cortas" : "Largas";
    if (parsed.sortMode === "custom") return "Manual";
  } catch {
    // ignore
  }
  return "Recientes";
}

export function RoutinesToolbarSkeleton() {
  return (
    <div className={cn("flex items-center justify-between gap-3", PAGE_STACK_INSET)}>
      <Skeleton className="h-4 w-20" />
      <Button
        type="button"
        variant="secondary"
        tabIndex={-1}
        className="pointer-events-none h-8 gap-1.5 rounded-full bg-muted/80 px-2.5 text-xs font-medium text-muted-foreground shadow-none [&_svg]:size-3.5"
      >
        <ArrowUpDown className="size-3.5" />
        {loadRoutinesSortShortLabel()}
        <ChevronDown className="size-3.5 opacity-70" />
      </Button>
    </div>
  );
}

export function RoutinesFabSkeleton() {
  return (
    <Button
      type="button"
      variant="new"
      tabIndex={-1}
      className="pointer-events-none fixed z-40 right-4 bottom-[calc(var(--app-bottom-nav-inset,5.5rem)+0.5rem)] shadow-lg md:right-8 md:bottom-10"
    >
      <span className="whitespace-nowrap">Añadir</span>
      <Plus className="shrink-0" />
    </Button>
  );
}

export function RoutinesCardListSkeleton() {
  return (
    <div className={cn("flex w-full flex-col bg-background", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <RoutineCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GaugeCardSkeleton({ title }: { title: string }) {
  return (
    <Card className={cn(PAGE_CARD, "min-w-0")}>
      <div className="block w-full pb-4 pt-5 text-left">
        <div className="flex items-center justify-between gap-1 px-5 pb-1">
          <CardTitle asChild className="min-w-0 truncate text-base font-bold">
            <h2>{title}</h2>
          </CardTitle>
          <ChevronRight aria-hidden className="h-4 w-4 shrink-0" />
        </div>
        <div className="px-3">
          <div className="text-center">
            <Skeleton
              className="mx-auto mt-1 w-full max-w-[200px] rounded-full"
              style={{ aspectRatio: ZONE_GAUGE_ASPECT_RATIO }}
            />
            <Skeleton className="mx-auto mt-2 h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TrainingLoadPairSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <GaugeCardSkeleton title="Forma" />
      <GaugeCardSkeleton title="Recuperación" />
    </div>
  );
}

export function GamificationCardSkeleton({
  contentClassName,
  className,
}: {
  contentClassName?: string;
  className?: string;
} = {}) {
  return (
    <Card className={cn(PAGE_CARD, className)}>
      <CardContent className={cn("space-y-3 p-0 px-5 py-6", contentClassName)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">Nivel</span>
            <Skeleton className="h-5 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Progress value={0} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <Skeleton className="h-3 w-16" />
            </span>
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExerciseProgressCardSkeleton({
  flushHeader = false,
  clockLabel,
}: {
  flushHeader?: boolean;
  clockLabel?: string;
} = {}) {
  return (
    <Card className={cn(PAGE_CARD, "min-w-0")}>
      <CardHeader className={flushHeader ? PROGRESS_CARD_HEADER : "px-5 pt-6 pb-4"}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle asChild className="text-base font-bold">
              <h2>Fuerza máxima</h2>
            </CardTitle>
            {clockLabel ? (
              <p className="text-xs font-normal text-muted-foreground">{clockLabel}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="rounded-md p-1 opacity-25" aria-hidden>
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <Skeleton className="h-4 w-10" />
            <span className="rounded-md p-1 opacity-25" aria-hidden>
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 px-5 pt-0">
        <div className="w-0 min-w-full max-w-full overflow-hidden pb-4">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="mb-3.5 min-h-13">
          <Skeleton className="h-3 w-24" />
          <div className="mt-1 flex flex-wrap gap-x-7 gap-y-1">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">1RM</p>
              <Skeleton className="h-[18px] w-12" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Serie</p>
              <Skeleton className="h-[18px] w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="w-full rounded-md" style={{ height: PROGRESS_CHART_HEIGHT }} />
      </CardContent>
    </Card>
  );
}

function MuscleRankRowsSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex w-full items-center justify-between text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="font-medium text-foreground">{i + 1}.</span>
            <Skeleton className="h-4 w-24" />
          </span>
          <Skeleton className="ml-2 h-5 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function MuscleRankingPairSkeleton({ clockLabel }: { clockLabel?: string } = {}) {
  return (
    <div className={cn("grid w-full grid-cols-1 bg-background sm:grid-cols-2", PAGE_CARD_STACK_GAP)}>
      <Card className={PAGE_CARD}>
        <CardHeader className={PROGRESS_CARD_HEADER}>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Flame className="h-4 w-4 text-primary" /> Más entrenados
          </CardTitle>
          {clockLabel ? (
            <p className="text-xs font-normal text-muted-foreground">{clockLabel}</p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-1.5 px-5 pt-0">
          <MuscleRankRowsSkeleton />
        </CardContent>
      </Card>
      <Card className={PAGE_CARD}>
        <CardHeader className={PROGRESS_CARD_HEADER}>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Snowflake className="h-4 w-4 text-muted-foreground" /> Menos entrenados
          </CardTitle>
          {clockLabel ? (
            <p className="text-xs font-normal text-muted-foreground">{clockLabel}</p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-1.5 px-5 pt-0">
          <MuscleRankRowsSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}

export function CommunitySearchCardSkeleton() {
  return (
    <Card className={PAGE_CARD}>
      <CardHeader className="px-5 pb-0 pt-6 md:pt-8">
        <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6 pt-3 md:pt-4">
        <Input
          readOnly
          tabIndex={-1}
          placeholder="Ej: juan_gym"
          className="pointer-events-none h-12"
        />
      </CardContent>
    </Card>
  );
}

export function CommunityUserRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 p-1">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <Skeleton className="h-9 w-20 rounded-full" />
    </div>
  );
}
