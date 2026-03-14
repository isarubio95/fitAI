import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface LogroRow {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  xp_recompensa: number;
  tipo: string;
  meta: number;
  created_at: string;
}

export interface LogroConEstado extends LogroRow {
  unlocked: boolean;
}

type LogroStats = {
  entrenamientosCompletados: number;
  rachaMaxima: number;
  maxSeriesEnUnDia: number;
};

async function fetchLogroStats(userId: string): Promise<LogroStats> {
  const [actividadesRes, perfilRes] = await Promise.all([
    supabase
      .from("actividad")
      .select("id, fecha")
      .eq("usuario_id", userId)
      .not("fecha_fin", "is", null),
    supabase.from("perfil" as any).select("racha_maxima").eq("id", userId).maybeSingle(),
  ]);

  if (actividadesRes.error) throw actividadesRes.error;
  const actividades = actividadesRes.data ?? [];
  const rachaMaxima = (perfilRes.data as { racha_maxima?: number } | null)?.racha_maxima ?? 0;

  let maxSeriesEnUnDia = 0;
  if (actividades.length > 0) {
    const actIds = actividades.map((a) => a.id);
    const { data: ejercicios, error: ejErr } = await supabase
      .from("ejercicio")
      .select("id, actividad_id")
      .in("actividad_id", actIds);
    if (ejErr) throw ejErr;

    const ejercicioIds = (ejercicios ?? []).map((e) => e.id);
    const actIdByEjId = new Map((ejercicios ?? []).map((e) => [e.id, e.actividad_id]));

    if (ejercicioIds.length > 0) {
      const { data: series, error: sErr } = await supabase
        .from("serie")
        .select("ejercicio_id")
        .in("ejercicio_id", ejercicioIds);
      if (sErr) throw sErr;

      const seriesPorEjercicio = new Map<string, number>();
      for (const s of series ?? []) {
        seriesPorEjercicio.set(s.ejercicio_id, (seriesPorEjercicio.get(s.ejercicio_id) ?? 0) + 1);
      }

      const seriesPorActividad = new Map<string, number>();
      for (const [ejId, count] of seriesPorEjercicio) {
        const actId = actIdByEjId.get(ejId);
        if (actId) seriesPorActividad.set(actId, (seriesPorActividad.get(actId) ?? 0) + count);
      }

      const seriesPorDia = new Map<string, number>();
      for (const a of actividades) {
        const day = a.fecha.slice(0, 10);
        const n = seriesPorActividad.get(a.id) ?? 0;
        seriesPorDia.set(day, (seriesPorDia.get(day) ?? 0) + n);
      }
      maxSeriesEnUnDia = Math.max(0, ...seriesPorDia.values());
    }
  }

  return {
    entrenamientosCompletados: actividades.length,
    rachaMaxima,
    maxSeriesEnUnDia,
  };
}

function isLogroUnlocked(logro: LogroRow, stats: LogroStats): boolean {
  const { tipo, meta } = logro;
  const m = Number(meta);
  if (tipo === "entrenamientos_completados") return stats.entrenamientosCompletados >= m;
  if (tipo === "racha_dias") return stats.rachaMaxima >= m;
  if (tipo === "series_en_un_dia") return stats.maxSeriesEnUnDia >= m;
  return false;
}

/**
 * Comprueba si el usuario cumple los requisitos de cada logro y registra en usuario_logro
 * los que estén desbloqueados (sin duplicar). Llamar al finalizar un entrenamiento.
 */
export async function checkAndAwardLogros(userId: string): Promise<void> {
  const [logrosRes, stats] = await Promise.all([
    supabase.from("logro" as any).select("*").order("meta", { ascending: true }),
    fetchLogroStats(userId),
  ]);

  if (logrosRes.error) throw logrosRes.error;
  const logros = (logrosRes.data ?? []) as unknown as LogroRow[];
  const toInsert = logros.filter((l) => isLogroUnlocked(l, stats)).map((l) => ({ usuario_id: userId, logro_id: l.id }));

  if (toInsert.length === 0) return;

  await supabase.from("usuario_logro" as any).upsert(toInsert, {
    onConflict: "usuario_id,logro_id",
    ignoreDuplicates: true,
  });
}

export function useLogros() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["logros", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos: listado de logros cambia poco
    queryFn: async (): Promise<LogroConEstado[]> => {
      const [logrosRes, unlockedRes] = await Promise.all([
        supabase.from("logro" as any).select("*").order("meta", { ascending: true }),
        supabase.from("usuario_logro" as any).select("logro_id").eq("usuario_id", user!.id),
      ]);

      if (logrosRes.error) throw logrosRes.error;
      if (unlockedRes.error) throw unlockedRes.error;

      const logros = (logrosRes.data ?? []) as unknown as LogroRow[];
      const unlockedRows = (unlockedRes.data ?? []) as unknown as { logro_id: string }[];
      const unlockedIds = new Set(unlockedRows.map((r) => r.logro_id));

      return logros.map((l) => ({
        ...l,
        unlocked: unlockedIds.has(l.id),
      }));
    },
  });
}
