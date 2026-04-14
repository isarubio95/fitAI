import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useExerciseCatalogInfinite, useCreateExercise, useDeleteExercise } from "@/hooks/useExerciseCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { Search, Dumbbell, User, Trash2, Loader2, ArrowUpDown, ArrowDownAZ, Check, Heart, PanelTopClose, CircleDot, Hand, Footprints, LayoutGrid, Wrench, Layers, SignalMedium, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import MuscleMultiSelect from "@/components/exercise/MuscleMultiSelect";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import { EXERCISE_SYNONYMS } from "@/constants/exerciseSynonyms";
import type { RegistroSeries } from "@/types/workout";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";

type DifficultyLevel = 1 | 2 | 3;

type ExerciseFilters = {
  q: string;
  tipos: string[];
  grupos: string[];
  equipments: string[];
  difs: DifficultyLevel[];
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
  return next;
}

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
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

function expandQueryTerms(q: string): string[] {
  const nq = normalizeText(q);
  if (!nq) return [];

  const out = new Set([nq]);
  // Añade sinónimos por presencia de frase clave
  for (const [kRaw, syns] of Object.entries(EXERCISE_SYNONYMS)) {
    const k = normalizeText(kRaw);
    if (!k) continue;
    if (nq.includes(k)) {
      for (const s of syns) out.add(normalizeText(s));
    }
  }

  // Añade tokens individuales (para que \"press banca\" funcione incluso si no hay frase exacta)
  for (const term of [...out]) {
    for (const token of term.split(" ")) out.add(token);
  }
  return [...out].filter(Boolean);
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
    <span className={cn("inline-flex items-center gap-1", color)}>
      <SignalMedium className="h-3.5 w-3.5" />
      <span className="inline-flex items-end gap-[3px]">
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
    </span>
  );
}

