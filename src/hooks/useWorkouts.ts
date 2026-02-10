import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { ActividadWithDetails, EjercicioWithDetails } from "@/types/workout";

export function useLastWorkout() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lastWorkout", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ActividadWithDetails | null> => {
      const { data: actividad, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("usuario_id", user!.id)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!actividad) return null;

      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("*, tipo_ejercicio(*)")
        .eq("actividad_id", actividad.id);

      if (ejError) throw ejError;

      const ejercicioIds = (ejercicios || []).map((e) => e.id);
      let series: any[] = [];
      if (ejercicioIds.length > 0) {
        const { data, error: sError } = await supabase
          .from("serie")
          .select("*")
          .in("ejercicio_id", ejercicioIds);
        if (sError) throw sError;
        series = data || [];
      }

      const ejerciciosWithDetails: EjercicioWithDetails[] = (ejercicios || []).map((ej) => ({
        ...ej,
        tipo_ejercicio: ej.tipo_ejercicio!,
        series: series.filter((s) => s.ejercicio_id === ej.id),
      }));

      return { ...actividad, ejercicios: ejerciciosWithDetails };
    },
  });
}

export function useWeeklyWorkouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["weeklyWorkouts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("actividad")
        .select("fecha")
        .eq("usuario_id", user!.id)
        .gte("fecha", startOfWeek.toISOString());

      if (error) throw error;

      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const counts = days.map((name, i) => ({
        name,
        workouts: (data || []).filter((a) => new Date(a.fecha).getDay() === i).length,
      }));

      return counts;
    },
  });
}

export function useWorkoutHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["workoutHistory", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ActividadWithDetails[]> => {
      const { data: actividades, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("usuario_id", user!.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      if (!actividades?.length) return [];

      const actIds = actividades.map((a) => a.id);
      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("*, tipo_ejercicio(*)")
        .in("actividad_id", actIds);

      if (ejError) throw ejError;

      const ejercicioIds = (ejercicios || []).map((e) => e.id);
      let series: any[] = [];
      if (ejercicioIds.length > 0) {
        const { data, error: sError } = await supabase
          .from("serie")
          .select("*")
          .in("ejercicio_id", ejercicioIds);
        if (sError) throw sError;
        series = data || [];
      }

      return actividades.map((act) => {
        const actEjercicios = (ejercicios || [])
          .filter((ej) => ej.actividad_id === act.id)
          .map((ej) => ({
            ...ej,
            tipo_ejercicio: ej.tipo_ejercicio!,
            series: series.filter((s) => s.ejercicio_id === ej.id),
          }));
        return { ...act, ejercicios: actEjercicios };
      });
    },
  });
}
