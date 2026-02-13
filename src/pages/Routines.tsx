import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const Routines = () => {
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const navigate = useNavigate();
  const updateOrder = useUpdateRoutineOrder();
  const { toast } = useToast();
  const { data: activeWorkout } = useActiveWorkout();
  const { openFromTemplate, openActiveWorkout } = useGlobalWorkoutDrawer();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [customOrder, setCustomOrder] = useState<RutinaWithDetails[] | null>(null);

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
      navigate("/");
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
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
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

      {/* FAB */}
      <Button
        size="icon" // Usamos 'icon' para asegurar que sea cuadrado perfecto
        onClick={() => openCreate()}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full 
                  bg-gradient-to-br from-primary via-primary to-primary/80
                  border border-white/10
                  shadow-[0_4px_20px_rgba(var(--primary),0.4)]
                  hover:shadow-[0_6px_25px_rgba(var(--primary),0.6)]
                  hover:scale-105 active:scale-90
                  transition-all duration-300 ease-out
                  group md:bottom-8 md:right-8"
      >
        <Plus 
          className="h-7 w-7 text-primary-foreground 
                    transition-transform duration-500 ease-out 
                    group-hover:rotate-90 group-active:rotate-180" 
          strokeWidth={2.5} 
        />
        
        {/* Brillo especular (Overlay) para efecto 3D sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      <RoutineForm open={formOpen} onOpenChange={setFormOpen} routineId={editId} />

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
