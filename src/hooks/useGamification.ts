import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";
import {
  computeStreakStats,
  streakOnWeek,
  weekStartKeyFromDayStr,
  workoutDaysToWeeks,
} from "@/lib/streakWeeks";
import { calculateCardioSessionXp, calculateStrengthSessionXp, type SessionXpParts } from "@/lib/sessionXp";
import {
  dayKeyToUltimaFechaIso,
  fetchCompletedTrainingDayKeys,
  latestDayKey,
} from "@/lib/trainingDays";

export interface ProfileStats {
  nivel: number;
  xp_total: number;
  racha_actual: number;
  racha_maxima: number;
  ultima_actividad_fecha: string | null;
}

export interface XPBreakdown {
  base: number;
  series: number;
  streakBonus: number;
  total: number;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  newStreak: number;
  volumeLabel?: "Volumen" | "Duración";
}

export function calculateLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export function xpProgress(xp: number) {
  const level = calculateLevel(xp);
  const currentLevelFloor = (level - 1) * 1000;
  const nextLevelXp = level * 1000;
  const progress = xp - currentLevelFloor;
  const needed = nextLevelXp - currentLevelFloor;
  return {
    level,
    progress,
    needed,
    percent: Math.min(100, Math.max(0, Math.round((progress / needed) * 100))),
  };
}

function toBreakdown(
  parts: SessionXpParts,
  previousXP: number,
  newStreak: number,
): XPBreakdown {
  const newXP = previousXP + parts.total;
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);
  return {
    base: parts.base,
    series: parts.series,
    streakBonus: parts.streakBonus,
    total: parts.total,
    leveledUp: newLevel > previousLevel,
    newLevel,
    previousLevel,
    newStreak,
    volumeLabel: parts.volumeLabel,
  };
}

async function persistProfileXp(opts: {
  userId: string;
  newXP: number;
  newLevel: number;
  newStreak: number;
  newMaxStreak: number;
  ultimaFechaISO: string | null;
}) {
  const { error } = await supabase
    .from("perfil")
    .update({
      xp_total: opts.newXP,
      nivel: opts.newLevel,
      racha_actual: opts.newStreak,
      racha_maxima: opts.newMaxStreak,
      ultima_actividad_fecha: opts.ultimaFechaISO,
    })
    .eq("id", opts.userId);
  if (error) throw error;
}

export async function awardSessionXp(opts: {
  userId: string;
  parts: SessionXpParts;
  fechaEntrenamiento?: string;
}): Promise<XPBreakdown> {
  const { data: profile, error: pErr } = await supabase
    .from("perfil")
    .select("xp_total")
    .eq("id", opts.userId)
    .maybeSingle();
  if (pErr) throw pErr;

  const previousXP = profile?.xp_total ?? 0;
  const days = await fetchCompletedTrainingDayKeys(opts.userId);
  const { actual: newStreak, maxima: newMaxStreak } = computeStreakStats(days);
  const breakdown = toBreakdown(opts.parts, previousXP, newStreak);
  const ultimaFechaISO = opts.fechaEntrenamiento
    ? new Date(`${opts.fechaEntrenamiento}T23:59:59.999Z`).toISOString()
    : new Date().toISOString();

  await persistProfileXp({
    userId: opts.userId,
    newXP: previousXP + opts.parts.total,
    newLevel: breakdown.newLevel,
    newStreak,
    newMaxStreak,
    ultimaFechaISO,
  });

  return breakdown;
}

export async function removeSessionXp(opts: {
  userId: string;
  totalToRemove: number;
  excludeActividadId?: string;
  excludeCardioId?: string;
}) {
  const { data: profile, error: pErr } = await supabase
    .from("perfil")
    .select("xp_total")
    .eq("id", opts.userId)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!profile) return;

  const remainingDays = await fetchCompletedTrainingDayKeys(opts.userId, {
    excludeActividadId: opts.excludeActividadId,
    excludeCardioId: opts.excludeCardioId,
  });
  const { actual: nuevaRachaActual, maxima: nuevaRachaMaxima } = computeStreakStats(remainingDays);
  const previousXP = profile.xp_total ?? 0;
  const newXP = Math.max(0, previousXP - opts.totalToRemove);
  const newLevel = calculateLevel(newXP);

  await persistProfileXp({
    userId: opts.userId,
    newXP,
    newLevel,
    newStreak: nuevaRachaActual,
    newMaxStreak: nuevaRachaMaxima,
    ultimaFechaISO: dayKeyToUltimaFechaIso(latestDayKey(remainingDays)),
  });
}

