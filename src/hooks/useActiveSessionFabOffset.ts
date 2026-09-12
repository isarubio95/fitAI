import { useActiveCardioSession } from "@/hooks/useActiveCardioSession";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { isActiveSessionPillCovered } from "@/lib/pillCircleTransition";

/** Pills visibles: 0, una (gym o cardio) o las dos apiladas. */
export type ActiveSessionFabOffset = 0 | 1 | 2;

export function useActiveSessionFabOffset(): ActiveSessionFabOffset {
  const { data: gym } = useActiveWorkout();
  const { state: gymDrawer } = useGlobalWorkoutDrawer();
  const { data: cardio } = useActiveCardioSession();
  const { state: cardioDrawer } = useGlobalCardioDrawer();

  const gymVisible = !!gym && !isActiveSessionPillCovered(gymDrawer.open, gymDrawer.pillCirclePhase);
  const cardioVisible =
    !!cardio && !isActiveSessionPillCovered(cardioDrawer.liveOpen, cardioDrawer.pillCirclePhase);
  if (gymVisible && cardioVisible) return 2;
  if (gymVisible || cardioVisible) return 1;
  return 0;
}

export function healthFabBottomClass(offset: ActiveSessionFabOffset): string {
  if (offset === 2) {
    return "bottom-[calc(var(--app-bottom-nav-inset,5.5rem)+8.5rem)] md:bottom-44";
  }
  if (offset === 1) {
    return "bottom-[calc(var(--app-bottom-nav-inset,5.5rem)+4.5rem)] md:bottom-28";
  }
  return "bottom-[calc(var(--app-bottom-nav-inset,5.5rem)+0.5rem)] md:bottom-10";
}

export function healthPageBottomPad(offset: ActiveSessionFabOffset): string {
  if (offset === 2) {
    return "max-md:pb-[calc(var(--app-bottom-nav-inset,5.5rem)+11.5rem)] md:pb-48";
  }
  if (offset === 1) {
    return "max-md:pb-[calc(var(--app-bottom-nav-inset,5.5rem)+7.5rem)] md:pb-36";
  }
  return "max-md:pb-[calc(var(--app-bottom-nav-inset,5.5rem)+3.5rem)] md:pb-20";
}
