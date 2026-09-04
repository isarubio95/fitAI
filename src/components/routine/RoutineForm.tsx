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
  type DragStartEvent,
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
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { vaulSafeDragHandleProps } from "@/lib/vaulSafeDragHandle";
import { Card, CardContent } from "@/components/ui/card";
import { SortableDragOverlay } from "@/components/ui/sortable-drag-overlay";
import { restrictToVerticalAxis } from "@/lib/dndModifiers";
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
import { Trash2, Loader2, GripVertical, Link, Unlink, Info, ListOrdered } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { WorkoutEmptyExerciseState } from "@/components/workout/workout-logger/WorkoutEmptyExerciseState";
import { RoutineIconPicker } from "@/components/routine/RoutineIconPicker";
import { useToast } from "@/hooks/use-toast";
import type {
  RoutineExerciseFormData,
  RoutineFormSnapshot,
  RoutineSetPlan,
  RutinaEjercicioWithDetails,
} from "@/types/routine";
import { type RegistroSeries, normalizeRegistroSeries } from "@/types/workout";
import {
  PLAN_PRESETS,
  applyPlanPreset,
  blankSetPlan,
  buildSimplePlan,
  formatRepTarget,
  parseRepTarget,
  planFromRows,
  reindexPlan,
  withSeriesPlan,
  type PlanPresetKey,
} from "@/lib/seriesPlan";
import { TIPOS_SERIE, tipoSerieLabel, type TipoSerie } from "@/lib/setTypes";
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

