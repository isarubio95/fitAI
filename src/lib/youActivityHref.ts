import type { SocialInteractionTargetType } from "@/types/inAppNotification";
import type { ProfileActivityItem } from "@/hooks/useProfileActivityHistory";

export function youActivityHref(params: {
  targetType: SocialInteractionTargetType;
  targetId: string;
  openComments?: boolean;
}): string {
  const key = params.targetType === "cardio" ? "cardio" : "gym";
  const search = new URLSearchParams({ tab: "activities", [key]: params.targetId });
  if (params.openComments) search.set("comments", "1");
  return `/evolution?${search.toString()}`;
}

export function pinFocusedYouActivity(
  items: ProfileActivityItem[],
  focusGymId: string | null,
  focusCardioId: string | null,
): ProfileActivityItem[] {
  if (focusGymId) {
    const focused = items.find((item) => item.type === "gym" && item.workout.id === focusGymId);
    if (!focused) return items;
    return [focused, ...items.filter((item) => !(item.type === "gym" && item.workout.id === focusGymId))];
  }
  if (focusCardioId) {
    const focused = items.find((item) => item.type === "cardio" && item.session.id === focusCardioId);
    if (!focused) return items;
    return [focused, ...items.filter((item) => !(item.type === "cardio" && item.session.id === focusCardioId))];
  }
  return items;
}
