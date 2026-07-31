import { useEffect, useRef } from "react";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useActiveCardioSession } from "@/hooks/useActiveCardioSession";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";
import {
  startLiveCardio,
  startLiveWorkout,
  stopLiveCardio,
  stopLiveWorkout,
} from "@/lib/liveSessionNotifications";
import { isNativeApp } from "@/lib/nativeAuth";

function disciplineNombre(data: {
  cardio_disciplina?: { nombre?: string | null; codigo?: string | null } | { nombre?: string | null; codigo?: string | null }[] | null;
  titulo?: string | null;
}): { title: string; codigo: string | null } {
  const d = data.cardio_disciplina;
  const row = Array.isArray(d) ? d[0] : d;
  const title = (row?.nombre?.trim() || data.titulo?.trim() || "Cardio") as string;
  return { title, codigo: row?.codigo ?? null };
}

/**
 * Rehydrates Android Live Updates when the app opens with an unfinished gym/cardio session.
 */
export function LiveSessionRehydrator() {
  const { data: workout } = useActiveWorkout();
  const { data: cardio } = useActiveCardioSession();
  const { liveSessionEnabled } = useNotificationPreferences();
  const lastWorkoutId = useRef<string | null>(null);
  const lastCardioId = useRef<string | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;

    if (!liveSessionEnabled) {
      lastWorkoutId.current = null;
      void stopLiveWorkout();
      return;
    }

    if (!workout) {
      if (lastWorkoutId.current) {
        lastWorkoutId.current = null;
        void stopLiveWorkout();
      }
      return;
    }

    if (lastWorkoutId.current === workout.id) return;
    lastWorkoutId.current = workout.id;
    void startLiveWorkout({
      sessionId: workout.id,
      title: workout.titulo?.trim() || "Entrenamiento",
      startedAtMs: new Date(workout.fecha).getTime(),
    });
  }, [workout?.id, workout?.titulo, workout?.fecha, liveSessionEnabled]);

  useEffect(() => {
    if (!isNativeApp()) return;

    if (!liveSessionEnabled) {
      lastCardioId.current = null;
      void stopLiveCardio();
      return;
    }

    if (!cardio) {
      if (lastCardioId.current) {
        lastCardioId.current = null;
        void stopLiveCardio();
      }
      return;
    }

    if (lastCardioId.current === cardio.id) return;
    lastCardioId.current = cardio.id;
    const { title, codigo } = disciplineNombre(cardio);
    void startLiveCardio({
      sessionId: cardio.id,
      title,
      startedAtMs: new Date(cardio.fecha_inicio).getTime(),
      wantsLocation: cardioDisciplineUsesGpsMap(codigo),
    });
  }, [cardio?.id, cardio?.titulo, cardio?.fecha_inicio, cardio?.cardio_disciplina, liveSessionEnabled]);

  return null;
}
