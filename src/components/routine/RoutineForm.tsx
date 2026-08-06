import { useState, useEffect, useCallback, useRef, useMemo, type ComponentProps } from "react";
import { formatMSS, parseMSS } from "@/hooks/useRestTimer";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useRoutineById } from "@/hooks/useRoutines";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Trash2, Loader2, GripVertical, Link, Unlink, Info } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { RoutineIconPicker } from "@/components/routine/RoutineIconPicker";
import { useToast } from "@/hooks/use-toast";
import type { RoutineExerciseFormData, RoutineFormSnapshot, RutinaEjercicioWithDetails } from "@/types/routine";
import { type RegistroSeries, normalizeRegistroSeries } from "@/types/workout";
import {
  DEFAULT_ROUTINE_ICON_KEY,
  resolveRoutineIconKey,
  type RoutineIconKey,
} from "@/lib/routineIcons";
import type { TablesInsert } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

interface RoutineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId?: string | null;
  prefillSnapshot?: RoutineFormSnapshot | null;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

/** Group consecutive exercises that share the same superset_id */
function groupExercises(ejercicios: RoutineExerciseFormData[]) {
  const groups: { supersetId: string | null; items: { exercise: RoutineExerciseFormData; originalIndex: number }[] }[] = [];

  ejercicios.forEach((ej, i) => {
    const sid = ej.superset_id || null;
    const lastGroup = groups[groups.length - 1];

    if (sid && lastGroup && lastGroup.supersetId === sid) {
      lastGroup.items.push({ exercise: ej, originalIndex: i });
    } else {
      groups.push({ supersetId: sid, items: [{ exercise: ej, originalIndex: i }] });
    }
  });

  return groups;
}

type RoutineFormEditSnapshot = {
  nombre: string;
  descripcion: string;
  icono: RoutineIconKey;
  ejercicios: RoutineExerciseFormData[];
};

function mapRoutineExercisesFromApi(ejercicios: RutinaEjercicioWithDetails[]): RoutineExerciseFormData[] {
  return ejercicios.map((ej) => ({
    tipo_ejercicio_id: (ej as { tipo_ejercicio_id?: string }).tipo_ejercicio_id ?? undefined,
    usuario_ejercicio_id: (ej as { usuario_ejercicio_id?: string }).usuario_ejercicio_id ?? undefined,
    nombre: ej.tipo_ejercicio.nombre,
    series_objetivo: ej.series_objetivo,
    repes_min: ej.repes_min,
    repes_max: ej.repes_max,
    rir: (ej as { rir?: number }).rir ?? 1,
    orden: ej.orden,
    superset_id: (ej as { superset_id?: string | null }).superset_id ?? null,
    descanso: (ej as { descanso?: number }).descanso ?? 120,
    registro_series: normalizeRegistroSeries((ej as { registro_series?: string }).registro_series),
    duracion_objetivo_seg: (ej as { duracion_objetivo_seg?: number | null }).duracion_objetivo_seg ?? null,
    ritmo_objetivo_seg_km: (ej as { ritmo_objetivo_seg_km?: number | null }).ritmo_objetivo_seg_km ?? null,
  }));
}

function exerciseSnapshotKey(ej: RoutineExerciseFormData) {
  return JSON.stringify({
    tipo_ejercicio_id: ej.tipo_ejercicio_id ?? null,
    usuario_ejercicio_id: ej.usuario_ejercicio_id ?? null,
    series_objetivo: ej.series_objetivo,
    repes_min: ej.repes_min,
    repes_max: ej.repes_max,
    rir: ej.rir,
    orden: ej.orden,
    superset_id: ej.superset_id ?? null,
    descanso: ej.descanso,
    registro_series: ej.registro_series,
    duracion_objetivo_seg: ej.duracion_objetivo_seg,
    ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km,
  });
}

function routineFormSnapshotsEqual(a: RoutineFormEditSnapshot, b: RoutineFormEditSnapshot) {
  if (a.nombre.trim() !== b.nombre.trim()) return false;
  if (a.descripcion.trim() !== b.descripcion.trim()) return false;
  if (a.icono !== b.icono) return false;
  if (a.ejercicios.length !== b.ejercicios.length) return false;
  return a.ejercicios.every((ej, i) => exerciseSnapshotKey(ej) === exerciseSnapshotKey(b.ejercicios[i]));
}

