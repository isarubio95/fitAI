import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRegistroSeries, type RegistroSeries } from "@/types/workout";
import {
  useExerciseCatalogInfinite,
  useExercisesByKeys,
  useFavoriteExercisesCatalog,
} from "@/hooks/useExerciseCatalog";
import { useExerciseUsageStats } from "@/hooks/useExerciseUsageStats";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";
import { useExerciseFavorites } from "@/hooks/useExerciseFavorites";
import { cn } from "@/lib/utils";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
import { normalizeExerciseName } from "@/lib/matchExerciseByName";
import { groupExerciseFamilies, type ExerciseFamily } from "@/lib/exerciseVariants";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import { ExerciseSelectorFilters } from "@/components/exercise/exercise-selector/ExerciseSelectorFilters";
import { ExerciseFamilyRow } from "@/components/exercise/exercise-selector/ExerciseFamilyRow";
import {
  exerciseKey,
  exerciseSource,
  type ExerciseSortMode,
  type SelectorExercise,
} from "@/components/exercise/exercise-selector/types";

/** Máximo de ejercicios "más usados" que traemos fuera de la paginación. */
const TOP_USED_LIMIT = 60;

const SEARCH_DEBOUNCE_MS = 220;

type ExerciseCatalogRef = {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
  registro_series?: RegistroSeries;
};

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (catalogRef: ExerciseCatalogRef, nombre: string) => void | Promise<unknown>;
  /** Permite reemplazar el botón por defecto (p. ej. para la barra flotante del entreno activo). */
  trigger?: ReactNode;
  /**
   * `drawer`: sheet inferior (entreno activo).
   * `floating`: alias de `drawer` (compat).
   * `popover`: comportamiento clásico (rutinas).
   */
  variant?: "popover" | "drawer" | "floating";
  /** Texto del botón de confirmación; por defecto depende de la variante. */
  addLabel?: string;
}

function catalogRefFor(exercise: SelectorExercise): ExerciseCatalogRef {
  const registro_series = normalizeRegistroSeries(exercise.registro_series);
  return exerciseSource(exercise) === "usuario"
    ? { usuario_ejercicio_id: exercise.id, registro_series }
    : { tipo_ejercicio_id: exercise.id, registro_series };
}

function matchesSearch(exercise: SelectorExercise, needle: string) {
  if (!needle) return true;
  const haystack = normalizeExerciseName(
    [exercise.nombre, exercise.equipment, exercise.grupo_muscular].filter(Boolean).join(" "),
  );
  return needle.split(" ").every((word) => haystack.includes(word));
}

function usageScore(
  family: ExerciseFamily<SelectorExercise>,
  usage: Map<string, { count: number; lastUsed: number }>,
) {
  let count = 0;
  let lastUsed = 0;
  for (const { item } of family.variants) {
    const stats = usage.get(exerciseKey(item));
    if (!stats) continue;
    count += stats.count;
    lastUsed = Math.max(lastUsed, stats.lastUsed);
  }
  return { count, lastUsed };
}

