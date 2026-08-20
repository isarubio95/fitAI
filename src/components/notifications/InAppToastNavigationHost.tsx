import { useEffect, useState } from "react";
import { CardioDetailsSheet } from "@/components/cardio/CardioDetailsSheet";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import {
  setInAppToastNavigationHandler,
  type InAppToastDestination,
} from "@/lib/inAppToastNavigation";

type ActivityTarget = {
  id: string;
  openComments: boolean;
};

/**
 * Recibe destinos de toasts (Sonner vive fuera de los providers) y abre
 * perfil o detalle de entreno/cardio.
 */
export function InAppToastNavigationHost() {
  const { openUserProfile } = useProfileDrawer();
  const [gym, setGym] = useState<ActivityTarget | null>(null);
  const [cardio, setCardio] = useState<ActivityTarget | null>(null);

  useEffect(() => {
    const onNavigate = (destination: InAppToastDestination) => {
      if (destination.type === "profile") {
        setGym(null);
        setCardio(null);
        openUserProfile(destination.userId);
        return;
      }
      if (destination.targetType === "actividad") {
        setCardio(null);
        setGym({ id: destination.targetId, openComments: destination.openComments });
        return;
      }
      setGym(null);
      setCardio({ id: destination.targetId, openComments: destination.openComments });
    };

    setInAppToastNavigationHandler(onNavigate);
    return () => setInAppToastNavigationHandler(null);
  }, [openUserProfile]);

  return (
    <>
      <WorkoutDetailsSheet
        open={!!gym}
        onOpenChange={(next) => {
          if (!next) setGym(null);
        }}
        workoutId={gym?.id ?? null}
        initialCommentsOpen={gym?.openComments}
      />
      <CardioDetailsSheet
        open={!!cardio}
        onOpenChange={(next) => {
          if (!next) setCardio(null);
        }}
        sessionId={cardio?.id ?? null}
        initialCommentsOpen={cardio?.openComments}
      />
    </>
  );
}
