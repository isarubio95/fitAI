import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRegistroSeries } from "@/types/workout";
import { useExerciseCatalogInfinite } from "@/hooks/useExerciseCatalog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info, Loader2, Plus, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
import { MUSCLE_GROUPS, MUSCLE_GROUP_ICON_SRC, type MainMuscleGroup } from "@/constants/muscleGroups";
import { filterChipActive, filterChipInactive } from "@/lib/filter-pill-styles";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";

const MUSCLE_GROUP_OPTIONS = Object.keys(MUSCLE_GROUPS) as MainMuscleGroup[];

/** Valor inexistente para que cmdk no resalte ningún ejercicio al abrir. */
const NO_HIGHLIGHT = "__none__";

/** Máscara tipo dial solo en la parte inferior (suave). */
const DIAL_MASK: CSSProperties = {
  maskImage: "linear-gradient(to bottom, black 0%, black 82%, rgba(0,0,0,0.45) 94%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 82%, rgba(0,0,0,0.45) 94%, transparent 100%)",
};

function applyDialDepth(scrollEl: HTMLElement) {
  const rootRect = scrollEl.getBoundingClientRect();
  const fadeStart = rootRect.top + rootRect.height * 0.62;
  const fadeEnd = rootRect.bottom;
  const fadeSpan = Math.max(fadeEnd - fadeStart, 1);
  scrollEl.querySelectorAll<HTMLElement>("[data-dial-item]").forEach((node) => {
    const r = node.getBoundingClientRect();
    const itemMid = r.top + r.height / 2;
    if (itemMid <= fadeStart) {
      node.style.opacity = "1";
      node.style.transform = "scale(1)";
      return;
    }
    const t = Math.min(1, (itemMid - fadeStart) / fadeSpan);
    const eased = t * t;
    node.style.opacity = String(1 - eased * 0.62);
    node.style.transform = `scale(${1 - eased * 0.1})`;
  });
}

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (
    catalogRef: { tipo_ejercicio_id?: string; usuario_ejercicio_id?: string },
    nombre: string,
  ) => void;
  /** Permite reemplazar el botón por defecto (p. ej. para la barra flotante del entreno activo). */
  trigger?: ReactNode;
  /**
   * `drawer`: sheet inferior (entreno activo).
   * `floating`: alias de `drawer` (compat).
   * `popover`: comportamiento clásico (rutinas).
   */
  variant?: "popover" | "drawer" | "floating";
}

type CatalogItem = {
  id: string;
  nombre: string;
  usuario_id?: string | null;
  registro_series?: string | null;
  __source?: string;
};

function toggleMuscleGroup(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ExerciseSelectorPanel({
  search,
  onSearchChange,
  selectedGrupos,
  onToggleGrupo,
  onlyMine,
  onOnlyMineChange,
  isLoading,
  filtered,
  userId,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onSelect,
  onViewDetail,
  highlightedValue,
  onHighlightedValueChange,
  fillHeight = false,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  selectedGrupos: string[];
  onToggleGrupo: (grupo: string) => void;
  onlyMine: boolean;
  onOnlyMineChange: (value: boolean) => void;
  isLoading: boolean;
  filtered: CatalogItem[];
  userId?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onSelect: ExerciseSelectorProps["onSelect"];
  onViewDetail: (exercise: CatalogItem) => void;
  highlightedValue: string;
  onHighlightedValueChange: (value: string) => void;
  /** En drawer: la lista crece y scrollea dentro del alto disponible. */
  fillHeight?: boolean;
}) {
  const listScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!fillHeight) return;
    const el = listScrollRef.current;
    if (!el) return;
    applyDialDepth(el);
  }, [fillHeight, filtered, isLoading, isFetchingNextPage]);

  return (
    <div className={cn("flex min-h-0 flex-col", fillHeight && "h-full")}>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-2">
        <Label className="mb-0 text-xs text-muted-foreground">Solo mis ejercicios</Label>
        <Switch checked={onlyMine} onCheckedChange={onOnlyMineChange} />
      </div>
      <Command
        value={highlightedValue}
        onValueChange={onHighlightedValueChange}
        className={cn(
          "rounded-none bg-transparent **:[[cmdk-input-wrapper]]:px-6",
          fillHeight && "min-h-0 flex-1",
        )}
      >
        <CommandInput placeholder="Buscar ejercicio..." value={search} onValueChange={onSearchChange} />
        <div className="shrink-0 border-b border-border px-4 py-2">
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] pb-0.5">
            {MUSCLE_GROUP_OPTIONS.map((grupo) => {
              const active = selectedGrupos.includes(grupo);
              return (
                <button
                  key={grupo}
                  type="button"
                  onClick={() => onToggleGrupo(grupo)}
                  className={cn(
                    "inline-flex shrink-0 flex-col items-center gap-2 rounded-xl px-2 py-1.5 text-[10px] font-medium leading-tight transition-all whitespace-nowrap",
                    active ? filterChipActive : filterChipInactive,
                  )}
                >
                  <img
                    src={MUSCLE_GROUP_ICON_SRC[grupo]}
                    alt=""
                    className="h-11 w-11 shrink-0"
                    draggable={false}
                  />
                  {grupo}
                </button>
              );
            })}
          </div>
        </div>
        <div className={cn("relative min-h-0", fillHeight ? "flex flex-1 flex-col" : undefined)}>
          {fillHeight ? (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12",
                "bg-linear-to-t from-card/55 via-card/20 to-transparent",
              )}
              aria-hidden
            />
          ) : null}
          <div
            ref={listScrollRef}
            className={cn(
              "overflow-y-auto overscroll-contain touch-pan-y pt-2 [-webkit-overflow-scrolling:touch]",
              fillHeight
                ? "min-h-0 flex-1 scrollbar-none"
                : "max-h-[min(66svh,34rem)]",
            )}
            style={fillHeight ? DIAL_MASK : undefined}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (fillHeight) applyDialDepth(el);
              const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
              if (nearBottom && hasNextPage && !isFetchingNextPage) {
                onFetchNextPage();
              }
            }}
          >
            <CommandList className="max-h-none overflow-visible">
              <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
              <CommandGroup className="p-0 **:[[cmdk-group-items]]:flex **:[[cmdk-group-items]]:flex-col **:[[cmdk-group-items]]:gap-0.5">
                {/* Ancla invisible: evita que cmdk resalte el primer ejercicio al abrir. */}
                <CommandItem value={NO_HIGHLIGHT} className="hidden" aria-hidden />
                {isLoading && (
                  <CommandItem value="_loading" disabled className="px-6">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando ejercicios...
                  </CommandItem>
                )}
                {filtered?.map((tipo) => {
                  const isOwn = tipo.usuario_id === userId;
                  const source = tipo.__source as "usuario" | "catalogo" | undefined;
                  const rs = normalizeRegistroSeries(tipo.registro_series);
                  const catalogRef =
                    source === "usuario"
                      ? { usuario_ejercicio_id: tipo.id, registro_series: rs }
                      : { tipo_ejercicio_id: tipo.id, registro_series: rs };
                  return (
                    <CommandItem
                      key={tipo.id}
                      value={tipo.nombre}
                      onSelect={() => onSelect(catalogRef, tipo.nombre)}
                      data-dial-item={fillHeight ? tipo.id : undefined}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 px-6",
                        fillHeight && "origin-center will-change-[opacity,transform]",
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate">{tipo.nombre}</span>
                        {isOwn && <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            title="Ver ficha del ejercicio"
                            aria-label={`Ver ficha de ${tipo.nombre}`}
                            className="touch-styled inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onViewDetail(tipo);
                            }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="z-[80]">
                          Ver ficha
                        </TooltipContent>
                      </Tooltip>
                    </CommandItem>
                  );
                })}
                {!isLoading && isFetchingNextPage && (
                  <CommandItem value="_loading_more" disabled className="px-6">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando más...
                  </CommandItem>
                )}
                {fillHeight ? <div className="h-10 shrink-0" aria-hidden /> : null}
              </CommandGroup>
            </CommandList>
          </div>
        </div>
      </Command>
    </div>
  );
}

