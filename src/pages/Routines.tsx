import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLayoutActionSlot } from "@/hooks/useLayoutActionSlot";
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
import { useRoutines, useDeleteRoutine, useUpdateRoutineOrder, useDuplicateRoutine, useRoutineLastTrainedByName } from "@/hooks/useRoutines";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Dumbbell,
  ArrowUpDown,
  Calendar,
  ArrowDownAZ,
  Hand,
  History,
  Clock,
  Check,
  PenLine,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
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
import { PredefinedRoutinesExplorer } from "@/components/routine/PredefinedRoutinesExplorer";
import { estimateRoutineDurationMinutes } from "@/lib/estimateRoutineDuration";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { RutinaWithDetails } from "@/types/routine";
import type { PillCircleOrigin } from "@/lib/pillCircleTransition";
import {
  type ExerciseFormData,
  normalizeRegistroSeries,
  defaultSetForMode,
  formatRitmoSegKmLabel,
} from "@/types/workout";
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

type SortMode = "date" | "name" | "lastUsed" | "duration" | "custom";
type SortDir = "asc" | "desc";

const SORT_MODES: SortMode[] = ["date", "name", "lastUsed", "duration", "custom"];

const ROUTINES_SORT_STORAGE_KEY = "gym-log.routines.sort";

