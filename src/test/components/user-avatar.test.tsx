import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserAvatar } from "@/components/UserAvatar";
import { GOOGLE_AVATAR_PROXY_PATH, normalizeGoogleAvatarUrl } from "@/lib/avatarUrl";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: vi.fn(),
      }),
    },
  },
}));

const GOOGLE_AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocLyhtuBi2XC3MNvmd2Y4YO1xBybWVlrXsnrv9fBUIwSMmPOz5i9=s96-c";

describe("UserAvatar", () => {
  beforeEach(() => {
    class MockImage {
      complete = false;
      naturalWidth = 0;
      referrerPolicy = "";
      crossOrigin: string | null = null;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      private listeners = new Map<string, Array<(event: { currentTarget: MockImage }) => void>>();

      addEventListener(type: string, cb: (event: { currentTarget: MockImage }) => void) {
        const next = this.listeners.get(type) ?? [];
        next.push(cb);
        this.listeners.set(type, next);
      }

      removeEventListener(type: string, cb: (event: { currentTarget: MockImage }) => void) {
        const next = (this.listeners.get(type) ?? []).filter((listener) => listener !== cb);
        this.listeners.set(type, next);
      }

      set src(_value: string) {
        this.complete = true;
        this.naturalWidth = 64;
        const event = { currentTarget: this };
        for (const listener of this.listeners.get("load") ?? []) listener(event);
        this.onload?.();
      }
    }

    vi.stubGlobal("Image", MockImage);
    Object.defineProperty(window, "Image", { configurable: true, writable: true, value: MockImage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("pide las fotos de Google sin referer", async () => {
    const { container } = render(<UserAvatar avatarUrl={GOOGLE_AVATAR} username="isa" />);

    await waitFor(() => {
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
    });

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(img?.getAttribute("src")?.startsWith(`${GOOGLE_AVATAR_PROXY_PATH}?u=`)).toBe(true);
    expect(img?.getAttribute("src")).toContain(encodeURIComponent(normalizeGoogleAvatarUrl(GOOGLE_AVATAR)));
  });

  it("muestra la inicial si la foto de Google falla", async () => {
    class FailingImage {
      complete = true;
      naturalWidth = 0;
      referrerPolicy = "";
      crossOrigin: string | null = null;
      addEventListener() {}
      removeEventListener() {}
      set src(_value: string) {}
    }
    Object.defineProperty(window, "Image", { configurable: true, writable: true, value: FailingImage });
    vi.stubGlobal("Image", FailingImage);

    const { container } = render(<UserAvatar avatarUrl={GOOGLE_AVATAR} username="isa" />);
    await waitFor(() => {
      expect(container).toHaveTextContent("I");
    });
    expect(container.querySelector("img")).toBeNull();
  });

  it("muestra la inicial si no hay foto", () => {
    const { container } = render(<UserAvatar avatarUrl={null} username="isa" />);
    expect(container).toHaveTextContent("I");
    expect(container.querySelector("img")).toBeNull();
  });
});
