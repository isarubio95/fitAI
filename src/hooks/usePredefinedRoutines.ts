import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { copySeriesPlans } from "./useRoutines";
import { toast } from "@/hooks/use-toast";

export interface PredefinedRoutine {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string | null;
  nivel: string | null;
  duracion_minutos: number | null;
  grupo_muscular: string | null;
  ejercicios: {
    id: string;
    tipo_ejercicio_id: string;
    series_objetivo: number;
    repes_min: number;
    repes_max: number;
    rir: number | null;
    orden: number;
    descanso: number | null;
    tipo_ejercicio: {
      id: string;
      nombre: string;
      musculos_involucrados: string[] | null;
      gif_url: string | null;
    };
  }[];
}

type PredefinedRoutinesFilters = {
  nivel: string | null;
  duracion: number | null;
  grupo: string | null;
  enabled?: boolean;
};

type RutinaPlantilla = Tables<"rutina">;

type RutinaEjercicioPlantillaJoin = Tables<"rutina_ejercicio"> & {
  tipo_ejercicio: {
    id: string;
    nombre: string;
    musculos_involucrados: string[] | null;
    gif_url: string | null;
  } | null;
};

function buildNivelOrFilter(nivel: string) {
  const n = nivel.trim().toLowerCase();
  if (n === "principiante") return "nivel.ilike.%principiante%,nivel.ilike.%bajo%,nivel.ilike.%baja%";
  if (n === "intermedio") return "nivel.ilike.%intermedio%,nivel.ilike.%medio%,nivel.ilike.%media%";
  if (n === "avanzado") return "nivel.ilike.%avanzado%,nivel.ilike.%alto%,nivel.ilike.%alta%";
  return `nivel.ilike.%${nivel}%`;
}

export function usePredefinedRoutines(filters?: PredefinedRoutinesFilters) {
  const { nivel = null, duracion = null, grupo = null, enabled = true } = filters ?? {};
  const shouldFetch = enabled && !!nivel && !!duracion && !!grupo;

  return useQuery<PredefinedRoutine[]>({
    queryKey: ["predefined-routines", nivel, duracion, grupo],
    staleTime: 10 * 60 * 1000, // 10 minutos: plantillas cambian poco
    enabled: shouldFetch,
    queryFn: async () => {
      if (!nivel || !duracion || !grupo) return [];

      const { data: rutinas, error } = await supabase
        .from("rutina")
        .select("*")
        .eq("es_plantilla", true)
        .or(buildNivelOrFilter(nivel))
        .eq("grupo_muscular", grupo)
        .order("created_at", { ascending: false });

      // Duración: 60+ se interpreta como >= 60
      const rutinasFiltradasPorDuracion = ((rutinas ?? []) as RutinaPlantilla[]).filter((r) => {
        const d = Number(r.duracion_minutos ?? 0);
        if (duracion === 60) return d >= 60;
        return d === duracion;
      });

      const rutinasFinal = rutinasFiltradasPorDuracion;
      if (error) throw error;
      if (!rutinasFinal.length) return [];

      const rutinaIds = rutinasFinal.map((r) => r.id);
      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select("*, tipo_ejercicio(id, nombre, musculos_involucrados, gif_url)")
        .in("rutina_id", rutinaIds)
        .order("orden");
      if (ejError) throw ejError;

      const ejerciciosJoined = (ejercicios ?? []) as RutinaEjercicioPlantillaJoin[];

      return rutinasFinal.map((r): PredefinedRoutine => ({
        id: r.id,
        nombre: r.nombre,
        icono: r.icono,
        descripcion: r.descripcion,
        nivel: r.nivel,
        duracion_minutos: r.duracion_minutos,
        grupo_muscular: r.grupo_muscular,
        ejercicios: ejerciciosJoined
          .filter((ej) => ej.rutina_id === r.id && ej.tipo_ejercicio)
          .map((ej) => ({
            id: ej.id,
            tipo_ejercicio_id: ej.tipo_ejercicio_id!,
            series_objetivo: ej.series_objetivo,
            repes_min: ej.repes_min,
            repes_max: ej.repes_max,
            rir: ej.rir,
            orden: ej.orden,
            descanso: ej.descanso,
            tipo_ejercicio: ej.tipo_ejercicio!,
          })),
      }));
    },
  });
}

export function useCloneRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!user) throw new Error("No autenticado");

      // Fetch the template
      const { data: template, error: tErr } = await supabase
        .from("rutina")
        .select("*")
        .eq("id", templateId)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!template) throw new Error("Rutina no encontrada");

      // Fetch exercises
      const { data: ejercicios, error: eErr } = await supabase
        .from("rutina_ejercicio")
        .select("*, rutina_ejercicio_serie(*)")
        .eq("rutina_id", templateId)
        .order("orden");
      if (eErr) throw eErr;

      // Clone the routine
      const { data: newRutina, error: insertErr } = await supabase
        .from("rutina")
        .insert({
          nombre: template.nombre,
          descripcion: template.descripcion,
          usuario_id: user.id,
          icono: template.icono,
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      // Clone exercises. Se copian TODOS los campos: antes se perdían
      // registro_series, superset_id y los objetivos de duración/ritmo, así que
      // una plantilla de cardio o con superseries se clonaba degradada.
      if (ejercicios?.length) {
        const supersetRemap = new Map<string, string>();
        const clonedEjercicios = ejercicios.map((ej) => {
          const sid = ej.superset_id?.trim() || null;
          let newSid: string | null = null;
          if (sid) {
            newSid = supersetRemap.get(sid) ?? crypto.randomUUID();
            supersetRemap.set(sid, newSid);
          }
          return {
            rutina_id: newRutina.id,
            tipo_ejercicio_id: ej.tipo_ejercicio_id,
            usuario_ejercicio_id: ej.usuario_ejercicio_id,
            series_objetivo: ej.series_objetivo,
            repes_min: ej.repes_min,
            repes_max: ej.repes_max,
            rir: ej.rir,
            orden: ej.orden,
            descanso: ej.descanso,
            superset_id: newSid,
            registro_series: ej.registro_series,
            duracion_objetivo_seg: ej.duracion_objetivo_seg,
            ritmo_objetivo_seg_km: ej.ritmo_objetivo_seg_km,
          };
        });
        const { data: insertedRows, error: ejInsertErr } = await supabase
          .from("rutina_ejercicio")
          .insert(clonedEjercicios)
          .select("id, orden");
        if (ejInsertErr) throw ejInsertErr;

        const plansByOrden: Array<Tables<"rutina_ejercicio_serie">[] | null> = [];
        ejercicios.forEach((ej) => {
          plansByOrden[ej.orden] = ej.rutina_ejercicio_serie ?? null;
        });
        await copySeriesPlans(plansByOrden, insertedRows ?? []);
      }

      return newRutina.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      toast({ title: "✅ Rutina guardada en tu perfil" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error al clonar", description: message, variant: "destructive" });
    },
  });
}
