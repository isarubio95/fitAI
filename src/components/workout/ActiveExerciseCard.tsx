import { useState, useCallback } from "react";
import { useLastPerformance } from "@/hooks/useLastPerformance";
import { useRestTimerContext } from "@/components/workout/RestTimerProvider";
import { formatMSS } from "@/hooks/useRestTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Trash2, Plus, Info, Timer } from "lucide-react";
import type { ActiveEjercicio, ActiveSerie } from "@/hooks/useActiveWorkout";

interface ActiveExerciseCardProps {
  exercise: ActiveEjercicio;
  exerciseIndex: number;
  restSeconds?: number;
  targetRir?: number | null;
  repRange?: string;
  onAddSet: () => void;
  onDeleteSet: (serieId: string) => void;
  onDeleteExercise: () => void;
  onUpdateSetField: (serieId: string, field: string, value: number) => void;
  onToggleCompleted: (serieId: string, completed: boolean) => void;
}

export function ActiveExerciseCard({
  exercise,
  exerciseIndex,
  restSeconds = 120,
  targetRir,
  repRange,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  onUpdateSetField,
  onToggleCompleted,
}: ActiveExerciseCardProps) {
  const { data: lastPerf } = useLastPerformance(exercise.tipo_ejercicio_id);
  const timer = useRestTimerContext();
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const [confirmDeleteSet, setConfirmDeleteSet] = useState<string | null>(null);

  // Local input state for controlled inputs with auto-save on blur
  const [localValues, setLocalValues] = useState<Record<string, { reps: string; peso: string }>>({});

  const getLocalValue = useCallback((serie: ActiveSerie) => {
    if (localValues[serie.id]) return localValues[serie.id];
    return {
      reps: serie.repeticiones ? String(serie.repeticiones) : "",
      peso: serie.peso_kg ? String(serie.peso_kg) : "",
    };
  }, [localValues]);

  const handleLocalChange = (serieId: string, field: "reps" | "peso", value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [serieId]: {
        ...prev[serieId] || { reps: "", peso: "" },
        [field]: value,
      },
    }));
  };

  const handleBlur = (serieId: string, field: "reps" | "peso") => {
    const val = localValues[serieId]?.[field];
    if (val === undefined) return;
    const numVal = Number(val) || 0;
    const dbField = field === "reps" ? "repeticiones" : "peso_kg";
    onUpdateSetField(serieId, dbField, numVal);
  };

  const handleCheckboxChange = (serie: ActiveSerie) => {
    const newCompleted = !serie.completed;
    onToggleCompleted(serie.id, newCompleted);
    // Trigger rest timer when completing a set
    if (newCompleted) {
      const timerKey = `${exerciseIndex}-${serie.numero_serie}`;
      timer.start(timerKey, restSeconds);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{exercise.tipo_ejercicio.nombre}</h3>
          {targetRir != null && (
            <Badge variant="secondary" className="text-xs gap-1">
              🎯 Meta RIR: {targetRir}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1">
            <Timer className="h-3 w-3" />
            {formatMSS(restSeconds)}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => setConfirmDeleteExercise(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Ghost set */}
      {lastPerf && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            Última vez: {lastPerf.peso_kg}kg × {lastPerf.repeticiones} reps
            {lastPerf.rir != null && ` (RIR ${lastPerf.rir})`}
          </span>
        </div>
      )}

      {/* Sets header */}
      <div className="grid grid-cols-[2rem_2rem_1fr_1fr_2rem] gap-2 text-xs text-muted-foreground px-1">
        <span>✓</span>
        <span>#</span>
        <span>Reps</span>
        <span>Peso (kg)</span>
        <span />
      </div>

      {exercise.series.map((serie) => {
        const local = getLocalValue(serie);
        const timerKey = `${exerciseIndex}-${serie.numero_serie}`;
        const isActive = timer.activeKey === timerKey;

        return (
          <div
            key={serie.id}
            className={`grid grid-cols-[2rem_2rem_1fr_1fr_2rem] gap-2 items-center transition-colors ${
              serie.completed ? "bg-green-500/5 rounded-lg" : ""
            }`}
          >
            {/* Checkbox */}
            <div className="flex justify-center">
              <Checkbox
                checked={serie.completed}
                onCheckedChange={() => handleCheckboxChange(serie)}
                className={serie.completed ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" : ""}
              />
            </div>

            <span className="text-sm text-muted-foreground text-center">{serie.numero_serie}</span>

            <Input
              type="number"
              min={0}
              value={local.reps}
              onChange={(e) => handleLocalChange(serie.id, "reps", e.target.value)}
              onBlur={() => handleBlur(serie.id, "reps")}
              className="h-11"
              placeholder={repRange || "0"}
            />
            <Input
              type="number"
              min={0}
              step={0.5}
              value={local.peso}
              onChange={(e) => handleLocalChange(serie.id, "peso", e.target.value)}
              onBlur={() => handleBlur(serie.id, "peso")}
              className="h-11"
              placeholder="0"
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDeleteSet(serie.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}

      <Button variant="outline" size="sm" className="w-full" onClick={onAddSet}>
        <Plus className="h-4 w-4 mr-1" /> Agregar Serie
      </Button>

      {/* Timer display */}
      {timer.activeKey?.startsWith(`${exerciseIndex}-`) && (timer.isRunning || timer.finished) && (
        <div className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-mono ${
          timer.finished
            ? "bg-green-500/10 text-green-500 border border-green-500/30"
            : "bg-primary/10 text-primary border border-primary/30"
        }`}>
          <Timer className="h-4 w-4" />
          {timer.finished ? "¡Listo!" : formatMSS(timer.remaining)}
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs ml-2" onClick={() => timer.stop()}>
            Cerrar
          </Button>
        </div>
      )}

      {/* Confirm delete exercise */}
      <AlertDialog open={confirmDeleteExercise} onOpenChange={setConfirmDeleteExercise}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{exercise.tipo_ejercicio.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminarán todas las series de este ejercicio.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteExercise}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete set */}
      <AlertDialog open={confirmDeleteSet !== null} onOpenChange={(open) => !open && setConfirmDeleteSet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta serie?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDeleteSet) onDeleteSet(confirmDeleteSet); setConfirmDeleteSet(null); }}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
