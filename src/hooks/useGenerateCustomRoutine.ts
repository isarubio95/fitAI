import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedTrainingPlan, PremiumRoutineFormData } from "@/types/premiumRoutine";

export function useGenerateCustomRoutine() {
  return useMutation({
    mutationFn: async (payload: PremiumRoutineFormData): Promise<GeneratedTrainingPlan> => {
      const { data, error } = await supabase.functions.invoke("generate-custom-routine", {
        body: payload,
      });

      if (error) throw error;
      return data as GeneratedTrainingPlan;
    },
  });
}