/** Handlers inertes para la copia de solo lectura que muestra el DragOverlay. */
const noop = () => {};

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
    series_plan: planFromRows(ej.rutina_ejercicio_serie),
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
    // Sin esto, editar solo el plan por serie no marcaría el formulario como sucio.
    series_plan:
      ej.series_plan?.map((s) => [
        s.orden,
        s.tipo_serie,
        s.repes_min,
        s.repes_max,
        s.rir,
        s.peso_objetivo_kg,
        s.descanso,
        s.duracion_objetivo_seg,
        s.ritmo_objetivo_seg_km,
      ]) ?? null,
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
  /** Índice del ejercicio en arrastre; alimenta la tarjeta del DragOverlay. */
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
            series_plan: null,
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
            series_plan: null,
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

  const handleRoutineDragStart = (event: DragStartEvent) => {
    setDraggingIndex(Number(event.active.id));
  };

  const handleRoutineDragEnd = (event: DragEndEvent) => {
    setDraggingIndex(null);
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

  /**
   * Sustituye el plan por serie de un ejercicio manteniendo sincronizados los
   * escalares de resumen. `null` vuelve al modo simple.
   */
  const updateSeriesPlan = (index: number, plan: RoutineSetPlan[] | null) => {
    setEjercicios((prev) =>
      prev.map((ej, i) => (i === index ? withSeriesPlan(ej, plan) : ej))
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
        // Se necesitan los ids devueltos para colgar de ellos el plan por serie.
        // Se mapea por `orden` (único dentro de la rutina) en vez de por
        // posición: PostgREST no garantiza el orden de las filas devueltas.
        const { data: insertedRows, error } = await supabase
          .from("rutina_ejercicio")
          .insert(inserts)
          .select("id, orden");
        if (error) throw error;

        const planInserts: TablesInsert<"rutina_ejercicio_serie">[] = [];
        (insertedRows ?? []).forEach((row) => {
          const plan = ejercicios[row.orden]?.series_plan;
          if (!plan?.length) return;
          plan.forEach((s, orden) => {
            planInserts.push({
              rutina_ejercicio_id: row.id,
              orden,
              tipo_serie: s.tipo_serie,
              repes_min: s.repes_min,
              repes_max: s.repes_max,
              rir: s.rir,
              peso_objetivo_kg: s.peso_objetivo_kg,
              descanso: s.descanso,
              duracion_objetivo_seg: s.duracion_objetivo_seg,
              ritmo_objetivo_seg_km: s.ritmo_objetivo_seg_km,
            });
          });
        });

        if (planInserts.length > 0) {
          const { error: planError } = await supabase
            .from("rutina_ejercicio_serie")
            .insert(planInserts);
          if (planError) throw planError;
        }
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
  const draggingExercise = draggingIndex == null ? null : ejercicios[draggingIndex] ?? null;

  // Con id + origen basta: `ExerciseDetailSheet` pide el detalle completo por
  // id. Filtrar antes por el catálogo en memoria dejaba el botón muerto para
  // los ejercicios que quedaban fuera de las primeras filas descargadas.
  const handleViewExerciseInfo = useCallback((ej: RoutineExerciseFormData) => {
    const catalogId = ej.tipo_ejercicio_id ?? ej.usuario_ejercicio_id;
    if (!catalogId) return;
    setSelectedExerciseDetail({
      id: catalogId,
      nombre: ej.nombre,
      __source: ej.tipo_ejercicio_id ? "catalogo" : "usuario",
    });
  }, []);

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
                disabled={saving || ejercicios.length === 0 || (isEdit && !isDirty)}
                size="sm"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <div className={cn("flex min-h-full flex-col gap-1 bg-background pb-[calc(5rem+env(safe-area-inset-bottom,0px))]")}>
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

              {ejercicios.length === 0 ? (
                <WorkoutEmptyExerciseState
                  layout="inline"
                  message="Añade un ejercicio para completar la rutina"
                  open={pickerOpen}
                  onOpenChange={(o) => {
                    setPickerOpen(o);
                    if (!o) setSupersetLink(null);
                  }}
                  onAddExercise={addExercise}
                />
              ) : (
              <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-3">
                    <div className="font-semibold">Ejercicios</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {ejercicios.length} ejercicio{ejercicios.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <DndContext
                    sensors={dndSensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragStart={handleRoutineDragStart}
                    onDragEnd={handleRoutineDragEnd}
                    onDragCancel={() => setDraggingIndex(null)}
                  >
                    <SortableContext items={ejercicios.map((_, i) => i)} strategy={verticalListSortingStrategy}>
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
                                      onUpdatePlan={updateSeriesPlan}
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
                              onUpdatePlan={updateSeriesPlan}
                              onRemove={removeExercise}
                              onLinkSuperset={startSupersetLink}
                              onBreakSuperset={breakSuperset}
                              isInSuperset={false}
                              onViewExerciseInfo={handleViewExerciseInfo}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>

                    <SortableDragOverlay>
                      {draggingExercise ? (
                        <ExerciseRow
                          exercise={draggingExercise}
                          index={draggingIndex ?? 0}
                          onUpdateField={noop}
                          onUpdatePlan={noop}
                          onRemove={noop}
                          onLinkSuperset={noop}
                          onBreakSuperset={noop}
                          isInSuperset={!!draggingExercise.superset_id}
                          onViewExerciseInfo={noop}
                        />
                      ) : null}
                    </SortableDragOverlay>
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
              )}
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
  onUpdatePlan: (index: number, plan: RoutineSetPlan[] | null) => void;
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
    transition: shouldAnimate ? 'transform 200ms cubic-bezier(0.2, 0, 0, 1)' : 'none',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      // La tarjeta visible durante el arrastre la pinta el DragOverlay; esta
      // fila se queda como hueco atenuado en su sitio.
      className={cn(isDragging && 'opacity-30')}
      {...attributes}
    >
      <ExerciseRow {...props} dragHandleProps={listeners} />
    </div>
  );
}

/** Individual exercise row used inside the form */
function ExerciseRow({
  exercise: ej,
  index: i,
  onUpdateField,
  onUpdatePlan,
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
  onUpdatePlan: (index: number, plan: RoutineSetPlan[] | null) => void;
  onRemove: (index: number) => void;
  onLinkSuperset: (index: number) => void;
  onBreakSuperset: (index: number) => void;
  isInSuperset: boolean;
  dragHandleProps?: DraggableSyntheticListeners;
  onViewExerciseInfo: (ej: RoutineExerciseFormData) => void;
}) {
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const [confirmSimplify, setConfirmSimplify] = useState(false);
  const plan = ej.series_plan;
  const wrapperClass = cn(
    "px-6 py-4 space-y-3",
    isInSuperset ? "bg-primary/5" : "bg-card",
  );

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div
            {...vaulSafeDragHandleProps(dragHandleProps)}
            aria-label={dragHandleProps ? "Reordenar ejercicio" : undefined}
            className={cn(
              "-ml-2 flex h-11 w-11 shrink-0 items-center justify-center",
              dragHandleProps && "cursor-grab touch-none active:cursor-grabbing",
            )}
          >
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
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              plan ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
            title={plan ? "Volver a series iguales" : "Personalizar series (pirámide, calentamiento…)"}
            onClick={() => {
              if (plan) setConfirmSimplify(true);
              else onUpdatePlan(i, buildSimplePlan(ej));
            }}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
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

      <AlertDialog open={confirmSimplify} onOpenChange={setConfirmSimplify}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Volver a series iguales?</AlertDialogTitle>
            <AlertDialogDescription>
              Se descartará el plan serie a serie de &quot;{ej.nombre}&quot;. El ejercicio
              pasará a {ej.series_objetivo} series de {formatRepTarget(ej.repes_min, ej.repes_max)} reps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onUpdatePlan(i, null);
                setConfirmSimplify(false);
              }}
            >
              Simplificar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {plan ? (
        <SeriesPlanEditor
          exercise={ej}
          plan={plan}
          onChange={(next) => onUpdatePlan(i, next)}
          onChangeRest={(val) => onUpdateField(i, "descanso", val)}
        />
      ) : (
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
      )}
    </div>
  );
}