export function useProfileStats(profileUserId?: string) {
  const { user } = useAuth();
  const id = profileUserId ?? user?.id;

  return useQuery({
    queryKey: ["profileStats", id],
    enabled: !!id,
    queryFn: async (): Promise<ProfileStats> => {
      const [perfilRes, days] = await Promise.all([
        supabase
          .from("perfil")
          .select("nivel, xp_total, racha_actual, racha_maxima, ultima_actividad_fecha")
          .eq("id", id!)
          .maybeSingle(),
        fetchCompletedTrainingDayKeys(id!),
      ]);

      if (perfilRes.error) throw perfilRes.error;

      const data = perfilRes.data;
      const { actual, maxima } = computeStreakStats(days);

      if (!data) {
        return {
          nivel: 1,
          xp_total: 0,
          racha_actual: actual,
          racha_maxima: maxima,
          ultima_actividad_fecha: null,
        };
      }

      return {
        nivel: data.nivel,
        xp_total: data.xp_total,
        racha_actual: actual,
        racha_maxima: maxima,
        ultima_actividad_fecha: data.ultima_actividad_fecha,
      };
    },
  });
}

export function useCalculateAndAwardXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const calculateAndAwardXP = useCallback(
    async (_actividadId: string, seriesCompletadas: number, fechaEntrenamiento?: string): Promise<XPBreakdown> => {
      if (!user) throw new Error("No user");

      const days = await fetchCompletedTrainingDayKeys(user.id);
      const { actual: newStreak } = computeStreakStats(days);
      const parts = calculateStrengthSessionXp(seriesCompletadas, newStreak);
      const breakdown = await awardSessionXp({
        userId: user.id,
        parts,
        fechaEntrenamiento,
      });

      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
      return breakdown;
    },
    [user, queryClient],
  );

  return calculateAndAwardXP;
}

export function useRemoveWorkoutXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const removeXP = useCallback(
    async (actividadId: string, seriesCompletadas: number) => {
      if (!user) throw new Error("No user");

      const { data: deletedAct, error: actErr } = await supabase
        .from("actividad")
        .select("fecha, fecha_fin")
        .eq("id", actividadId)
        .maybeSingle();
      if (actErr) throw actErr;
      if (!deletedAct?.fecha_fin) return;

      const completedDay = deletedAct.fecha
        ? deletedAct.fecha.slice(0, 10)
        : deletedAct.fecha_fin.slice(0, 10);

      const daysIncluding = await fetchCompletedTrainingDayKeys(user.id);
      const streak = completedDay
        ? streakOnWeek(weekStartKeyFromDayStr(completedDay), workoutDaysToWeeks(daysIncluding))
        : 0;
      const { total: totalToRemove } = calculateStrengthSessionXp(seriesCompletadas, streak);

      await removeSessionXp({
        userId: user.id,
        totalToRemove,
        excludeActividadId: actividadId,
      });

      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
    },
    [user, queryClient],
  );

  return removeXP;
}

export function useRemoveCardioXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const removeXP = useCallback(
    async (cardioSesionId: string, durationSec: number) => {
      if (!user) throw new Error("No user");

      const { data: deleted, error } = await supabase
        .from("cardio_sesion")
        .select("fecha_inicio, fecha_fin")
        .eq("id", cardioSesionId)
        .maybeSingle();
      if (error) throw error;
      if (!deleted?.fecha_fin) return;

      const completedDay = (deleted.fecha_inicio || deleted.fecha_fin).slice(0, 10);
      const daysIncluding = await fetchCompletedTrainingDayKeys(user.id);
      const streak = completedDay
        ? streakOnWeek(weekStartKeyFromDayStr(completedDay), workoutDaysToWeeks(daysIncluding))
        : 0;
      const { total: totalToRemove } = calculateCardioSessionXp(durationSec, streak);

      await removeSessionXp({
        userId: user.id,
        totalToRemove,
        excludeCardioId: cardioSesionId,
      });

      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
    },
    [user, queryClient],
  );

  return removeXP;
}
