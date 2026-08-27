import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import type { RutinaWithDetails, RutinaEjercicioWithDetails } from "@/types/routine";
import { migrateRoutineIconsFromLocalStorage } from "@/lib/routineIcons";

let localIconMigrationDone = false;

type RutinaEjercicioJoinRow = Tables<"rutina_ejercicio"> & {
  tipo_ejercicio: Tables<"tipo_ejercicio"> | null;
  usuario_ejercicio: Tables<"usuario_ejercicio"> | null;
  /** Plan por serie; vacío = ejercicio en modo simple. */
  rutina_ejercicio_serie: Tables<"rutina_ejercicio_serie">[] | null;
};

function mapRutinaEjercicio(ej: RutinaEjercicioJoinRow): RutinaEjercicioWithDetails {
  const tipo = ej.tipo_ejercicio ?? ej.usuario_ejercicio;
  return {
    ...ej,
    tipo_ejercicio: tipo!,
    rutina_ejercicio_serie: ej.rutina_ejercicio_serie ?? null,
  };
}

export function useRoutines() {
  const { user } = useAuth();
  return useQuery<RutinaWithDetails[]>({
    queryKey: ["routines", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (user && !localIconMigrationDone) {
        localIconMigrationDone = true;
        await migrateRoutineIconsFromLocalStorage(user.id, supabase);
      }

      const { data: rutinas, error } = await supabase
        .from("rutina")
        .select("*")
        .eq("usuario_id", user!.id)
        .not("es_plantilla", "eq", true)
        .order("orden", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!rutinas?.length) return [];

      const rutinaIds = rutinas.map((r) => r.id);
      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select("*, tipo_ejercicio(*), usuario_ejercicio(*), rutina_ejercicio_serie(*)")
        .in("rutina_id", rutinaIds)
        .order("orden");
      if (ejError) throw ejError;

      const ejerciciosJoined = (ejercicios ?? []) as RutinaEjercicioJoinRow[];

      return rutinas.map((r) => ({
        ...r,
        ejercicios: ejerciciosJoined
          .filter((ej) => ej.rutina_id === r.id)
          .map(mapRutinaEjercicio),
      }));
    },
  });
}

