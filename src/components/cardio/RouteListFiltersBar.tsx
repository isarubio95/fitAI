import { Check, ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CYCLING_SPORT_OPTIONS,
  DEFAULT_ROUTE_LIST_FILTERS,
  ROUTE_DIFFICULTY_OPTIONS,
  ROUTE_DISTANCE_OPTIONS,
  ROUTE_SORT_OPTIONS,
  routeListFiltersActive,
  type RouteListFilters,
} from "@/lib/routeListFilters";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { cn } from "@/lib/utils";

type Props = {
  value: RouteListFilters;
  onChange: (next: RouteListFilters) => void;
  /** Dificultad Komoot (solo predefinidas). */
  showDifficulty?: boolean;
  /** Subtipo cycling (mtb / carretera / touring). */
  showSport?: boolean;
};

function optionLabel<T extends string>(
  options: Array<{ id: T; label: string }>,
  id: T,
  fallback: string,
): string {
  return options.find((o) => o.id === id)?.label ?? fallback;
}

function FilterPopup<T extends string>({
  category,
  options,
  value,
  defaultId,
  onChange,
}: {
  category: string;
  options: Array<{ id: T; label: string }>;
  value: T;
  defaultId: T;
  onChange: (id: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const isCustom = value !== defaultId;
  const triggerLabel = isCustom ? optionLabel(options, value, category) : category;

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            filterPillBase,
            "inline-flex shrink-0 items-center gap-1",
            isCustom ? filterPillActive : filterPillInactive,
          )}
        >
          <span className="max-w-28 truncate">{triggerLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[140] w-48 p-1.5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {category}
        </p>
        <div className="flex flex-col gap-0.5">
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60",
                )}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RouteListFiltersBar({
  value,
  onChange,
  showDifficulty = false,
  showSport = false,
}: Props) {
  const active = routeListFiltersActive(value, { showSport });
  const patch = (partial: Partial<RouteListFilters>) => onChange({ ...value, ...partial });

  return (
    <div className="space-y-2.5 border-b border-border px-4 py-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder="Buscar por nombre…"
          className="h-10 pl-9 pr-9"
          aria-label="Buscar rutas"
        />
        {value.q ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Limpiar búsqueda"
            onClick={() => patch({ q: "" })}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPopup
          category="Distancia"
          options={ROUTE_DISTANCE_OPTIONS}
          value={value.distance}
          defaultId="all"
          onChange={(distance) => patch({ distance })}
        />
        {showDifficulty ? (
          <FilterPopup
            category="Dificultad"
            options={ROUTE_DIFFICULTY_OPTIONS}
            value={value.difficulty}
            defaultId="all"
            onChange={(difficulty) => patch({ difficulty })}
          />
        ) : null}
        {showSport ? (
          <FilterPopup
            category="Tipo"
            options={CYCLING_SPORT_OPTIONS}
            value={value.sport}
            defaultId="all"
            onChange={(sport) => patch({ sport })}
          />
        ) : null}
        <FilterPopup
          category="Orden"
          options={ROUTE_SORT_OPTIONS}
          value={value.sort}
          defaultId="popular"
          onChange={(sort) => patch({ sort })}
        />
        {active ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 px-2 text-muted-foreground"
            onClick={() => onChange({ ...DEFAULT_ROUTE_LIST_FILTERS })}
          >
            Limpiar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
