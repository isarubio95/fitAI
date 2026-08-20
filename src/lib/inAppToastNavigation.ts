import type { SocialInteractionTargetType } from "@/types/inAppNotification";

export type InAppToastDestination =
  | { type: "profile"; userId: string }
  | {
      type: "activity";
      targetType: SocialInteractionTargetType;
      targetId: string;
      openComments: boolean;
    };

type Handler = (destination: InAppToastDestination) => void;

let handler: Handler | null = null;

export function setInAppToastNavigationHandler(next: Handler | null) {
  handler = next;
}

export function navigateFromInAppToast(destination: InAppToastDestination) {
  handler?.(destination);
}
