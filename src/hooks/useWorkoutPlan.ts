import { useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RutinaWithDetails } from "@/types/routine";

export interface PlannedRoutine {
  id: string;
  usuario_id: string;
  rutina_id: string;
  fecha_programada: string; // YYYY-MM-DD
  actividad_id: string | null;
  created_at: string;
  rutina: RutinaWithDetails;
}

function toYMD(input: string | Date) {
  if (typeof input === "string") return input.slice(0, 10);
  // Importante: usamos fecha LOCAL (no UTC) para evitar off-by-one en rangos.
  return format(input, "yyyy-MM-dd");
}

export function usePlannedRoutines(startDate: string | Date, endDate: string | Date) {
  const { user } = useAuth();
  const start = useMemo(() => toYMD(startDate), [startDate]);
  const end = useMemo(() => toYMD(endDate), [endDate]);
  const userId = user?.id;

  return useQuery<PlannedRoutine[]>({
    queryKey: ["plannedRoutines", userId, start, end],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("rutina_programada")
        .select(
          `
          id,
          usuario_id,
          rutina_id,
          fecha_programada,
          actividad_id,
          created_at,
          rutina:rutina!rutina_programada_rutina_id_fkey (
            *,
            ejercicios:rutina_ejercicio!rutina_ejercicio_rutina_id_fkey (
              *,
              tipo_ejercicio:tipo_ejercicio!rutina_ejercicio_tipo_ejercicio_id_fkey (*)
            )
          )
        `
        )
        .eq("usuario_id", userId)
        .gte("fecha_programada", start)
        .lte("fecha_programada", end)
        .order("fecha_programada", { ascending: true })
        .returns<PlannedRoutine[]>();

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useScheduleRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opts: { rutinaId: string; fechasArray: Array<string | Date> }) => {
      if (!user) throw new Error("No autenticado");
      const { rutinaId, fechasArray } = opts;
      const rows = fechasArray.map((f) => ({
        usuario_id: user.id,
        rutina_id: rutinaId,
        fecha_programada: toYMD(f),
        actividad_id: null,
      }));

      const { error } = await supabase.from("rutina_programada").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
    },
  });
}

/** Planifica varias rutinas a la vez: cada entrada puede tener un rutinaId y sus fechas. */
export function useScheduleRoutines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedules: Array<{ rutinaId: string; fechasArray: Array<string | Date> }>) => {
      if (!user) throw new Error("No autenticado");
      const rows = schedules.flatMap(({ rutinaId, fechasArray }) =>
        fechasArray.map((f) => ({
          usuario_id: user.id,
          rutina_id: rutinaId,
          fecha_programada: toYMD(f),
          actividad_id: null,
        }))
      );
      if (rows.length === 0) return;
      const { error } = await supabase.from("rutina_programada").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
    },
  });
}

export function useDeletePlannedRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      const { error } = await supabase
        .from("rutina_programada")
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
    },
  });
}

/** Elimina toda la planificación (hoja de ruta) del usuario actual. */
export function useDeleteAllPlannedRoutines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("rutina_programada")
        .delete()
        .eq("usuario_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
    },
  });
}

export function useUpdatePlannedRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opts: { id: string; fecha_programada?: string; rutina_id?: string }) => {
      const { id, fecha_programada, rutina_id } = opts;
      const payload: Record<string, unknown> = {};
      if (fecha_programada != null) payload.fecha_programada = fecha_programada.slice(0, 10);
      if (rutina_id != null) payload.rutina_id = rutina_id;
      if (Object.keys(payload).length === 0) return;
      const { error } = await supabase
        .from("rutina_programada")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannedRoutines"] });
    },
  });
}

