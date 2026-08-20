import { useEffect } from "react";
import { notifySocialInteractionToast } from "@/components/notifications/inAppSocialToast";

/**
 * Mock de toast social para pruebas de diseño.
 *
 * Para activarlo, monta `<MockSocialToastPreview />` en `AppLayout`
 * (junto a `InAppSocialToastSync`).
 */
export function MockSocialToastPreview() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      notifySocialInteractionToast({
        interaction: "comment",
        targetType: "actividad",
        targetId: "mock-preview",
        username: "noeliapinillos",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      });
    }, 600);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
