import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useCardioHistory } from "@/hooks/useCardioSessions";
import { attachCardioTrackPreviews } from "@/lib/attachCardioTrackPreviews";
import { mergeDatedFeedEntries } from "@/lib/communityFeedMerge";
import type { ActividadWithDetails } from "@/types/workout";
import type { CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";

export type ProfileActivityGymItem = {
  type: "gym";
  fecha: string;
  workout: ActividadWithDetails;
};

export type ProfileActivityCardioItem = {
  type: "cardio";
  fecha: string;
  session: CardioSesionWithDetails;
};

export type ProfileActivityItem = ProfileActivityGymItem | ProfileActivityCardioItem;

/**
 * Historial mixto gym + cardio para el drawer de perfil.
 * Contador total = todas las sesiones; `items` = últimos `limit` por fecha.
 */
export function useProfileActivityHistory(profileUserId?: string, limit = 5) {
  const { user } = useAuth();
  const id = profileUserId ?? user?.id;
  const isSelf = !!id && id === user?.id;

  const workoutsQuery = useWorkoutHistory(id);
  const cardioQuery = useCardioHistory(id, { onlyPublic: !isSelf });

  const workouts = workoutsQuery.data ?? [];
  const cardio = cardioQuery.data ?? [];

  const { items, totalCount } = useMemo(() => {
    const gymEntries = workouts.map((w) => ({
      id: w.id,
      fecha: w.fecha,
      payload: w,
    }));
    const cardioEntries = cardio.map((s) => ({
      id: s.id,
      fecha: s.fecha_inicio,
      payload: s,
    }));

    const { items: merged } = mergeDatedFeedEntries(
      gymEntries,
      cardioEntries,
      Math.max(limit, gymEntries.length + cardioEntries.length),
    );

    const recent: ProfileActivityItem[] = merged.slice(0, limit).map((m) => {
      if (m.source === "a") {
        return { type: "gym" as const, fecha: m.entry.fecha, workout: m.entry.payload };
      }
      return { type: "cardio" as const, fecha: m.entry.fecha, session: m.entry.payload };
    });

    return {
      items: recent,
      totalCount: workouts.length + cardio.length,
    };
  }, [workouts, cardio, limit]);

  const previewSessions = useMemo(
    () => items.filter((i): i is ProfileActivityCardioItem => i.type === "cardio").map((i) => i.session),
    [items],
  );
  const previewKey = previewSessions.map((s) => s.id).join(",");

  const previewsQuery = useQuery({
    queryKey: ["profileCardioPreviews", id, previewKey],
    enabled: !!id && previewSessions.length > 0,
    queryFn: () => attachCardioTrackPreviews(previewSessions),
  });

  const previewById = useMemo(
    () => new Map((previewsQuery.data ?? []).map((s) => [s.id, s])),
    [previewsQuery.data],
  );

  const displayItems = useMemo(
    () =>
      items.map((item) => {
        if (item.type !== "cardio") return item;
        const hydrated = previewById.get(item.session.id);
        return hydrated ? { ...item, session: hydrated } : item;
      }),
    [items, previewById],
  );

  return {
    items: displayItems,
    totalCount,
    isLoading: workoutsQuery.isLoading || cardioQuery.isLoading,
  };
}
