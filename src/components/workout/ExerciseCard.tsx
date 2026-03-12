import { forwardRef, useState } from "react";
import { useLastPerformance } from "@/hooks/useLastPerformance";
import { useRestTimerContext } from "@/components/workout/RestTimerProvider";
import { formatMSS } from "@/hooks/useRestTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Trash2, Plus, Info, Timer, GripVertical, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

interface ExerciseCardProps {
  exercise: ExerciseFormData;
  exerciseIndex: number;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number) => void;
  onAutoSaveSet?: (setIndex: number) => void;
  onSetCompleted?: (setIndex: number, completed: boolean) => void;
  dragHandleProps?: Record<string, any>;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onAutoSaveSet,
  onSetCompleted,
  dragHandleProps,
}: ExerciseCardProps) {
  const { data: lastPerf } = useLastPerformance(exercise.tipo_ejercicio_id);
  const timer = useRestTimerContext();
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const [confirmDeleteSet, setConfirmDeleteSet] = useState<number | null>(null);

  const restSeconds = exercise.descanso ?? 120;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div {...dragHandleProps} className="cursor-grab touch-none active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">{exercise.nombre}</h3>
          {exercise.targetRir != null && (
            <Badge variant="secondary" className="text-xs gap-1">
              🎯 Meta RIR: {exercise.targetRir}
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

      {/* Previous session history */}
      {lastPerf ? (
        <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Sesión anterior ({lastPerf.fecha ? new Date(lastPerf.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lastPerf.sets.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                S{s.numero_serie}: {s.peso_kg}kg × {s.repeticiones}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <span>💪</span>
          <span>¡Primer registro! Dale duro</span>
        </div>
      )}

      {/* Sets header: # | Hecho | Reps | Peso | delete */}
      <div className="grid grid-cols-[2rem_2.5rem_1fr_1fr_2rem] gap-2 text-xs text-muted-foreground px-1 items-center">
        <span>#</span>
        <span className="mr-2 flex justify-center">Hecho</span>
        <span>Reps</span>
        <span>Peso (kg)</span>
        <span />
      </div>

      {exercise.sets.map((s, si) => (
        <div key={si} className="grid grid-cols-[2rem_2.5rem_1fr_1fr_2rem] gap-2 items-center">
          <span className="text-sm text-muted-foreground text-left">{si + 1}</span>
          <div className="flex items-center justify-center justify-self-center">
            {onSetCompleted ? (
              <Button
                variant={s.completed ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onSetCompleted(si, !s.completed)}
                title={s.completed ? "Marcar como no hecho" : "Marcar serie hecha e iniciar descanso"}
              >
                {s.completed ? <Check className="h-4 w-4" /> : null}
              </Button>
            ) : (
              <span className="text-muted-foreground text-xs">{s.completed ? "✓" : "—"}</span>
            )}
          </div>
          <Input
            type="number"
            min={0}
            value={s.repeticiones || ""}
            onChange={(e) => onUpdateSet(si, "repeticiones", Number(e.target.value))}
            onBlur={() => onAutoSaveSet?.(si)}
            className="h-11"
            placeholder={exercise.repRange || "0"}
          />
          <Input
            type="number"
            min={0}
            step={0.5}
            value={s.peso_kg || ""}
            onChange={(e) => onUpdateSet(si, "peso_kg", Number(e.target.value))}
            onBlur={() => onAutoSaveSet?.(si)}
            className="h-11"
            placeholder="0"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmDeleteSet(si)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onAddSet}
      >
        <Plus className="h-4 w-4 mr-1" /> Agregar Serie
      </Button>

      {/* Floating timer display */}
      {timer.activeKey?.startsWith(`${exerciseIndex}-`) && (timer.isRunning || timer.finished) && (
        <div className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-mono ${
          timer.finished
            ? "bg-green-500/10 text-green-500 border border-green-500/30"
            : "bg-primary/10 text-primary border border-primary/30"
        }`}>
          <Timer className="h-4 w-4" />
          {timer.finished ? "¡Listo!" : formatMSS(timer.remaining)}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs ml-2"
            onClick={() => timer.stop()}
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Confirm delete exercise */}
      <AlertDialog open={confirmDeleteExercise} onOpenChange={setConfirmDeleteExercise}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{exercise.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminarán todas las series de este ejercicio.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onRemoveExercise}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete set */}
      <AlertDialog open={confirmDeleteSet !== null} onOpenChange={(open) => !open && setConfirmDeleteSet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar serie {confirmDeleteSet !== null ? confirmDeleteSet + 1 : ""}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDeleteSet !== null) onRemoveSet(confirmDeleteSet); setConfirmDeleteSet(null); }}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
