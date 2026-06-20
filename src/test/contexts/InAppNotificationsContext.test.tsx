import React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUser = { id: "user-abc" };

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

import {
  InAppNotificationsProvider,
  useInAppNotificationsDismiss,
} from "@/contexts/InAppNotificationsContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <InAppNotificationsProvider>{children}</InAppNotificationsProvider>;
}

describe("InAppNotificationsContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("carga descartes desde localStorage al montar", () => {
    localStorage.setItem(
      "gym-log.notifications.dismissed:user-abc",
      JSON.stringify(["plan-suggestion"]),
    );

    const { result } = renderHook(() => useInAppNotificationsDismiss(), { wrapper });

    expect(result.current.dismissed.has("plan-suggestion")).toBe(true);
  });

  it("no pierde descartes previos al añadir nuevos (re-login / seed)", () => {
    localStorage.setItem(
      "gym-log.notifications.dismissed:user-abc",
      JSON.stringify(["plan-suggestion", "community-privacy-hint"]),
    );

    const { result } = renderHook(() => useInAppNotificationsDismiss(), { wrapper });

    act(() => {
      result.current.dismissMany(["new-follow-1"]);
    });

    const stored = JSON.parse(
      localStorage.getItem("gym-log.notifications.dismissed:user-abc") ?? "[]",
    ) as string[];

    expect(stored).toEqual(
      expect.arrayContaining(["plan-suggestion", "community-privacy-hint", "new-follow-1"]),
    );
    expect(result.current.dismissed.has("plan-suggestion")).toBe(true);
    expect(result.current.dismissed.has("new-follow-1")).toBe(true);
  });
});
