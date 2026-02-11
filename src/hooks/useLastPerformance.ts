import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LastPerformanceData {
  peso_kg: number;
  repeticiones: number;
  rir: number | null;
  fecha: string;
}

export function useLastPerformance(tipoEjercicioId: string | undefined) {
  const { user } = useAuth();
  return useQuery<LastPerformanceData | null>({
    queryKey: ["lastPerformance", user?.id, tipoEjercicioId],
    enabled: !!user && !!tipoEjercicioId,
    staleTime: 1000 * 60 * 5, // 5 min cache
    queryFn: async () => {
      if (!tipoEjercicioId) return null;

      // Find the most recent ejercicio of this type by the user
      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select("id, actividad_id, actividad!inner(fecha)")
        .eq("tipo_ejercicio_id", tipoEjercicioId)
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (ejError) throw ejError;
      if (!ejercicios?.length) return null;

      // Get series for these ejercicios
      const ejIds = ejercicios.map((e) => e.id);
      const { data: series, error: sError } = await supabase
        .from("serie")
        .select("peso_kg, repeticiones, ejercicio_id")
        .in("ejercicio_id", ejIds);

      if (sError) throw sError;
      if (!series?.length) return null;

      // Find best set (highest volume = weight * reps)
      let best: (typeof series)[0] | null = null;
      let bestVolume = 0;
      let bestEjId = "";

      for (const s of series) {
        const vol = Number(s.peso_kg) * s.repeticiones;
        if (vol > bestVolume) {
          bestVolume = vol;
          best = s;
          bestEjId = s.ejercicio_id;
        }
      }

      if (!best) return null;

      // Get the fecha from the matching ejercicio
      const matchingEj = ejercicios.find((e) => e.id === bestEjId);
      const fecha = (matchingEj?.actividad as any)?.fecha || "";

      return {
        peso_kg: Number(best.peso_kg),
        repeticiones: best.repeticiones,
        rir: (best as any).rir ?? null,
        fecha,
      };
    },
  });
}