export function RoutineForm({ open, onOpenChange, routineId = null, prefillSnapshot = null }: RoutineFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: existingRoutine } = useRoutineById(routineId);
  const { data: exerciseCatalog } = useExerciseCatalog();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icono, setIcono] = useState<RoutineIconKey>(DEFAULT_ROUTINE_ICON_KEY);
  const [ejercicios, setEjercicios] = useState<RoutineExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<
    ComponentProps<typeof ExerciseDetailSheet>["exercise"]
  >(null);

  // When linking a superset, we store the index + generated superset_id
  const [supersetLink, setSupersetLink] = useState<{ afterIndex: number; supersetId: string } | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<RoutineFormEditSnapshot | null>(null);

  const isEdit = !!routineId;

  useEffect(() => {
    if (isEdit && existingRoutine && open) {
      const loadedEjercicios = mapRoutineExercisesFromApi(existingRoutine.ejercicios);
      const snapshot: RoutineFormEditSnapshot = {
        nombre: existingRoutine.nombre,
        descripcion: existingRoutine.descripcion || "",
        icono: resolveRoutineIconKey(existingRoutine.icono),
        ejercicios: loadedEjercicios,
      };
      setNombre(snapshot.nombre);
      setDescripcion(snapshot.descripcion);
      setIcono(snapshot.icono);
      setEjercicios(loadedEjercicios);
      setInitialSnapshot(snapshot);
    }
  }, [isEdit, existingRoutine, open]);

  useEffect(() => {
    if (open && !isEdit) {
      if (prefillSnapshot) {
        setNombre(prefillSnapshot.nombre);
        setDescripcion(prefillSnapshot.descripcion);
        setIcono(resolveRoutineIconKey(prefillSnapshot.icono));
        setEjercicios(
          prefillSnapshot.ejercicios.map((ej, index) => ({
            ...ej,
            orden: index,
          })),
        );
      } else {
        setNombre("");
        setDescripcion("");
        setIcono(DEFAULT_ROUTINE_ICON_KEY);
        setEjercicios([]);
      }
      setSupersetLink(null);
      setInitialSnapshot(null);
    }
  }, [open, isEdit, prefillSnapshot]);

  useEffect(() => {
    if (!open) setInitialSnapshot(null);
  }, [open]);

  const isDirty = useMemo(() => {
    if (!isEdit || !initialSnapshot) return false;
    const current: RoutineFormEditSnapshot = { nombre, descripcion, icono, ejercicios };
    return !routineFormSnapshotsEqual(initialSnapshot, current);
  }, [isEdit, initialSnapshot, nombre, descripcion, icono, ejercicios]);

  const addExercise = useCallback(
    (
      catalogRef: {
        tipo_ejercicio_id?: string;
        usuario_ejercicio_id?: string;
        registro_series?: RegistroSeries;
      },
      nombreEj: string
    ) => {
      const { tipo_ejercicio_id, usuario_ejercicio_id, registro_series: rs } = catalogRef;
      const registro_series = rs ?? "peso_reps";
      if (supersetLink) {
        // Insert immediately after the linking exercise with same superset_id
        const { afterIndex, supersetId } = supersetLink;
        setEjercicios((prev) => {
          // Also ensure the source exercise has the superset_id
          const updated = prev.map((ej, i) =>
            i === afterIndex ? { ...ej, superset_id: supersetId } : ej
          );
          const newExercise: RoutineExerciseFormData = {
            tipo_ejercicio_id,
            usuario_ejercicio_id,
            nombre: nombreEj,
            series_objetivo: 3,
            repes_min: 8,
            repes_max: 12,
            rir: 1,
            orden: 0,
            superset_id: supersetId,
            descanso: 120,
            registro_series,
            duracion_objetivo_seg:
              registro_series === "duracion" || registro_series === "duracion_ritmo"
                ? registro_series === "duracion_ritmo"
                  ? 600
                  : 45
                : null,
            ritmo_objetivo_seg_km: registro_series === "duracion_ritmo" ? 300 : null,
          };
          // Insert after afterIndex
          const result = [
            ...updated.slice(0, afterIndex + 1),
            newExercise,
            ...updated.slice(afterIndex + 1),
          ].map((ej, i) => ({ ...ej, orden: i }));
          return result;
        });
        setSupersetLink(null);
      } else {
        setEjercicios((prev) => [
          ...prev,
          {
            tipo_ejercicio_id,
            usuario_ejercicio_id,
            nombre: nombreEj,
            series_objetivo: 3,
            repes_min: 8,
            repes_max: 12,
            rir: 1,
            orden: prev.length,
            superset_id: null,
            descanso: 120,
            registro_series,
            duracion_objetivo_seg:
              registro_series === "duracion" || registro_series === "duracion_ritmo"
                ? registro_series === "duracion_ritmo"
                  ? 600
                  : 45
                : null,
            ritmo_objetivo_seg_km: registro_series === "duracion_ritmo" ? 300 : null,
          },
        ]);
      }
      setPickerOpen(false);
    },
    [supersetLink]
  );

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleRoutineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEjercicios((prev) => {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      return arrayMove(prev, oldIndex, newIndex).map((ej, i) => ({ ...ej, orden: i }));
    });
  };

  const removeExercise = (index: number) => {
    setEjercicios((prev) => prev.filter((_, i) => i !== index).map((ej, i) => ({ ...ej, orden: i })));
  };

  const updateExerciseField = <K extends keyof RoutineExerciseFormData>(
    index: number,
    field: K,
    value: RoutineExerciseFormData[K]
  ) => {
    setEjercicios((prev) =>
      prev.map((ej, i) => (i === index ? ({ ...ej, [field]: value } as RoutineExerciseFormData) : ej))
    );
  };

  const startSupersetLink = (index: number) => {
    const existing = ejercicios[index].superset_id;
    const supersetId = existing || generateUUID();
    setSupersetLink({ afterIndex: index, supersetId });
    setPickerOpen(true);
  };

  const breakSuperset = (index: number) => {
    setEjercicios((prev) =>
      prev.map((ej, i) => (i === index ? { ...ej, superset_id: null } : ej))
    );
  };

  const handleSave = async () => {
    if (!user || !nombre.trim() || ejercicios.length === 0) {
      toast({ title: "Completa el formulario", description: "Agrega nombre y al menos un ejercicio.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let rutinaId: string;

      if (isEdit && routineId) {
        const { error } = await supabase
          .from("rutina")
          .update({
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            icono,
          })
          .eq("id", routineId);
        if (error) throw error;
        rutinaId = routineId;
        await supabase.from("rutina_ejercicio").delete().eq("rutina_id", routineId);
      } else {
        const { data, error } = await supabase
          .from("rutina")
          .insert({
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            usuario_id: user.id,
            icono,
          })
          .select("id")
          .single();
        if (error) throw error;
        rutinaId = data.id;
      }

      const inserts: TablesInsert<"rutina_ejercicio">[] = ejercicios.map((ej, i) => ({
        rutina_id: rutinaId,
        tipo_ejercicio_id: ej.tipo_ejercicio_id ?? null,
        usuario_ejercicio_id: ej.usuario_ejercicio_id ?? null,
        series_objetivo: ej.series_objetivo,
        repes_min: ej.repes_min,
        repes_max: ej.repes_max,
        rir: ej.rir,
        orden: i,
        superset_id: ej.superset_id || null,
        descanso: ej.descanso,
        registro_series: ej.registro_series,
        duracion_objetivo_seg: ej.duracion_objetivo_seg,
        ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km,
      }));

      if (inserts.length > 0) {
        const { error } = await supabase.from("rutina_ejercicio").insert(inserts);
        if (error) throw error;
      }

      toast({ title: isEdit ? "¡Rutina actualizada!" : "¡Rutina creada!" });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine"] });
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const groups = groupExercises(ejercicios);

  const handleViewExerciseInfo = useCallback(
    (ej: RoutineExerciseFormData) => {
      const catalogId = ej.tipo_ejercicio_id ?? ej.usuario_ejercicio_id;
      if (!catalogId || !exerciseCatalog?.length) return;
      const found = exerciseCatalog.find((t) => t.id === catalogId);
      if (!found) return;
      setSelectedExerciseDetail(found as ComponentProps<typeof ExerciseDetailSheet>["exercise"]);
    },
    [exerciseCatalog]
  );

  return (
    <>
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent side="bottom" className="h-[92lvh] max-h-[92lvh] min-h-0 overflow-hidden p-0">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <DrawerHeader className="sticky top-0 z-10 shrink-0 border-b border-border bg-card px-6 text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg">
                {isEdit ? "Editar Rutina" : "Nueva Rutina"}
              </DrawerTitle>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={saving || (isEdit && !isDirty)}
                size="sm"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <div className={cn("flex flex-col gap-1 bg-background pb-[calc(5rem+env(safe-area-inset-bottom,0px))]")}>
              <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                <CardContent className="space-y-3 px-6 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="routine-name">Nombre</Label>
                    <Input
                      id="routine-name"
                      placeholder="Ej: Push Day, Pierna A..."
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="routine-desc">Descripción</Label>
                    <Textarea
                      id="routine-desc"
                      placeholder="Descripción opcional..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <RoutineIconPicker value={icono} onChange={setIcono} label="Icono de rutina" />
                </CardContent>
              </Card>

              <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-3">
                    <div className="font-semibold">Ejercicios</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {ejercicios.length} ejercicio{ejercicios.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleRoutineDragEnd}>
                    <SortableContext items={ejercicios.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                      {ejercicios.length > 0 ? (
                        <div className="flex flex-col gap-1 bg-background">
                          {groups.map((group) => {
                            const isSuperset = !!group.supersetId && group.items.length > 1;

                            if (isSuperset) {
                              return (
                                <div key={group.supersetId} className="flex flex-col gap-1 bg-background">
                                  <div className="bg-primary/5 px-6 pt-2 pb-1">
                                    <span className="text-xs font-medium text-primary">🔗 Superserie</span>
                                  </div>
                                  <div className="flex flex-col gap-1 bg-background">
                                    {group.items.map(({ exercise: ej, originalIndex: i }) => (
                                      <SortableExerciseRow
                                        key={i}
                                        sortId={i}
                                        exercise={ej}
                                        index={i}
                                        onUpdateField={updateExerciseField}
                                        onRemove={removeExercise}
                                        onLinkSuperset={startSupersetLink}
                                        onBreakSuperset={breakSuperset}
                                        isInSuperset
                                        onViewExerciseInfo={handleViewExerciseInfo}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            const { exercise: ej, originalIndex: i } = group.items[0];
                            return (
                              <SortableExerciseRow
                                key={i}
                                sortId={i}
                                exercise={ej}
                                index={i}
                                onUpdateField={updateExerciseField}
                                onRemove={removeExercise}
                                onLinkSuperset={startSupersetLink}
                                onBreakSuperset={breakSuperset}
                                isInSuperset={false}
                                onViewExerciseInfo={handleViewExerciseInfo}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <p className="px-6 pb-4 text-sm text-muted-foreground">
                          Añade ejercicios para completar la rutina.
                        </p>
                      )}
                    </SortableContext>
                  </DndContext>

                  <div className="px-6 py-4">
                    <ExerciseSelector
                      open={pickerOpen}
                      onOpenChange={(o) => {
                        setPickerOpen(o);
                        if (!o) setSupersetLink(null);
                      }}
                      onSelect={addExercise}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>

    <ExerciseDetailSheet
      exercise={selectedExerciseDetail}
      open={!!selectedExerciseDetail}
      onOpenChange={(o) => {
        if (!o) setSelectedExerciseDetail(null);
      }}
      currentUserId={user?.id}
    />
    </>
  );
}

/** Sortable wrapper for ExerciseRow */
function SortableExerciseRow({ sortId, ...props }: {
  sortId: number;
  exercise: RoutineExerciseFormData;
  index: number;
  onUpdateField: <K extends keyof RoutineExerciseFormData>(
    index: number,
    field: K,
    value: RoutineExerciseFormData[K]
  ) => void;
  onRemove: (index: number) => void;
  onLinkSuperset: (index: number) => void;
  onBreakSuperset: (index: number) => void;
  isInSuperset: boolean;
  onViewExerciseInfo: (ej: RoutineExerciseFormData) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging, isSorting } = useSortable({ id: sortId });
  const shouldAnimate = isSorting && !isDragging;
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: shouldAnimate ? 'transform 150ms ease' : 'none',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseRow {...props} dragHandleProps={listeners} />
    </div>
  );
}

/** Individual exercise row used inside the form */
function ExerciseRow({
  exercise: ej,
  index: i,
  onUpdateField,
  onRemove,
  onLinkSuperset,
  onBreakSuperset,
  isInSuperset,
  dragHandleProps,
  onViewExerciseInfo,
}: {
  exercise: RoutineExerciseFormData;
  index: number;
  onUpdateField: <K extends keyof RoutineExerciseFormData>(
    index: number,
    field: K,
    value: RoutineExerciseFormData[K]
  ) => void;
  onRemove: (index: number) => void;
  onLinkSuperset: (index: number) => void;
  onBreakSuperset: (index: number) => void;
  isInSuperset: boolean;
  dragHandleProps?: DraggableSyntheticListeners;
  onViewExerciseInfo: (ej: RoutineExerciseFormData) => void;
}) {
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const wrapperClass = cn(
    "px-6 py-4 space-y-3",
    isInSuperset ? "bg-primary/5" : "bg-card",
  );

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div {...dragHandleProps} className="cursor-grab touch-none active:cursor-grabbing shrink-0">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-sm truncate">{ej.nombre}</h3>
          {(ej.tipo_ejercicio_id || ej.usuario_ejercicio_id) && (
            <button
              type="button"
              title="Ver cómo se hace este ejercicio"
              onClick={() => onViewExerciseInfo(ej)}
              className={cn(
                badgeVariants({ variant: "outline" }),
                "touch-styled h-7 w-7 shrink-0 p-0 inline-flex items-center justify-center",
                "transition-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-100",
              )}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {isInSuperset ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Romper superserie"
              onClick={() => onBreakSuperset(i)}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Crear superserie"
              onClick={() => onLinkSuperset(i)}
            >
              <Link className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setConfirmDeleteExercise(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmDeleteExercise} onOpenChange={setConfirmDeleteExercise}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{ej.nombre}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará este ejercicio de la rutina. Puedes volver a añadirlo desde el selector.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove(i);
                setConfirmDeleteExercise(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Series</Label>
            <Input
              type="number"
              min={1}
              value={ej.series_objetivo}
              onChange={(e) => onUpdateField(i, "series_objetivo", Number(e.target.value))}
              className="h-10"
            />
          </div>
          {ej.registro_series === "peso_reps" ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Reps mín</Label>
                <Input
                  type="number"
                  min={1}
                  value={ej.repes_min}
                  onChange={(e) => onUpdateField(i, "repes_min", Number(e.target.value))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Reps máx</Label>
                <Input
                  type="number"
                  min={1}
                  value={ej.repes_max}
                  onChange={(e) => onUpdateField(i, "repes_max", Number(e.target.value))}
                  className="h-10"
                />
              </div>
            </>
          ) : ej.registro_series === "duracion" ? (
            <div className="space-y-1 col-span-2">
              <Label className="text-xs text-muted-foreground">Objetivo por serie (s)</Label>
              <Input
                type="number"
                min={0}
                value={ej.duracion_objetivo_seg ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  onUpdateField(i, "duracion_objetivo_seg", v === "" ? null : Number(v));
                }}
                className="h-10"
                placeholder="Ej: 45"
              />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tiempo (s)</Label>
                <Input
                  type="number"
                  min={0}
                  value={ej.duracion_objetivo_seg ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onUpdateField(i, "duracion_objetivo_seg", v === "" ? null : Number(v));
                  }}
                  className="h-10"
                  placeholder="Ej: 600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Ritmo (s/km)</Label>
                <Input
                  type="number"
                  min={1}
                  value={ej.ritmo_objetivo_seg_km ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onUpdateField(i, "ritmo_objetivo_seg_km", v === "" ? null : Number(v));
                  }}
                  className="h-10"
                  placeholder="300 = 5:00/km"
                />
              </div>
            </>
          )}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">RIR</Label>
            <Select
              value={String(ej.rir)}
              onValueChange={(val) => onUpdateField(i, "rir", Number(val))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <RestTimeInput
            value={ej.descanso}
            onChange={(val) => onUpdateField(i, "descanso", val)}
          />
        </div>
      </div>
    </div>
  );
}

/** M:SS rest time input */
function RestTimeInput({ value, onChange }: { value: number; onChange: (seconds: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState(formatMSS(value));

  useEffect(() => {
    setDisplay(formatMSS(value));
  }, [value]);

  const handleBlur = () => {
    const parsed = parseMSS(display);
    if (parsed != null) {
      onChange(parsed);
      setDisplay(formatMSS(parsed));
    } else {
      setDisplay(formatMSS(value));
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">Descanso</Label>
      <Input
        ref={inputRef}
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        onBlur={handleBlur}
        className="h-10 text-center"
        placeholder="2:00"
      />
    </div>
  );
}
