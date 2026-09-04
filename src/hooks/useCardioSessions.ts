import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { checkAndAwardLogros, type LogroRow } from "@/hooks/useLogros";
import { notifyLogrosDesbloqueados } from "@/components/logros/logroToast";
import { awardSessionXp, useRemoveCardioXP, type XPBreakdown } from "@/hooks/useGamification";
import { calculateCardioSessionXp, resolveCardioDurationSec } from "@/lib/sessionXp";
import { fetchCompletedTrainingDayKeys } from "@/lib/trainingDays";
import { computeStreakStats } from "@/lib/streakWeeks";
import type { CardioBlockInput, CardioSportDetailInput, CardioTrackInput } from "@/types/cardio";
import type { CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";
import {
  MAX_TRACK_POINTS_DB,
  TRACK_POINTS_INSERT_CHUNK,
  prepareTrackPointsForStorage,
} from "@/lib/cardioTrackPoints";
import { endOfMonth, startOfMonth } from "date-fns";

type CardioSessionInput = {
  titulo: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  comentarios?: string | null;
  es_publica?: boolean;
  rpe?: number | null;
  cardio_disciplina_id?: string | null;
  sport_detail?: CardioSportDetailInput | null;
  track?: CardioTrackInput | null;
  bloques: CardioBlockInput[];
};

/** Listados / calendario: métricas del track sin puntos GPS. */
export const CARDIO_SESSION_LIST_SELECT = `
  *,
  cardio_disciplina(*),
  cardio_bloque(*),
  cardio_sesion_running(*),
  cardio_sesion_cycling(*),
  cardio_track(*)
`;

/** Detalle / editor: incluye el GPS completo. */
export const CARDIO_SESSION_SELECT = `
  *,
  cardio_disciplina(*),
  cardio_bloque(*),
  cardio_sesion_running(*),
  cardio_sesion_cycling(*),
  cardio_track(*, cardio_track_point(*))
`;

export function useCardioDisciplinas() {
  return useQuery({
    queryKey: ["cardioDisciplinas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_disciplina")
        .select("*")
        .eq("activo", true)
        .order("orden", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Última disciplina de un cardio completado (para preselección rápida en setup). */
export function useLastCardioDisciplineId() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lastCardioDisciplineId", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select("cardio_disciplina_id")
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
        .not("cardio_disciplina_id", "is", null)
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data?.cardio_disciplina_id as string | null) ?? null;
    },
  });
}

export function useCardioSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cardioSessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select(CARDIO_SESSION_LIST_SELECT)
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
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
    queryFn: async (): Promise<CardioSesionWithDetails | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select(CARDIO_SESSION_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as CardioSesionWithDetails | null) ?? null;
    },
  });
}

/**
 * Historial de cardio de un usuario (perfil).
 * Propio: todas las sesiones completadas. Ajeno: solo `es_publica`.
 */
