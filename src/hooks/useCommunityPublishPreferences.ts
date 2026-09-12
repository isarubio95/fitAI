import { useCallback, useEffect, useState } from "react";
import {
  isCommunityPublishDefaultEnabled,
  setCommunityPublishDefaultEnabled,
  subscribeCommunityPublishPreferences,
} from "@/lib/communityPublishPreferences";

export function useCommunityPublishPreferences() {
  const [enabled, setEnabledState] = useState(isCommunityPublishDefaultEnabled);

  useEffect(() => {
    return subscribeCommunityPublishPreferences(() => {
      setEnabledState(isCommunityPublishDefaultEnabled());
    });
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setCommunityPublishDefaultEnabled(next);
    setEnabledState(next);
  }, []);

  return { enabled, setEnabled };
}
