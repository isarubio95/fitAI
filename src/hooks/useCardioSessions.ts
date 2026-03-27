import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CardioBlockInput } from "@/types/cardio";
import { endOfMonth, startOfMonth } from "date-fns";

type CardioSessionInput = {
  titulo: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  comentarios?: string | null;
  es_publica?: boolean;
  deporte?: string | null;
  bloques: CardioBlockInput[];
};

export function useCardioSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cardioSessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select("*, cardio_bloque(*)")
        .eq("usuario_id", user!.id)
        .order("fecha_inicio", { ascending: false })
        .order("orden", { referencedTable: "cardio_bloque", ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCardioSessionById(id: string | null) {
  return useQuery({
    queryKey: ["cardioSession", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select("*, cardio_bloque(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMonthCardioSessions(month: Date) {
  const { user } = useAuth();
  const from = startOfMonth(month).toISOString();
  const to = endOfMonth(month).toISOString();
  return useQuery({
    queryKey: ["monthCardioSessions", user?.id, from],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select("*, cardio_bloque(*)")
        .eq("usuario_id", user!.id)
        .gte("fecha_inicio", from)
        .lte("fecha_inicio", to)
        .order("fecha_inicio", { ascending: false })
        .order("orden", { referencedTable: "cardio_bloque", ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMonthCardioSessionDates(month: Date) {
  const { user } = useAuth();
  const from = startOfMonth(month).toISOString();
  const to = endOfMonth(month).toISOString();
  return useQuery({
    queryKey: ["monthCardioSessionDates", user?.id, from],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select("fecha_inicio")
        .eq("usuario_id", user!.id)
        .gte("fecha_inicio", from)
        .lte("fecha_inicio", to);
      if (error) throw error;
      return (data ?? []).map((s) => new Date(s.fecha_inicio));
    },
  });
}

export function useUpsertCardioSession() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: string | null;
      input: CardioSessionInput;
    }) => {
      const payload = {
        titulo: input.titulo,
        fecha_inicio: input.fecha_inicio,
        fecha_fin: input.fecha_fin ?? null,
        comentarios: input.comentarios ?? null,
        es_publica: input.es_publica ?? false,
        deporte: input.deporte ?? null,
        usuario_id: user!.id,
      };

      let sessionId = id ?? null;
      if (sessionId) {
        const { error } = await supabase.from("cardio_sesion").update(payload).eq("id", sessionId);
        if (error) throw error;
        const { error: deleteError } = await supabase.from("cardio_bloque").delete().eq("cardio_sesion_id", sessionId);
        if (deleteError) throw deleteError;
      } else {
        const { data, error } = await supabase.from("cardio_sesion").insert(payload).select("id").single();
        if (error) throw error;
        sessionId = data.id;
      }

      if (input.bloques.length > 0) {
        const rows = input.bloques.map((b, index) => ({
          cardio_sesion_id: sessionId,
          orden: index,
          tipo_bloque: b.tipo_bloque || "work",
          distancia_m: b.distancia_m ?? null,
          duracion_seg: b.duracion_seg ?? null,
          elevacion_m: b.elevacion_m ?? null,
          fc_media: b.fc_media ?? null,
          fc_max: b.fc_max ?? null,
          calorias: b.calorias ?? null,
        }));
        const { error } = await supabase.from("cardio_bloque").insert(rows);
        if (error) throw error;
      }

      return sessionId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cardioSessions"] });
      qc.invalidateQueries({ queryKey: ["cardioSession"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessionDates"] });
    },
  });
}

export function useDeleteCardioSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cardio_sesion").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessionDates"] });
    },
  });
}