export function useCardioHistory(profileUserId?: string, opts?: { onlyPublic?: boolean }) {
  const { user } = useAuth();
  const id = profileUserId ?? user?.id;
  const onlyPublic = opts?.onlyPublic ?? (id != null && id !== user?.id);

  return useQuery({
    queryKey: ["cardioHistory", id, onlyPublic],
    enabled: !!id,
    queryFn: async (): Promise<CardioSesionWithDetails[]> => {
      let q = supabase
        .from("cardio_sesion")
        .select(CARDIO_SESSION_LIST_SELECT)
        .eq("usuario_id", id!)
        .not("fecha_fin", "is", null)
        .order("fecha_inicio", { ascending: false })
        .order("orden", { referencedTable: "cardio_bloque", ascending: true });

      if (onlyPublic) {
        q = q.eq("es_publica", true);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CardioSesionWithDetails[];
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
    queryFn: async (): Promise<CardioSesionWithDetails[]> => {
      const { data, error } = await supabase
        .from("cardio_sesion")
        .select(CARDIO_SESSION_LIST_SELECT)
        .eq("usuario_id", user!.id)
        .not("fecha_fin", "is", null)
        .gte("fecha_inicio", from)
        .lte("fecha_inicio", to)
        .order("fecha_inicio", { ascending: false })
        .order("orden", { referencedTable: "cardio_bloque", ascending: true });
      if (error) throw error;
      return (data ?? []) as CardioSesionWithDetails[];
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
        .not("fecha_fin", "is", null)
        .gte("fecha_inicio", from)
        .lte("fecha_inicio", to);
      if (error) throw error;
      return (data ?? []).map((s) => new Date(s.fecha_inicio));
    },
  });
}

export type UpsertCardioSessionResult = {
  sessionId: string;
  xp: XPBreakdown | null;
  logros: LogroRow[];
};

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
    }): Promise<UpsertCardioSessionResult> => {
      const payload = {
        titulo: input.titulo,
        fecha_inicio: input.fecha_inicio,
        fecha_fin: input.fecha_fin ?? null,
        comentarios: input.comentarios ?? null,
        es_publica: input.es_publica ?? false,
        rpe: input.rpe ?? null,
        cardio_disciplina_id: input.cardio_disciplina_id ?? null,
        usuario_id: user!.id,
      };

      let sessionId = id ?? null;
      let previousFechaFin: string | null = null;
      if (sessionId) {
        const { data: existing, error: existingErr } = await supabase
          .from("cardio_sesion")
          .select("fecha_fin")
          .eq("id", sessionId)
          .maybeSingle();
        if (existingErr) throw existingErr;
        previousFechaFin = existing?.fecha_fin ?? null;
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

      await supabase.from("cardio_sesion_running").delete().eq("cardio_sesion_id", sessionId);
      await supabase.from("cardio_sesion_cycling").delete().eq("cardio_sesion_id", sessionId);

      if (input.sport_detail?.disciplina_codigo === "running") {
        const { error } = await supabase.from("cardio_sesion_running").insert({
          cardio_sesion_id: sessionId,
          ritmo_medio_seg_km: input.sport_detail.running.ritmo_medio_seg_km ?? null,
          cadencia_media_spm: input.sport_detail.running.cadencia_media_spm ?? null,
          desnivel_positivo_m: input.sport_detail.running.desnivel_positivo_m ?? null,
          zancada_media_cm: input.sport_detail.running.zancada_media_cm ?? null,
        });
        if (error) throw error;
      }

      if (input.sport_detail?.disciplina_codigo === "cycling") {
        const { error } = await supabase.from("cardio_sesion_cycling").insert({
          cardio_sesion_id: sessionId,
          potencia_media_w: input.sport_detail.cycling.potencia_media_w ?? null,
          potencia_normalizada_w: input.sport_detail.cycling.potencia_normalizada_w ?? null,
          cadencia_media_rpm: input.sport_detail.cycling.cadencia_media_rpm ?? null,
          desnivel_positivo_m: input.sport_detail.cycling.desnivel_positivo_m ?? null,
          tipo_bici: input.sport_detail.cycling.tipo_bici ?? null,
        });
        if (error) throw error;
      }

      if (input.track) {
        const { data: upsertedTrack, error: trackError } = await supabase
          .from("cardio_track")
          .upsert(
            {
              cardio_sesion_id: sessionId,
              fuente: input.track.fuente ?? null,
              distancia_total_m: input.track.distancia_total_m ?? null,
              duracion_total_seg: input.track.duracion_total_seg ?? null,
              elevacion_positiva_m: input.track.elevacion_positiva_m ?? null,
            },
            { onConflict: "cardio_sesion_id" },
          )
          .select("id")
          .single();
        if (trackError) throw trackError;

        const trackId = upsertedTrack.id;
        const { error: deleteTrackPointsError } = await supabase.from("cardio_track_point").delete().eq("cardio_track_id", trackId);
        if (deleteTrackPointsError) throw deleteTrackPointsError;

        if (input.track.puntos.length > 0) {
          const prepared = prepareTrackPointsForStorage(input.track.puntos, MAX_TRACK_POINTS_DB);
          const pointRows = prepared.map((p, idx) => ({
            cardio_track_id: trackId,
            orden: p.orden ?? idx,
            lat: p.lat,
            lng: p.lng,
            elevacion_m: p.elevacion_m ?? null,
            timestamp_utc: p.timestamp_utc ?? null,
            velocidad_m_s: p.velocidad_m_s ?? null,
            fc: p.fc ?? null,
            cadencia: p.cadencia ?? null,
            potencia_w: p.potencia_w ?? null,
          }));
          for (let i = 0; i < pointRows.length; i += TRACK_POINTS_INSERT_CHUNK) {
            const chunk = pointRows.slice(i, i + TRACK_POINTS_INSERT_CHUNK);
            const { error: pointsError } = await supabase.from("cardio_track_point").insert(chunk);
            if (pointsError) throw pointsError;
          }
        }
      } else if (sessionId) {
        const { data: existingTrack } = await supabase
          .from("cardio_track")
          .select("id")
          .eq("cardio_sesion_id", sessionId)
          .maybeSingle();
        if (existingTrack?.id) {
          await supabase.from("cardio_track_point").delete().eq("cardio_track_id", existingTrack.id);
          await supabase.from("cardio_track").delete().eq("id", existingTrack.id);
        }
      }

      if (!sessionId) throw new Error("No se pudo guardar la sesión.");

      const firstComplete = Boolean(input.fecha_fin) && !previousFechaFin;
      let xp: XPBreakdown | null = null;
      if (firstComplete && user?.id) {
        const durationSec = resolveCardioDurationSec({
          blockDurationsSec: input.bloques.map((b) => b.duracion_seg),
          fechaInicio: input.fecha_inicio,
          fechaFin: input.fecha_fin,
          trackDurationSec: input.track?.duracion_total_seg,
        });
        const days = await fetchCompletedTrainingDayKeys(user.id);
        const { actual: newStreak } = computeStreakStats(days);
        const parts = calculateCardioSessionXp(durationSec, newStreak);
        xp = await awardSessionXp({
          userId: user.id,
          parts,
          fechaEntrenamiento: input.fecha_inicio.slice(0, 10),
        });
      }

      let logros: LogroRow[] = [];
      if (input.fecha_fin && user?.id) {
        try {
          const awarded = await checkAndAwardLogros(user.id);
          logros = awarded.nuevos;
        } catch {
          logros = [];
        }
      }

      return { sessionId, xp, logros };
    },
    onSuccess: (result, { input }) => {
      qc.invalidateQueries({ queryKey: ["cardioSessions"] });
      qc.invalidateQueries({ queryKey: ["cardioSession"] });
      qc.invalidateQueries({ queryKey: ["cardioHistory"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessionDates"] });
      qc.invalidateQueries({ queryKey: ["cardioDisciplinas"] });
      qc.invalidateQueries({ queryKey: ["activeCardioSession"] });
      qc.invalidateQueries({ queryKey: ["trainingLoad"] });
      qc.invalidateQueries({ queryKey: ["communityFeed"] });
      qc.invalidateQueries({ queryKey: ["profileStats"] });
      if (input.fecha_fin) {
        qc.invalidateQueries({ queryKey: ["lastCardioDisciplineId"] });
        qc.invalidateQueries({ queryKey: ["logros"] });
      }

      // Edición de una sesión ya cerrada: no hay modal de XP, celebrar logros aquí.
      if (!result.xp && result.logros.length > 0) {
        notifyLogrosDesbloqueados(result.logros);
      }
    },
  });
}

export function useStartCardioLiveSession() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { cardio_disciplina_id: string; titulo: string }) => {
      if (!user?.id) throw new Error("Sesión no iniciada.");
      const titulo = input.titulo.trim();
      if (!titulo) throw new Error("Falta el título.");
      const cardio_disciplina_id = input.cardio_disciplina_id?.trim();
      if (!cardio_disciplina_id) throw new Error("Falta el tipo de cardio.");

      // Sesión abierta: no enviar usuario_id (usa DEFAULT auth.uid() en BD) ni fecha_fin (queda NULL).
      // es_publica false hasta finalizar: evita CHECK/triggers que exijan sesión "completa" para públicas.
      // No enviar `deporte`: muchos proyectos solo tienen cardio_disciplina_id (columna legacy ausente en Supabase).
      const { data, error } = await supabase
        .from("cardio_sesion")
        .insert({
          titulo,
          fecha_inicio: new Date().toISOString(),
          comentarios: null,
          es_publica: false,
          cardio_disciplina_id,
        })
        .select("id")
        .single();
      if (error) {
        console.error("useStartCardioLiveSession", error);
        throw error;
      }
      return data.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeCardioSession"] });
      qc.invalidateQueries({ queryKey: ["cardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessionDates"] });
      qc.invalidateQueries({ queryKey: ["cardioSession"] });
    },
  });
}

