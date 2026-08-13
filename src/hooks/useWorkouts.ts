import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import {
  type Actividad,
  type ActividadWithDetails,
  type Ejercicio,
  type EjercicioWithDetails,
  type Serie,
  type TipoEjercicio,
  type UsuarioEjercicio,
  setHasWork,
} from "@/types/workout";
import { useRemoveWorkoutXP } from "@/hooks/useGamification";
import { useToast } from "@/hooks/use-toast";

type EjercicioJoinRow = Ejercicio & {
  tipo_ejercicio: TipoEjercicio | null;
  usuario_ejercicio: UsuarioEjercicio | null;
};

function mapEjercicioWithSeries(ej: EjercicioJoinRow, series: Serie[]): EjercicioWithDetails {
  const tipo = ej.tipo_ejercicio ?? ej.usuario_ejercicio;
  return {
    ...ej,
    tipo_ejercicio: tipo!,
    series: series.filter((s) => s.ejercicio_id === ej.id),
  };
}

export function useMonthWorkoutDates(month: Date) {
  const { user } = useAuth();
  const from = startOfMonth(month).toISOString();
  const to = endOfMonth(month).toISOString();
  return useQuery({
    queryKey: ["monthWorkoutDates", user?.id, from],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actividad")
        .select("fecha")
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
        .gte("fecha", from)
        .lte("fecha", to);
      if (error) throw error;
      return (data || []).map((a) => new Date(a.fecha));
    },
  });
}

export function useMonthWorkouts(month: Date) {
  const { user } = useAuth();
  const from = startOfMonth(month).toISOString();
  const to = endOfMonth(month).toISOString();
  return useQuery<ActividadWithDetails[]>({
    queryKey: ["monthWorkouts", user?.id, from],
    enabled: !!user,
    queryFn: async () => {
      const { data: actividades, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
        .gte("fecha", from)
        .lte("fecha", to)
        .order("fecha", { ascending: false });
      if (error) throw error;
      if (!actividades?.length) return [];

      return hydrateActividadesWithDetails(actividades);
    },
  });
}

export function useWorkoutsForDate(date: Date | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["workoutsForDate", user?.id, date?.toISOString()],
    enabled: !!user && !!date,
    queryFn: async (): Promise<ActividadWithDetails[]> => {
      if (!date) return [];
      const dayStart = startOfDay(date).toISOString();
      const dayEnd = endOfDay(date).toISOString();

      const { data: actividades, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
        .gte("fecha", dayStart)
        .lte("fecha", dayEnd)
        .order("fecha", { ascending: false });

      if (error) throw error;
      if (!actividades?.length) return [];

      const actIds = actividades.map((a) => a.id);
      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("*, tipo_ejercicio(*), usuario_ejercicio(*)")
        .in("actividad_id", actIds);
      if (ejError) throw ejError;

      const ejerciciosJoined = (ejercicios ?? []) as EjercicioJoinRow[];
      const ejercicioIds = ejerciciosJoined.map((e) => e.id);
      let series: Serie[] = [];
      if (ejercicioIds.length > 0) {
        const { data, error: sError } = await supabase
          .from("serie")
          .select("*")
          .in("ejercicio_id", ejercicioIds);
        if (sError) throw sError;
        series = data ?? [];
      }

      return actividades.map((act) => ({
        ...act,
        ejercicios: ejerciciosJoined
          .filter((ej) => ej.actividad_id === act.id)
          .map((ej) => mapEjercicioWithSeries(ej, series)),
      }));
    },
  });
}

export function useWorkoutById(id: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["workout", id],
    enabled: !!user && !!id,
    queryFn: async (): Promise<ActividadWithDetails | null> => {
      if (!id) return null;
      const { data: actividad, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("*, tipo_ejercicio(*), usuario_ejercicio(*)")
        .eq("actividad_id", id)
        .order("created_at", { ascending: true });
      if (ejError) throw ejError;

      const ejerciciosJoined = (ejercicios ?? []) as EjercicioJoinRow[];
      const ejercicioIds = ejerciciosJoined.map((e) => e.id);
      let series: Serie[] = [];
      if (ejercicioIds.length > 0) {
        const { data, error: sError } = await supabase
          .from("serie")
          .select("*")
          .in("ejercicio_id", ejercicioIds)
          .order("created_at", { ascending: true })
          .order("numero_serie", { ascending: true });
        if (sError) throw sError;
        series = data ?? [];
      }

      return {
        ...actividad,
        ejercicios: ejerciciosJoined.map((ej) => mapEjercicioWithSeries(ej, series)),
      };
    },
  });
}

const ACTIVIDAD_IDS_CHUNK = 80;
const EJERCICIO_IDS_CHUNK = 200;

