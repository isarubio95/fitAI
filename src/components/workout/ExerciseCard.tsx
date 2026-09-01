import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { DrawerInContentContext } from "@/components/ui/drawer";
import { useLastPerformance, type LastSetData } from "@/hooks/useLastPerformance";
import { useProgressiveOverload } from "@/hooks/useProgressiveOverload";
import { useProgressiveOverloadPreferences } from "@/hooks/useProgressiveOverloadPreferences";
import { OverloadSuggestionBanner } from "./OverloadSuggestion";
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
  setIsUnlogged,
  setCanApplyOverloadPatch,
  formPatchFromLastSet,
  setHasWork,
} from "@/types/workout";
import { formatRepTarget } from "@/lib/seriesPlan";
import { applyOverloadToSet, overloadPatchChangesSet } from "@/lib/progressiveOverload";
import { isWorkingSet, tipoSerieLabel, tipoSerieShort } from "@/lib/setTypes";
import { ActiveWorkoutCheckbox } from "./ActiveWorkoutCheckbox";
import { SwipeToDeleteRow } from "./SwipeToDeleteRow";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { vaulSafeDragHandleProps } from "@/lib/vaulSafeDragHandle";

function formatPreviousSet(
  mode: ReturnType<typeof normalizeRegistroSeries>,
  set: LastSetData | undefined,
): string {
  if (!set) return "—";
  const seg = set.duracion_seg != null && set.duracion_seg > 0;
  const pace = set.ritmo_seg_km;
  if (mode === "duracion_ritmo" || (seg && pace != null && pace > 0)) {
    return `${set.duracion_seg ?? 0}s · ${formatRitmoSegKmLabel(pace ?? null)}`;
  }
  if (mode === "duracion" || seg) return `${set.duracion_seg ?? 0}s`;
  return `${set.peso_kg}x${set.repeticiones}`;
}

const SETS_GRID_TWO_INPUTS =
  "grid w-full grid-cols-[var(--num-col)_var(--anterior-col)_1fr_1fr_2.5rem] gap-2 items-center text-center";
const SETS_GRID_ONE_INPUT =
  "grid w-full grid-cols-[var(--num-col)_var(--anterior-col)_1fr_2.5rem] gap-2 items-center text-center";

