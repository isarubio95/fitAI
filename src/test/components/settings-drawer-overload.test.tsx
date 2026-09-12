import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import {
  PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY,
  isProgressiveOverloadSuggestionsEnabled,
} from "@/lib/progressiveOverloadPreferences";
import {
  COMMUNITY_PUBLISH_DEFAULT_KEY,
  isCommunityPublishDefaultEnabled,
} from "@/lib/communityPublishPreferences";

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

describe("SettingsDrawer preferencias", () => {
  afterEach(() => {
    localStorage.removeItem(PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY);
    localStorage.removeItem(COMMUNITY_PUBLISH_DEFAULT_KEY);
  });

  it("expone el toggle de progresión y persiste la preferencia", async () => {
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

  it("expone el toggle de publicar entrenamientos activo por defecto", async () => {
    render(
      <MemoryRouter>
        <SettingsDrawer />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ajustes" }));
    const toggle = await screen.findByRole("switch", { name: "Publicar entrenamientos por defecto" });
    expect(toggle).toHaveAttribute("data-state", "checked");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "unchecked");
    expect(isCommunityPublishDefaultEnabled()).toBe(false);
  });
});
