import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EjercicioJoinRow } from "@/hooks/useWorkouts";
import type { ActiveWorkoutSummary } from "@/hooks/useActiveWorkout";
import {
  defaultTargetRirForNewExercise,
  initialSetsForNewExercise,
  normalizeRegistroSeries,
  serieFieldsForRegistro,
  serieTargetFields,
  serieTargetsFromRow,
  type ActividadWithDetails,
  type ExerciseFormData,
  type Serie,
} from "@/types/workout";
import { catalogRefFromCarry, type CatalogExerciseCarry } from "@/lib/catalogExerciseCarry";

export function mapWorkoutExerciseToFormData(ej: {
  id: string;
  tipo_ejercicio_id?: string | null;
  usuario_ejercicio_id?: string | null;
  tipo_ejercicio: { nombre: string };
  descanso?: number | null;
  rep_range?: string | null;
  rir_objetivo?: number | null;
  registro_series?: string | null;
  series: Serie[];
}): ExerciseFormData {
  return {
    tipo_ejercicio_id: ej.tipo_ejercicio_id ?? undefined,
    usuario_ejercicio_id: ej.usuario_ejercicio_id ?? undefined,
    nombre: ej.tipo_ejercicio.nombre,
    id: ej.id,
    descanso: ej.descanso ?? undefined,
    repRange: ej.rep_range ?? undefined,
    targetRir: ej.rir_objetivo ?? undefined,
    registro_series: normalizeRegistroSeries(ej.registro_series),
    sets: [...ej.series]
      .sort((a, b) => a.numero_serie - b.numero_serie)
      .map((s) => ({
        repeticiones: s.repeticiones,
        peso_kg: Number(s.peso_kg),
        duracion_seg: s.duracion_seg ?? null,
        ritmo_seg_km: s.ritmo_seg_km ?? null,
        id: s.id,
        completed: s.completed,
        descanso: s.descanso ?? undefined,
        ...serieTargetsFromRow(s),
      })),
  };
}

function patchWorkoutWithExercise(
  queryClient: QueryClient,
  workoutId: string,
  ejercicio: EjercicioJoinRow,
  series: Serie[],
) {
  const tipo = ejercicio.tipo_ejercicio ?? ejercicio.usuario_ejercicio;
  if (!tipo) return;
  queryClient.setQueryData<ActividadWithDetails | null>(["workout", workoutId], (old) => {
    if (!old) return old;
    return {
      ...old,
      ejercicios: [
        ...(old.ejercicios ?? []).filter((row) => row.id !== ejercicio.id),
        { ...ejercicio, tipo_ejercicio: tipo, series },
      ],
    };
  });
}

export async function persistCatalogExerciseToWorkout(args: {
  workoutId: string;
  userId: string;
  carry: CatalogExerciseCarry;
  queryClient: QueryClient;
}): Promise<void> {
  const { workoutId, userId, carry, queryClient } = args;
  const ref = catalogRefFromCarry(carry);
  const registro_series = normalizeRegistroSeries(ref.registro_series);
  const targetRir = defaultTargetRirForNewExercise(registro_series);
  const setsSource = initialSetsForNewExercise(registro_series);

  const { data: ej, error } = await supabase
    .from("ejercicio")
    .insert({
      actividad_id: workoutId,
      tipo_ejercicio_id: ref.tipo_ejercicio_id ?? null,
      usuario_ejercicio_id: ref.usuario_ejercicio_id ?? null,
      usuario_id: userId,
      registro_series,
      rir_objetivo: targetRir,
    })
    .select("*, tipo_ejercicio(*), usuario_ejercicio(*)")
    .single<EjercicioJoinRow>();
  if (error) throw error;

  const { data: series, error: seriesError } = await supabase
    .from("serie")
    .insert(
      setsSource.map((s, i) => ({
        ejercicio_id: ej.id,
        usuario_id: userId,
        numero_serie: i + 1,
        repeticiones: s.repeticiones ?? 0,
        peso_kg: s.peso_kg ?? 0,
        ...serieFieldsForRegistro(registro_series, s),
        completed: s.completed ?? false,
        descanso: s.descanso ?? null,
        ...serieTargetFields(s),
      })),
    )
    .select("*");
  if (seriesError) throw seriesError;

  const orderedSeries = [...((series ?? []) as Serie[])].sort((a, b) => a.numero_serie - b.numero_serie);
  patchWorkoutWithExercise(queryClient, workoutId, ej, orderedSeries);
  queryClient.setQueryData<ActiveWorkoutSummary | null>(["activeWorkout", userId], (old) =>
    old && old.id === workoutId ? { ...old, hasExercises: true } : old,
  );
}
