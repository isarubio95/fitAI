import type { SocialInteractionTargetType } from "@/types/inAppNotification";

export function communityActivityHref(params: {
  targetType: SocialInteractionTargetType;
  targetId: string;
  openComments?: boolean;
}): string {
  const key = params.targetType === "cardio" ? "cardio" : "gym";
  const search = new URLSearchParams({ [key]: params.targetId });
  if (params.openComments) search.set("comments", "1");
  return `/community?${search.toString()}`;
}
