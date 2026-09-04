import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import {
  PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY,
  isProgressiveOverloadSuggestionsEnabled,
} from "@/lib/progressiveOverloadPreferences";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
}));

vi.mock("@/hooks/useNotificationPreferences", () => ({
  useNotificationPreferences: () => ({
    liveSessionEnabled: true,
    restFinishedEnabled: true,
    setLiveSessionEnabled: vi.fn(),
    setRestFinishedEnabled: vi.fn(),
  }),
}));

vi.mock("@/components/layout/PhysiologySettings", () => ({
  PhysiologySettings: () => null,
}));

vi.mock("@/components/ColorThemeSelector", () => ({
  ColorThemeSelector: () => null,
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false, getPlatform: () => "web" },
}));

import { SettingsDrawer } from "@/components/layout/SettingsDrawer";

describe("SettingsDrawer sugerencias de progresión", () => {
  afterEach(() => {
    localStorage.removeItem(PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY);
  });

  it("expone el toggle y persiste la preferencia", async () => {
    render(
      <MemoryRouter>
        <SettingsDrawer />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ajustes" }));
    const toggle = await screen.findByRole("switch", { name: "Mostrar sugerencias de progresión" });
    expect(toggle).toHaveAttribute("data-state", "checked");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "unchecked");
    expect(isProgressiveOverloadSuggestionsEnabled()).toBe(false);
  });
});
