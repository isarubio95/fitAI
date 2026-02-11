import { useLastPerformance } from "@/hooks/useLastPerformance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Info } from "lucide-react";
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
      <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs text-muted-foreground px-1">
        <span>#</span>
        <span>Reps</span>
        <span>Peso (kg)</span>
        <span />
      </div>

      {exercise.sets.map((s, si) => (
        <div key={si} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center">
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemoveSet(si)}
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
    </div>
  );
}
