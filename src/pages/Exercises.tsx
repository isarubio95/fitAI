import { useState, useEffect, useMemo, useRef } from "react";
import { useExerciseCatalogInfinite, useCreateExercise, useDeleteExercise, useFavoriteExercisesCatalog } from "@/hooks/useExerciseCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { filterButtonActive } from "@/lib/filter-pill-styles";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { resolveExerciseMediaUrl } from "@/lib/exerciseMediaUrl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Dumbbell, User, Trash2, Loader2, ArrowDownAZ, Check, ChevronDown, Heart, PanelTopClose, CircleDot, Hand, Footprints, LayoutGrid, Wrench, BicepsFlexed, Filter, X, Plus, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import MuscleMultiSelect from "@/components/exercise/MuscleMultiSelect";
import { type MainMuscleGroup } from "@/constants/muscleGroups";
import { EXERCISE_SYNONYMS } from "@/constants/exerciseSynonyms";
import type { RegistroSeries, TipoEjercicio } from "@/types/workout";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";
import {
  useExerciseFavorites,
  type ExerciseFavoriteSource,
} from "@/hooks/useExerciseFavorites";

type DifficultyLevel = 1 | 2 | 3;

const DIFFICULTY_OPTIONS: { level: DifficultyLevel; label: string }[] = [
  { level: 1, label: "Baja" },
  { level: 2, label: "Media" },
  { level: 3, label: "Alta" },
];

/** Fila unificada del catálogo sistema + ejercicios de usuario. */
type CatalogExercise = TipoEjercicio & {
  usuario_id?: string;
  __source?: "catalogo" | "usuario";
  body_part?: string | string[] | null;
  descripcion?: string | null;
};

type ExerciseFilters = {
  q: string;
  tipos: string[];
  grupos: string[];
  equipments: string[];
  difs: DifficultyLevel[];
  favoritesOnly: boolean;
};

function uniqNonEmpty(values: (string | null | undefined)[]) {
  return [...new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean))];
}

