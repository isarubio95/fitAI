import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useExerciseCatalogInfinite, useCreateExercise, useDeleteExercise } from "@/hooks/useExerciseCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Search, Dumbbell, User, Trash2, Loader2, ArrowUpDown, ArrowDownAZ, Check, Heart, PanelTopClose, CircleDot, Hand, Footprints, LayoutGrid, Wrench, Layers, SignalMedium } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import MuscleMultiSelect from "@/components/exercise/MuscleMultiSelect";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";

/** Devuelve el grupo principal del primer músculo en body_part, o null */
function getMainGroupFromBodyPart(bodyPart: string[] | null | undefined): MainMuscleGroup | null {
  if (!bodyPart?.length) return null;
  for (const muscle of bodyPart) {
    for (const [group, muscles] of Object.entries(MUSCLE_GROUPS) as [MainMuscleGroup, readonly string[]][]) {
      if (muscles.includes(muscle)) return group;
    }
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

const Exercises = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useExerciseCatalogInfinite(search, 30);
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBodyParts, setNewBodyParts] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [headerActionsSlot, setHeaderActionsSlot] = useState<HTMLElement | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Flatten: ejercicios de usuario (solo primera página) + páginas del catálogo
  const exercises = useMemo(() => {
    const pages = data?.pages ?? [];
    const usuario = pages[0]?.usuario ?? [];
    const catalogo = pages.flatMap((p) => p.catalogo ?? []);
    return [...usuario, ...catalogo];
  }, [data]);

  const sortedExercises = useMemo(() => {
    if (!exercises?.length) return [];
    const list = [...exercises];
    list.sort((a, b) => {
      const cmp = a.nombre.localeCompare(b.nombre, undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [exercises, sortOrder]);

  // UX: al cambiar la búsqueda, volvemos arriba
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, sortOrder]);

  useEffect(() => {
    setHeaderActionsSlot(document.getElementById("header-actions-slot"));
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (!hasNextPage || isFetchingNextPage) return;
        fetchNextPage();
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (location.state?.action === "new") {
      setCreateOpen(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
    }
  }, [location.state]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      await createExercise.mutateAsync({
        nombre: newName,
        descripcion: newDesc,
        usuario_id: user.id,
        musculos_involucrados: newBodyParts,
      });
      toast({ title: "Ejercicio creado" });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewBodyParts([]);
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
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
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : sortedExercises.map((ex) => {
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
        {!isLoading && !isError && sortedExercises.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground py-8">
            No hay ejercicios que coincidan. Prueba otra búsqueda o revisa en Supabase que existan filas en{" "}
            <code className="text-xs">tipo_ejercicio</code> y las políticas RLS permitan leerlas.
          </p>
        )}
      </div>

      {/* Sentinel para infinite scroll */}
      <div ref={loadMoreRef} className="h-10" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-2 text-sm text-muted-foreground">
          Cargando más...
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