interface ExerciseCardProps {
  exercise: ExerciseFormData;
  exerciseIndex: number;
  isInSuperset?: boolean;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number | null) => void;
  onSeedSetFromPrevious?: (setIndex: number, patch: Partial<SetFormData>) => void;
  onApplySuggestionToSet?: (
    setIndex: number,
    patch: Partial<SetFormData>,
    options?: { revert?: boolean },
  ) => void;
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
  onSeedSetFromPrevious,
  onApplySuggestionToSet,
  onAutoSaveSet,
  onSetCompleted,
  dragHandleProps,
  onViewExerciseDetails,
}: ExerciseCardProps) {
  const { data: lastPerf } = useLastPerformance({
    tipo_ejercicio_id: exercise.tipo_ejercicio_id,
    usuario_ejercicio_id: exercise.usuario_ejercicio_id,
  });
  const { enabled: overloadSuggestionsEnabled } = useProgressiveOverloadPreferences();
  const overloadSuggestion = useProgressiveOverload(exercise, {
    enabled: overloadSuggestionsEnabled,
  });
  const mode = normalizeRegistroSeries(exercise.registro_series);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const [overloadApplied, setOverloadApplied] = useState(false);
  const [overloadFlash, setOverloadFlash] = useState<Record<string, number>>({});
  const overloadSnapshotRef = useRef<
    Array<{
      setIndex: number;
      peso_kg: number;
      repeticiones: number;
      seededFromPrevious?: boolean;
    }>
  >([]);
  const overloadFlashSeq = useRef(0);
  const setsTableRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = setsTableRef.current;
    if (!host) return;

    const measure = () => {
      const fitColumn = (selector: string, property: string, extra = "") => {
        let max = 0;
        host.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          max = Math.max(max, el.scrollWidth);
        });
        if (max > 0) host.style.setProperty(property, extra ? `calc(${Math.ceil(max)}px + ${extra})` : `${Math.ceil(max)}px`);
      };
      fitColumn("[data-num-cell]", "--num-col", "0.25rem");
      fitColumn("[data-anterior-cell]", "--anterior-col");
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    host.querySelectorAll("[data-num-cell], [data-anterior-cell]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [exercise.sets, lastPerf, mode]);

  useEffect(() => {
    if (!onSeedSetFromPrevious) return;
    exercise.sets.forEach((s, si) => {
      if (!setIsUnlogged(s, mode)) return;
      const prev = lastPerf?.sets[si];
      const patch: Partial<SetFormData> = prev ? formPatchFromLastSet(mode, prev) : {};
      // Un peso prescrito en la rutina (pirámide, calentamiento) es una
      // decisión explícita del usuario: gana sobre lo que hizo la última vez.
      if (mode === "peso_reps" && s.objetivo_peso_kg != null) {
        patch.peso_kg = s.objetivo_peso_kg;
      }
      if (!setHasWork({ ...s, ...patch })) return;
      onSeedSetFromPrevious(si, patch);
    });
  }, [exercise.sets, lastPerf, mode, onSeedSetFromPrevious]);

  const flashOverloadFields = (
    entries: Array<{ setIndex: number; field: "repeticiones" | "peso_kg"; from: number; to: number }>,
  ) => {
    const patch: Record<string, number> = {};
    for (const { setIndex, field, from, to } of entries) {
      if (Number(from) === Number(to)) continue;
      overloadFlashSeq.current += 1;
      patch[`${setIndex}:${field}`] = overloadFlashSeq.current;
    }
    if (Object.keys(patch).length === 0) return;
    setOverloadFlash((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyOverload = () => {
    if (!overloadSuggestion || !onApplySuggestionToSet) return;
    const snapshot: typeof overloadSnapshotRef.current = [];
    const flashes: Array<{
      setIndex: number;
      field: "repeticiones" | "peso_kg";
      from: number;
      to: number;
    }> = [];
    const topWeight = Math.max(
      0,
      ...exercise.sets
        .filter((s) => isWorkingSet(s.tipo_serie))
        .map((s) => Number(s.peso_kg) || 0),
    );
    exercise.sets.forEach((s, si) => {
      // La sugerencia es para las series efectivas; un calentamiento no sube.
      if (!isWorkingSet(s.tipo_serie)) return;
      if (!setCanApplyOverloadPatch(s, mode)) return;
      const patch = applyOverloadToSet(s, overloadSuggestion, topWeight);
      if (!overloadPatchChangesSet(s, patch)) return;
      snapshot.push({
        setIndex: si,
        peso_kg: s.peso_kg,
        repeticiones: s.repeticiones,
        seededFromPrevious: s.seededFromPrevious,
      });
      flashes.push(
        { setIndex: si, field: "peso_kg", from: s.peso_kg, to: patch.peso_kg },
        { setIndex: si, field: "repeticiones", from: s.repeticiones, to: patch.repeticiones },
      );
      onApplySuggestionToSet(si, patch);
    });
    if (snapshot.length === 0) return;
    overloadSnapshotRef.current = snapshot;
    setOverloadApplied(true);
    flashOverloadFields(flashes);
  };

  const handleUndoOverload = () => {
    if (!onApplySuggestionToSet || overloadSnapshotRef.current.length === 0) return;
    const flashes: Array<{
      setIndex: number;
      field: "repeticiones" | "peso_kg";
      from: number;
      to: number;
    }> = [];
    overloadSnapshotRef.current.forEach((prev) => {
      if (prev.setIndex >= exercise.sets.length) return;
      const current = exercise.sets[prev.setIndex];
      flashes.push(
        { setIndex: prev.setIndex, field: "peso_kg", from: current.peso_kg, to: prev.peso_kg },
        { setIndex: prev.setIndex, field: "repeticiones", from: current.repeticiones, to: prev.repeticiones },
      );
      onApplySuggestionToSet(
        prev.setIndex,
        {
          peso_kg: prev.peso_kg,
          repeticiones: prev.repeticiones,
          seededFromPrevious: prev.seededFromPrevious,
        },
        { revert: true },
      );
    });
    overloadSnapshotRef.current = [];
    setOverloadApplied(false);
    flashOverloadFields(flashes);
  };

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
    <div className="flex items-center justify-center justify-self-center">
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

  const previousCell = (si: number) => (
    <span data-anterior-cell className="w-max justify-self-center whitespace-nowrap text-xs tracking-wide tabular-nums text-muted-foreground">
      {formatPreviousSet(mode, lastPerf?.sets[si])}
    </span>
  );

  /**
   * Número de serie con marca del tipo cuando no es una serie efectiva
   * (W = calentamiento, D = dropset, A = AMRAP).
   */
  const setNumberCell = (s: SetFormData, si: number, spacing: string) => {
    const short = tipoSerieShort(s.tipo_serie);
    return (
      <span
        data-num-cell
        className={cn(
          spacing,
          "w-max justify-self-start whitespace-nowrap text-left text-sm tabular-nums text-muted-foreground",
        )}
      >
        {si + 1}
        {short ? (
          <span
            title={tipoSerieLabel(s.tipo_serie)}
            className={cn(
              "ml-0.5 align-super text-[9px] font-semibold",
              s.tipo_serie === "calentamiento" ? "text-amber-500" : "text-primary",
            )}
          >
            {short}
          </span>
        ) : null}
      </span>
    );
  };

  /** Fila de calentamiento: atenuada para que no compita con las efectivas. */
  const setRowClass = (s: SetFormData) =>
    !isWorkingSet(s.tipo_serie) ? "opacity-70" : undefined;

  /** Objetivo de reps de ESTA serie; cae al del ejercicio si no hay plan. */
  const repsPlaceholder = (s: SetFormData) => {
    if (s.objetivo_repes_min != null || s.objetivo_repes_max != null) {
      return formatRepTarget(s.objetivo_repes_min, s.objetivo_repes_max);
    }
    return exercise.repRange || "0";
  };

  const lastSessionLabel = lastPerf?.fecha
    ? `Última: ${new Date(lastPerf.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
    : null;

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex min-w-0 items-center gap-2">
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
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {exercise.targetRir != null && (
              <Badge variant="outline" className={cn("text-xs", headerMetaBadgeClass)}>
                🎯 RIR: {exercise.targetRir}
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-xs", headerMetaBadgeClass)}>
              <Timer className="h-3 w-3" />
              {formatMSS(restSeconds)}
            </Badge>
            {lastSessionLabel ? (
              <span className="text-xs text-muted-foreground">{lastSessionLabel}</span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-destructive"
            onClick={() => setConfirmDeleteExercise(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mode === "peso_reps" && overloadSuggestionsEnabled && overloadSuggestion ? (
        <OverloadSuggestionBanner
          suggestion={overloadSuggestion}
          canApply={!!onApplySuggestionToSet}
          applied={overloadApplied}
          onApply={handleApplyOverload}
          onUndo={handleUndoOverload}
        />
      ) : null}

      <div
        ref={setsTableRef}
        className="w-full space-y-3"
        style={{ "--num-col": "max-content", "--anterior-col": "max-content" } as CSSProperties}
      >
      {mode === "peso_reps" ? (
        <>
          <div className={cn(SETS_GRID_TWO_INPUTS, "text-xs text-muted-foreground")}>
            <span aria-hidden className="mx-0.5" />
            <span data-anterior-cell className="w-max justify-self-center">Anterior</span>
            <span>Reps</span>
            <span>Peso (kg)</span>
            <span className="sr-only">Hecho</span>
          </div>
          {exercise.sets.map((s, si) => (
            <SwipeToDeleteRow
              key={s.id ?? si}
              label={`serie ${si + 1}`}
              onDelete={() => onRemoveSet(si)}
              className={surfaceBg}
            >
              <div className={cn(SETS_GRID_TWO_INPUTS, setRowClass(s))}>
                {setNumberCell(s, si, "mr-0.5")}
                {previousCell(si)}
                <SetValueInput
                  field="repeticiones"
                  value={s.repeticiones}
                  onValueChange={(v) => onUpdateSet(si, "repeticiones", v ?? 0)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11 text-center"
                  placeholder={repsPlaceholder(s)}
                  flashToken={overloadFlash[`${si}:repeticiones`]}
                />
                <SetValueInput
                  field="peso_kg"
                  value={s.peso_kg}
                  allowDecimal
                  onValueChange={(v) => onUpdateSet(si, "peso_kg", v ?? 0)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11 text-center"
                  placeholder={s.objetivo_peso_kg != null ? String(s.objetivo_peso_kg) : "0"}
                  flashToken={overloadFlash[`${si}:peso_kg`]}
                />
                {setDoneControl(s, si)}
              </div>
            </SwipeToDeleteRow>
          ))}
        </>
      ) : mode === "duracion" ? (
        <>
          <div className={cn(SETS_GRID_ONE_INPUT, "text-xs text-muted-foreground")}>
            <span aria-hidden className="mx-0.5" />
            <span data-anterior-cell className="w-max justify-self-center">Anterior</span>
            <span>Segundos</span>
            <span className="sr-only">Hecho</span>
          </div>
          {exercise.sets.map((s, si) => (
            <SwipeToDeleteRow
              key={s.id ?? si}
              label={`serie ${si + 1}`}
              onDelete={() => onRemoveSet(si)}
              className={surfaceBg}
            >
              <div className={cn(SETS_GRID_ONE_INPUT, setRowClass(s))}>
                {setNumberCell(s, si, "mx-0.5")}
                {previousCell(si)}
                <SetValueInput
                  field="duracion_seg"
                  value={s.duracion_seg}
                  emptyAs="null"
                  onValueChange={(v) => onUpdateSet(si, "duracion_seg", v)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11 text-center"
                  placeholder="s"
                />
                {setDoneControl(s, si)}
              </div>
            </SwipeToDeleteRow>
          ))}
        </>
      ) : (
        <>
          <div className={cn(SETS_GRID_TWO_INPUTS, "text-xs text-muted-foreground")}>
            <span aria-hidden className="mx-0.5" />
            <span data-anterior-cell className="w-max justify-self-center">Anterior</span>
            <span>Tiempo (s)</span>
            <span>Ritmo (s/km)</span>
            <span className="sr-only">Hecho</span>
          </div>
          <p className="text-[10px] text-muted-foreground px-1 -mt-1">
            Ritmo en segundos por km (ej. 300 = 5:00/km)
          </p>
          {exercise.sets.map((s, si) => (
            <SwipeToDeleteRow
              key={s.id ?? si}
              label={`serie ${si + 1}`}
              onDelete={() => onRemoveSet(si)}
              className={surfaceBg}
            >
              <div className={cn(SETS_GRID_TWO_INPUTS, setRowClass(s))}>
                {setNumberCell(s, si, "mx-0.5")}
                {previousCell(si)}
                <SetValueInput
                  field="duracion_seg"
                  value={s.duracion_seg}
                  emptyAs="null"
                  onValueChange={(v) => onUpdateSet(si, "duracion_seg", v)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11 text-center"
                  placeholder="s"
                />
                <SetValueInput
                  field="ritmo_seg_km"
                  value={s.ritmo_seg_km}
                  emptyAs="null"
                  min={1}
                  onValueChange={(v) => onUpdateSet(si, "ritmo_seg_km", v)}
                  onCommit={() => onAutoSaveSet?.(si)}
                  className="h-11 text-center"
                  placeholder="300"
                />
                {setDoneControl(s, si)}
              </div>
            </SwipeToDeleteRow>
          ))}
        </>
      )}
      </div>

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
