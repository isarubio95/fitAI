import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LastSetData {
  numero_serie: number;
  peso_kg: number;
  repeticiones: number;
  duracion_seg: number | null;
  ritmo_seg_km: number | null;
}

export interface LastPerformanceData {
  fecha: string;
  sets: LastSetData[];
}

export function useLastPerformance(opts: {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
}) {
  const tipoEjercicioId = opts.tipo_ejercicio_id;
  const usuarioEjercicioId = opts.usuario_ejercicio_id;
  const { user } = useAuth();
  const enabled = !!user && (!!tipoEjercicioId || !!usuarioEjercicioId);
  return useQuery<LastPerformanceData | null>({
    queryKey: ["lastPerformance", user?.id, tipoEjercicioId, usuarioEjercicioId],
    enabled,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!user) return null;

      const base = () =>
        supabase
          .from("ejercicio")
          .select("id, actividad!inner(fecha, fecha_fin)")
          .eq("usuario_id", user.id)
          .not("actividad.fecha_fin", "is", null)
          .order("created_at", { ascending: false })
          .limit(1);

      const { data: ejercicios, error: ejError } = usuarioEjercicioId
        ? await base().eq("usuario_ejercicio_id", usuarioEjercicioId)
        : tipoEjercicioId
          ? await base().eq("tipo_ejercicio_id", tipoEjercicioId)
          : { data: null, error: null };

      if (ejError) throw ejError;
      if (!ejercicios?.length) return null;

      const lastEj = ejercicios[0];
      const fecha = (lastEj.actividad as any)?.fecha || "";

      const { data: series, error: sError } = await supabase
        .from("serie")
        .select("numero_serie, peso_kg, repeticiones, duracion_seg, ritmo_seg_km")
        .eq("ejercicio_id", lastEj.id)
        .order("numero_serie", { ascending: true });

      if (sError) throw sError;
      if (!series?.length) return null;

      return {
        fecha,
        sets: series.map((s) => ({
          numero_serie: s.numero_serie,
          peso_kg: Number(s.peso_kg),
          repeticiones: s.repeticiones,
          duracion_seg: s.duracion_seg ?? null,
          ritmo_seg_km: s.ritmo_seg_km ?? null,
        })),
      };
    },
  });
}
