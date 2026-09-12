import { afterEach, describe, expect, it } from "vitest";
import {
  COMMUNITY_PUBLISH_DEFAULT_KEY,
  isCommunityPublishDefaultEnabled,
  setCommunityPublishDefaultEnabled,
  subscribeCommunityPublishPreferences,
} from "@/lib/communityPublishPreferences";

describe("communityPublishPreferences", () => {
  afterEach(() => {
    localStorage.removeItem(COMMUNITY_PUBLISH_DEFAULT_KEY);
  });

  it("está activa por defecto si no hay preferencia", () => {
    expect(isCommunityPublishDefaultEnabled()).toBe(true);
    setCommunityPublishDefaultEnabled(false);
    expect(isCommunityPublishDefaultEnabled()).toBe(false);
    setCommunityPublishDefaultEnabled(true);
    expect(isCommunityPublishDefaultEnabled()).toBe(true);
  });

  it("notifica a los suscriptores al cambiar", () => {
    let calls = 0;
    const unsubscribe = subscribeCommunityPublishPreferences(() => {
      calls += 1;
    });
    setCommunityPublishDefaultEnabled(false);
    setCommunityPublishDefaultEnabled(true);
    expect(calls).toBe(2);
    unsubscribe();
    setCommunityPublishDefaultEnabled(false);
    expect(calls).toBe(2);
  });
});