export function useRoutineById(id: string | null) {
  const { user } = useAuth();
  return useQuery<RutinaWithDetails | null>({
    queryKey: ["routine", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data: rutina, error } = await supabase
        .from("rutina")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!rutina) return null;

      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select("*, tipo_ejercicio(*), usuario_ejercicio(*), rutina_ejercicio_serie(*)")
        .eq("rutina_id", id)
        .order("orden");
      if (ejError) throw ejError;

      const ejerciciosJoined = (ejercicios ?? []) as RutinaEjercicioJoinRow[];

      return {
        ...rutina,
        ejercicios: ejerciciosJoined.map(mapRutinaEjercicio),
      };
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rutina").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useUpdateRoutineOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; orden: number }[]) => {
      // Update each routine's orden in parallel
      const promises = items.map(({ id, orden }) =>
        supabase.from("rutina").update({ orden }).eq("id", id)
      );
      const results = await Promise.all(promises);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

/**
 * Última fecha de entrenamiento por nombre de rutina.
 * Nota: no hay `rutina_id` en `actividad`; se empareja por `titulo === nombre`.
 */
export function useRoutineLastTrainedByName(routineNames: string[]) {
  const { user } = useAuth();
  const namesKey = useMemo(
    () =>
      [...new Set(routineNames.map((n) => n.trim()).filter(Boolean))].sort().join("\0"),
    [routineNames],
  );

  return useQuery<Record<string, string>>({
    queryKey: ["routineLastTrained", user?.id, namesKey],
    enabled: !!user && namesKey.length > 0,
    queryFn: async () => {
      const names = namesKey.split("\0");
      const { data, error } = await supabase
        .from("actividad")
        .select("titulo, fecha")
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
        .in("titulo", names)
        .order("fecha", { ascending: false });
      if (error) throw error;

      const latest: Record<string, string> = {};
      for (const row of data ?? []) {
        const title = row.titulo?.trim();
        if (!title || latest[title]) continue;
        latest[title] = row.fecha;
      }
      return latest;
    },
  });
}

function remapSupersetIds<T extends { superset_id: string | null }>(
  exercises: T[],
): (T & { superset_id: string | null })[] {
  const map = new Map<string, string>();
  return exercises.map((ej) => {
    const sid = ej.superset_id?.trim() || null;
    if (!sid) return { ...ej, superset_id: null };
    let next = map.get(sid);
    if (!next) {
      next = crypto.randomUUID();
      map.set(sid, next);
    }
    return { ...ej, superset_id: next };
  });
}

/**
 * Copia el plan por serie a los rutina_ejercicio recién insertados.
 *
 * `sourceByOrden` debe estar indexado por el mismo `orden` con el que se
 * insertaron las filas; se mapea por `orden` y no por posición porque
 * PostgREST no garantiza el orden de las filas devueltas.
 */
export async function copySeriesPlans(
  sourceByOrden: Array<Tables<"rutina_ejercicio_serie">[] | null | undefined>,
  insertedRows: Array<{ id: string; orden: number }>,
): Promise<void> {
  const planInserts: TablesInsert<"rutina_ejercicio_serie">[] = [];

  for (const row of insertedRows) {
    const plan = sourceByOrden[row.orden];
    if (!plan?.length) continue;
    [...plan]
      .sort((a, b) => a.orden - b.orden)
      .forEach((s, orden) => {
        planInserts.push({
          rutina_ejercicio_id: row.id,
          orden,
          tipo_serie: s.tipo_serie,
          repes_min: s.repes_min,
          repes_max: s.repes_max,
          rir: s.rir,
          peso_objetivo_kg: s.peso_objetivo_kg,
          descanso: s.descanso,
          duracion_objetivo_seg: s.duracion_objetivo_seg,
          ritmo_objetivo_seg_km: s.ritmo_objetivo_seg_km,
        });
      });
  }

  if (!planInserts.length) return;
  const { error } = await supabase.from("rutina_ejercicio_serie").insert(planInserts);
  if (error) throw error;
}

/** Duplica una rutina del usuario (incl. ejercicios, superseries y plan por serie). */
export function useDuplicateRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routine: RutinaWithDetails) => {
      if (!user) throw new Error("No autenticado");

      const { data: newRutina, error: insertErr } = await supabase
        .from("rutina")
        .insert({
          nombre: `${routine.nombre.trim()} (copia)`,
          descripcion: routine.descripcion,
          usuario_id: user.id,
          icono: routine.icono,
          grupo_muscular: routine.grupo_muscular,
          nivel: routine.nivel,
          duracion_minutos: routine.duracion_minutos,
          es_plantilla: false,
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      const sorted = [...routine.ejercicios].sort((a, b) => a.orden - b.orden);
      if (sorted.length) {
        const withNewSupersets = remapSupersetIds(sorted);
        const inserts = withNewSupersets.map((ej, i) => ({
          rutina_id: newRutina.id,
          tipo_ejercicio_id: ej.tipo_ejercicio_id,
          usuario_ejercicio_id: ej.usuario_ejercicio_id,
          series_objetivo: ej.series_objetivo,
          repes_min: ej.repes_min,
          repes_max: ej.repes_max,
          rir: ej.rir,
          orden: i,
          descanso: ej.descanso,
          superset_id: ej.superset_id,
          registro_series: ej.registro_series,
          duracion_objetivo_seg: ej.duracion_objetivo_seg,
          ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km,
        }));
        const { data: insertedRows, error: ejInsertErr } = await supabase
          .from("rutina_ejercicio")
          .insert(inserts)
          .select("id, orden");
        if (ejInsertErr) throw ejInsertErr;

        await copySeriesPlans(
          withNewSupersets.map((ej) => ej.rutina_ejercicio_serie),
          insertedRows ?? [],
        );
      }

      return newRutina.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}
