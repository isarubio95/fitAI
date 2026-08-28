import { supabase } from "@/integrations/supabase/client";

export function dayKeyFromTimestamp(iso: string | null | undefined): string {
  return (iso ?? "").slice(0, 10);
}

export function latestDayKey(days: Iterable<string>): string | null {
  let latest: string | null = null;
  for (const day of days) {
    if (day.length < 10) continue;
    if (latest == null || day > latest) latest = day;
  }
  return latest;
}

export function dayKeyToUltimaFechaIso(day: string | null): string | null {
  return day ? new Date(`${day}T23:59:59.999Z`).toISOString() : null;
}

type FetchDaysOpts = {
  excludeActividadId?: string;
  excludeCardioId?: string;
};

/** Días (YYYY-MM-DD) con al menos un gym o cardio cerrado. */
export async function fetchCompletedTrainingDayKeys(
  userId: string,
  opts: FetchDaysOpts = {},
): Promise<string[]> {
  const [gymRes, cardioRes] = await Promise.all([
    supabase
      .from("actividad")
      .select("id, fecha, fecha_fin")
      .eq("usuario_id", userId)
      .not("fecha_fin", "is", null),
    supabase
      .from("cardio_sesion")
      .select("id, fecha_inicio, fecha_fin")
      .eq("usuario_id", userId)
      .not("fecha_fin", "is", null),
  ]);
  if (gymRes.error) throw gymRes.error;
  if (cardioRes.error) throw cardioRes.error;

  const days: string[] = [];
  for (const a of gymRes.data ?? []) {
    if (opts.excludeActividadId && a.id === opts.excludeActividadId) continue;
    const key = dayKeyFromTimestamp(a.fecha || a.fecha_fin);
    if (key) days.push(key);
  }
  for (const c of cardioRes.data ?? []) {
    if (opts.excludeCardioId && c.id === opts.excludeCardioId) continue;
    const key = dayKeyFromTimestamp(c.fecha_inicio || c.fecha_fin);
    if (key) days.push(key);
  }
  return days;
}