function ExerciseSelectorPanel({
  search,
  onSearchChange,
  selectedGrupos,
  onToggleGrupo,
  onlyMine,
  onOnlyMineChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  showUserFilters,
  sort,
  onSortChange,
  isLoading,
  families,
  expandAll,
  expandedKeys,
  onExpandedChange,
  selectedKeys,
  onToggleSelect,
  onViewDetail,
  userId,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  fillHeight,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  selectedGrupos: string[];
  onToggleGrupo: (grupo: string) => void;
  onlyMine: boolean;
  onOnlyMineChange: (value: boolean) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  showUserFilters: boolean;
  sort: ExerciseSortMode;
  onSortChange: (sort: ExerciseSortMode) => void;
  isLoading: boolean;
  families: ExerciseFamily<SelectorExercise>[];
  expandAll: boolean;
  expandedKeys: Set<string>;
  onExpandedChange: (key: string, expanded: boolean) => void;
  selectedKeys: Set<string>;
  onToggleSelect: (exercise: SelectorExercise) => void;
  onViewDetail: (exercise: SelectorExercise) => void;
  userId?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  /** En drawer: la lista crece y scrollea dentro del alto disponible. */
  fillHeight?: boolean;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col", fillHeight && "h-full")}>
      <ExerciseSelectorFilters
        search={search}
        onSearchChange={onSearchChange}
        selectedGrupos={selectedGrupos}
        onToggleGrupo={onToggleGrupo}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={onFavoritesOnlyChange}
        onlyMine={onlyMine}
        onOnlyMineChange={onOnlyMineChange}
        showUserFilters={showUserFilters}
        sort={sort}
        onSortChange={onSortChange}
      />

      <div
        className={cn(
          "overflow-y-auto overscroll-contain touch-pan-y border-t border-border [-webkit-overflow-scrolling:touch]",
          fillHeight ? "min-h-0 flex-1" : "max-h-[min(58svh,30rem)]",
        )}
        onWheelCapture={(e) => e.stopPropagation()}
        onTouchMoveCapture={(e) => e.stopPropagation()}
        onScroll={(e) => {
          const el = e.currentTarget;
          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
          if (nearBottom && hasNextPage && !isFetchingNextPage) onFetchNextPage();
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando ejercicios...
          </div>
        ) : families.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
            {favoritesOnly && !search.trim()
              ? "No hay ejercicios favoritos."
              : "No se encontraron ejercicios."}
          </p>
        ) : (
          families.map((family) => (
            <ExerciseFamilyRow
              key={family.key}
              family={family}
              expanded={expandAll || expandedKeys.has(family.key)}
              onExpandedChange={(next) => onExpandedChange(family.key, next)}
              selectedKeys={selectedKeys}
              onToggleSelect={onToggleSelect}
              onViewDetail={onViewDetail}
              currentUserId={userId}
            />
          ))
        )}
        {!isLoading && isFetchingNextPage && (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground sm:px-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando más...
          </div>
        )}
      </div>
    </div>
  );
}