export function ExerciseSelector({
  open,
  onOpenChange,
  onSelect,
  trigger,
  variant = "popover",
}: ExerciseSelectorProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedGrupos, setSelectedGrupos] = useState<string[]>([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState(NO_HIGHLIGHT);
  const [detailExercise, setDetailExercise] = useState<CatalogItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawer = variant === "drawer" || variant === "floating";
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseCatalogInfinite({ q: search, grupos: selectedGrupos }, 30);

  useEffect(() => {
    if (!open) {
      setSelectedGrupos([]);
      setDetailExercise(null);
      return;
    }
    setHighlightedValue(NO_HIGHLIGHT);
  }, [open]);

  // El Drawer ya registra su propia capa de back; el popover sí necesita la suya.
  useBackCloseLayer({ open: !isDrawer && open, onOpenChange, kind: "popover" });

  const catalog = useMemo(() => {
    const pages = data?.pages ?? [];
    const usuario = pages[0]?.usuario ?? [];
    const catalogo = pages.flatMap((p) => p.catalogo ?? []);
    return [...usuario, ...catalogo];
  }, [data]);

  const filtered = useMemo(
    () => catalog.filter((tipo) => !onlyMine || (tipo as { usuario_id?: string }).usuario_id === user?.id),
    [catalog, onlyMine, user?.id],
  );

  const handleSelect: ExerciseSelectorProps["onSelect"] = (catalogRef, nombre) => {
    onSelect(catalogRef, nombre);
    onOpenChange(false);
    setSearch("");
  };

  const panel = (
    <TooltipProvider delayDuration={300}>
      <ExerciseSelectorPanel
        search={search}
        onSearchChange={setSearch}
        selectedGrupos={selectedGrupos}
        onToggleGrupo={(grupo) => setSelectedGrupos((prev) => toggleMuscleGroup(prev, grupo))}
        onlyMine={onlyMine}
        onOnlyMineChange={setOnlyMine}
        isLoading={isLoading}
        filtered={filtered as CatalogItem[]}
        userId={user?.id}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onFetchNextPage={() => void fetchNextPage()}
        onSelect={handleSelect}
        onViewDetail={setDetailExercise}
        highlightedValue={highlightedValue}
        onHighlightedValueChange={setHighlightedValue}
        fillHeight={isDrawer}
      />
    </TooltipProvider>
  );

  const detailSheet = (
    <ExerciseDetailSheet
      exercise={detailExercise as any}
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
            "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md active:scale-[0.82] active:duration-100 active:ease-out",
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
            className="z-[60] flex h-[min(90lvh,46rem)] max-h-[90lvh] flex-col overflow-hidden rounded-t-[20px] bg-card p-0"
          >
            <DrawerHeader className="shrink-0 border-b border-border bg-card px-6 text-left">
              <DrawerTitle className="text-lg">Agregar ejercicio</DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-hidden bg-card">{panel}</div>
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
        <PopoverContent className="max-h-[75svh] w-[320px] overflow-hidden p-0" align="start">
          {panel}
        </PopoverContent>
      </Popover>
      {detailSheet}
    </>
  );
}
