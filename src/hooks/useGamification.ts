import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";

export interface ProfileStats {
  nivel: number;
  xp_total: number;
  racha_actual: number;
  racha_maxima: number;
  ultima_actividad_fecha: string | null;
}

export interface XPBreakdown {
  base: number;
  volume: number;
  total: number;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  newStreak: number;
}

function calculateLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

function xpForNextLevel(level: number) {
  return level * 1000;
}

export function xpProgress(xp: number) {
  const level = calculateLevel(xp);
  const currentLevelFloor = (level - 1) * 1000;
  const nextLevelXp = xpForNextLevel(level);
  const progress = xp - currentLevelFloor;
  const needed = nextLevelXp - currentLevelFloor;
  return { level, progress, needed, percent: Math.min(100, Math.round((progress / needed) * 100)) };
}

export function useProfileStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profileStats", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ProfileStats> => {
      const { data, error } = await supabase
        .from("perfil" as any)
        .select("nivel, xp_total, racha_actual, racha_maxima, ultima_actividad_fecha")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const defaults = {
          id: user!.id,
          nivel: 1,
          xp_total: 0,
          racha_actual: 0,
          racha_maxima: 0,
          ultima_actividad_fecha: null,
        };
        const { error: insertError } = await supabase
          .from("perfil" as any)
          .insert(defaults as any);
        if (insertError) throw insertError;
        return defaults;
      }

      return data as unknown as ProfileStats;
    },
  });
}

export function useCalculateAndAwardXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const calculateAndAwardXP = useCallback(
    async (actividadId: string, seriesCompletadas: number): Promise<XPBreakdown> => {
      if (!user) throw new Error("No user");

      // Get current profile
      const { data: profile, error: pErr } = await supabase
        .from("perfil" as any)
        .select("*")
        .eq("id", user.id)
        .single();
      if (pErr) throw pErr;

      const p = profile as any;
      const baseXP = 100;
      const volumeXP = seriesCompletadas * 5;
      const totalXP = baseXP + volumeXP;

      const previousXP = p.xp_total ?? 0;
      const newXP = previousXP + totalXP;
      const previousLevel = calculateLevel(previousXP);
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > previousLevel;

      // Streak logic
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = p.ultima_actividad_fecha ? new Date(p.ultima_actividad_fecha) : null;
      let newStreak = p.racha_actual ?? 0;

      if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
        // diffDays === 0 means same day, keep streak
      } else {
        newStreak = 1;
      }

      const newMaxStreak = Math.max(newStreak, p.racha_maxima ?? 0);

      const { error: uErr } = await supabase
        .from("perfil" as any)
        .update({
          xp_total: newXP,
          nivel: newLevel,
          racha_actual: newStreak,
          racha_maxima: newMaxStreak,
          ultima_actividad_fecha: new Date().toISOString(),
        } as any)
        .eq("id", user.id);
      if (uErr) throw uErr;

      queryClient.invalidateQueries({ queryKey: ["profileStats"] });

      return {
        base: baseXP,
        volume: volumeXP,
        total: totalXP,
        leveledUp,
        newLevel,
        previousLevel,
        newStreak,
      };
    },
    [user, queryClient]
  );

  return calculateAndAwardXP;
}
