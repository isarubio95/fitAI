import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { persistCatalogExerciseToWorkout } from "@/lib/persistCatalogExerciseToWorkout";
import type { CatalogExerciseCarry } from "@/lib/catalogExerciseCarry";

export function useAppendExerciseToActiveWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: activeWorkout } = useActiveWorkout();

  const mutation = useMutation({
    mutationFn: async (carry: CatalogExerciseCarry) => {
      if (!user) throw new Error("Inicia sesión para añadir al entreno.");
      if (!activeWorkout) throw new Error("No hay un entreno abierto.");
      await persistCatalogExerciseToWorkout({
        workoutId: activeWorkout.id,
        userId: user.id,
        carry,
        queryClient,
      });
    },
  });

  return {
    activeWorkout: activeWorkout ?? null,
    append: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