/**
 * Editor del plan serie a serie: pirámides, calentamientos, dropsets y AMRAP.
 * Solo se muestra cuando el ejercicio está en modo avanzado (`series_plan`).
 */
function SeriesPlanEditor({
  exercise: ej,
  plan,
  onChange,
  onChangeRest,
}: {
  exercise: RoutineExerciseFormData;
  plan: RoutineSetPlan[];
  onChange: (plan: RoutineSetPlan[]) => void;
  onChangeRest: (seconds: number) => void;
}) {
  const isStrength = ej.registro_series === "peso_reps";

  const updateSet = (index: number, patch: Partial<RoutineSetPlan>) => {
    onChange(plan.map((s, idx) => (idx === index ? { ...s, ...patch } : s)));
  };

  const addSet = () => {
    const last = plan.length ? plan[plan.length - 1] : blankSetPlan(ej, 0);
    onChange(reindexPlan([...plan, { ...last, id: undefined, orden: plan.length }]));
  };

  const removeSet = (index: number) => {
    if (plan.length <= 1) return;
    onChange(reindexPlan(plan.filter((_, idx) => idx !== index)));
  };

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground mr-1">Plantillas:</span>
        {PLAN_PRESETS.map((preset) => (
          <Button
            key={preset.key}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-2.5 text-xs font-normal"
            title={preset.description}
            onClick={() => onChange(applyPlanPreset(preset.key as PlanPresetKey, plan, ej))}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2.5">
        {plan.map((s, idx) => (
          <div
            key={s.id ?? idx}
            className={cn(
              "space-y-1.5 rounded-md border p-2",
              s.tipo_serie === "calentamiento"
                ? "border-dashed border-border bg-muted/30"
                : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                {idx + 1}
              </span>
              <Select
                value={s.tipo_serie}
                onValueChange={(val) => {
                  const tipo = val as TipoSerie;
                  updateSet(idx, {
                    tipo_serie: tipo,
                    // AMRAP = rango abierto por definición.
                    ...(tipo === "amrap" ? { repes_max: null } : {}),
                    // Un dropset se encadena sin descanso.
                    ...(tipo === "dropset" ? { descanso: 0 } : {}),
                  });
                }}
              >
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERIE.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {tipoSerieLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={plan.length <= 1}
                title="Quitar serie"
                onClick={() => removeSet(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {isStrength ? (
                <>
                  <RepTargetInput
                    label="Reps"
                    min={s.repes_min}
                    max={s.repes_max}
                    onChange={(next) => updateSet(idx, next)}
                  />
                  <PlanNumberInput
                    label="RIR"
                    value={s.rir}
                    placeholder="—"
                    onChange={(v) => updateSet(idx, { rir: v })}
                  />
                  <PlanNumberInput
                    label="Peso (kg)"
                    value={s.peso_objetivo_kg}
                    placeholder="—"
                    step="0.5"
                    onChange={(v) => updateSet(idx, { peso_objetivo_kg: v })}
                  />
                </>
              ) : (
                <>
                  <PlanNumberInput
                    label="Tiempo (s)"
                    value={s.duracion_objetivo_seg}
                    placeholder="—"
                    onChange={(v) => updateSet(idx, { duracion_objetivo_seg: v })}
                  />
                  {ej.registro_series === "duracion_ritmo" ? (
                    <PlanNumberInput
                      label="Ritmo (s/km)"
                      value={s.ritmo_objetivo_seg_km}
                      placeholder="300"
                      onChange={(v) => updateSet(idx, { ritmo_objetivo_seg_km: v })}
                    />
                  ) : (
                    <div />
                  )}
                  <div />
                </>
              )}
              <PlanRestInput
                value={s.descanso}
                fallback={ej.descanso}
                onChange={(v) => updateSet(idx, { descanso: v })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={addSet}
        >
          + Añadir serie
        </Button>
        <div className="min-w-0">
          <RestTimeInput value={ej.descanso} onChange={onChangeRest} label="Descanso base" />
        </div>
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">
        Las series de calentamiento no cuentan para volumen, carga ni XP.
      </p>
    </div>
  );
}

/** Rango de reps como texto: "8-12", "8+" (abierto) o "10". */
function RepTargetInput({
  label,
  min,
  max,
  onChange,
}: {
  label: string;
  min: number | null;
  max: number | null;
  onChange: (next: { repes_min: number | null; repes_max: number | null }) => void;
}) {
  const [draft, setDraft] = useState(() => formatRepTarget(min, max));

  useEffect(() => {
    setDraft(formatRepTarget(min, max));
  }, [min, max]);

  const commit = () => {
    const parsed = parseRepTarget(draft);
    if (!parsed) {
      setDraft(formatRepTarget(min, max));
      return;
    }
    onChange({ repes_min: parsed.min, repes_max: parsed.max });
    setDraft(formatRepTarget(parsed.min, parsed.max));
  };

  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        value={draft}
        inputMode="numeric"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        className="h-9 px-2 text-center text-sm"
        placeholder="8-12"
      />
    </div>
  );
}

function PlanNumberInput({
  label,
  value,
  placeholder,
  step,
  onChange,
}: {
  label: string;
  value: number | null;
  placeholder?: string;
  step?: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        step={step}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        className="h-9 px-2 text-center text-sm"
      />
    </div>
  );
}

/** Descanso de una serie; vacío = hereda el del ejercicio. */
function PlanRestInput({
  value,
  fallback,
  onChange,
}: {
  value: number | null;
  fallback: number;
  onChange: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(() => (value == null ? "" : formatMSS(value)));

  useEffect(() => {
    setDraft(value == null ? "" : formatMSS(value));
  }, [value]);

  const commit = () => {
    if (draft.trim() === "") {
      onChange(null);
      return;
    }
    const parsed = parseMSS(draft);
    if (parsed == null) {
      setDraft(value == null ? "" : formatMSS(value));
      return;
    }
    onChange(parsed);
    setDraft(formatMSS(parsed));
  };

  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">Descanso</Label>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        className="h-9 px-2 text-center text-sm"
        placeholder={formatMSS(fallback)}
      />
    </div>
  );
}

/** M:SS rest time input */
function RestTimeInput({
  value,
  onChange,
  label = "Descanso",
}: {
  value: number;
  onChange: (seconds: number) => void;
  label?: string;
}) {
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
      <Label className="text-xs text-muted-foreground">{label}</Label>
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