function DifficultyBarsMono({ level, active }: { level: 1 | 2 | 3; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        active ? "text-primary" : "text-foreground",
      )}
      aria-hidden
    >
      <SignalMedium className="h-3.5 w-3.5" />
      <span className="inline-flex items-end gap-[3px]">
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
    30,
  );
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBodyParts, setNewBodyParts] = useState<string[]>([]);
  const [newRegistroSeries, setNewRegistroSeries] = useState<RegistroSeries>("peso_reps");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [headerActionsSlot, setHeaderActionsSlot] = useState<HTMLElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [difficultyLoading, setDifficultyLoading] = useState(false);
  const difficultyLoadingTimerRef = useRef<number | null>(null);

  // Flatten: ejercicios de usuario (solo primera página) + páginas del catálogo
  const exercises = useMemo(() => {
    const pages = data?.pages ?? [];
    const usuario = pages[0]?.usuario ?? [];
    const catalogo = pages.flatMap((p) => p.catalogo ?? []);
    return [...usuario, ...catalogo];
  }, [data]);

  const tipoOptions = useMemo(
    () => uniqNonEmpty(exercises.map((x: any) => x.tipo)).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [exercises],
  );
  const grupoOptions = useMemo(
    () =>
      uniqNonEmpty(exercises.map((x: any) => x.grupo_muscular)).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [exercises],
  );
  const equipmentOptions = useMemo(
    () =>
      uniqNonEmpty(exercises.flatMap((x: any) => splitEquipmentUnits(x.equipment))).sort((a, b) =>
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
    const qTerms = expandQueryTerms(filters.q);
    const qTokens = q.split(" ").filter(Boolean);

    return sortedExercises.filter((ex: any) => {
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
        const synonymMatch = qTerms.some((t) => {
          const tk = normalizeSearchKey(t);
          return hayBase.includes(t) || (tk.length > 0 && hayCompact.includes(tk));
        });
        const ok = phraseMatch || tokensMatch || synonymMatch;
        if (!ok) return false;
      }

      return true;
    });
  }, [sortedExercises, filters]);

  const anyFilterActive =
    !!filters.q.trim() ||
    filters.tipos.length > 0 ||
    filters.grupos.length > 0 ||
    filters.equipments.length > 0 ||
    filters.difs.length > 0;

  // UX: al cambiar la búsqueda/orden, volvemos arriba
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters.q, sortOrder]);

  useEffect(() => {
    setHeaderActionsSlot(document.getElementById("header-actions-slot"));
  }, []);

  // Sincroniza input local cuando la query cambia por navegación/filtros externos.
  useEffect(() => {
    if (filters.q !== searchInput) {
      setSearchInput(filters.q);
    }
  }, [filters.q, searchInput]);

  // Evita glitches al teclear: actualiza URL con pequeño debounce.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = serializeFiltersToSearchParams(searchParams, {
        q: searchInput,
        tipos: filters.tipos,
        grupos: filters.grupos,
        equipments: filters.equipments,
        difs: filters.difs,
      });
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [searchInput, filters.tipos, filters.grupos, filters.equipments, filters.difs, searchParams, setSearchParams]);

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
    if (!target || !hasNextPage) return;

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, filteredExercises.length]);

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
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExercise.mutateAsync(deleteId);
      toast({ title: "Ejercicio eliminado" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <div className="w-full min-w-0 p-4 md:p-8 pt-6 space-y-6 max-w-2xl mx-auto">
      {headerActionsSlot &&
        !!exercises?.length &&
        createPortal(
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">{sortOrder === "asc" ? "A → Z" : "Z → A"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-popover">
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
          </DropdownMenu>,
          headerActionsSlot
        )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ejercicio..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-28 justify-center gap-2",
                  filters.tipos.length > 0 && "border-primary text-primary hover:bg-primary/5",
                )}
              >
                <Filter className="h-4 w-4" /> Tipo
                {filters.tipos.length > 0 && (
                  <Badge variant="outline" className="border-primary/40 bg-transparent text-primary">
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
                variant="outline"
                size="sm"
                className={cn(
                  "w-28 justify-center gap-2",
                  filters.grupos.length > 0 && "border-primary text-primary hover:bg-primary/5",
                )}
              >
                <Layers className="h-4 w-4" /> Grupo
                {filters.grupos.length > 0 && (
                  <Badge variant="outline" className="border-primary/40 bg-transparent text-primary">
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
                variant="outline"
                size="sm"
                className={cn(
                  "w-28 justify-center gap-2",
                  filters.equipments.length > 0 && "border-primary text-primary hover:bg-primary/5",
                )}
              >
                <Wrench className="h-4 w-4" /> Equipo
                {filters.equipments.length > 0 && (
                  <Badge variant="outline" className="border-primary/40 bg-transparent text-primary">
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

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "w-28 justify-center",
                filters.difs.includes(1) && "border-primary text-primary hover:bg-primary/5",
              )}
              onClick={() => {
                const difs = filters.difs.includes(1) ? filters.difs.filter((d) => d !== 1) : [...filters.difs, 1];
                triggerDifficultyLoading();
                setSearchParams(serializeFiltersToSearchParams(searchParams, { ...filters, difs }), { replace: true });
              }}
            >
              <DifficultyBarsMono level={1} active={filters.difs.includes(1)} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "w-28 justify-center",
                filters.difs.includes(2) && "border-primary text-primary hover:bg-primary/5",
              )}
              onClick={() => {
                const difs = filters.difs.includes(2) ? filters.difs.filter((d) => d !== 2) : [...filters.difs, 2];
                triggerDifficultyLoading();
                setSearchParams(serializeFiltersToSearchParams(searchParams, { ...filters, difs }), { replace: true });
              }}
            >
              <DifficultyBarsMono level={2} active={filters.difs.includes(2)} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "w-28 justify-center",
                filters.difs.includes(3) && "border-primary text-primary hover:bg-primary/5",
              )}
              onClick={() => {
                const difs = filters.difs.includes(3) ? filters.difs.filter((d) => d !== 3) : [...filters.difs, 3];
                triggerDifficultyLoading();
                setSearchParams(serializeFiltersToSearchParams(searchParams, { ...filters, difs }), { replace: true });
              }}
            >
              <DifficultyBarsMono level={3} active={filters.difs.includes(3)} />
            </Button>
          </div>

          {anyFilterActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const cleared: ExerciseFilters = { q: "", tipos: [], grupos: [], equipments: [], difs: [] };
                setSearchParams(serializeFiltersToSearchParams(searchParams, cleared), { replace: true });
              }}
            >
              <X className="h-4 w-4" /> Limpiar
            </Button>
          )}
        </div>

        {/* Chips de filtros activos */}
        {anyFilterActive && (
          <div className="flex flex-wrap gap-2">
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
                Dif: {d}
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
          </div>
        )}
      </div>

      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading || difficultyLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : filteredExercises.map((ex) => {
              const isOwn = (ex as any).usuario_id === user?.id;
              const IconComponent = getExerciseIcon(ex as { musculos_involucrados?: string[] | null });
              return (
                <Card
                  key={ex.id}
                  className={`transition-colors cursor-pointer ${
                    isOwn
                      ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedExercise(ex)}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isOwn ? "bg-primary/20" : "bg-primary/10"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{ex.nombre}</p>
                        {isOwn && <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {isOwn && (
                          <Badge variant="secondary" className="text-[11px]">
                            Personal
                          </Badge>
                        )}
                        {(ex as any).tipo && (
                          <Badge variant="outline" className="text-[11px]">
                            <Dumbbell className="mr-1 h-3 w-3" />
                            {(ex as any).tipo}
                          </Badge>
                        )}
                        {(ex as any).grupo_muscular && (
                          <Badge variant="outline" className="text-[11px]">
                            <Layers className="mr-1 h-3 w-3" />
                            {(ex as any).grupo_muscular}
                          </Badge>
                        )}
                        {difficultyToLevel((ex as any).dificultad) && (
                          <Badge variant="outline" className="text-[11px]">
                            <DifficultyBars level={difficultyToLevel((ex as any).dificultad)!} />
                          </Badge>
                        )}
                        {(ex as any).equipment && (
                          <Badge variant="outline" className="text-[11px]">
                            <Wrench className="mr-1 h-3 w-3" />
                            {(ex as any).equipment}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isOwn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(ex.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        {!isLoading && !difficultyLoading && !isError && filteredExercises.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground py-8">
            No hay ejercicios que coincidan. Prueba otra búsqueda o revisa en Supabase que existan filas en{" "}
            <code className="text-xs">tipo_ejercicio</code> y las políticas RLS permitan leerlas.
          </p>
        )}
      </div>

      {!isLoading && !difficultyLoading && hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-2">
          {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
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
      />
    </div>
  );
};

export default Exercises;
