import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import { useRoutineById } from "@/hooks/useRoutines";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Loader2, Search, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoutineExerciseFormData } from "@/types/routine";

interface RoutineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId?: string | null;
}

export function RoutineForm({ open, onOpenChange, routineId = null }: RoutineFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: catalog } = useExerciseCatalog();
  const { data: existingRoutine } = useRoutineById(routineId);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ejercicios, setEjercicios] = useState<RoutineExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isEdit = !!routineId;

  useEffect(() => {
    if (isEdit && existingRoutine && open) {
      setNombre(existingRoutine.nombre);
      setDescripcion(existingRoutine.descripcion || "");
      setEjercicios(
        existingRoutine.ejercicios.map((ej) => ({
          tipo_ejercicio_id: ej.tipo_ejercicio_id,
          nombre: ej.tipo_ejercicio.nombre,
          series_objetivo: ej.series_objetivo,
          repes_min: ej.repes_min,
          repes_max: ej.repes_max,
          orden: ej.orden,
        }))
      );
    }
  }, [isEdit, existingRoutine, open]);

  useEffect(() => {
    if (open && !isEdit) {
      setNombre("");
      setDescripcion("");
      setEjercicios([]);
    }
  }, [open, isEdit]);

  const addExercise = (tipoId: string, nombre: string) => {
    setEjercicios((prev) => [
      ...prev,
      { tipo_ejercicio_id: tipoId, nombre, series_objetivo: 3, repes_min: 8, repes_max: 12, orden: prev.length },
    ]);
    setPickerOpen(false);
  };

  const removeExercise = (index: number) => {
    setEjercicios((prev) => prev.filter((_, i) => i !== index).map((ej, i) => ({ ...ej, orden: i })));
  };

  const updateExercise = (index: number, field: keyof RoutineExerciseFormData, value: number) => {
    setEjercicios((prev) =>
      prev.map((ej, i) => (i === index ? { ...ej, [field]: value } : ej))
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

        // Delete old exercises (cascade not needed since we delete directly)
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
        tipo_ejercicio_id: ej.tipo_ejercicio_id,
        series_objetivo: ej.series_objetivo,
        repes_min: ej.repes_min,
        repes_max: ej.repes_max,
        orden: i,
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto rounded-t-2xl p-0">
        <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">
              {isEdit ? "Editar Rutina" : "Nueva Rutina"}
            </SheetTitle>
            <Button onClick={handleSave} disabled={saving} size="sm">
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

          <div className="space-y-4">
            {ejercicios.map((ej, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{ej.nombre}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeExercise(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Series</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ej.series_objetivo}
                      onChange={(e) => updateExercise(i, "series_objetivo", Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Reps mín</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ej.repes_min}
                      onChange={(e) => updateExercise(i, "repes_min", Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Reps máx</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ej.repes_max}
                      onChange={(e) => updateExercise(i, "repes_max", Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12">
                  <Search className="h-4 w-4 mr-2" /> Agregar Ejercicio
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar ejercicio..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
                    <CommandGroup>
                      {catalog?.map((tipo) => (
                        <CommandItem
                          key={tipo.id}
                          value={tipo.nombre}
                          onSelect={() => addExercise(tipo.id, tipo.nombre)}
                          className="cursor-pointer"
                        >
                          {tipo.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
