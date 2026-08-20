import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import { communityActivityHref } from "@/lib/communityActivityHref";
import {
  setInAppToastNavigationHandler,
  type InAppToastDestination,
} from "@/lib/inAppToastNavigation";

/**
 * Recibe destinos de toasts (Sonner vive fuera de los providers) y abre
 * perfil o la tarjeta en Comunidad.
 */
export function InAppToastNavigationHost() {
  const { openUserProfile } = useProfileDrawer();
  const navigate = useNavigate();

  useEffect(() => {
    const onNavigate = (destination: InAppToastDestination) => {
      if (destination.type === "profile") {
        openUserProfile(destination.userId);
        return;
      }
      navigate(
        communityActivityHref({
          targetType: destination.targetType,
          targetId: destination.targetId,
          openComments: destination.openComments,
        }),
      );
    };

    setInAppToastNavigationHandler(onNavigate);
    return () => setInAppToastNavigationHandler(null);
  }, [navigate, openUserProfile]);

  return null;
}
