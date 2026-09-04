import { afterEach, describe, expect, it } from "vitest";
import {
  PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY,
  isProgressiveOverloadSuggestionsEnabled,
  setProgressiveOverloadSuggestionsEnabled,
  subscribeProgressiveOverloadPreferences,
} from "@/lib/progressiveOverloadPreferences";

describe("progressiveOverloadPreferences", () => {
  afterEach(() => {
    localStorage.removeItem(PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY);
  });

  it("está activa por defecto si no hay preferencia", () => {
    expect(isProgressiveOverloadSuggestionsEnabled()).toBe(true);
    setProgressiveOverloadSuggestionsEnabled(false);
    expect(isProgressiveOverloadSuggestionsEnabled()).toBe(false);
    setProgressiveOverloadSuggestionsEnabled(true);
    expect(isProgressiveOverloadSuggestionsEnabled()).toBe(true);
  });

  it("notifica a los suscriptores al cambiar", () => {
    let calls = 0;
    const unsubscribe = subscribeProgressiveOverloadPreferences(() => {
      calls += 1;
    });
    setProgressiveOverloadSuggestionsEnabled(false);
    setProgressiveOverloadSuggestionsEnabled(true);
    expect(calls).toBe(2);
    unsubscribe();
    setProgressiveOverloadSuggestionsEnabled(false);
    expect(calls).toBe(2);
  });
});
