import { useMemo } from "react";
import { useLastPerformance } from "@/hooks/useLastPerformance";
import { useMuscleFatigue } from "@/hooks/useMuscleFatigue";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";
import { suggestProgressiveOverload, type OverloadSuggestion } from "@/lib/progressiveOverload";
import { parseRepTarget } from "@/lib/seriesPlan";
import { normalizeRegistroSeries, type ExerciseFormData } from "@/types/workout";

type ExerciseOverloadSource = Pick<
  ExerciseFormData,
  "tipo_ejercicio_id" | "usuario_ejercicio_id" | "repRange" | "targetRir" | "registro_series" | "grupo_muscular"
>;

export function useProgressiveOverload(
  exercise: ExerciseOverloadSource,
): OverloadSuggestion | null {
  const mode = normalizeRegistroSeries(exercise.registro_series);
  const { data: lastPerf } = useLastPerformance({
    tipo_ejercicio_id: exercise.tipo_ejercicio_id,
    usuario_ejercicio_id: exercise.usuario_ejercicio_id,
  });
  const { data: fatigue } = useMuscleFatigue("week");
  const { data: trainingLoad } = useTrainingLoad();

  return useMemo(() => {
    if (mode !== "peso_reps" || !lastPerf?.sets.length) return null;

    const parsed = parseRepTarget(exercise.repRange);
    // Rango abierto (AMRAP, "8+"): sin techo se usa el mínimo como objetivo.
    const repRange = parsed
      ? { min: parsed.min, max: parsed.max ?? parsed.min }
      : { min: 8, max: 12 };
    const muscleGroup = resolveMainMuscleGroup(exercise.grupo_muscular);
    const fatigueNorm =
      muscleGroup && fatigue && fatigue.maxGroupFatigue > 0
        ? (fatigue.groupFatigue[muscleGroup] ?? 0) / fatigue.maxGroupFatigue
        : 0;

    return suggestProgressiveOverload({
      lastSets: lastPerf.sets.map((s) => ({
        peso_kg: s.peso_kg,
        repeticiones: s.repeticiones,
        rir: s.rir,
        tipo_serie: s.tipo_serie,
      })),
      target: {
        repesMin: repRange.min,
        repesMax: repRange.max,
        targetRir: exercise.targetRir ?? 2,
      },
      muscleFatigueNorm: fatigueNorm,
      trainingForm: trainingLoad?.totals.form ?? 0,
    });
  }, [
    mode,
    lastPerf,
    exercise.repRange,
    exercise.targetRir,
    exercise.grupo_muscular,
    fatigue,
    trainingLoad?.totals.form,
  ]);
}
