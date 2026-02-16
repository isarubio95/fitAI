import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExerciseWithHistory {
  id: string;
  name: string;
  lastPerformed: string;
}

interface ExerciseHistoryPoint {
  date: string;
  oneRepMax: number;
  weight: number;
  reps: number;
}

// Returns exercises the user has performed at least once, ordered by most recent
export function useExerciseWithHistory() {
  const { user } = useAuth();

  return useQuery<ExerciseWithHistory[]>({
    queryKey: ["exercise-with-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get all series with exercise + tipo_ejercicio info
      const { data, error } = await supabase
        .from("serie")
        .select(`
          created_at,
          ejercicio!inner (
            tipo_ejercicio_id,
            tipo_ejercicio!inner ( id, nombre )
          )
        `)
        .eq("usuario_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Group by tipo_ejercicio_id, keep most recent date
      const map = new Map<string, ExerciseWithHistory>();
      for (const row of data) {
        const ej = row.ejercicio as any;
        const tipo = ej.tipo_ejercicio;
        if (!map.has(tipo.id)) {
          map.set(tipo.id, {
            id: tipo.id,
            name: tipo.nombre,
            lastPerformed: row.created_at,
          });
        }
      }

      return Array.from(map.values());
    },
  });
}

export interface LastRecord {
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
}

// Returns daily best estimated 1RM for a specific exercise type
// En src/hooks/useExerciseProgress.ts

// ... imports

export function useExerciseHistory(exerciseId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exercise-history", exerciseId],
    enabled: !!user && !!exerciseId,
    queryFn: async () => {
      // 1. Query: Asegúrate de traer la fecha de la ACTIVIDAD, no solo la de la serie
      const { data, error } = await supabase
        .from("serie")
        .select(`
          peso_kg,
          repeticiones,
          created_at,
          ejercicio:ejercicio_id!inner (
             actividad:actividad_id ( fecha ) 
          )
        `)
        .eq("usuario_id", user!.id)
        .eq("ejercicio.tipo_ejercicio_id", exerciseId)
        .order("created_at", { ascending: true }); // Ordenamos cronológicamente

      if (error) throw error;

      // 2. Agrupación Robusta
      const sessionsMap = new Map<string, any>();

      data?.forEach((item: any) => {
        // TRUCO: Priorizamos la fecha elegida en la actividad.
        // Si no existe, usamos created_at.
        // Cortamos la cadena para quedarnos SOLO con 'YYYY-MM-DD'
        let dateStr = item.ejercicio?.actividad?.fecha || item.created_at;
        
        // Convertimos a objeto Date para manejar zonas horarias si hace falta, 
        // pero lo más seguro es cortar el string ISO si viene de Supabase
        const dateKey = new Date(dateStr).toISOString().split('T')[0]; 

        const peso = Number(item.peso_kg);
        const repes = Number(item.repeticiones);
        const estimated1RM = peso * (1 + (0.0333 * repes));

        // Lógica: "Me quedo con la MEJOR serie de ese día"
        if (!sessionsMap.has(dateKey)) {
          sessionsMap.set(dateKey, { 
            date: dateKey, // Usamos la fecha limpia
            oneRepMax: estimated1RM,
            weight: peso,
            reps: repes
          });
        } else {
          const current = sessionsMap.get(dateKey);
          if (estimated1RM > current.oneRepMax) {
            current.oneRepMax = estimated1RM;
            current.weight = peso;
            current.reps = repes;
          }
        }
      });

      // 3. Convertir a Array y Ordenar
      const history = Array.from(sessionsMap.values())
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        history,
        lastRecord: history.length > 0 ? history[history.length - 1] : null
      };
    }
  });
}
