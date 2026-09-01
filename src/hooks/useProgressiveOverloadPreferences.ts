import { useCallback, useEffect, useState } from "react";
import {
  isProgressiveOverloadSuggestionsEnabled,
  setProgressiveOverloadSuggestionsEnabled,
  subscribeProgressiveOverloadPreferences,
} from "@/lib/progressiveOverloadPreferences";

export function useProgressiveOverloadPreferences() {
  const [enabled, setEnabledState] = useState(isProgressiveOverloadSuggestionsEnabled);

  useEffect(() => {
    return subscribeProgressiveOverloadPreferences(() => {
      setEnabledState(isProgressiveOverloadSuggestionsEnabled());
    });
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setProgressiveOverloadSuggestionsEnabled(next);
    setEnabledState(next);
  }, []);

  return { enabled, setEnabled };
}
