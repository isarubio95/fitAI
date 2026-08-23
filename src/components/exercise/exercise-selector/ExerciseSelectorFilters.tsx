import { useState } from "react";
import { Bookmark, Check, ChevronDown, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { MUSCLE_GROUPS, MUSCLE_GROUP_ICON_SRC, type MainMuscleGroup } from "@/constants/muscleGroups";
import { EXERCISE_SORT_LABELS, type ExerciseSortMode } from "./types";

const MUSCLE_GROUP_OPTIONS = Object.keys(MUSCLE_GROUPS) as MainMuscleGroup[];

/** Grupos musculares visibles antes de pulsar "Más". */
const COLLAPSED_GROUP_COUNT = 3;

const SORT_OPTIONS: ExerciseSortMode[] = ["usados", "recientes", "az"];

type FilterPillProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label?: string;
};

function FilterPill({ active, onClick, children, label }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        filterPillBase,
        "inline-flex shrink-0 items-center gap-1.5 text-[13px]",
        active ? filterPillActive : filterPillInactive,
      )}
    >
      {children}
    </button>
  );
}

export type ExerciseSelectorFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedGrupos: string[];
  onToggleGrupo: (grupo: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  onlyMine: boolean;
  onOnlyMineChange: (value: boolean) => void;
  /** Sin sesión no hay favoritos ni ejercicios propios. */
  showUserFilters: boolean;
  sort: ExerciseSortMode;
  onSortChange: (sort: ExerciseSortMode) => void;
};

export function ExerciseSelectorFilters({
  search,
  onSearchChange,
  selectedGrupos,
  onToggleGrupo,
  favoritesOnly,
  onFavoritesOnlyChange,
  onlyMine,
  onOnlyMineChange,
  showUserFilters,
  sort,
  onSortChange,
}: ExerciseSelectorFiltersProps) {
  const [showAllGroups, setShowAllGroups] = useState(false);

  // Los seleccionados van primero: al plegar la lista nunca desaparece un filtro activo.
  const orderedGroups = [
    ...MUSCLE_GROUP_OPTIONS.filter((g) => selectedGrupos.includes(g)),
    ...MUSCLE_GROUP_OPTIONS.filter((g) => !selectedGrupos.includes(g)),
  ];
  const visibleGroups = showAllGroups
    ? orderedGroups
    : orderedGroups.slice(0, Math.max(COLLAPSED_GROUP_COUNT, selectedGrupos.length));
  const hiddenCount = orderedGroups.length - visibleGroups.length;

  return (
    <div className="shrink-0 space-y-3 px-4 pb-2.5 pt-1 sm:px-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Nombre, músculo o material"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 rounded-xl border-0 bg-muted/45 pl-10 text-sm"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visibleGroups.map((grupo) => (
          <FilterPill
            key={grupo}
            active={selectedGrupos.includes(grupo)}
            onClick={() => onToggleGrupo(grupo)}
          >
            <img
              src={MUSCLE_GROUP_ICON_SRC[grupo]}
              alt=""
              className="h-4.5 w-4.5 shrink-0"
              draggable={false}
            />
            {grupo}
          </FilterPill>
        ))}
        {showUserFilters && (
          <>
            <FilterPill
              active={favoritesOnly}
              onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
              label="Solo favoritos"
            >
              <Bookmark className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current")} />
              Favoritos
            </FilterPill>
            <FilterPill
              active={onlyMine}
              onClick={() => onOnlyMineChange(!onlyMine)}
              label="Solo mis ejercicios"
            >
              <User className="h-3.5 w-3.5" />
              Mis ejercicios
            </FilterPill>
          </>
        )}
        {(hiddenCount > 0 || showAllGroups) && (
          <FilterPill active={false} onClick={() => setShowAllGroups((v) => !v)}>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAllGroups && "rotate-180")} />
            {showAllGroups ? "Menos" : "Más"}
          </FilterPill>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">
          Ordenado por: {EXERCISE_SORT_LABELS[sort]}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="touch-styled shrink-0 text-xs font-medium text-primary outline-none focus:outline-none focus-visible:outline-none"
            >
              Cambiar
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[80] w-48 bg-popover">
            <DropdownMenuLabel className="text-xs">Ordenar por</DropdownMenuLabel>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem key={option} onClick={() => onSortChange(option)}>
                <span className="capitalize">{EXERCISE_SORT_LABELS[option]}</span>
                {sort === option && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
