import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCallback } from "react";

// Extended types for active workout (columns not yet in generated types)
export interface ActiveSerie {
  id: string;
  ejercicio_id: string;
  usuario_id: string;
  numero_serie: number;
  repeticiones: number;
  peso_kg: number;
  completed: boolean;
  created_at: string;
}

export interface ActiveEjercicio {
  id: string;
  actividad_id: string;
  tipo_ejercicio_id: string;
  usuario_id: string;
  created_at: string;
  tipo_ejercicio: {
    id: string;
    nombre: string;
    body_part: string | null;
    equipment: string | null;
    gif_url: string | null;
    imagen: string | null;
    instructions: string[] | null;
    descripcion: string | null;
    external_id: string | null;
    created_at: string;
  };
  series: ActiveSerie[];
}

export interface ActiveWorkout {
  id: string;
  titulo: string;
  fecha: string;
  fecha_fin: string | null;
  usuario_id: string;
  comentarios: string | null;
  created_at: string;
  ejercicios: ActiveEjercicio[];
}

/** Query for the currently active workout (fecha_fin IS NULL) */
export function useActiveWorkoutQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeWorkout", user?.id],
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30s for pill updates
    queryFn: async (): Promise<ActiveWorkout | null> => {
      const { data, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("usuario_id", user!.id)
        .is("fecha_fin" as any, null)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return { ...(data as any), ejercicios: [] } as ActiveWorkout;
    },
  });
}

/** Fetch full active workout details by ID */
export function useActiveWorkoutById(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeWorkoutDetail", id],
    enabled: !!user && !!id,
    queryFn: async (): Promise<ActiveWorkout | null> => {
      if (!id) return null;

      const { data: actividad, error } = await supabase
        .from("actividad")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!actividad) return null;

      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("*, tipo_ejercicio(*)")
        .eq("actividad_id", id);
      if (ejError) throw ejError;

      const ejercicioIds = (ejercicios || []).map((e) => e.id);
      let series: any[] = [];
      if (ejercicioIds.length > 0) {
        const { data, error: sError } = await supabase
          .from("serie")
          .select("*")
          .in("ejercicio_id", ejercicioIds)
          .order("numero_serie", { ascending: true });
        if (sError) throw sError;
        series = data || [];
      }

      const ejerciciosWithDetails: ActiveEjercicio[] = (ejercicios || []).map((ej) => ({
        ...ej,
        tipo_ejercicio: ej.tipo_ejercicio!,
        series: series.filter((s) => s.ejercicio_id === ej.id),
      }));

      return { ...(actividad as any), ejercicios: ejerciciosWithDetails };
    },
  });
}

