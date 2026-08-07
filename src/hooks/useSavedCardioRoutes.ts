import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  TRACK_POINTS_INSERT_CHUNK,
  prepareTrackPointsForStorage,
} from "@/lib/cardioTrackPoints";
import {
  computeCardioSessionMetrics,
  extractCardioTrackPoints,
  type CardioSesionWithDetails,
} from "@/lib/cardioSessionDisplay";
import { formatCardioDistanceM } from "@/lib/cardioFormat";
import type { CardioRutaWithPoints, SelectedCardioRoute } from "@/types/cardio";

const CARDIO_RUTA_SELECT = `
  *,
  cardio_ruta_punto(*)
`;

function sortRoutePoints(route: CardioRutaWithPoints): CardioRutaWithPoints {
  const puntos = [...(route.cardio_ruta_punto ?? [])].sort((a, b) => a.orden - b.orden);
  return { ...route, cardio_ruta_punto: puntos };
}

export function routeToSelected(route: CardioRutaWithPoints): SelectedCardioRoute {
  const sorted = sortRoutePoints(route);
  return {
    id: sorted.id,
    nombre: sorted.nombre,
    distancia_total_m: sorted.distancia_total_m,
    elevacion_positiva_m: sorted.elevacion_positiva_m,
    points: (sorted.cardio_ruta_punto ?? []).map((p) => ({
      lat: p.lat,
      lng: p.lng,
      elevacion_m: p.elevacion_m,
    })),
  };
}

export function defaultRouteNameFromSession(session: CardioSesionWithDetails): string {
  const title = session.titulo?.trim();
  if (title) return title.slice(0, 120);
  const metrics = computeCardioSessionMetrics(session);
  return `Ruta · ${formatCardioDistanceM(metrics.distanceM)}`;
}

export function useSavedCardioRoutes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["savedCardioRoutes", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CardioRutaWithPoints[]> => {
      const { data, error } = await supabase
        .from("cardio_ruta")
        .select(CARDIO_RUTA_SELECT)
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => sortRoutePoints(row as CardioRutaWithPoints));
    },
  });
}

export function useSaveCardioRouteFromSession() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      session: CardioSesionWithDetails;
      nombre?: string;
      descripcion?: string | null;
    }) => {
      if (!user) throw new Error("No autenticado");

      const points = extractCardioTrackPoints(input.session);
      if (points.length < 2) throw new Error("La sesión no tiene recorrido GPS");

      const metrics = computeCardioSessionMetrics(input.session);
      const prepared = prepareTrackPointsForStorage(
        points.map((p, idx) => ({
          orden: idx,
          lat: p.lat,
          lng: p.lng,
          elevacion_m: p.elevacion_m ?? null,
        })),
      );

      const nombre = (input.nombre?.trim() || defaultRouteNameFromSession(input.session)).slice(0, 120);

      const { data: ruta, error: insertErr } = await supabase
        .from("cardio_ruta")
        .insert({
          usuario_id: user.id,
          nombre,
          descripcion: input.descripcion?.trim() || null,
          cardio_disciplina_id: input.session.cardio_disciplina_id,
          distancia_total_m: metrics.distanceM || null,
          elevacion_positiva_m: metrics.elevationM || null,
          origen_cardio_sesion_id: input.session.id,
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      const pointRows = prepared.map((p, idx) => ({
        cardio_ruta_id: ruta.id,
        orden: p.orden ?? idx,
        lat: p.lat,
        lng: p.lng,
        elevacion_m: p.elevacion_m ?? null,
      }));

      for (let i = 0; i < pointRows.length; i += TRACK_POINTS_INSERT_CHUNK) {
        const chunk = pointRows.slice(i, i + TRACK_POINTS_INSERT_CHUNK);
        const { error: pointsError } = await supabase.from("cardio_ruta_punto").insert(chunk);
        if (pointsError) throw pointsError;
      }

      return ruta.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savedCardioRoutes"] });
    },
  });
}

export function useDeleteSavedCardioRoute() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rutaId: string) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("cardio_ruta")
        .delete()
        .eq("id", rutaId)
        .eq("usuario_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savedCardioRoutes"] });
    },
  });
}
