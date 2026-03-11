import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useRoutines, useDeleteRoutine, useUpdateRoutineOrder } from "@/hooks/useRoutines";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Dumbbell, ArrowUpDown, Calendar, ArrowDownAZ, Hand, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoutineForm } from "@/components/routine/RoutineForm";
import { SortableRoutineCard } from "@/components/routine/SortableRoutineCard";
import { ImportRoutineFromCsvDialog } from "@/components/routine/ImportRoutineFromCsvDialog";
import { useToast } from "@/hooks/use-toast";
import type { RutinaWithDetails } from "@/types/routine";
import type { ExerciseFormData } from "@/types/workout";
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

type SortMode = "date" | "name" | "custom";
type SortDir = "asc" | "desc";

const ROUTINES_SORT_STORAGE_KEY = "gym-log.routines.sort";

function loadRoutinesSortPreference(): { sortMode: SortMode; sortDir: SortDir } {
  try {
    const raw = localStorage.getItem(ROUTINES_SORT_STORAGE_KEY);
    if (!raw) return { sortMode: "date", sortDir: "desc" };
    const parsed = JSON.parse(raw) as { sortMode?: string; sortDir?: string };
    const sortMode: SortMode =
      parsed.sortMode === "date" || parsed.sortMode === "name" || parsed.sortMode === "custom"
        ? parsed.sortMode
        : "date";
    const sortDir: SortDir =
      parsed.sortDir === "asc" || parsed.sortDir === "desc" ? parsed.sortDir : "desc";
    return { sortMode, sortDir };
  } catch {
    return { sortMode: "date", sortDir: "desc" };
  }
}

function saveRoutinesSortPreference(sortMode: SortMode, sortDir: SortDir) {
  try {
    localStorage.setItem(ROUTINES_SORT_STORAGE_KEY, JSON.stringify({ sortMode, sortDir }));
  } catch {
    // ignore
  }
}

const Routines = () => {
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const navigate = useNavigate();
  const location = useLocation();
  const updateOrder = useUpdateRoutineOrder();
  const { toast } = useToast();
  const { data: activeWorkout } = useActiveWorkout();
  const { openFromTemplate, openActiveWorkout } = useGlobalWorkoutDrawer();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importCsvOpen, setImportCsvOpen] = useState(false);

  const [sortMode, setSortMode] = useState<SortMode>(() => loadRoutinesSortPreference().sortMode);
  const [sortDir, setSortDir] = useState<SortDir>(() => loadRoutinesSortPreference().sortDir);

  const [customOrder, setCustomOrder] = useState<RutinaWithDetails[] | null>(null);

  useEffect(() => {
    if (location.state?.action === "new") {
      setEditId(null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.action === "import-csv") {
      setImportCsvOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    saveRoutinesSortPreference(sortMode, sortDir);
  }, [sortMode, sortDir]);

  const isDragMode = sortMode === "custom";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedRoutines = useMemo(() => {
    if (!routines?.length) return [];
    if (isDragMode && customOrder) return customOrder;
    const sorted = [...routines];
    switch (sortMode) {
      case "date":
        sorted.sort((a, b) => {
          const d = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          return sortDir === "asc" ? d : -d;
        });
        break;
      case "name":
        sorted.sort((a, b) => {
          const c = a.nombre.localeCompare(b.nombre);
          return sortDir === "asc" ? c : -c;
        });
        break;
      case "custom":
        sorted.sort((a, b) => ((a as any).orden ?? 0) - ((b as any).orden ?? 0));
        break;
    }
    return sorted;
  }, [routines, sortMode, sortDir, customOrder, isDragMode]);

  const selectSort = (mode: SortMode, dir: SortDir) => {
    setSortMode(mode);
    setSortDir(dir);
    if (mode === "custom" && routines) {
      const ordered = [...routines].sort(
        (a, b) => ((a as any).orden ?? 0) - ((b as any).orden ?? 0)
      );
      setCustomOrder(ordered);
    } else {
      setCustomOrder(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !customOrder) return;
    const oldIndex = customOrder.findIndex((r) => r.id === active.id);
    const newIndex = customOrder.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(customOrder, oldIndex, newIndex);
    setCustomOrder(reordered);
    const updates = reordered.map((r, i) => ({ id: r.id, orden: i }));
    updateOrder.mutate(updates);
  };

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRoutine.mutateAsync(deleteId);
      toast({ title: "Rutina eliminada" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const startRoutine = (routine: RutinaWithDetails) => {
    // Block if there's already an active workout
    if (activeWorkout) {
      toast({
        title: "Ya tienes un entrenamiento en curso",
        description: "Termínalo o cancélalo antes de empezar otro.",
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => openActiveWorkout(activeWorkout.id)}
          >
            Ir al entreno
          </Button>
        ),
      });
      return;
    }

    const exercises: ExerciseFormData[] = routine.ejercicios
      .sort((a, b) => a.orden - b.orden)
      .map((ej) => ({
        tipo_ejercicio_id: ej.tipo_ejercicio_id,
        nombre: ej.tipo_ejercicio.nombre,
        repRange: `${ej.repes_min}-${ej.repes_max}`,
        targetRir: (ej as any).rir ?? 1,
        descanso: (ej as any).descanso ?? 120,
        sets: Array.from({ length: ej.series_objetivo }, () => ({
          repeticiones: 0,
          peso_kg: 0,
        })),
      }));

    openFromTemplate(routine.nombre, exercises);
  };

  const sortLabel = () => {
    if (sortMode === "date") return sortDir === "desc" ? "Más recientes" : "Más antiguas";
    if (sortMode === "name") return sortDir === "asc" ? "A-Z" : "Z-A";
    return "Orden manual";
  };

  return (
    <div className="p-4 md:p-8 pt-6 space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rutinas</h1>
          <p className="text-sm text-muted-foreground">Tus plantillas de entrenamiento</p>
        </div>
        {!!routines?.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">{sortLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" /> Fecha
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => selectSort("date", "desc")}>
                Más recientes {sortMode === "date" && sortDir === "desc" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => selectSort("date", "asc")}>
                Más antiguas {sortMode === "date" && sortDir === "asc" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                <ArrowDownAZ className="h-3.5 w-3.5" /> Nombre
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => selectSort("name", "asc")}>
                A → Z {sortMode === "name" && sortDir === "asc" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => selectSort("name", "desc")}>
                Z → A {sortMode === "name" && sortDir === "desc" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                <Hand className="h-3.5 w-3.5" /> Personalizado
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => selectSort("custom", "asc")}>
                Orden manual {sortMode === "custom" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !routines?.length ? (
        <div className="text-center py-12 space-y-3">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Aún no tienes rutinas creadas.</p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Crear Rutina
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedRoutines.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {sortedRoutines.map((r) => (
                <SortableRoutineCard
                  key={r.id}
                  routine={r}
                  isDragMode={isDragMode}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onStart={startRoutine}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <RoutineForm open={formOpen} onOpenChange={setFormOpen} routineId={editId} />
      <ImportRoutineFromCsvDialog open={importCsvOpen} onOpenChange={setImportCsvOpen} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Routines;