/** Hook for active workout mutations */
export function useActiveWorkoutActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = useCallback((workoutId: string) => {
    queryClient.invalidateQueries({ queryKey: ["activeWorkoutDetail", workoutId] });
    queryClient.invalidateQueries({ queryKey: ["activeWorkout"] });
  }, [queryClient]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["activeWorkout"] });
    queryClient.invalidateQueries({ queryKey: ["activeWorkoutDetail"] });
    queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
    queryClient.invalidateQueries({ queryKey: ["weeklyWorkouts"] });
    queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    queryClient.invalidateQueries({ queryKey: ["monthWorkoutDates"] });
    queryClient.invalidateQueries({ queryKey: ["workoutsForDate"] });
    queryClient.invalidateQueries({ queryKey: ["workout"] });
  }, [queryClient]);

  /** Create a new active workout and return its ID */
  const startWorkout = useCallback(async (titulo: string = "Entrenamiento"): Promise<string> => {
    if (!user) throw new Error("No user");
    const { data, error } = await supabase
      .from("actividad")
      .insert({
        titulo,
        fecha: new Date().toISOString(),
        usuario_id: user.id,
      } as any)
      .select("id")
      .single();
    if (error) throw error;
    invalidateAll();
    return data.id;
  }, [user, invalidateAll]);

  /** Start workout from a routine template */
  const startWorkoutFromTemplate = useCallback(async (
    titulo: string,
    templateExercises: Array<{
      tipo_ejercicio_id: string;
      sets: number;
      descanso?: number;
      targetRir?: number | null;
    }>
  ): Promise<string> => {
    if (!user) throw new Error("No user");

    const { data: actividad, error: actError } = await supabase
      .from("actividad")
      .insert({
        titulo,
        fecha: new Date().toISOString(),
        usuario_id: user.id,
      } as any)
      .select("id")
      .single();
    if (actError) throw actError;

    for (const tmpl of templateExercises) {
      const { data: ejercicio, error: ejError } = await supabase
        .from("ejercicio")
        .insert({
          actividad_id: actividad.id,
          tipo_ejercicio_id: tmpl.tipo_ejercicio_id,
          usuario_id: user.id,
        })
        .select("id")
        .single();
      if (ejError) throw ejError;

      const setsToCreate = Array.from({ length: tmpl.sets }, (_, i) => ({
        ejercicio_id: ejercicio.id,
        usuario_id: user.id,
        numero_serie: i + 1,
        repeticiones: 0,
        peso_kg: 0,
        completed: false,
      }));

      if (setsToCreate.length > 0) {
        const { error: sError } = await supabase.from("serie").insert(setsToCreate as any);
        if (sError) throw sError;
      }
    }

    invalidateAll();
    return actividad.id;
  }, [user, invalidateAll]);

  /** Add an exercise to an active workout */
  const addExercise = useCallback(async (workoutId: string, tipoEjercicioId: string): Promise<void> => {
    if (!user) throw new Error("No user");

    const { data: ejercicio, error: ejError } = await supabase
      .from("ejercicio")
      .insert({
        actividad_id: workoutId,
        tipo_ejercicio_id: tipoEjercicioId,
        usuario_id: user.id,
      })
      .select("id")
      .single();
    if (ejError) throw ejError;

    // Create one initial set
    const { error: sError } = await supabase.from("serie").insert({
      ejercicio_id: ejercicio.id,
      usuario_id: user.id,
      numero_serie: 1,
      repeticiones: 0,
      peso_kg: 0,
      completed: false,
    } as any);
    if (sError) throw sError;

    invalidate(workoutId);
  }, [user, invalidate]);

  /** Add a set to an exercise */
  const addSet = useCallback(async (workoutId: string, ejercicioId: string, nextNumber: number): Promise<void> => {
    if (!user) throw new Error("No user");
    const { error } = await supabase.from("serie").insert({
      ejercicio_id: ejercicioId,
      usuario_id: user.id,
      numero_serie: nextNumber,
      repeticiones: 0,
      peso_kg: 0,
      completed: false,
    } as any);
    if (error) throw error;
    invalidate(workoutId);
  }, [user, invalidate]);

  /** Delete a set */
  const deleteSet = useCallback(async (workoutId: string, serieId: string): Promise<void> => {
    const { error } = await supabase.from("serie").delete().eq("id", serieId);
    if (error) throw error;
    invalidate(workoutId);
  }, [invalidate]);

  /** Delete an exercise and its sets */
  const deleteExercise = useCallback(async (workoutId: string, ejercicioId: string): Promise<void> => {
    await supabase.from("serie").delete().eq("ejercicio_id", ejercicioId);
    const { error } = await supabase.from("ejercicio").delete().eq("id", ejercicioId);
    if (error) throw error;
    invalidate(workoutId);
  }, [invalidate]);

  /** Update a set field (auto-save) */
  const updateSetField = useCallback(async (serieId: string, field: string, value: number | boolean): Promise<void> => {
    const { error } = await supabase.from("serie").update({ [field]: value } as any).eq("id", serieId);
    if (error) throw error;
  }, []);

  /** Toggle set completed */
  const toggleSetCompleted = useCallback(async (serieId: string, completed: boolean): Promise<void> => {
    const { error } = await supabase.from("serie").update({ completed } as any).eq("id", serieId);
    if (error) throw error;
  }, []);

  /** Update workout title */
  const updateTitle = useCallback(async (workoutId: string, titulo: string): Promise<void> => {
    const { error } = await supabase.from("actividad").update({ titulo }).eq("id", workoutId);
    if (error) throw error;
  }, []);

  /** Finish workout */
  const finishWorkout = useCallback(async (workoutId: string): Promise<void> => {
    const { error } = await supabase
      .from("actividad")
      .update({ fecha_fin: new Date().toISOString() } as any)
      .eq("id", workoutId);
    if (error) throw error;
    invalidateAll();
  }, [invalidateAll]);

  /** Delete entire workout */
  const deleteWorkout = useCallback(async (workoutId: string): Promise<void> => {
    const { data: ejercicios } = await supabase
      .from("ejercicio")
      .select("id")
      .eq("actividad_id", workoutId);

    if (ejercicios?.length) {
      const ids = ejercicios.map((e) => e.id);
      await supabase.from("serie").delete().in("ejercicio_id", ids);
      await supabase.from("ejercicio").delete().eq("actividad_id", workoutId);
    }

    const { error } = await supabase.from("actividad").delete().eq("id", workoutId);
    if (error) throw error;
    invalidateAll();
  }, [invalidateAll]);

  return {
    startWorkout,
    startWorkoutFromTemplate,
    addExercise,
    addSet,
    deleteSet,
    deleteExercise,
    updateSetField,
    toggleSetCompleted,
    updateTitle,
    finishWorkout,
    deleteWorkout,
  };
}