function loadRoutinesSortPreference(): { sortMode: SortMode; sortDir: SortDir } {
  try {
    const raw = localStorage.getItem(ROUTINES_SORT_STORAGE_KEY);
    if (!raw) return { sortMode: "date", sortDir: "desc" };
    const parsed = JSON.parse(raw) as { sortMode?: string; sortDir?: string };
    const sortMode: SortMode = SORT_MODES.includes(parsed.sortMode as SortMode)
      ? (parsed.sortMode as SortMode)
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
  const duplicateRoutine = useDuplicateRoutine();
  const navigate = useNavigate();
  const location = useLocation();
  const updateOrder = useUpdateRoutineOrder();
  const { toast } = useToast();
  const { openFromTemplate } = useGlobalWorkoutDrawer();

  const routineNames = useMemo(
    () => (routines ?? []).map((r) => r.nombre),
    [routines],
  );
  const { data: lastTrainedByName } = useRoutineLastTrainedByName(routineNames);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importCsvOpen, setImportCsvOpen] = useState(false);
  const [createChoiceOpen, setCreateChoiceOpen] = useState(false);
  const [predefinedExplorerOpen, setPredefinedExplorerOpen] = useState(false);

  const [sortMode, setSortMode] = useState<SortMode>(() => loadRoutinesSortPreference().sortMode);
  const [sortDir, setSortDir] = useState<SortDir>(() => loadRoutinesSortPreference().sortDir);

  const [customOrder, setCustomOrder] = useState<RutinaWithDetails[] | null>(null);
  const mobileActionsSlot = useLayoutActionSlot("section-pills-actions-slot", null);
  const desktopCreateSlot = useLayoutActionSlot(null, "desktop-floating-create-slot");
  const desktopToolbarSlot = useLayoutActionSlot(null, "desktop-section-toolbar-slot");

  useEffect(() => {
    if (location.state?.action === "new") {
      setEditId(null);
      setFormOpen(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
    }
    if (location.state?.action === "import-csv") {
      setImportCsvOpen(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
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
      case "lastUsed":
        sorted.sort((a, b) => {
          const taRaw = lastTrainedByName?.[a.nombre.trim()];
          const tbRaw = lastTrainedByName?.[b.nombre.trim()];
          const ta = taRaw ? new Date(taRaw).getTime() : NaN;
          const tb = tbRaw ? new Date(tbRaw).getTime() : NaN;
          const aOk = Number.isFinite(ta);
          const bOk = Number.isFinite(tb);
          if (!aOk && !bOk) return a.nombre.localeCompare(b.nombre);
          if (!aOk) return 1;
          if (!bOk) return -1;
          const d = ta - tb;
          return sortDir === "asc" ? d : -d;
        });
        break;
      case "duration":
        sorted.sort((a, b) => {
          const da = estimateRoutineDurationMinutes(a.ejercicios) ?? 0;
          const db = estimateRoutineDurationMinutes(b.ejercicios) ?? 0;
          const d = da - db;
          if (d !== 0) return sortDir === "asc" ? d : -d;
          return a.nombre.localeCompare(b.nombre);
        });
        break;
      case "custom":
        sorted.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        break;
    }
    return sorted;
  }, [routines, sortMode, sortDir, customOrder, isDragMode, lastTrainedByName]);

  const selectSort = (mode: SortMode, dir: SortDir) => {
    setSortMode(mode);
    setSortDir(dir);
    if (mode === "custom" && routines) {
      const ordered = [...routines].sort(
        (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
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

  const openCreateChoice = () => {
    setCreateChoiceOpen(true);
  };

  /** Evita solapar dos modales Radix al cerrar uno y abrir otro. */
  const afterCloseChoice = (fn: () => void) => {
    setCreateChoiceOpen(false);
    window.setTimeout(fn, 0);
  };

  const chooseDesdeCero = () => {
    afterCloseChoice(() => {
      setEditId(null);
      setFormOpen(true);
    });
  };

  const choosePredefined = () => {
    afterCloseChoice(() => setPredefinedExplorerOpen(true));
  };

  const chooseImportCsv = () => {
    afterCloseChoice(() => setImportCsvOpen(true));
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setFormOpen(true);
  };

  const handleDuplicate = async (routine: RutinaWithDetails) => {
    try {
      await duplicateRoutine.mutateAsync(routine);
      toast({ title: "Rutina duplicada" });
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
      await deleteRoutine.mutateAsync(deleteId);
      toast({ title: "Rutina eliminada" });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Error desconocido",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const startRoutine = (routine: RutinaWithDetails, origin?: PillCircleOrigin) => {
    const exercises: ExerciseFormData[] = routine.ejercicios
      .sort((a, b) => a.orden - b.orden)
      .map((ej) => {
        const registro_series = normalizeRegistroSeries(ej.registro_series);
        const durObj = ej.duracion_objetivo_seg;
        const ritmoObj = ej.ritmo_objetivo_seg_km;
        return {
          tipo_ejercicio_id: ej.tipo_ejercicio_id ?? undefined,
          usuario_ejercicio_id: ej.usuario_ejercicio_id ?? undefined,
          nombre: ej.tipo_ejercicio.nombre,
          registro_series,
          repRange:
            registro_series === "duracion_ritmo"
              ? `${durObj != null ? `${durObj}s` : "Tiempo"} · ${formatRitmoSegKmLabel(ritmoObj ?? null)}`
              : registro_series === "duracion"
                ? durObj != null
                  ? `${durObj} s`
                  : "Tiempo"
                : `${ej.repes_min}-${ej.repes_max}`,
          targetRir: ej.rir ?? 1,
          descanso: ej.descanso ?? 120,
          superset_id: ej.superset_id ?? null,
          sets: Array.from({ length: ej.series_objetivo }, () =>
            defaultSetForMode(registro_series, durObj ?? null, ritmoObj ?? null)
          ),
        };
      });

    openFromTemplate(routine.nombre, exercises, routine.icono, origin);
  };

  const sortLabel = () => {
    if (sortMode === "date") return sortDir === "desc" ? "Más recientes" : "Más antiguas";
    if (sortMode === "name") return sortDir === "asc" ? "A-Z" : "Z-A";
    if (sortMode === "lastUsed") {
      return sortDir === "desc" ? "Recién entrenadas" : "Hace más tiempo";
    }
    if (sortMode === "duration") return sortDir === "asc" ? "Más cortas" : "Más largas";
    return "Orden manual";
  };

  const sortMenuContent = (
    <>
      <DropdownMenuLabel className="flex items-center gap-2 text-xs">
        <Calendar className="h-3.5 w-3.5" /> Fecha de creación
      </DropdownMenuLabel>
      <DropdownMenuItem onClick={() => selectSort("date", "desc")}>
        Más recientes {sortMode === "date" && sortDir === "desc" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => selectSort("date", "asc")}>
        Más antiguas {sortMode === "date" && sortDir === "asc" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuLabel className="flex items-center gap-2 text-xs">
        <History className="h-3.5 w-3.5" /> Última vez
      </DropdownMenuLabel>
      <DropdownMenuItem onClick={() => selectSort("lastUsed", "desc")}>
        Recién entrenadas {sortMode === "lastUsed" && sortDir === "desc" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => selectSort("lastUsed", "asc")}>
        Hace más tiempo {sortMode === "lastUsed" && sortDir === "asc" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuLabel className="flex items-center gap-2 text-xs">
        <Clock className="h-3.5 w-3.5" /> Duración
      </DropdownMenuLabel>
      <DropdownMenuItem onClick={() => selectSort("duration", "asc")}>
        Más cortas {sortMode === "duration" && sortDir === "asc" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => selectSort("duration", "desc")}>
        Más largas {sortMode === "duration" && sortDir === "desc" && <Check className="ml-auto h-4 w-4" />}
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
    </>
  );

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-2xl flex-1 flex-col overflow-x-hidden bg-background px-0 pt-3 pb-6 mx-auto md:px-8 md:pt-6",
        "max-md:-mb-24 max-md:pb-24",
        PAGE_CARD_STACK_GAP,
      )}
    >
      {mobileActionsSlot &&
        createPortal(
          <div className="flex items-center gap-2">
            {!!routines?.length && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground/58 dark:text-foreground dark:hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5"
                    title={`Orden: ${sortLabel()}`}
                    aria-label={`Ordenar rutinas, actual: ${sortLabel()}`}
                  >
                    <ArrowUpDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  {sortMenuContent}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              type="button"
              variant="new"
              onClick={openCreateChoice}
              title="Crear rutina"
              aria-label="Nueva rutina"
            >
              <span className="whitespace-nowrap">Crear</span>
              <Plus className="shrink-0" />
            </Button>
          </div>,
          mobileActionsSlot,
        )}
      {desktopToolbarSlot &&
        !!routines?.length &&
        createPortal(
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground/58 dark:text-foreground dark:hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5"
                title={`Orden: ${sortLabel()}`}
                aria-label={`Ordenar rutinas, actual: ${sortLabel()}`}
              >
                <ArrowUpDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              {sortMenuContent}
            </DropdownMenuContent>
          </DropdownMenu>,
          desktopToolbarSlot,
        )}
      {desktopCreateSlot &&
        createPortal(
          <Button
            type="button"
            variant="new"
            onClick={openCreateChoice}
            title="Crear rutina"
            aria-label="Nueva rutina"
            className="shadow-lg"
          >
            <span className="whitespace-nowrap">Crear</span>
            <Plus className="shrink-0" />
          </Button>,
          desktopCreateSlot,
        )}

      {isLoading ? (
        <div className="flex w-full flex-col gap-3 bg-background px-4 md:gap-[11px] md:px-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl border border-border/40 bg-card" />
          ))}
        </div>
      ) : !routines?.length ? (
        <div className="space-y-3 px-4 py-12 text-center md:px-0">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Aún no tienes rutinas creadas.</p>
          <Button onClick={openCreateChoice}>
            <Plus className="h-4 w-4 mr-2" /> Crear Rutina
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedRoutines.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="flex w-full flex-col gap-3 bg-background px-4 md:gap-[11px] md:px-0">
              {sortedRoutines.map((r) => (
                <SortableRoutineCard
                  key={r.id}
                  routine={r}
                  isDragMode={isDragMode}
                  lastTrainedAt={lastTrainedByName?.[r.nombre.trim()] ?? null}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onDuplicate={handleDuplicate}
                  onStart={startRoutine}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={createChoiceOpen} onOpenChange={setCreateChoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva rutina</DialogTitle>
            <DialogDescription>Elige cómo quieres crearla.</DialogDescription>
          </DialogHeader>
          <DialogActions className="pt-1">
            <Button
              type="button"
              variant="secondary"
              className="h-auto justify-start gap-3 py-3 px-4 text-left"
              onClick={chooseDesdeCero}
            >
              <PenLine className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium leading-snug">Desde cero</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-auto justify-start gap-3 py-3 px-4 text-left"
              onClick={choosePredefined}
            >
              <Sparkles className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium leading-snug">Rutinas predefinidas</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-auto justify-start gap-3 py-3 px-4 text-left"
              onClick={chooseImportCsv}
            >
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium leading-snug">Importar desde CSV</span>
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <PredefinedRoutinesExplorer open={predefinedExplorerOpen} onOpenChange={setPredefinedExplorerOpen} />
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
