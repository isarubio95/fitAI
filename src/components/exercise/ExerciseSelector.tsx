import { useEffect, useLayoutEffect, useMemo, useRef, useState, cloneElement, isValidElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRegistroSeries } from "@/types/workout";
import { useExerciseCatalogInfinite } from "@/hooks/useExerciseCatalog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";
import { filterChipActive, filterChipInactive } from "@/lib/filter-pill-styles";

const MUSCLE_GROUP_OPTIONS = Object.keys(MUSCLE_GROUPS) as MainMuscleGroup[];

const FLOATING_MENU_WIDTH = "w-full max-w-[min(92vw,22.5rem)]";
const WORKOUT_DRAWER_SURFACE = "[data-workout-drawer-surface]";

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (
    catalogRef: { tipo_ejercicio_id?: string; usuario_ejercicio_id?: string },
    nombre: string,
  ) => void;
  /** Permite reemplazar el botón por defecto (p. ej. para la barra flotante del entreno activo). */
  trigger?: ReactNode;
  /** `floating`: menú estilo navbar (+ con giro, blur y animación). `popover`: comportamiento clásico. */
  variant?: "popover" | "floating";
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
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <Label className="text-xs text-muted-foreground">Solo mis ejercicios</Label>
        <Switch checked={onlyMine} onCheckedChange={onOnlyMineChange} />
      </div>
      <Command>
        <CommandInput placeholder="Buscar ejercicio..." value={search} onValueChange={onSearchChange} />
        <div className="border-b border-border px-2 py-2">
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] pb-0.5">
            {MUSCLE_GROUP_OPTIONS.map((grupo) => {
              const active = selectedGrupos.includes(grupo);
              return (
                <button
                  key={grupo}
                  type="button"
                  onClick={() => onToggleGrupo(grupo)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                    active ? filterChipActive : filterChipInactive,
                  )}
                >
                  {grupo}
                </button>
              );
            })}
          </div>
        </div>
        <div
          className="max-h-[min(58svh,28rem)] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
          onScroll={(e) => {
            const el = e.currentTarget;
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
            if (nearBottom && hasNextPage && !isFetchingNextPage) {
              onFetchNextPage();
            }
          }}
        >
          <CommandList className="max-h-none overflow-visible">
            <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
            <CommandGroup>
              {isLoading && (
                <CommandItem value="_loading" disabled>
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
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <span>{tipo.nombre}</span>
                    {isOwn && <User className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </CommandItem>
                );
              })}
              {!isLoading && isFetchingNextPage && (
                <CommandItem value="_loading_more" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando más...
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </div>
      </Command>
    </>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuHost, setMenuHost] = useState<Element | null>(null);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseCatalogInfinite({ q: search, grupos: selectedGrupos }, 30);

  useEffect(() => {
    if (!open) setSelectedGrupos([]);
  }, [open]);

  useBackCloseLayer({ open, onOpenChange, kind: "popover" });

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
    />
  );

  useLayoutEffect(() => {
    if (variant !== "floating") {
      setMenuHost(null);
      return;
    }
    setMenuHost(document.querySelector(WORKOUT_DRAWER_SURFACE));
  }, [variant, open]);

  useEffect(() => {
    if (variant !== "popover" || !open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant, open, onOpenChange]);

  const renderFloatingTrigger = () => {
    const toggle = () => onOpenChange(!open);
    const rotationClass = cn(
      "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      open && "rotate-45 drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]",
    );

    if (trigger && isValidElement(trigger)) {
      return cloneElement(trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; className?: string }>, {
        onClick: (e: React.MouseEvent) => {
          (trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props.onClick?.(e);
          toggle();
        },
        className: cn(
          (trigger as React.ReactElement<{ className?: string }>).props.className,
          rotationClass,
        ),
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

  if (variant === "floating") {
    const surface =
      menuHost;

    const floatingMenu = (
      <div
        className={cn(
          "absolute inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-55 flex justify-center px-3",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "flex origin-bottom flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300 ease-in-out",
            FLOATING_MENU_WIDTH,
            open ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          {panel}
        </div>
      </div>
    );

    return (
      <>
        <div ref={containerRef} className="relative flex justify-center">
          {renderFloatingTrigger()}
        </div>
        {surface ? createPortal(floatingMenu, surface) : null}
      </>
    );
  }

  return (
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
  );
}