function parseCsvListParam(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseDifficultyListParam(v: string | null): DifficultyLevel[] {
  const xs = parseCsvListParam(v);
  const out: DifficultyLevel[] = [];
  for (const x of xs) {
    const n = Number.parseInt(x, 10);
    if (n === 1 || n === 2 || n === 3) out.push(n);
  }
  return [...new Set(out)];
}

function parseFiltersFromSearchParams(sp: URLSearchParams): ExerciseFilters {
  return {
    q: sp.get("q") ?? "",
    tipos: parseCsvListParam(sp.get("tipo")),
    grupos: parseCsvListParam(sp.get("grupo")),
    equipments: parseCsvListParam(sp.get("eq")),
    difs: parseDifficultyListParam(sp.get("dif")),
    favoritesOnly: sp.get("fav") === "1",
  };
}

function serializeFiltersToSearchParams(sp: URLSearchParams, f: ExerciseFilters): URLSearchParams {
  const next = new URLSearchParams(sp);
  const setOrDelete = (key: string, val: string) => {
    if (val) next.set(key, val);
    else next.delete(key);
  };

  setOrDelete("q", f.q);
  setOrDelete("tipo", uniqNonEmpty(f.tipos).join(","));
  setOrDelete("grupo", uniqNonEmpty(f.grupos).join(","));
  setOrDelete("eq", uniqNonEmpty(f.equipments).join(","));
  setOrDelete("dif", [...new Set(f.difs)].sort().join(","));
  setOrDelete("fav", f.favoritesOnly ? "1" : "");
  return next;
}

function exerciseFavoriteSource(ex: { __source?: string; usuario_id?: string | null }): ExerciseFavoriteSource {
  if (ex.__source === "usuario" || ex.__source === "catalogo") return ex.__source;
  return ex.usuario_id ? "usuario" : "catalogo";
}

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function toggleDifficulty(list: DifficultyLevel[], value: DifficultyLevel) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function difficultyLabel(level: DifficultyLevel) {
  return DIFFICULTY_OPTIONS.find((o) => o.level === level)?.label ?? String(level);
}

function splitEquipmentUnits(value: unknown): string[] {
  return String(value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeText(s: unknown) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeSearchKey(s: unknown) {
  return normalizeText(s).replace(/[^a-z0-9]/g, "");
}

/** Si la consulta contiene una clave de sinónimos, comprueba frases alternativas completas (no tokens sueltos). */
function synonymPhraseMatches(hayBase: string, hayCompact: string, qRaw: string): boolean {
  const nq = normalizeText(qRaw);
  if (!nq) return false;
  for (const [kRaw, syns] of Object.entries(EXERCISE_SYNONYMS)) {
    const k = normalizeText(kRaw);
    if (!k || !nq.includes(k)) continue;
    for (const s of syns) {
      const sn = normalizeText(s);
      if (!sn) continue;
      const sk = normalizeSearchKey(sn);
      if (hayBase.includes(sn) || (sk.length > 0 && hayCompact.includes(sk))) return true;
    }
  }
  return false;
}

/** Devuelve el grupo principal del primer músculo en body_part, o null */
function getMainGroupFromBodyPart(bodyPart: string[] | null | undefined): MainMuscleGroup | null {
  if (!bodyPart?.length) return null;
  for (const muscle of bodyPart) {
    const group = resolveMainMuscleGroup(muscle);
    if (group) return group;
  }
  return null;
}

const MUSCLE_GROUP_ICONS: Record<MainMuscleGroup, typeof Dumbbell> = {
  Pecho: Heart,
  Espalda: PanelTopClose,
  Hombro: CircleDot,
  Bíceps: Hand,
  Tríceps: Hand,
  Antebrazo: Hand,
  Cuádriceps: Footprints,
  Femoral: Footprints,
  Glúteo: Footprints,
  Pantorrilla: Footprints,
  Core: LayoutGrid,
};

function getExerciseIcon(ex: { musculos_involucrados?: string[] | null }) {
  const group = getMainGroupFromBodyPart(ex.musculos_involucrados as string[] | null);
  return group ? MUSCLE_GROUP_ICONS[group] : Dumbbell;
}

function difficultyToLevel(d: unknown): 1 | 2 | 3 | null {
  if (d == null) return null;
  if (typeof d === "number" && Number.isFinite(d)) {
    const n = Math.max(1, Math.min(3, Math.round(d)));
    return n as 1 | 2 | 3;
  }
  const s = String(d).trim().toLowerCase();
  const num = Number.parseInt(s, 10);
  if (Number.isFinite(num)) {
    const n = Math.max(1, Math.min(3, num));
    return n as 1 | 2 | 3;
  }
  if (s.includes("baja")) return 1;
  if (s.includes("media")) return 2;
  if (s.includes("alta")) return 3;
  return null;
}

function DifficultyBars({ level }: { level: 1 | 2 | 3 }) {
  const color =
    level === 1
      ? "text-emerald-600 dark:text-emerald-400"
      : level === 2
        ? "text-amber-600 dark:text-amber-400"
        : "text-orange-600 dark:text-orange-400";

  return (
    <span className={cn("inline-flex items-end gap-[3px]", color)} aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "inline-block w-[4px] rounded-sm",
            i === 1 ? "h-[6px]" : i === 2 ? "h-[9px]" : "h-[12px]",
            i <= level ? "bg-current" : "bg-current/25",
          )}
        />
      ))}
    </span>
  );
}