async function fetchEjerciciosForActividades(actIds: string[]): Promise<EjercicioJoinRow[]> {
  const ejercicios: EjercicioJoinRow[] = [];
  for (let i = 0; i < actIds.length; i += ACTIVIDAD_IDS_CHUNK) {
    const chunk = actIds.slice(i, i + ACTIVIDAD_IDS_CHUNK);
    const { data, error } = await supabase
      .from("ejercicio")
      .select("*, tipo_ejercicio(*), usuario_ejercicio(*)")
      .in("actividad_id", chunk);
    if (error) throw error;
    if (data?.length) ejercicios.push(...(data as EjercicioJoinRow[]));
  }
  return ejercicios;
}

async function fetchSeriesForEjercicios(ejercicioIds: string[]): Promise<Serie[]> {
  const series: Serie[] = [];
  for (let i = 0; i < ejercicioIds.length; i += EJERCICIO_IDS_CHUNK) {
    const chunk = ejercicioIds.slice(i, i + EJERCICIO_IDS_CHUNK);
    const { data, error } = await supabase.from("serie").select("*").in("ejercicio_id", chunk);
    if (error) throw error;
    if (data?.length) series.push(...data);
  }
  return series;
}

export async function hydrateActividadesWithDetails(
  actividades: Actividad[],
): Promise<ActividadWithDetails[]> {
  if (!actividades.length) return [];

  const actIds = actividades.map((a) => a.id);
  const ejercicios = await fetchEjerciciosForActividades(actIds);

  const ejercicioIds = ejercicios.map((e) => e.id);
  const series =
    ejercicioIds.length > 0 ? await fetchSeriesForEjercicios(ejercicioIds) : [];

  return actividades.map((act) => ({
    ...act,
    ejercicios: ejercicios
      .filter((ej) => ej.actividad_id === act.id)
      .map((ej) => mapEjercicioWithSeries(ej, series)),
  }));
}

export function useWorkoutHistory(profileUserId?: string) {
  const { user } = useAuth();
  const id = profileUserId ?? user?.id;
  return useQuery({
    queryKey: ["workoutHistory", id],
    enabled: !!id,
    queryFn: async (): Promise<ActividadWithDetails[]> => {
      const { data: actividades, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("usuario_id", id!)
        .not("fecha_fin", "is", null)
        .order("fecha", { ascending: false });

      if (error) throw error;
      if (!actividades?.length) return [];

      return hydrateActividadesWithDetails(actividades);
    },
  });
}

export function useDeleteWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const removeXP = useRemoveWorkoutXP();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const { data: actividad, error: actErr } = await supabase
        .from("actividad")
        .select("id, fecha, fecha_fin")
        .eq("id", workoutId)
        .maybeSingle();
      if (actErr) throw actErr;
      if (!actividad) throw new Error("Entrenamiento no encontrado");

      const { data: oldEjercicios } = await supabase
        .from("ejercicio")
        .select("id")
        .eq("actividad_id", workoutId);
      const oldIds = oldEjercicios?.length ? oldEjercicios.map((e) => e.id) : [];

      // Solo restar XP si el entreno estaba completado (la XP se otorga al finalizar)
      if (actividad.fecha_fin && oldIds.length) {
        const { data: series } = await supabase
          .from("serie")
          .select("id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km")
          .in("ejercicio_id", oldIds);
        const seriesCompletadas = (series ?? []).filter((s) => setHasWork(s)).length;
        if (seriesCompletadas > 0) await removeXP(workoutId, seriesCompletadas);
      }
      if (oldIds.length) {
        await supabase.from("serie").delete().in("ejercicio_id", oldIds);
        await supabase.from("ejercicio").delete().eq("actividad_id", workoutId);
      }
      const { error } = await supabase.from("actividad").delete().eq("id", workoutId);
      if (error) throw error;

      const deletedFecha = actividad.fecha ? new Date(actividad.fecha).toISOString().slice(0, 10) : undefined;
      queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
      queryClient.invalidateQueries({ queryKey: ["activeWorkout"] });
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    queryClient.invalidateQueries({ queryKey: ["exercise-with-history"] });
    queryClient.invalidateQueries({ queryKey: ["exercise-history"] });
    queryClient.invalidateQueries({ queryKey: ["trainingLoad"] });
    queryClient.invalidateQueries({ queryKey: ["muscleVolume"] });
    queryClient.invalidateQueries({ queryKey: ["muscleStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
      if (deletedFecha) {
        queryClient.invalidateQueries({ queryKey: ["workoutsForDate", user?.id, deletedFecha] });
        const from = startOfMonth(new Date(deletedFecha + "T12:00:00.000Z")).toISOString();
        queryClient.invalidateQueries({ queryKey: ["monthWorkoutDates", user?.id, from] });
        queryClient.invalidateQueries({ queryKey: ["monthWorkouts", user?.id, from] });
      }
      queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
      queryClient.invalidateQueries({ queryKey: ["routineLastTrained"] });
    },
    onSuccess: () => toast({ title: "Entrenamiento eliminado correctamente" }),
    onError: (err: Error) => toast({ title: "Error al eliminar", description: err.message, variant: "destructive" }),
  });
}
