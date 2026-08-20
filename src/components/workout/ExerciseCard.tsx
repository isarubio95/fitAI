import { useContext, useState } from "react";
import { DrawerInContentContext } from "@/components/ui/drawer";
import { useLastPerformance } from "@/hooks/useLastPerformance";
import { formatMSS } from "@/hooks/useRestTimer";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { SetValueInput } from "./SetValueInput";
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
import { Trash2, Plus, Info, Timer, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ExerciseFormData,
  type SetFormData,
  normalizeRegistroSeries,
  formatRitmoSegKmLabel,
} from "@/types/workout";
import { ActiveWorkoutCheckbox } from "./ActiveWorkoutCheckbox";
import { SwipeToDeleteRow } from "./SwipeToDeleteRow";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

interface ExerciseCardProps {
  exercise: ExerciseFormData;
  exerciseIndex: number;
  isInSuperset?: boolean;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number | null) => void;
  onAutoSaveSet?: (setIndex: number) => void;
  onSetCompleted?: (setIndex: number, completed: boolean) => void;
  dragHandleProps?: DraggableSyntheticListeners & Partial<DraggableAttributes>;
  onViewExerciseDetails?: (exercise: ExerciseFormData) => void;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  isInSuperset,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onAutoSaveSet,
  onSetCompleted,
  dragHandleProps,
  onViewExerciseDetails,
}: ExerciseCardProps) {
  const { data: lastPerf } = useLastPerformance({
    tipo_ejercicio_id: exercise.tipo_ejercicio_id,
    usuario_ejercicio_id: exercise.usuario_ejercicio_id,
  });
  const mode = normalizeRegistroSeries(exercise.registro_series);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);

  const restSeconds = exercise.descanso ?? 120;

  /** Misma base visual que el badge de descanso (outline + borde tema). */
  const headerMetaBadgeClass = "gap-1";

  const inDrawer = useContext(DrawerInContentContext);
  const surfaceBg = inDrawer && isInSuperset ? "bg-primary/5" : "bg-card";
  const wrapperClass = cn(
    "space-y-3",
    inDrawer
      ? cn("p-6", surfaceBg)
      : cn("rounded-xl border border-border bg-card p-4"),
  );

  const setDoneControl = (s: SetFormData, si: number) => (
    <div className="flex items-center justify-center justify-self-center mr-4">
      {onSetCompleted ? (
        <ActiveWorkoutCheckbox
          checked={!!s.completed}
          onChange={(next) => onSetCompleted(si, next)}
          title={s.completed ? "Marcar como no hecho" : "Marcar serie hecha e iniciar descanso"}
          size={32}
        />
      ) : (
        <span className="text-muted-foreground text-xs">{s.completed ? "✓" : "—"}</span>
      )}
    </div>
  );

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div {...dragHandleProps} className="cursor-grab touch-none active:cursor-grabbing shrink-0">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="truncate text-sm font-semibold">{exercise.nombre}</h3>
          {onViewExerciseDetails && (
            <button
              type="button"
              title="Ver cómo se hace este ejercicio"
              onClick={() => onViewExerciseDetails(exercise)}
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
          {exercise.targetRir != null && (
            <Badge variant="outline" className={cn("text-xs", headerMetaBadgeClass)}>
              🎯 RIR: {exercise.targetRir}
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-xs", headerMetaBadgeClass)}>
            <Timer className="h-3 w-3" />
            {formatMSS(restSeconds)}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-destructive"
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
            {lastPerf.sets.map((s, i) => {
              const seg = s.duracion_seg != null && s.duracion_seg > 0;
              const pace = s.ritmo_seg_km;
              const txt =
                mode === "duracion_ritmo" || (seg && pace != null && pace > 0)
                  ? `S${s.numero_serie}: ${s.duracion_seg ?? 0}s · ${formatRitmoSegKmLabel(pace ?? null)}`
                  : seg
                    ? `S${s.numero_serie}: ${s.duracion_seg}s`
                    : `S${s.numero_serie}: ${s.peso_kg}kg × ${s.repeticiones}`;
              return (
                <Badge key={i} variant="secondary" className="text-xs font-normal">
                  {txt}
                </Badge>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <span>💪</span>
          <span>¡Primer registro! Dale duro</span>
        </div>
      )}

      {mode === "peso_reps" ? (
        <>
          <div className="grid grid-cols-[2rem_2.5rem_1fr_1fr] gap-2 text-xs text-muted-foreground px-1 items-center">
            <span>#</span>
            <span className="mr-4 flex justify-center">Hecho</span>
            <span>Reps</span>
            <span>Peso (kg)</span>
          </div>
          {exercise.sets.map((s, si) => (
            <SwipeToDeleteRow
              key={s.id ?? si}
              label={`serie ${si + 1}`}
              onDelete={() => onRemoveSet(si)}
              className={cn("px-1", surfaceBg)}
            >
              <div className="grid grid-cols-[2rem_2.5rem_1fr_1fr] gap-2 items-center">
                <span className="text-sm text-muted-foreground text-left">{si + 1}</span>
                {setDoneControl(s, si)}
                <SetValueInput
                  field="repeticiones"
                  value={s.repeticiones}
                  onValueChange={(v) => onUpdateSet(si, "repeticiones", v ?? 0)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11"
                  placeholder={exercise.repRange || "0"}
                />
                <SetValueInput
                  field="peso_kg"
                  value={s.peso_kg}
                  allowDecimal
                  onValueChange={(v) => onUpdateSet(si, "peso_kg", v ?? 0)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11"
                  placeholder="0"
                />
              </div>
            </SwipeToDeleteRow>
          ))}
        </>
      ) : mode === "duracion" ? (
        <>
          <div className="grid grid-cols-[2rem_2.5rem_1fr] gap-2 text-xs text-muted-foreground px-1 items-center">
            <span>#</span>
            <span className="mr-4 flex justify-center">Hecho</span>
            <span>Segundos</span>
          </div>
          {exercise.sets.map((s, si) => (
            <SwipeToDeleteRow
              key={s.id ?? si}
              label={`serie ${si + 1}`}
              onDelete={() => onRemoveSet(si)}
              className={cn("px-1", surfaceBg)}
            >
              <div className="grid grid-cols-[2rem_2.5rem_1fr] gap-2 items-center">
                <span className="text-sm text-muted-foreground text-left">{si + 1}</span>
                {setDoneControl(s, si)}
                <SetValueInput
                  field="duracion_seg"
                  value={s.duracion_seg}
                  emptyAs="null"
                  onValueChange={(v) => onUpdateSet(si, "duracion_seg", v)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11"
                  placeholder="s"
                />
              </div>
            </SwipeToDeleteRow>
          ))}
        </>
      ) : (
        <>
          <div className="grid grid-cols-[2rem_2.5rem_1fr_1fr] gap-2 text-xs text-muted-foreground px-1 items-center">
            <span>#</span>
            <span className="mr-4 flex justify-center">Hecho</span>
            <span>Tiempo (s)</span>
            <span>Ritmo (s/km)</span>
          </div>
          <p className="text-[10px] text-muted-foreground px-1 -mt-1">
            Ritmo en segundos por km (ej. 300 = 5:00/km)
          </p>
          {exercise.sets.map((s, si) => (
            <SwipeToDeleteRow
              key={s.id ?? si}
              label={`serie ${si + 1}`}
              onDelete={() => onRemoveSet(si)}
              className={cn("px-1", surfaceBg)}
            >
              <div className="grid grid-cols-[2rem_2.5rem_1fr_1fr] gap-2 items-center">
                <span className="text-sm text-muted-foreground text-left">{si + 1}</span>
                {setDoneControl(s, si)}
                <SetValueInput
                  field="duracion_seg"
                  value={s.duracion_seg}
                  emptyAs="null"
                  onValueChange={(v) => onUpdateSet(si, "duracion_seg", v)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11"
                  placeholder="s"
                />
                <SetValueInput
                  field="ritmo_seg_km"
                  value={s.ritmo_seg_km}
                  emptyAs="null"
                  min={1}
                  onValueChange={(v) => onUpdateSet(si, "ritmo_seg_km", v)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11"
                  placeholder="300"
                />
              </div>
            </SwipeToDeleteRow>
          ))}
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onAddSet}
      >
        <Plus className="h-4 w-4 mr-1" /> Agregar Serie
      </Button>
      {/* El contador de descanso se muestra como pill dentro del Entrenamiento Activo */}

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
    </div>
  );
}
