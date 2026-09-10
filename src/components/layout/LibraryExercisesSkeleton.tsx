import { ArrowDownAZ, BicepsFlexed, Bookmark, ChevronDown, Filter, Plus, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LIBRARY_EXERCISES_LIST, LIBRARY_EXERCISES_PAGE, PAGE_STACK_INSET } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

const FILTER_CHIPS = [
  { label: "Favoritos", Icon: Bookmark },
  { label: "Tipo", Icon: Filter },
  { label: "Grupo", Icon: BicepsFlexed },
  { label: "Equipo", Icon: Wrench },
] as const;

/** Una fila del catálogo: min-h 5.25rem, thumb blanco 112px, título + equipo + bookmark. */
export function ExerciseRowSkeleton() {
  return (
    <Card className="w-full max-w-none overflow-hidden rounded-xl border border-border/40 bg-card shadow-none">
      <CardContent className="flex min-h-[5.25rem] items-stretch p-0">
        <div className="relative w-28 shrink-0 self-stretch overflow-hidden bg-white">
          <Skeleton className="absolute inset-0 rounded-none bg-muted/70" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 p-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <div className="flex min-h-4 min-w-0 items-center gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-7" />
            </div>
          </div>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground">
            <Bookmark className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ExercisesToolbarSkeleton() {
  return (
    <div
      className={cn(
        "sticky z-30 w-full bg-background",
        "top-[calc(var(--app-header-height,5rem)-2px)] pt-0.5 md:top-0 md:pt-0",
      )}
    >
      <Card className="w-full max-w-none overflow-hidden rounded-none border-0 bg-background shadow-none">
        <CardContent className={cn("space-y-4 py-4 md:px-5 md:py-6", PAGE_STACK_INSET)}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              tabIndex={-1}
              placeholder="Buscar ejercicio..."
              className="pointer-events-none h-12 pl-10"
            />
          </div>
          <div className="flex flex-col gap-3 md:gap-2">
            <div className="-mr-4 min-w-0 md:-mr-6">
              <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] scrollbar-none [&::-webkit-scrollbar]:hidden">
                {FILTER_CHIPS.map(({ label, Icon }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="filter"
                    size="sm"
                    tabIndex={-1}
                    className="pointer-events-none shrink-0 justify-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="filter"
                  size="sm"
                  tabIndex={-1}
                  className="pointer-events-none shrink-0 justify-center gap-2"
                >
                  Dificultad
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
                <Button
                  type="button"
                  variant="filter"
                  size="sm"
                  tabIndex={-1}
                  className="pointer-events-none shrink-0 justify-center gap-2"
                >
                  <ArrowDownAZ className="h-4 w-4" />
                  Orden
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LibraryExercisesSkeleton() {
  return (
    <div className={LIBRARY_EXERCISES_PAGE} aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <Button
        type="button"
        variant="new"
        tabIndex={-1}
        className="pointer-events-none fixed z-40 right-4 bottom-[calc(var(--app-bottom-nav-inset,5.5rem)+0.5rem)] shadow-lg md:right-8 md:bottom-10"
      >
        <span className="whitespace-nowrap">Crear</span>
        <Plus className="shrink-0" />
      </Button>
      <ExercisesToolbarSkeleton />
      <div className={cn(LIBRARY_EXERCISES_LIST, PAGE_STACK_INSET)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ExerciseRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
