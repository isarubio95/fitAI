import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LastSetData {
  numero_serie: number;
  peso_kg: number;
  repeticiones: number;
}

export interface LastPerformanceData {
  fecha: string;
  sets: LastSetData[];
}

export function useLastPerformance(tipoEjercicioId: string | undefined) {
  const { user } = useAuth();
  return useQuery<LastPerformanceData | null>({
    queryKey: ["lastPerformance", user?.id, tipoEjercicioId],
    enabled: !!user && !!tipoEjercicioId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!tipoEjercicioId) return null;

      // Find the most recent completed ejercicio of this type
      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("id, actividad!inner(fecha, fecha_fin)")
        .eq("tipo_ejercicio_id", tipoEjercicioId)
        .eq("usuario_id", user!.id)
        .not("actividad.fecha_fin", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (ejError) throw ejError;
      if (!ejercicios?.length) return null;

      const lastEj = ejercicios[0];
      const fecha = (lastEj.actividad as any)?.fecha || "";

      // Get all sets for this ejercicio
      const { data: series, error: sError } = await supabase
        .from("serie")
        .select("numero_serie, peso_kg, repeticiones")
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
        })),
      };
    },
  });
}
