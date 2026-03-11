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
  series: number;
  total: number;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  newStreak: number;
}

// Fórmula de niveles
export function calculateLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

// Barra de progreso visual
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
    percent: Math.min(100, Math.max(0, Math.round((progress / needed) * 100))) 
  };
}

// Obtener datos del perfil en tiempo real
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
        return {
          nivel: 1,
          xp_total: 0,
          racha_actual: 0,
          racha_maxima: 0,
          ultima_actividad_fecha: null,
        };
      }

      return data as unknown as ProfileStats;
    },
  });
}

// Función que calcula la XP y ACTUALIZA la base de datos desde el frontend
export function useCalculateAndAwardXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const calculateAndAwardXP = useCallback(
    async (actividadId: string, seriesCompletadas: number): Promise<XPBreakdown> => {
      if (!user) throw new Error("No user");

      // 1. Obtener perfil actual (tabla "perfil" no está en tipos generados de Supabase)
      const { data: profile, error: pErr } = await supabase
        .from("perfil" as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (pErr) throw pErr;

      type PerfilRow = { xp_total?: number; racha_actual?: number; racha_maxima?: number; ultima_actividad_fecha?: string | null };
      const p: PerfilRow = (profile as PerfilRow) || { xp_total: 0, racha_actual: 0, racha_maxima: 0, ultima_actividad_fecha: null };
      
      // 2. Calcular nuevas métricas (XP y Nivel)
      const baseXP = 100;
      const volumeXP = seriesCompletadas * 5;
      const totalXP = baseXP + volumeXP;

      const previousXP = p.xp_total ?? 0;
      const newXP = previousXP + totalXP;
      const previousLevel = calculateLevel(previousXP);
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > previousLevel;

      // 3. Lógica de Rachas (Streaks)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = p.ultima_actividad_fecha ? new Date(p.ultima_actividad_fecha) : null;
      let newStreak = p.racha_actual ?? 0;

      if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1; // Entrenó días consecutivos
        } else if (diffDays > 1) {
          newStreak = 1; // Perdió la racha, empieza en 1
        }
        // Si diffDays === 0, es el mismo día, mantiene la racha
      } else {
        newStreak = 1; // Primer entreno
      }

      const newMaxStreak = Math.max(newStreak, p.racha_maxima ?? 0);

      // 4. Actualizar la base de datos
      const { error: uErr } = await supabase
        .from("perfil" as any)
        .update({
          xp_total: newXP,
          nivel: newLevel,
          racha_actual: newStreak,
          racha_maxima: newMaxStreak,
          ultima_actividad_fecha: new Date().toISOString(),
        })
        .eq("id", user.id);
        
      if (uErr) throw uErr;

      // 5. Refrescar la UI
      queryClient.invalidateQueries({ queryKey: ["profileStats"] });

      return {
        base: baseXP,
        series: volumeXP,
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

// NUEVO HOOK: Función para restar XP cuando se borra un entrenamiento
export function useRemoveWorkoutXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const removeXP = useCallback(
    async (actividadId: string, seriesCompletadas: number) => {
      if (!user) throw new Error("No user");

      // 1. Obtener perfil actual (tabla "perfil" no está en tipos generados de Supabase)
      const { data: profile, error: pErr } = await supabase
        .from("perfil" as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (pErr) throw pErr;
      if (!profile) return; // Si no hay perfil, no hay nada que restar

      const prof = profile as { xp_total?: number };
      // 2. Calcular los puntos a restar
      const baseXP = 100;
      const volumeXP = seriesCompletadas * 5;
      const totalToRemove = baseXP + volumeXP;

      const previousXP = prof.xp_total ?? 0;
      const newXP = Math.max(0, previousXP - totalToRemove); // GREATEST: Evitar XP negativa
      const newLevel = calculateLevel(newXP);

      // 3. Buscar cuál fue la última actividad ANTES de la que estamos borrando
      // para restaurar la "ultima_actividad_fecha" correctamente
      const { data: lastAct } = await supabase
        .from("actividad")
        .select("fecha_fin")
        .eq("usuario_id", user.id)
        .neq("id", actividadId) // Excluir la que estamos borrando
        .not("fecha_fin", "is", null)
        .order("fecha_fin", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nuevaUltimaFecha = lastAct?.fecha_fin || null;

      // 4. Actualizar la base de datos (XP, Nivel y Fecha)
      const { error: uErr } = await supabase
        .from("perfil" as any)
        .update({
          xp_total: newXP,
          nivel: newLevel,
          ultima_actividad_fecha: nuevaUltimaFecha,
        })
        .eq("id", user.id);
        
      if (uErr) throw uErr;

      // 5. Refrescar la UI
      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
    },
    [user, queryClient]
  );

  return removeXP;
}