import { useState, useEffect, useCallback, useRef } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { Trash2, Loader2, GripVertical, Link, Unlink } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { useToast } from "@/hooks/use-toast";
import type { RoutineExerciseFormData } from "@/types/routine";
import { type RegistroSeries, normalizeRegistroSeries } from "@/types/workout";

interface RoutineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId?: string | null;
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

export function RoutineForm({ open, onOpenChange, routineId = null }: RoutineFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: existingRoutine } = useRoutineById(routineId);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ejercicios, setEjercicios] = useState<RoutineExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // When linking a superset, we store the index + generated superset_id
  const [supersetLink, setSupersetLink] = useState<{ afterIndex: number; supersetId: string } | null>(null);

  const isEdit = !!routineId;

  useEffect(() => {
    if (isEdit && existingRoutine && open) {
      setNombre(existingRoutine.nombre);
      setDescripcion(existingRoutine.descripcion || "");
      setEjercicios(
        existingRoutine.ejercicios.map((ej) => ({
          tipo_ejercicio_id: (ej as any).tipo_ejercicio_id ?? undefined,
          usuario_ejercicio_id: (ej as any).usuario_ejercicio_id ?? undefined,
          nombre: ej.tipo_ejercicio.nombre,
          series_objetivo: ej.series_objetivo,
          repes_min: ej.repes_min,
          repes_max: ej.repes_max,
          rir: (ej as any).rir ?? 1,
          orden: ej.orden,
          superset_id: (ej as any).superset_id ?? null,
          descanso: (ej as any).descanso ?? 120,
          registro_series: normalizeRegistroSeries((ej as any).registro_series),
          duracion_objetivo_seg: (ej as any).duracion_objetivo_seg ?? null,
          ritmo_objetivo_seg_km: (ej as any).ritmo_objetivo_seg_km ?? null,
        }))
      );
    }
  }, [isEdit, existingRoutine, open]);

  useEffect(() => {
    if (open && !isEdit) {
      setNombre("");
      setDescripcion("");
      setEjercicios([]);
      setSupersetLink(null);
    }
  }, [open, isEdit]);

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
      prev.map((ej, i) => {
        if (i !== index) return ej;
        const next = { ...ej, [field]: value } as RoutineExerciseFormData;
        if (field === "registro_series") {
          if (value === "duracion") {
            next.duracion_objetivo_seg = next.duracion_objetivo_seg ?? 45;
            next.ritmo_objetivo_seg_km = null;
          } else if (value === "duracion_ritmo") {
            next.duracion_objetivo_seg = next.duracion_objetivo_seg ?? 600;
            next.ritmo_objetivo_seg_km = next.ritmo_objetivo_seg_km ?? 300;
          } else {
            next.duracion_objetivo_seg = null;
            next.ritmo_objetivo_seg_km = null;
          }
        }
        return next;
      })
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
          .update({ nombre: nombre.trim(), descripcion: descripcion.trim() || null })
          .eq("id", routineId);
        if (error) throw error;
        rutinaId = routineId;
        await supabase.from("rutina_ejercicio").delete().eq("rutina_id", routineId);
      } else {
        const { data, error } = await supabase
          .from("rutina")
          .insert({ nombre: nombre.trim(), descripcion: descripcion.trim() || null, usuario_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        rutinaId = data.id;
      }

      const inserts = ejercicios.map((ej, i) => ({
        rutina_id: rutinaId,
        tipo_ejercicio_id: ej.tipo_ejercicio_id ?? null,
        usuario_ejercicio_id: (ej as any).usuario_ejercicio_id ?? null,
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
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const groups = groupExercises(ejercicios);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto rounded-t-[20px] p-0">
        <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">
              {isEdit ? "Editar Rutina" : "Nueva Rutina"}
            </SheetTitle>
            <Button variant="default" onClick={handleSave} disabled={saving} size="sm">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
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
          </div>

          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleRoutineDragEnd}>
            <SortableContext items={ejercicios.map((_, i) => i)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {groups.map((group, gIdx) => {
                  const isSuperset = !!group.supersetId && group.items.length > 1;

                  if (isSuperset) {
                    return (
                      <div key={group.supersetId} className="relative rounded-xl border-2 border-primary/40 bg-primary/5">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                         <div className="px-3 pt-2 pb-1">
                          <span className="text-xs font-medium text-primary">🔗 Superserie</span>
                        </div>
                        <div className="divide-y divide-border">
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
                    />
                  );
                })}

                <ExerciseSelector
                  open={pickerOpen}
                  onOpenChange={(o) => { setPickerOpen(o); if (!o) setSupersetLink(null); }}
                  onSelect={addExercise}
                />
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </SheetContent>
    </Sheet>
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
  dragHandleProps?: Record<string, any>;
}) {
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const wrapperClass = isInSuperset
    ? "p-4 space-y-3"
    : "rounded-xl border border-border bg-card p-4 space-y-3";

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...dragHandleProps} className="cursor-grab touch-none active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-sm">{ej.nombre}</h3>
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
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Registro de series</Label>
          <Select
            value={ej.registro_series}
            onValueChange={(val) => onUpdateField(i, "registro_series", val as RegistroSeries)}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peso_reps">Peso y repeticiones</SelectItem>
              <SelectItem value="duracion">Duración (segundos)</SelectItem>
              <SelectItem value="duracion_ritmo">Duración y ritmo (s/km)</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <SelectItem value="0">0 - Fallo</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
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