const Exercises = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState(filters.q);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseCatalogInfinite(
    {
      // Importante: la búsqueda por texto se hace solo client-side (normalizeText),
      // para que no distinga acentos: "bíceps" = "biceps".
      q: "",
      tipos: filters.tipos,
      grupos: filters.grupos,
      // El filtro por equipamiento se hace client-side para soportar unidades atómicas
      // cuando en BD viene una cadena combinada (p. ej. "Banco Inclinable, Polea").
      equipments: [],
    },
    15,
  );
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, favoriteKeys } = useExerciseFavorites();
  const favoritesCatalogQuery = useFavoriteExercisesCatalog(favoriteKeys, filters.favoritesOnly);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBodyParts, setNewBodyParts] = useState<string[]>([]);
  const [newRegistroSeries, setNewRegistroSeries] = useState<RegistroSeries>("peso_reps");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<CatalogExercise | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [difficultyLoading, setDifficultyLoading] = useState(false);
  const difficultyLoadingTimerRef = useRef<number | null>(null);

  // Flatten: ejercicios de usuario (solo primera página) + páginas del catálogo
  const exercises = useMemo((): CatalogExercise[] => {
    if (filters.favoritesOnly) {
      return (favoritesCatalogQuery.data ?? []) as CatalogExercise[];
    }
    const pages = data?.pages ?? [];
    const usuario = (pages[0]?.usuario ?? []) as CatalogExercise[];
    const catalogo = pages.flatMap((p) => (p.catalogo ?? []) as CatalogExercise[]);
    return [...usuario, ...catalogo];
  }, [data, favoritesCatalogQuery.data, filters.favoritesOnly]);

  const catalogLoading = filters.favoritesOnly
    ? favoriteKeys.size > 0 && favoritesCatalogQuery.isLoading
    : isLoading;

  const tipoOptions = useMemo(
    () => uniqNonEmpty(exercises.map((x) => x.tipo)).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [exercises],
  );
  const grupoOptions = useMemo(
    () =>
      uniqNonEmpty(exercises.map((x) => x.grupo_muscular)).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [exercises],
  );
  const equipmentOptions = useMemo(
    () =>
      uniqNonEmpty(exercises.flatMap((x) => splitEquipmentUnits(x.equipment))).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [exercises],
  );

  const sortedExercises = useMemo(() => {
    if (!exercises?.length) return [];
    const list = [...exercises];
    list.sort((a, b) => {
      const cmp = a.nombre.localeCompare(b.nombre, undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [exercises, sortOrder]);

  const filteredExercises = useMemo(() => {
    const q = normalizeText(filters.q);
    const qCompact = normalizeSearchKey(filters.q);
    const qTokens = q.split(" ").filter(Boolean);

    return sortedExercises.filter((ex) => {
      if (filters.favoritesOnly) {
        const source = exerciseFavoriteSource(ex);
        if (!isFavorite(source, ex.id)) return false;
      }

      // Multi-select exact match filters
      if (filters.tipos.length && !filters.tipos.includes(String(ex.tipo ?? "").trim())) return false;
      if (filters.grupos.length && !filters.grupos.includes(String(ex.grupo_muscular ?? "").trim())) return false;
      if (filters.equipments.length) {
        const units = splitEquipmentUnits(ex.equipment);
        const hasAnySelectedEquipment = filters.equipments.some((eq) => units.includes(eq));
        if (!hasAnySelectedEquipment) return false;
      }

      if (filters.difs.length) {
        const lvl = difficultyToLevel(ex.dificultad);
        if (!lvl || !filters.difs.includes(lvl)) return false;
      }

      if (qTokens.length) {
        const hayBase = [
          normalizeText(ex.nombre),
          normalizeText(ex.equipment),
          normalizeText(ex.tipo),
          normalizeText(ex.grupo_muscular),
          normalizeText((ex as { body_part?: string[] | null }).body_part?.join(" ")),
          normalizeText((ex as { musculos_involucrados?: string[] | null }).musculos_involucrados?.join(" ")),
        ].join(" | ");

        const hayCompact = normalizeSearchKey(hayBase);
        const phraseMatch = hayBase.includes(q) || (qCompact.length > 0 && hayCompact.includes(qCompact));
        const tokensMatch = qTokens.every((t) => {
          const tk = normalizeSearchKey(t);
          return hayBase.includes(t) || (tk.length > 0 && hayCompact.includes(tk));
        });
        const synonymOk = synonymPhraseMatches(hayBase, hayCompact, filters.q);
        const ok = phraseMatch || tokensMatch || synonymOk;
        if (!ok) return false;
      }

      return true;
    });
  }, [sortedExercises, filters, isFavorite]);

  const anyFilterActive =
    !!filters.q.trim() ||
    filters.tipos.length > 0 ||
    filters.grupos.length > 0 ||
    filters.equipments.length > 0 ||
    filters.difs.length > 0 ||
    filters.favoritesOnly;

  // UX: al cambiar la búsqueda/orden, volvemos arriba
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters.q, sortOrder]);

  // Sincroniza el input solo cuando `q` en la URL cambia (atrás/adelante, enlaces, etc.).
  // No incluir `searchInput` en las dependencias: mientras tecleas, la URL va con debounce
  // y `filters.q` sigue desactualizado; resetear aquí borraba el texto al instante.
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  // Evita glitches al teclear: actualiza URL con pequeño debounce.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = serializeFiltersToSearchParams(searchParams, {
        q: searchInput,
        tipos: filters.tipos,
        grupos: filters.grupos,
        equipments: filters.equipments,
        difs: filters.difs,
        favoritesOnly: filters.favoritesOnly,
      });
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [
    searchInput,
    filters.tipos,
    filters.grupos,
    filters.equipments,
    filters.difs,
    filters.favoritesOnly,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (location.state?.action === "new") {
      setCreateOpen(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (difficultyLoadingTimerRef.current != null) {
        window.clearTimeout(difficultyLoadingTimerRef.current);
      }
    };
  }, []);

  const triggerDifficultyLoading = () => {
    setDifficultyLoading(true);
    if (difficultyLoadingTimerRef.current != null) {
      window.clearTimeout(difficultyLoadingTimerRef.current);
    }
    difficultyLoadingTimerRef.current = window.setTimeout(() => {
      setDifficultyLoading(false);
      difficultyLoadingTimerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || filters.favoritesOnly) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, filteredExercises.length, filters.favoritesOnly]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      await createExercise.mutateAsync({
        nombre: newName,
        descripcion: newDesc,
        usuario_id: user.id,
        musculos_involucrados: newBodyParts,
        registro_series: newRegistroSeries,
      });
      toast({ title: "Ejercicio creado" });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewBodyParts([]);
      setNewRegistroSeries("peso_reps");
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExercise.mutateAsync(deleteId);
      toast({ title: "Ejercicio eliminado" });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Error desconocido",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-2xl flex-col overflow-x-clip bg-background px-0 pb-6 mx-auto md:px-8 md:pt-6",
        PAGE_CARD_STACK_GAP,
        "max-md:-mb-24 max-md:pb-[calc(var(--app-bottom-nav-inset,5.5rem)+3.5rem)] md:pb-20",
      )}
    >
      {user ? (
        <Button
          type="button"
          variant="new"
          onClick={() => setCreateOpen(true)}
          title="Crear ejercicio"
          aria-label="Nuevo ejercicio"
          className="fixed z-40 right-4 bottom-[calc(var(--app-bottom-nav-inset,5.5rem)+0.5rem)] shadow-lg md:right-8 md:bottom-10"
        >
          <span className="whitespace-nowrap">Crear</span>
          <Plus className="shrink-0" />
        </Button>
      ) : null}

      <div
        className={cn(
          // Solapa 2px bajo el header fijo para evitar el hueco subpíxel por el que asoma la lista.
          "sticky z-30 w-full bg-background",
          "top-[calc(var(--app-header-height,5rem)-2px)] pt-0.5 md:top-0 md:pt-0",
        )}
      >
        <Card className="w-full max-w-none overflow-hidden rounded-none border-0 bg-background shadow-none">
          <CardContent className="space-y-4 px-4 py-4 md:px-6 md:py-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ejercicio..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

          {/* Filtros: una sola fila con scroll horizontal (sin padding derecho para
              que el último visible se recorte y se note que hay más). */}
          <div className="flex flex-col gap-3 md:gap-2">
            <div className="-mr-4 min-w-0 md:-mr-6">
              <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] scrollbar-none [&::-webkit-scrollbar]:hidden">
                {user && (
                  <Button
                    type="button"
                    variant="filter"
                    size="sm"
                    className={cn(
                      "shrink-0 justify-center gap-2",
                      filters.favoritesOnly && filterButtonActive,
                    )}
                    onClick={() => {
                      const nextFilters: ExerciseFilters = {
                        ...filters,
                        favoritesOnly: !filters.favoritesOnly,
                      };
                      setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), {
                        replace: true,
                      });
                    }}
                  >
                    <Bookmark className={cn("h-4 w-4", filters.favoritesOnly && "fill-current")} />{" "}
                    Favoritos
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="filter"
                      size="sm"
                      className={cn(
                        "shrink-0 justify-center gap-2",
                        filters.tipos.length > 0 && filterButtonActive,
                      )}
                    >
                      <Filter className="h-4 w-4" /> Tipo
                      {filters.tipos.length > 0 && (
                        <Badge variant="outline" className="border-primary/25 bg-transparent text-primary">
                          {filters.tipos.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar tipo..." />
                      <CommandList className="max-h-[260px]">
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup heading="Tipo">
                          {tipoOptions.map((t) => (
                            <CommandItem
                              key={t}
                              value={t}
                              onSelect={() => {
                                const nextFilters: ExerciseFilters = { ...filters, tipos: toggleInList(filters.tipos, t) };
                                setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", filters.tipos.includes(t) ? "opacity-100" : "opacity-0")} />
                              {t}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="filter"
                      size="sm"
                      className={cn(
                        "shrink-0 justify-center gap-2",
                        filters.grupos.length > 0 && filterButtonActive,
                      )}
                    >
                      <BicepsFlexed className="h-4 w-4" /> Grupo
                      {filters.grupos.length > 0 && (
                        <Badge variant="outline" className="border-primary/25 bg-transparent text-primary">
                          {filters.grupos.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar grupo..." />
                      <CommandList className="max-h-[260px]">
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup heading="Grupo muscular">
                          {grupoOptions.map((g) => (
                            <CommandItem
                              key={g}
                              value={g}
                              onSelect={() => {
                                const nextFilters: ExerciseFilters = { ...filters, grupos: toggleInList(filters.grupos, g) };
                                setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", filters.grupos.includes(g) ? "opacity-100" : "opacity-0")} />
                              {g}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="filter"
                      size="sm"
                      className={cn(
                        "shrink-0 justify-center gap-2",
                        filters.equipments.length > 0 && filterButtonActive,
                      )}
                    >
                      <Wrench className="h-4 w-4" /> Equipo
                      {filters.equipments.length > 0 && (
                        <Badge variant="outline" className="border-primary/25 bg-transparent text-primary">
                          {filters.equipments.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar equipamiento..." />
                      <CommandList className="max-h-[260px]">
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup heading="Equipamiento">
                          {equipmentOptions.map((eq) => (
                            <CommandItem
                              key={eq}
                              value={eq}
                              onSelect={() => {
                                const nextFilters: ExerciseFilters = {
                                  ...filters,
                                  equipments: toggleInList(filters.equipments, eq),
                                };
                                setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.equipments.includes(eq) ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {eq}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="filter"
                      size="sm"
                      className={cn(
                        "shrink-0 justify-center gap-2",
                        filters.difs.length > 0 && filterButtonActive,
                      )}
                    >
                      Dificultad
                      {filters.difs.length > 0 && (
                        <Badge variant="outline" className="border-primary/25 bg-transparent text-primary">
                          {filters.difs.length}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup heading="Dificultad">
                          {DIFFICULTY_OPTIONS.map(({ level, label }) => (
                            <CommandItem
                              key={level}
                              value={label}
                              onSelect={() => {
                                const difs = toggleDifficulty(filters.difs, level);
                                triggerDifficultyLoading();
                                setSearchParams(
                                  serializeFiltersToSearchParams(searchParams, { ...filters, difs }),
                                  { replace: true },
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.difs.includes(level) ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <span className="flex flex-1 items-center justify-between gap-3">
                                {label}
                                <DifficultyBars level={level} />
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="filter"
                      size="sm"
                      className={cn(
                        "shrink-0 justify-center gap-2",
                        sortOrder === "desc" && filterButtonActive,
                      )}
                      title={sortOrder === "asc" ? "Orden: A → Z" : "Orden: Z → A"}
                      aria-label={`Ordenar ejercicios por nombre, ${sortOrder === "asc" ? "A a Z" : "Z a A"}`}
                    >
                      <ArrowDownAZ className="h-4 w-4" />
                      Orden
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 bg-popover">
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                      <ArrowDownAZ className="h-3.5 w-3.5" /> Ordenar por nombre
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                      A → Z {sortOrder === "asc" && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                      Z → A {sortOrder === "desc" && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {anyFilterActive && (
              <div className="flex flex-wrap items-center gap-2">
                {filters.tipos.map((t) => (
                  <Badge key={`tipo:${t}`} variant="secondary" className="gap-1">
                    Tipo: {t}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => {
                        const nextFilters: ExerciseFilters = { ...filters, tipos: filters.tipos.filter((x) => x !== t) };
                        setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                      }}
                    />
                  </Badge>
                ))}
                {filters.grupos.map((g) => (
                  <Badge key={`grupo:${g}`} variant="secondary" className="gap-1">
                    Grupo: {g}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => {
                        const nextFilters: ExerciseFilters = { ...filters, grupos: filters.grupos.filter((x) => x !== g) };
                        setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                      }}
                    />
                  </Badge>
                ))}
                {filters.equipments.map((eq) => (
                  <Badge key={`eq:${eq}`} variant="secondary" className="gap-1">
                    Eq: {eq}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => {
                        const nextFilters: ExerciseFilters = {
                          ...filters,
                          equipments: filters.equipments.filter((x) => x !== eq),
                        };
                        setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                      }}
                    />
                  </Badge>
                ))}
                {filters.difs.map((d) => (
                  <Badge key={`dif:${d}`} variant="secondary" className="gap-1">
                    Dif: {difficultyLabel(d)}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => {
                        const nextFilters: ExerciseFilters = { ...filters, difs: filters.difs.filter((x) => x !== d) };
                        triggerDifficultyLoading();
                        setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), { replace: true });
                      }}
                    />
                  </Badge>
                ))}
                {filters.favoritesOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Favoritos
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => {
                        const nextFilters: ExerciseFilters = { ...filters, favoritesOnly: false };
                        setSearchParams(serializeFiltersToSearchParams(searchParams, nextFilters), {
                          replace: true,
                        });
                      }}
                    />
                  </Badge>
                )}
                <button
                  type="button"
                  className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const cleared: ExerciseFilters = {
                      q: "",
                      tipos: [],
                      grupos: [],
                      equipments: [],
                      difs: [],
                      favoritesOnly: false,
                    };
                    setSearchParams(serializeFiltersToSearchParams(searchParams, cleared), { replace: true });
                  }}
                >
                  <X className="h-3 w-3" />
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {isError && (
        <Card className="w-full max-w-none overflow-hidden rounded-none border-0 border-destructive/50 bg-destructive/5 shadow-none md:rounded-3xl md:border md:border-x">
          <CardContent className="p-4 text-sm space-y-2">
            <p className="font-medium text-destructive">Error al cargar el catálogo</p>
            <p className="text-muted-foreground">
              {(error as Error)?.message ??
                "Revisa la consola del navegador (F12) y la respuesta de Supabase."}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex w-full flex-col gap-3 bg-background px-4 pt-1 md:gap-2.75 md:px-0">
        {catalogLoading || difficultyLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full overflow-hidden rounded-xl border border-border/40 bg-card"
              >
                <Skeleton className="h-21 w-20 shrink-0 rounded-none" />
                <div className="min-w-0 flex-1 space-y-2 p-3">
                  <Skeleton className="h-10 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          : filteredExercises.map((ex) => {
              const isOwn = ex.usuario_id === user?.id;
              const IconComponent = getExerciseIcon(ex as { musculos_involucrados?: string[] | null });
              const mediaUrl = resolveExerciseMediaUrl(ex.gif_url || ex.imagen);
              const level = difficultyToLevel(ex.dificultad);
              const favSource = exerciseFavoriteSource(ex);
              const favored = user ? isFavorite(favSource, ex.id) : false;
              return (
                <Card
                  key={`${favSource}:${ex.id}`}
                  className={cn(
                    "w-full max-w-none cursor-pointer overflow-hidden rounded-xl border bg-card shadow-none transition-colors hover:border-primary/50",
                    isOwn ? "border-primary/30" : "border-border/40",
                  )}
                  onClick={() => setSelectedExercise(ex)}
                >
                  <CardContent className="flex min-h-[5.25rem] items-stretch p-0">
                    <div className="relative w-20 shrink-0 self-stretch overflow-hidden bg-white">
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={ex.nombre}
                          className="absolute inset-0 h-full w-full object-contain"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full min-h-[5.25rem] w-full items-center justify-center">
                          <IconComponent className="h-7 w-7 text-muted-foreground/60" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-3 p-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start gap-1.5">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug">{ex.nombre}</p>
                          {isOwn && <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        </div>
                        <div className="flex min-h-4 min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          {ex.equipment && (
                            <span className="truncate capitalize">{ex.equipment}</span>
                          )}
                          {ex.equipment && level && (
                            <span className="shrink-0 text-muted-foreground/50" aria-hidden>
                              ·
                            </span>
                          )}
                          {level && (
                            <span className="shrink-0" title={difficultyLabel(level)}>
                              <DifficultyBars level={level} />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-0.5">
                        {isOwn && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive"
                            aria-label={`Eliminar ${ex.nombre}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(ex.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {user && (
                          <button
                            type="button"
                            className={cn(
                              "touch-styled inline-flex h-9 w-9 items-center justify-center",
                              favored ? "text-primary" : "text-muted-foreground",
                            )}
                            aria-label={favored ? `Quitar ${ex.nombre} de favoritos` : `Guardar ${ex.nombre} en favoritos`}
                            aria-pressed={favored}
                            onClick={async (e) => {
                              e.stopPropagation();
                              (e.currentTarget as HTMLButtonElement).blur();
                              try {
                                await toggleFavorite({ source: favSource, id: ex.id });
                              } catch (err: unknown) {
                                toast({
                                  title: "No se pudo actualizar favoritos",
                                  description: err instanceof Error ? err.message : "Error desconocido",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Bookmark
                              className={cn("h-5 w-5", favored && "fill-current")}
                              strokeWidth={2}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        {!catalogLoading &&
          !difficultyLoading &&
          !isError &&
          filteredExercises.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay ejercicios que coincidan. Prueba otra búsqueda o cambia los filtros.
          </p>
        )}
      </div>

      {!catalogLoading && !difficultyLoading && !filters.favoritesOnly && hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-2">
          {isFetchingNextPage && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                placeholder="Ej: Curl Martillo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción opcional..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Músculos Trabajados</Label>
              <MuscleMultiSelect value={newBodyParts} onChange={setNewBodyParts} />
            </div>
            <div className="space-y-1.5">
              <Label>Registro de series</Label>
              <Select
                value={newRegistroSeries}
                onValueChange={(v) => setNewRegistroSeries(v as RegistroSeries)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peso_reps">Peso y repeticiones</SelectItem>
                  <SelectItem value="duracion">Duración (segundos)</SelectItem>
                  <SelectItem value="duracion_ritmo">Duración y ritmo (s/km)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createExercise.isPending}>
              {createExercise.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ejercicio?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exercise Detail Sheet */}
      <ExerciseDetailSheet
        exercise={selectedExercise}
        open={!!selectedExercise}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
        currentUserId={user?.id}
        favoriteSource={selectedExercise ? exerciseFavoriteSource(selectedExercise) : undefined}
      />
    </div>
  );
};

export default Exercises;
