import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface PredefinedRoutine {
  id: string;
  nombre: string;
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
      body_part: string[] | null;
      gif_url: string | null;
    };
  }[];
}

export function usePredefinedRoutines() {
  return useQuery<PredefinedRoutine[]>({
    queryKey: ["predefined-routines"],
    queryFn: async () => {
      const { data: rutinas, error } = await (supabase
        .from("rutina")
        .select("*") as any)
        .eq("es_plantilla", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!rutinas?.length) return [];

      const rutinaIds = rutinas.map((r) => r.id);
      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select("*, tipo_ejercicio(id, nombre, body_part, gif_url)")
        .in("rutina_id", rutinaIds)
        .order("orden");
      if (ejError) throw ejError;

      return rutinas.map((r) => ({
        ...r,
        nivel: (r as any).nivel,
        duracion_minutos: (r as any).duracion_minutos,
        grupo_muscular: (r as any).grupo_muscular,
        ejercicios: (ejercicios || [])
          .filter((ej) => ej.rutina_id === r.id)
          .map((ej) => ({ ...ej, tipo_ejercicio: ej.tipo_ejercicio! })),
      })) as PredefinedRoutine[];
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
        .select("*")
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
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      // Clone exercises
      if (ejercicios?.length) {
        const clonedEjercicios = ejercicios.map((ej) => ({
          rutina_id: newRutina.id,
          tipo_ejercicio_id: ej.tipo_ejercicio_id,
          series_objetivo: ej.series_objetivo,
          repes_min: ej.repes_min,
          repes_max: ej.repes_max,
          rir: ej.rir,
          orden: ej.orden,
          descanso: ej.descanso,
        }));
        const { error: ejInsertErr } = await supabase
          .from("rutina_ejercicio")
          .insert(clonedEjercicios);
        if (ejInsertErr) throw ejInsertErr;
      }

      return newRutina.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      toast({ title: "✅ Rutina guardada en tu perfil" });
    },
    onError: (err: any) => {
      toast({ title: "Error al clonar", description: err.message, variant: "destructive" });
    },
  });
}
