import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevel } from "@/hooks/useGamification";
import { computeStreakStats, weekStartKeyFromDayStr } from "@/lib/streakWeeks";
import { isWorkingSet } from "@/lib/setTypes";

export type LogroNivel = "bronce" | "plata" | "oro" | "platino" | "diamante" | "reto";

export interface LogroRow {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  xp_recompensa: number;
  tipo: string;
  meta: number;
  categoria: string;
  nivel: string;
  orden: number;
  created_at: string;
}

export interface LogroConEstado extends LogroRow {
  unlocked: boolean;
  fecha_desbloqueo: string | null;
}

export interface LogroAwardResult {
  nuevos: LogroRow[];
  xpGanado: number;
}

export interface LogroStats {
  entrenamientosCompletados: number;
  rachaMaxima: number;
  maxSeriesEnUnDia: number;
  volumenTotalKg: number;
  cardioSesiones: number;
  distanciaTotalKm: number;
  nivel: number;
  // Retos únicos
  disciplinasCardioDistintas: number;
  tieneEntrenoMadrugador: boolean;
  tieneEntrenoNocturno: boolean;
  tieneFindeCompleto: boolean;
  tieneDobleSesion: boolean;
  tieneSemanaPerfecta: boolean;
  maxPesoSerieKg: number;
  ejerciciosDistintos: number;
  maxDuracionSesionMin: number;
  maxDistanciaSesionKm: number;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Trocea consultas .in() para no exceder límites de URL con muchos ids. */
async function selectInChunks<T>(
  ids: string[],
  fetcher: (idsChunk: string[]) => Promise<T[]>
): Promise<T[]> {
  const results = await Promise.all(chunk(ids, 200).map(fetcher));
  return results.flat();
}

export async function fetchLogroStats(userId: string): Promise<LogroStats> {
  const [actividadesRes, perfilRes, cardioRes] = await Promise.all([
    supabase
      .from("actividad")
      .select("id, fecha, fecha_fin")
      .eq("usuario_id", userId)
      .not("fecha_fin", "is", null),
    supabase.from("perfil").select("nivel, xp_total").eq("id", userId).maybeSingle(),
    supabase
      .from("cardio_sesion")
      .select("id, fecha_inicio, fecha_fin, cardio_disciplina_id")
      .eq("usuario_id", userId)
      .not("fecha_fin", "is", null),
  ]);

  if (actividadesRes.error) throw actividadesRes.error;
  if (cardioRes.error) throw cardioRes.error;

  const actividades = actividadesRes.data ?? [];
  const cardioSesiones = cardioRes.data ?? [];
  const perfil = perfilRes.data;
  const nivel = Math.max(perfil?.nivel ?? 1, calculateLevel(perfil?.xp_total ?? 0));

  // Ejercicios y series de todas las actividades completadas
  const actIds = actividades.map((a) => a.id);
  const ejercicios = actIds.length
    ? await selectInChunks(actIds, async (idsChunk) => {
        const { data, error } = await supabase
          .from("ejercicio")
          .select("id, actividad_id, tipo_ejercicio_id, usuario_ejercicio_id")
          .in("actividad_id", idsChunk);
        if (error) throw error;
        return data ?? [];
      })
    : [];

  const ejercicioIds = ejercicios.map((e) => e.id);
  const series = ejercicioIds.length
    ? await selectInChunks(ejercicioIds, async (idsChunk) => {
        const { data, error } = await supabase
          .from("serie")
          .select("ejercicio_id, peso_kg, repeticiones, completed, tipo_serie")
          .in("ejercicio_id", idsChunk);
        if (error) throw error;
        return data ?? [];
      })
    : [];

  // Bloques de cardio para distancias
  const cardioIds = cardioSesiones.map((c) => c.id);
  const bloques = cardioIds.length
    ? await selectInChunks(cardioIds, async (idsChunk) => {
        const { data, error } = await supabase
          .from("cardio_bloque")
          .select("cardio_sesion_id, distancia_m")
          .in("cardio_sesion_id", idsChunk);
        if (error) throw error;
        return data ?? [];
      })
    : [];

  // --- Fuerza: volumen, mejor serie y series por día ---
  const actIdByEjId = new Map(ejercicios.map((e) => [e.id, e.actividad_id]));
  const seriesPorActividad = new Map<string, number>();
  let volumenTotalKg = 0;
  let maxPesoSerieKg = 0;

  for (const s of series) {
    if (!s.completed) continue;
    // El calentamiento no suma tonelaje ni cuenta como serie de la sesión.
    if (!isWorkingSet(s.tipo_serie)) continue;
    volumenTotalKg += (s.peso_kg ?? 0) * (s.repeticiones ?? 0);
    if ((s.peso_kg ?? 0) > maxPesoSerieKg) maxPesoSerieKg = s.peso_kg;
    const actId = actIdByEjId.get(s.ejercicio_id);
    if (actId) seriesPorActividad.set(actId, (seriesPorActividad.get(actId) ?? 0) + 1);
  }

  const strengthDays: string[] = [];
  const seriesPorDia = new Map<string, number>();
  let maxDuracionSesionMin = 0;
  let tieneEntrenoMadrugador = false;
  let tieneEntrenoNocturno = false;

  for (const a of actividades) {
    const start = new Date(a.fecha);
    const day = a.fecha.slice(0, 10);
    strengthDays.push(day);
    seriesPorDia.set(day, (seriesPorDia.get(day) ?? 0) + (seriesPorActividad.get(a.id) ?? 0));

    const hour = start.getHours();
    if (hour < 7) tieneEntrenoMadrugador = true;
    if (hour >= 22) tieneEntrenoNocturno = true;

    if (a.fecha_fin) {
      const min = (new Date(a.fecha_fin).getTime() - start.getTime()) / 60000;
      if (min > maxDuracionSesionMin) maxDuracionSesionMin = min;
    }
  }
  const maxSeriesEnUnDia = Math.max(0, ...seriesPorDia.values());

  // Ejercicios distintos (por tipo global o ejercicio personalizado)
  const ejerciciosDistintosSet = new Set<string>();
  for (const e of ejercicios) {
    const key = e.tipo_ejercicio_id ?? e.usuario_ejercicio_id;
    if (key) ejerciciosDistintosSet.add(key);
  }

  // --- Cardio: disciplinas, distancias y duraciones ---
  const distanciaPorSesion = new Map<string, number>();
  for (const b of bloques) {
    distanciaPorSesion.set(
      b.cardio_sesion_id,
      (distanciaPorSesion.get(b.cardio_sesion_id) ?? 0) + (b.distancia_m ?? 0)
    );
  }

  const cardioDays: string[] = [];
  const disciplinas = new Set<string>();
  let distanciaTotalM = 0;
  let maxDistanciaSesionM = 0;

  for (const c of cardioSesiones) {
    const start = new Date(c.fecha_inicio);
    cardioDays.push(c.fecha_inicio.slice(0, 10));
    if (c.cardio_disciplina_id) disciplinas.add(c.cardio_disciplina_id);

    const hour = start.getHours();
    if (hour < 7) tieneEntrenoMadrugador = true;
    if (hour >= 22) tieneEntrenoNocturno = true;

    if (c.fecha_fin) {
      const min = (new Date(c.fecha_fin).getTime() - start.getTime()) / 60000;
      if (min > maxDuracionSesionMin) maxDuracionSesionMin = min;
    }

    const dist = distanciaPorSesion.get(c.id) ?? 0;
    distanciaTotalM += dist;
    if (dist > maxDistanciaSesionM) maxDistanciaSesionM = dist;
  }

  // --- Días combinados (fuerza + cardio) para retos de calendario ---
  const strengthDaySet = new Set(strengthDays);
  const cardioDaySet = new Set(cardioDays);
  const allDays = new Set([...strengthDays, ...cardioDays]);

  let tieneDobleSesion = false;
  for (const day of strengthDaySet) {
    if (cardioDaySet.has(day)) {
      tieneDobleSesion = true;
      break;
    }
  }

  // Días por semana ISO: finde completo (sáb+dom) y semana perfecta (5 días)
  const diasPorSemana = new Map<string, Set<string>>();
  for (const day of allDays) {
    const week = weekStartKeyFromDayStr(day);
    if (!diasPorSemana.has(week)) diasPorSemana.set(week, new Set());
    diasPorSemana.get(week)!.add(day);
  }

  let tieneFindeCompleto = false;
  let tieneSemanaPerfecta = false;
  for (const days of diasPorSemana.values()) {
    if (days.size >= 5) tieneSemanaPerfecta = true;
    let sabado = false;
    let domingo = false;
    for (const day of days) {
      const dow = new Date(day + "T12:00:00.000Z").getUTCDay();
      if (dow === 6) sabado = true;
      if (dow === 0) domingo = true;
    }
    if (sabado && domingo) tieneFindeCompleto = true;
  }

  // Racha semanal: mismo cálculo que la gamificación (solo entrenos de fuerza)
  const { maxima: rachaMaxima } = computeStreakStats(strengthDays);

  return {
    entrenamientosCompletados: actividades.length,
    rachaMaxima,
    maxSeriesEnUnDia,
    volumenTotalKg,
    cardioSesiones: cardioSesiones.length,
    distanciaTotalKm: distanciaTotalM / 1000,
    nivel,
    disciplinasCardioDistintas: disciplinas.size,
    tieneEntrenoMadrugador,
    tieneEntrenoNocturno,
    tieneFindeCompleto,
    tieneDobleSesion,
    tieneSemanaPerfecta,
    maxPesoSerieKg,
    ejerciciosDistintos: ejerciciosDistintosSet.size,
    maxDuracionSesionMin,
    maxDistanciaSesionKm: maxDistanciaSesionM / 1000,
  };
}

const RETO_CHECKS: Record<string, (stats: LogroStats) => boolean> = {
  reto_multideporte: (s) => s.disciplinasCardioDistintas >= 5,
  reto_madrugador: (s) => s.tieneEntrenoMadrugador,
  reto_buho: (s) => s.tieneEntrenoNocturno,
  reto_finde: (s) => s.tieneFindeCompleto,
  reto_doble_sesion: (s) => s.tieneDobleSesion,
  reto_semana_perfecta: (s) => s.tieneSemanaPerfecta,
  reto_club_100: (s) => s.maxPesoSerieKg >= 100,
  reto_explorador: (s) => s.ejerciciosDistintos >= 20,
  reto_resistencia: (s) => s.maxDuracionSesionMin > 120,
  reto_media_maraton: (s) => s.maxDistanciaSesionKm >= 21,
};

/** Valor actual del usuario para un logro incremental; null para retos únicos. */
export function getLogroProgress(
  logro: Pick<LogroRow, "tipo" | "meta">,
  stats: LogroStats
): { current: number; target: number } | null {
  const target = Number(logro.meta);
  switch (logro.tipo) {
    case "entrenamientos_completados":
      return { current: stats.entrenamientosCompletados, target };
    case "racha_semanas":
      return { current: stats.rachaMaxima, target };
    case "volumen_total_kg":
      return { current: Math.round(stats.volumenTotalKg), target };
    case "series_en_un_dia":
      return { current: stats.maxSeriesEnUnDia, target };
    case "cardio_sesiones":
      return { current: stats.cardioSesiones, target };
    case "distancia_total_km":
      return { current: Math.floor(stats.distanciaTotalKm), target };
    case "nivel_alcanzado":
      return { current: stats.nivel, target };
    default:
      return null;
  }
}

function isLogroUnlocked(logro: LogroRow, stats: LogroStats): boolean {
  if (logro.tipo === "reto") {
    const check = RETO_CHECKS[logro.codigo];
    return check ? check(stats) : false;
  }
  const progress = getLogroProgress(logro, stats);
  return progress !== null && progress.current >= progress.target;
}

/**
 * Comprueba los requisitos de cada logro, registra los recién desbloqueados en
 * usuario_logro y suma su xp_recompensa al perfil (recalculando el nivel).
 * Devuelve los logros nuevos para poder celebrarlos en la UI.
 */
export async function checkAndAwardLogros(userId: string): Promise<LogroAwardResult> {
  const [logrosRes, unlockedRes, perfilRes, stats] = await Promise.all([
    supabase.from("logro").select("*").order("orden", { ascending: true }),
    supabase.from("usuario_logro").select("logro_id").eq("usuario_id", userId),
    supabase.from("perfil").select("xp_total").eq("id", userId).maybeSingle(),
    fetchLogroStats(userId),
  ]);

  if (logrosRes.error) throw logrosRes.error;
  if (unlockedRes.error) throw unlockedRes.error;

  const logros = (logrosRes.data ?? []) as LogroRow[];
  const unlockedIds = new Set((unlockedRes.data ?? []).map((r) => r.logro_id));
  const xpInicial = perfilRes.data?.xp_total ?? 0;

  const nuevos: LogroRow[] = [];
  let xpGanado = 0;

  // El XP de un logro puede subir de nivel y desbloquear logros de nivel: iterar hasta estabilizar.
  for (let pass = 0; pass < 5; pass++) {
    const nivelActual = Math.max(stats.nivel, calculateLevel(xpInicial + xpGanado));
    const statsActuales: LogroStats = { ...stats, nivel: nivelActual };
    const desbloqueados = logros.filter(
      (l) => !unlockedIds.has(l.id) && isLogroUnlocked(l, statsActuales)
    );
    if (desbloqueados.length === 0) break;
    for (const l of desbloqueados) {
      unlockedIds.add(l.id);
      nuevos.push(l);
      xpGanado += l.xp_recompensa;
    }
  }

  if (nuevos.length === 0) return { nuevos: [], xpGanado: 0 };

  const { error: insertErr } = await supabase.from("usuario_logro").upsert(
    nuevos.map((l) => ({ usuario_id: userId, logro_id: l.id })),
    { onConflict: "usuario_id,logro_id", ignoreDuplicates: true }
  );
  if (insertErr) throw insertErr;

  const nuevoXp = xpInicial + xpGanado;
  const { error: xpErr } = await supabase
    .from("perfil")
    .update({ xp_total: nuevoXp, nivel: calculateLevel(nuevoXp) })
    .eq("id", userId);
  if (xpErr) throw xpErr;

  return { nuevos, xpGanado };
}

/** Catálogo completo con estado de desbloqueo del usuario indicado (por defecto, el propio). */
export function useLogros(profileUserId?: string) {
  const { user } = useAuth();
  const id = profileUserId ?? user?.id;

  return useQuery({
    queryKey: ["logros", id],
    enabled: !!id,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<LogroConEstado[]> => {
      const [logrosRes, unlockedRes] = await Promise.all([
        supabase.from("logro").select("*").order("orden", { ascending: true }),
        supabase
          .from("usuario_logro")
          .select("logro_id, fecha_desbloqueo")
          .eq("usuario_id", id!),
      ]);

      if (logrosRes.error) throw logrosRes.error;
      if (unlockedRes.error) throw unlockedRes.error;

      const logros = (logrosRes.data ?? []) as LogroRow[];
      const fechaPorLogro = new Map(
        (unlockedRes.data ?? []).map((r) => [r.logro_id, r.fecha_desbloqueo])
      );

      return logros.map((l) => ({
        ...l,
        unlocked: fechaPorLogro.has(l.id),
        fecha_desbloqueo: fechaPorLogro.get(l.id) ?? null,
      }));
    },
  });
}

/** Stats del propio usuario para pintar barras de progreso en la página de logros. */
export function useLogroStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["logroStats", user?.id],
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    queryFn: () => fetchLogroStats(user!.id),
  });
}