export function useDeleteCardioSession() {
  const qc = useQueryClient();
  const removeXP = useRemoveCardioXP();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: session, error: sessionErr } = await supabase
        .from("cardio_sesion")
        .select("fecha_inicio, fecha_fin")
        .eq("id", id)
        .maybeSingle();
      if (sessionErr) throw sessionErr;

      const { data: bloques, error: bloquesErr } = await supabase
        .from("cardio_bloque")
        .select("duracion_seg")
        .eq("cardio_sesion_id", id);
      if (bloquesErr) throw bloquesErr;

      const { data: track, error: trackErr } = await supabase
        .from("cardio_track")
        .select("duracion_total_seg")
        .eq("cardio_sesion_id", id)
        .maybeSingle();
      if (trackErr) throw trackErr;

      if (session?.fecha_fin) {
        const durationSec = resolveCardioDurationSec({
          blockDurationsSec: (bloques ?? []).map((b) => b.duracion_seg),
          fechaInicio: session.fecha_inicio,
          fechaFin: session.fecha_fin,
          trackDurationSec: track?.duracion_total_seg,
        });
        await removeXP(id, durationSec);
      }

      // La BD base referencia cardio_sesion sin ON DELETE CASCADE en varias tablas → DELETE directo da 409.
      const { data: tracks, error: trackListErr } = await supabase.from("cardio_track").select("id").eq("cardio_sesion_id", id);
      if (trackListErr) throw trackListErr;

      for (const row of tracks ?? []) {
        const { error: ptsErr } = await supabase.from("cardio_track_point").delete().eq("cardio_track_id", row.id);
        if (ptsErr) throw ptsErr;
      }
      const { error: trkErr } = await supabase.from("cardio_track").delete().eq("cardio_sesion_id", id);
      if (trkErr) throw trkErr;

      const { error: runErr } = await supabase.from("cardio_sesion_running").delete().eq("cardio_sesion_id", id);
      if (runErr) throw runErr;
      const { error: cycErr } = await supabase.from("cardio_sesion_cycling").delete().eq("cardio_sesion_id", id);
      if (cycErr) throw cycErr;
      const { error: blqErr } = await supabase.from("cardio_bloque").delete().eq("cardio_sesion_id", id);
      if (blqErr) throw blqErr;

      const { error: planErr } = await supabase
        .from("cardio_rutina_programada")
        .update({ cardio_sesion_id: null })
        .eq("cardio_sesion_id", id);
      if (planErr) throw planErr;

      const { error } = await supabase.from("cardio_sesion").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessions"] });
      qc.invalidateQueries({ queryKey: ["monthCardioSessionDates"] });
      qc.invalidateQueries({ queryKey: ["activeCardioSession"] });
      qc.invalidateQueries({ queryKey: ["cardioSession"] });
      qc.invalidateQueries({ queryKey: ["cardioHistory"] });
      qc.invalidateQueries({ queryKey: ["communityFeed"] });
      qc.invalidateQueries({ queryKey: ["trainingLoad"] });
      qc.invalidateQueries({ queryKey: ["profileStats"] });
    },
  });
}

