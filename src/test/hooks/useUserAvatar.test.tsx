import { act, renderHook, waitFor } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { storageCreateSignedUrl, storageFrom } = vi.hoisted(() => ({
  storageCreateSignedUrl: vi.fn(),
  storageFrom: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: storageFrom,
    },
  },
}));

import { buildAuthAvatarCandidates, useUserAvatar } from "@/hooks/useUserAvatar";
import { GOOGLE_AVATAR_PROXY_PATH, normalizeGoogleAvatarUrl } from "@/lib/avatarUrl";

const GOOGLE_AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocLyhtuBi2XC3MNvmd2Y4YO1xBybWVlrXsnrv9fBUIwSMmPOz5i9=s96-c";

describe("useUserAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/avatar.jpg" },
      error: null,
    });
    storageFrom.mockReturnValue({
      createSignedUrl: storageCreateSignedUrl,
    });
  });

  it("deduplica fotos de Google con distinto tamaño y en dev las sirve por el proxy", async () => {
    const { result } = renderHook(() =>
      useUserAvatar([GOOGLE_AVATAR, GOOGLE_AVATAR.replace("=s96-c", "=s256-c")]),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.src?.startsWith(`${GOOGLE_AVATAR_PROXY_PATH}?u=`)).toBe(true);
    expect(result.current.src).toContain(encodeURIComponent(normalizeGoogleAvatarUrl(GOOGLE_AVATAR)));
    expect(storageCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("firma rutas de storage", async () => {
    const { result } = renderHook(() => useUserAvatar(["user-77/avatar.jpg"]));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.src).toBe("https://signed.example/avatar.jpg");
    expect(storageCreateSignedUrl).toHaveBeenCalledWith("user-77/avatar.jpg", 3600);
  });

  it("pasa al siguiente candidato si onError lo pide", async () => {
    const { result } = renderHook(() =>
      useUserAvatar(["https://cdn.example/one.jpg", "https://cdn.example/two.jpg"]),
    );

    await waitFor(() => expect(result.current.src).toBe("https://cdn.example/one.jpg"));
    act(() => {
      expect(result.current.onError()).toBe(true);
    });
    expect(result.current.src).toBe("https://cdn.example/two.jpg");
    act(() => {
      expect(result.current.onError()).toBe(false);
    });
    expect(result.current.src).toBe("https://cdn.example/two.jpg");
  });

  it("extrae la foto de Google del usuario de auth", () => {
    const user = {
      user_metadata: { avatar_url: GOOGLE_AVATAR, picture: GOOGLE_AVATAR.replace("=s96-c", "=s64-c") },
      identities: [{ identity_data: { picture: GOOGLE_AVATAR } }],
    } as unknown as User;

    expect(buildAuthAvatarCandidates(user)).toEqual([normalizeGoogleAvatarUrl(GOOGLE_AVATAR)]);
  });
});
