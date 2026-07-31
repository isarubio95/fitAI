import { useCallback, useEffect, useState } from "react";
import {
  isLiveSessionNotificationEnabled,
  isRestFinishedNotificationEnabled,
  setLiveSessionNotificationEnabled,
  setRestFinishedNotificationEnabled,
  subscribeNotificationPreferences,
} from "@/lib/notificationPreferences";
import { stopAllLiveSessions } from "@/lib/liveSessionNotifications";
import { cancelRestTimerNotification } from "@/lib/restTimerNotifications";

export function useNotificationPreferences() {
  const [liveSessionEnabled, setLiveSessionEnabledState] = useState(isLiveSessionNotificationEnabled);
  const [restFinishedEnabled, setRestFinishedEnabledState] = useState(isRestFinishedNotificationEnabled);

  useEffect(() => {
    return subscribeNotificationPreferences(() => {
      setLiveSessionEnabledState(isLiveSessionNotificationEnabled());
      setRestFinishedEnabledState(isRestFinishedNotificationEnabled());
    });
  }, []);

  const setLiveSessionEnabled = useCallback((enabled: boolean) => {
    setLiveSessionNotificationEnabled(enabled);
    setLiveSessionEnabledState(enabled);
    if (!enabled) {
      void stopAllLiveSessions();
    }
  }, []);

  const setRestFinishedEnabled = useCallback((enabled: boolean) => {
    setRestFinishedNotificationEnabled(enabled);
    setRestFinishedEnabledState(enabled);
    if (!enabled) {
      void cancelRestTimerNotification();
    }
  }, []);

  return {
    liveSessionEnabled,
    restFinishedEnabled,
    setLiveSessionEnabled,
    setRestFinishedEnabled,
  };
}
