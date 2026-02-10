import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

interface WorkoutLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkoutLogger({ open, onOpenChange }: WorkoutLoggerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: catalog } = useExerciseCatalog();

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);

  const addExercise = (tipoId: string, nombre: string) => {
    setExercises((prev) => [
      ...prev,
      { tipo_ejercicio_id: tipoId, nombre, sets: [{ repeticiones: 0, peso_kg: 0 }] },
    ]);
    setExercisePickerOpen(false);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: [...ex.sets, { repeticiones: 0, peso_kg: 0 }] }
          : ex
      )
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetFormData,
    value: number
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const handleSave = async () => {
    if (!user || !titulo.trim() || exercises.length === 0) {
      toast({ title: "Completa el formulario", description: "Agrega título y al menos un ejercicio.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // 1. Create actividad
      const { data: actividad, error: actError } = await supabase
        .from("actividad")
        .insert({ titulo: titulo.trim(), fecha: new Date(fecha).toISOString(), usuario_id: user.id })
        .select("id")
        .single();

      if (actError) throw actError;

      // 2. Create ejercicios
      const ejercicioInserts = exercises.map((ex) => ({
        actividad_id: actividad.id,
        tipo_ejercicio_id: ex.tipo_ejercicio_id,
        usuario_id: user.id,
      }));

      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .insert(ejercicioInserts)
        .select("id");

      if (ejError) throw ejError;

      // 3. Create series
      const serieInserts = exercises.flatMap((ex, i) =>
        ex.sets.map((s, si) => ({
          ejercicio_id: ejercicios[i].id,
          usuario_id: user.id,
          numero_serie: si + 1,
          repeticiones: s.repeticiones,
          peso_kg: s.peso_kg,
        }))
      );

      if (serieInserts.length > 0) {
        const { error: sError } = await supabase.from("serie").insert(serieInserts);
        if (sError) throw sError;
      }

      toast({ title: "¡Entrenamiento guardado!" });
      queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyWorkouts"] });
      queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });

      // Reset
      setTitulo("");
      setFecha(new Date().toISOString().slice(0, 10));
      setExercises([]);
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
            <SheetTitle className="text-lg">Nuevo Entrenamiento</SheetTitle>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Title & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Ej: Día de Pierna"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            {exercises.map((ex, ei) => (
              <div key={ei} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{ex.nombre}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeExercise(ei)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sets header */}
                <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs text-muted-foreground px-1">
                  <span>#</span>
                  <span>Reps</span>
                  <span>Peso (kg)</span>
                  <span />
                </div>

                {ex.sets.map((s, si) => (
                  <div key={si} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center">
                    <span className="text-sm text-muted-foreground text-center">{si + 1}</span>
                    <Input
                      type="number"
                      min={0}
                      value={s.repeticiones || ""}
                      onChange={(e) =>
                        updateSet(ei, si, "repeticiones", Number(e.target.value))
                      }
                      className="h-11"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={s.peso_kg || ""}
                      onChange={(e) =>
                        updateSet(ei, si, "peso_kg", Number(e.target.value))
                      }
                      className="h-11"
                      placeholder="0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSet(ei, si)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => addSet(ei)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar Serie
                </Button>
              </div>
            ))}

            {/* Add Exercise Button */}
            <Popover open={exercisePickerOpen} onOpenChange={setExercisePickerOpen}>
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
