import { Button } from "@/components/ui/button";
import type { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ToastFn = ReturnType<typeof useToast>["toast"];

export async function fetchUnfinishedWorkoutId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("actividad")
    .select("id")
    .eq("usuario_id", userId)
    .is("fecha_fin", null)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export function toastActiveWorkoutBlocked(
  toast: ToastFn,
  openActiveWorkout: (workoutId: string) => void,
  activeWorkout: { id: string },
) {
  toast({
    title: "Ya tienes un entrenamiento en curso",
    description: "Termínalo o cancélalo antes de empezar otro.",
    variant: "destructive",
    action: (
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => {
          const activeEl = document.activeElement as HTMLElement | null;
          activeEl?.blur?.();
          openActiveWorkout(activeWorkout.id);
        }}
      >
        Ir al entreno
      </Button>
    ),
  });
}
