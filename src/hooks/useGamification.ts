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
  streakBonus: number;
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
    async (actividadId: string, seriesCompletadas: number, fechaEntrenamiento?: string): Promise<XPBreakdown> => {
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

      // 3. Lógica de Rachas (Streaks) — usamos la fecha del entrenamiento, no "hoy"
      const workoutDay = fechaEntrenamiento ? new Date(fechaEntrenamiento + "T12:00:00.000Z") : new Date();
      workoutDay.setUTCHours(0, 0, 0, 0);
      const lastDate = p.ultima_actividad_fecha ? new Date(p.ultima_actividad_fecha) : null;
      let newStreak = p.racha_actual ?? 0;

      if (lastDate) {
        lastDate.setUTCHours(0, 0, 0, 0);
        const diffDays = Math.floor((workoutDay.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1; // Entrenó días consecutivos
        } else if (diffDays > 1) {
          newStreak = 1; // Perdió la racha, empieza en 1
        }
        // Si diffDays === 0, es el mismo día, mantiene la racha
      } else {
        newStreak = 1; // Primer entreno
      }

      // Bonus por racha: 20 XP por cada día de racha a partir del 2º (2 días → 20, 3 → 40, 4 → 60…)
      const streakBonusXP = Math.max(0, (newStreak - 1) * 20);
      const totalXP = baseXP + volumeXP + streakBonusXP;

      const previousXP = p.xp_total ?? 0;
      const newXP = previousXP + totalXP;
      const previousLevel = calculateLevel(previousXP);
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > previousLevel;

      const newMaxStreak = Math.max(newStreak, p.racha_maxima ?? 0);

      // ultima_actividad_fecha = fecha del entrenamiento (no "ahora") para que la racha use el día registrado
      const ultimaFechaISO = fechaEntrenamiento
        ? new Date(fechaEntrenamiento + "T23:59:59.999Z").toISOString()
        : new Date().toISOString();

      // 4. Actualizar la base de datos
      const { error: uErr } = await supabase
        .from("perfil" as any)
        .update({
          xp_total: newXP,
          nivel: newLevel,
          racha_actual: newStreak,
          racha_maxima: newMaxStreak,
          ultima_actividad_fecha: ultimaFechaISO,
        })
        .eq("id", user.id);
        
      if (uErr) throw uErr;

      // 5. Refrescar la UI
      queryClient.invalidateQueries({ queryKey: ["profileStats"] });

      return {
        base: baseXP,
        series: volumeXP,
        streakBonus: streakBonusXP,
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

/** Dado un día (YYYY-MM-DD) y un set de días con entrenamiento, devuelve la racha ese día (días consecutivos hacia atrás). */
function streakOnDay(dayStr: string, workoutDays: Set<string>): number {
  if (!workoutDays.has(dayStr)) return 0;
  let count = 1;
  const d = new Date(dayStr + "T12:00:00Z");
  for (;;) {
    d.setUTCDate(d.getUTCDate() - 1);
    const prev = d.toISOString().slice(0, 10);
    if (!workoutDays.has(prev)) break;
    count++;
  }
  return count;
}

// Función para restar XP cuando se borra un entrenamiento (incluye bonus por racha)
export function useRemoveWorkoutXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const removeXP = useCallback(
    async (actividadId: string, seriesCompletadas: number) => {
      if (!user) throw new Error("No user");

      // 1. Obtener la actividad que se borra: usamos "fecha" (día del entreno), igual que al otorgar XP
      const { data: deletedAct, error: actErr } = await supabase
        .from("actividad")
        .select("fecha, fecha_fin")
        .eq("id", actividadId)
        .maybeSingle();
      if (actErr) throw actErr;

      const completedDay = deletedAct?.fecha
        ? (deletedAct.fecha as string).slice(0, 10)
        : deletedAct?.fecha_fin
          ? (deletedAct.fecha_fin as string).slice(0, 10)
          : null;

      // 2. Todas las actividades completadas; usamos "fecha" (día del entreno) para coincidir con el cálculo al otorgar
      const { data: actividades, error: listErr } = await supabase
        .from("actividad")
        .select("id, fecha, fecha_fin")
        .eq("usuario_id", user.id)
        .not("fecha_fin", "is", null);
      if (listErr) throw listErr;

      const allActs = actividades ?? [];
      const workoutDays = new Set<string>(allActs.map((a) => ((a.fecha as string) || (a.fecha_fin as string)).slice(0, 10)));
      const streak = completedDay ? streakOnDay(completedDay, workoutDays) : 0;
      const streakBonusToRemove = Math.max(0, (streak - 1) * 20);

      // 3. Días que quedarán después de borrar (para recalcular racha_actual y racha_maxima)
      const allRemaining = allActs.filter((a) => a.id !== actividadId);
      const remainingDaysSet = new Set<string>(
        allRemaining.map((a) => ((a.fecha as string) || (a.fecha_fin as string)).slice(0, 10))
      );

      let nuevaRachaActual = 0;
      let nuevaRachaMaxima = 0;
      if (remainingDaysSet.size > 0) {
        const sortedDays = Array.from(remainingDaysSet).sort().reverse();
        const ultimoDia = sortedDays[0];
        nuevaRachaActual = streakOnDay(ultimoDia, remainingDaysSet);
        nuevaRachaMaxima = Math.max(0, ...sortedDays.map((d) => streakOnDay(d, remainingDaysSet)));
      }

      // 4. Obtener perfil actual
      const { data: profile, error: pErr } = await supabase
        .from("perfil" as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!profile) return;

      const prof = profile as { xp_total?: number };
      const baseXP = 100;
      const volumeXP = seriesCompletadas * 5;
      const totalToRemove = baseXP + volumeXP + streakBonusToRemove;

      const previousXP = prof.xp_total ?? 0;
      const newXP = Math.max(0, previousXP - totalToRemove);
      const newLevel = calculateLevel(newXP);

      // 5. Última actividad restante por fecha de entreno para ultima_actividad_fecha
      const { data: lastAct } = await supabase
        .from("actividad")
        .select("fecha")
        .eq("usuario_id", user.id)
        .neq("id", actividadId)
        .not("fecha_fin", "is", null)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nuevaUltimaFecha = lastAct?.fecha
        ? new Date((lastAct.fecha as string).slice(0, 10) + "T23:59:59.999Z").toISOString()
        : null;

      // 6. Actualizar la base de datos (incl. racha_actual y racha_maxima recalculadas)
      const { error: uErr } = await supabase
        .from("perfil" as any)
        .update({
          xp_total: newXP,
          nivel: newLevel,
          racha_actual: nuevaRachaActual,
          racha_maxima: nuevaRachaMaxima,
          ultima_actividad_fecha: nuevaUltimaFecha,
        })
        .eq("id", user.id);
      if (uErr) throw uErr;

      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
    },
    [user, queryClient]
  );

  return removeXP;
}