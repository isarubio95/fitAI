import { useLastPerformance } from "@/hooks/useLastPerformance";
import { useRestTimerContext } from "@/components/workout/RestTimerProvider";
import { formatMSS } from "@/hooks/useRestTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Info, Play, Square, Timer } from "lucide-react";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

interface ExerciseCardProps {
  exercise: ExerciseFormData;
  exerciseIndex: number;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number) => void;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: ExerciseCardProps) {
  const { data: lastPerf } = useLastPerformance(exercise.tipo_ejercicio_id);
  const timer = useRestTimerContext();

  const restSeconds = exercise.descanso ?? 120;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
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
          onClick={onRemoveExercise}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Ghost set - previous performance */}
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
      <div className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 text-xs text-muted-foreground px-1">
        <span>#</span>
        <span>Reps</span>
        <span>Peso (kg)</span>
        <span />
        <span />
      </div>

      {exercise.sets.map((s, si) => {
        const timerKey = `${exerciseIndex}-${si}`;
        const isActive = timer.activeKey === timerKey;
        const isRunning = isActive && timer.isRunning;
        const isFinished = isActive && timer.finished;

        return (
          <div key={si} className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 items-center">
            <span className="text-sm text-muted-foreground text-center">{si + 1}</span>
            <Input
              type="number"
              min={0}
              value={s.repeticiones || ""}
              onChange={(e) => onUpdateSet(si, "repeticiones", Number(e.target.value))}
              className="h-11"
              placeholder={exercise.repRange || "0"}
            />
            <Input
              type="number"
              min={0}
              step={0.5}
              value={s.peso_kg || ""}
              onChange={(e) => onUpdateSet(si, "peso_kg", Number(e.target.value))}
              className="h-11"
              placeholder="0"
            />
            {/* Timer button */}
            {isRunning ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary font-mono text-xs p-0"
                onClick={() => timer.stop()}
                title="Detener"
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isFinished ? "text-green-500" : "text-muted-foreground hover:text-primary"}`}
                onClick={() => timer.start(timerKey, restSeconds)}
                title={`Descanso ${formatMSS(restSeconds)}`}
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveSet(si)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}

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
    </div>
  );
}