/** Rangos para destacar en perfil (sin retos): diamante > platino > oro > plata > bronce. */
const LOGRO_NIVEL_RANK: Record<string, number> = {
  diamante: 5,
  platino: 4,
  oro: 3,
  plata: 2,
  bronce: 1,
};

/** Los más importantes primero (nivel, luego XP, luego orden del catálogo). */
export function compareLogrosByImportance(
  a: Pick<LogroRow, "nivel" | "xp_recompensa" | "orden">,
  b: Pick<LogroRow, "nivel" | "xp_recompensa" | "orden">,
): number {
  const rankDiff = (LOGRO_NIVEL_RANK[b.nivel] ?? 0) - (LOGRO_NIVEL_RANK[a.nivel] ?? 0);
  if (rankDiff !== 0) return rankDiff;
  const xpDiff = Number(b.xp_recompensa) - Number(a.xp_recompensa);
  if (xpDiff !== 0) return xpDiff;
  return a.orden - b.orden;
}

const PROFILE_FEATURED_LOGROS = 5;

/** Hasta 5 logros desbloqueados más relevantes para el perfil (excluye retos). */
export function pickFeaturedLogros<T extends LogroConEstado>(logros: T[], limit = PROFILE_FEATURED_LOGROS): T[] {
  return logros
    .filter((l) => l.unlocked && l.nivel !== "reto" && l.tipo !== "reto")
    .slice()
    .sort(compareLogrosByImportance)
    .slice(0, limit);
}