export function ExerciseSelector({
  open,
  onOpenChange,
  onSelect,
  trigger,
  variant = "popover",
  addLabel,
}: ExerciseSelectorProps) {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGrupos, setSelectedGrupos] = useState<string[]>([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<ExerciseSortMode>("usados");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<SelectorExercise[]>([]);
  const [detailExercise, setDetailExercise] = useState<SelectorExercise | null>(null);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawer = variant === "drawer" || variant === "floating";
  const { isFavorite, favoriteKeys } = useExerciseFavorites();

  useEffect(() => {
    if (searchInput === search) return;
    const timer = window.setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  const favoritesCatalogQuery = useFavoriteExercisesCatalog(favoriteKeys, favoritesOnly && open);
  const { usage, topKeys } = useExerciseUsageStats(!!user && open);
  const usedByUsage = sort !== "az" && !favoritesOnly;
  const topUsedQuery = useExercisesByKeys(
    topKeys.slice(0, TOP_USED_LIMIT),
    open && usedByUsage,
  );
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseCatalogInfinite(
    { q: search, grupos: selectedGrupos, searchScope: "amplio" },
    30,
  );

  useEffect(() => {
    if (open) return;
    setSelectedGrupos([]);
    setFavoritesOnly(false);
    setDetailExercise(null);
    setExpandedKeys(new Set());
    setSelection([]);
    setSearchInput("");
    setSearch("");
  }, [open]);

  // El Drawer ya registra su propia capa de back; el popover sí necesita la suya.
  useBackCloseLayer({ open: !isDrawer && open, onOpenChange, kind: "popover" });

  const catalog = useMemo<SelectorExercise[]>(() => {
    const rows: SelectorExercise[] = [];
    if (favoritesOnly) {
      rows.push(...((favoritesCatalogQuery.data ?? []) as SelectorExercise[]));
    } else {
      // Los más usados van primero aunque vivan en una página lejana del catálogo.
      if (usedByUsage) rows.push(...((topUsedQuery.data ?? []) as SelectorExercise[]));
      const pages = data?.pages ?? [];
      rows.push(...((pages[0]?.usuario ?? []) as SelectorExercise[]));
      rows.push(...(pages.flatMap((p) => p.catalogo ?? []) as SelectorExercise[]));
    }

    const seen = new Set<string>();
    return rows.filter((row) => {
      const key = exerciseKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, favoritesOnly, favoritesCatalogQuery.data, topUsedQuery.data, usedByUsage]);

  const needle = normalizeExerciseName(search);

  const filtered = useMemo(
    () =>
      catalog.filter((ex) => {
        if (onlyMine && ex.usuario_id !== user?.id) return false;
        if (favoritesOnly && !isFavorite(exerciseSource(ex), ex.id)) return false;
        if (selectedGrupos.length) {
          const grupo = String(ex.grupo_muscular ?? "").trim();
          if (!selectedGrupos.includes(grupo)) return false;
        }
        return matchesSearch(ex, needle);
      }),
    [catalog, onlyMine, user?.id, favoritesOnly, isFavorite, selectedGrupos, needle],
  );

  const families = useMemo(() => {
    const grouped = groupExerciseFamilies(filtered);
    const byName = (a: ExerciseFamily<SelectorExercise>, b: ExerciseFamily<SelectorExercise>) =>
      a.base.localeCompare(b.base, "es");

    for (const family of grouped) {
      family.variants.sort((a, b) => {
        if (sort !== "az") {
          const sa = usage.get(exerciseKey(a.item));
          const sb = usage.get(exerciseKey(b.item));
          const diff =
            sort === "usados"
              ? (sb?.count ?? 0) - (sa?.count ?? 0)
              : (sb?.lastUsed ?? 0) - (sa?.lastUsed ?? 0);
          if (diff) return diff;
        }
        return a.label.localeCompare(b.label, "es");
      });
    }

    if (sort === "az") return grouped.sort(byName);

    return grouped.sort((a, b) => {
      const sa = usageScore(a, usage);
      const sb = usageScore(b, usage);
      const diff = sort === "usados" ? sb.count - sa.count : sb.lastUsed - sa.lastUsed;
      return diff || byName(a, b);
    });
  }, [filtered, sort, usage]);

  const selectedKeys = useMemo(
    () => new Set(selection.map((ex) => exerciseKey(ex))),
    [selection],
  );

  const toggleSelect = useCallback((exercise: SelectorExercise) => {
    setSelection((prev) => {
      const key = exerciseKey(exercise);
      const next = prev.filter((ex) => exerciseKey(ex) !== key);
      return next.length === prev.length ? [...prev, exercise] : next;
    });
  }, []);

  const handleExpandedChange = useCallback((key: string, expanded: boolean) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const handleAdd = async () => {
    if (!selection.length || adding) return;
    setAdding(true);
    try {
      // Secuencial: en el entreno activo cada alta inserta en BD y el orden importa.
      for (const exercise of selection) {
        await onSelect(catalogRefFor(exercise), exercise.nombre);
      }
    } finally {
      setAdding(false);
    }
    onOpenChange(false);
  };

  const resultCount = filtered.length;
  const confirmLabel = addLabel ?? (isDrawer ? "Añadir al entreno" : "Añadir a la rutina");

  const panel = (
    <ExerciseSelectorPanel
      search={searchInput}
      onSearchChange={setSearchInput}
      selectedGrupos={selectedGrupos}
      onToggleGrupo={(grupo) =>
        setSelectedGrupos((prev) =>
          prev.includes(grupo) ? prev.filter((g) => g !== grupo) : [...prev, grupo],
        )
      }
      onlyMine={onlyMine}
      onOnlyMineChange={setOnlyMine}
      favoritesOnly={favoritesOnly}
      onFavoritesOnlyChange={setFavoritesOnly}
      showUserFilters={!!user}
      sort={sort}
      onSortChange={setSort}
      isLoading={
        favoritesOnly ? favoriteKeys.size > 0 && favoritesCatalogQuery.isLoading : isLoading
      }
      families={families}
      expandAll={!!search.trim() || favoritesOnly}
      expandedKeys={expandedKeys}
      onExpandedChange={handleExpandedChange}
      selectedKeys={selectedKeys}
      onToggleSelect={toggleSelect}
      onViewDetail={setDetailExercise}
      userId={user?.id}
      hasNextPage={!!hasNextPage && !favoritesOnly}
      isFetchingNextPage={isFetchingNextPage && !favoritesOnly}
      onFetchNextPage={() => void fetchNextPage()}
      fillHeight={isDrawer}
    />
  );

  const footer = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-4 pt-3 sm:px-6",
        isDrawer ? drawerSafeAreaBottom : "pb-3",
      )}
    >
      <span className="text-xs text-muted-foreground">
        {selection.length === 0
          ? "Ninguno seleccionado"
          : `${selection.length} seleccionado${selection.length === 1 ? "" : "s"}`}
      </span>
      <Button
        type="button"
        onClick={() => void handleAdd()}
        disabled={!selection.length || adding}
        className="min-w-40 flex-1 sm:flex-none"
      >
        {adding && <Loader2 className="h-4 w-4 animate-spin" />}
        {confirmLabel}
      </Button>
    </div>
  );

  const detailSheet = (
    <ExerciseDetailSheet
      exercise={detailExercise}
      open={!!detailExercise}
      onOpenChange={(next) => {
        if (!next) setDetailExercise(null);
      }}
      currentUserId={user?.id}
      overlayClassName="z-[65]"
      className="z-[70]"
    />
  );

  useEffect(() => {
    if (isDrawer || !open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawer, open, onOpenChange]);

  const renderDrawerTrigger = () => {
    const toggle = () => onOpenChange(!open);
    const rotationClass = cn(
      "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      open && "rotate-45 drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]",
    );

    if (trigger && isValidElement(trigger)) {
      type TriggerProps = {
        onClick?: (e: ReactMouseEvent) => void;
        className?: string;
        "aria-expanded"?: boolean;
      };
      const triggerEl = trigger as ReactElement<TriggerProps>;
      return cloneElement(triggerEl, {
        onClick: (e: ReactMouseEvent) => {
          triggerEl.props.onClick?.(e);
          toggle();
        },
        className: cn(triggerEl.props.className, rotationClass),
        "aria-expanded": open,
      });
    }

    return (
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Agregar ejercicio"
        className="touch-styled group flex flex-col items-center justify-center gap-1.5 focus:outline-none"
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-primary-solid text-primary-foreground shadow-md active:scale-[0.82] active:duration-100 active:ease-out",
            rotationClass,
          )}
        >
          <Plus className="h-5 w-5 stroke-[2px]" />
        </div>
        <span
          className={cn(
            "text-[10px] font-medium tracking-wide transition-colors duration-300",
            open ? "text-primary" : "text-muted-foreground",
          )}
        >
          Ejercicio
        </span>
      </button>
    );
  };

  if (isDrawer) {
    return (
      <>
        <div ref={containerRef} className="relative flex justify-center">
          {renderDrawerTrigger()}
        </div>
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
          <DrawerContent
            side="bottom"
            overlayClassName="z-[55]"
            className="z-[60] flex h-[min(92lvh,49rem)] max-h-[92lvh] flex-col overflow-hidden bg-card p-0"
          >
            <DrawerHeader className="shrink-0 bg-card px-4 pb-2 text-left sm:px-6">
              <div className="flex items-baseline justify-between gap-3">
                <DrawerTitle className="text-lg">Agregar ejercicio</DrawerTitle>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {resultCount}
                  {hasNextPage && !favoritesOnly ? "+" : ""} resultado
                  {resultCount === 1 ? "" : "s"}
                </span>
              </div>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-hidden bg-card">{panel}</div>
            {footer}
          </DrawerContent>
        </Drawer>
        {detailSheet}
      </>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          {trigger ?? (
            <Button variant="secondary" className="h-12 w-full">
              <Search className="mr-2 h-4 w-4" /> Agregar Ejercicio
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="flex w-[min(24rem,calc(100vw-2rem))] max-h-[80svh] flex-col overflow-hidden bg-card p-0"
          align="start"
        >
          <div className="flex items-baseline justify-between gap-3 px-4 pt-3 sm:px-6">
            <span className="text-sm font-semibold">Agregar ejercicio</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {resultCount}
              {hasNextPage && !favoritesOnly ? "+" : ""} resultado
              {resultCount === 1 ? "" : "s"}
            </span>
          </div>
          {panel}
          {footer}
        </PopoverContent>
      </Popover>
      {detailSheet}
    </>
  );
}
