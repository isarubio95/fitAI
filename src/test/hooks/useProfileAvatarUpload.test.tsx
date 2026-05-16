import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  storageRemove,
  storageUpload,
  storageCreateSignedUrl,
  storageFrom,
  dbEq,
  dbUpdate,
  dbFrom,
} = vi.hoisted(() => ({
  storageRemove: vi.fn(),
  storageUpload: vi.fn(),
  storageCreateSignedUrl: vi.fn(),
  storageFrom: vi.fn(),
  dbEq: vi.fn(),
  dbUpdate: vi.fn(),
  dbFrom: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: storageFrom,
    },
    from: dbFrom,
  },
}));

import {
  PROFILE_AVATAR_BUCKET,
  PROFILE_AVATAR_MAX_FILE_SIZE_BYTES,
  useProfileAvatarUpload,
} from "@/hooks/useProfileAvatarUpload";

describe("useProfileAvatarUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    storageRemove.mockResolvedValue({ error: null });
    storageUpload.mockResolvedValue({ error: null });
    storageCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/avatar.jpg" },
      error: null,
    });
    storageFrom.mockReturnValue({
      remove: storageRemove,
      upload: storageUpload,
      createSignedUrl: storageCreateSignedUrl,
    });

    dbEq.mockResolvedValue({ error: null });
    dbUpdate.mockReturnValue({ eq: dbEq });
    dbFrom.mockReturnValue({ update: dbUpdate });

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-avatar");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(Date, "now").mockReturnValue(123456789);

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
      callback(new Blob(["avatar"], { type: "image/jpeg" }));
    });

    vi.stubGlobal(
      "Image",
      class MockImage {
        naturalWidth = 1200;
        naturalHeight = 1000;
        width = 1200;
        height = 1000;
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;

        set src(_value: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      } as unknown as typeof Image,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rechaza archivos no imagen", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useProfileAvatarUpload(), { wrapper });

    const txtFile = new File(["hola"], "hola.txt", { type: "text/plain" });

    await expect(
      result.current.mutateAsync({
        file: txtFile,
        userId: "user-1",
      }),
    ).rejects.toThrow("Selecciona un archivo de imagen válido.");
  });

  it("sube avatar, actualiza perfil y devuelve signed url", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useProfileAvatarUpload(), { wrapper });

    const pngData = new Uint8Array([137, 80, 78, 71]);
    const imgFile = new File([pngData], "avatar.png", { type: "image/png" });

    let response: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined;
    await act(async () => {
      response = await result.current.mutateAsync({
        file: imgFile,
        userId: "user-77",
        currentAvatarPath: `${PROFILE_AVATAR_BUCKET}/user-77/avatar-old.jpg`,
      });
    });

    expect(storageRemove).toHaveBeenCalledWith(["user-77/avatar-old.jpg"]);
    expect(storageUpload).toHaveBeenCalledWith(
      "user-77/avatar-123456789.jpg",
      expect.any(Blob),
      expect.objectContaining({ contentType: "image/jpeg", upsert: false }),
    );
    expect(dbFrom).toHaveBeenCalledWith("perfil");
    expect(dbUpdate).toHaveBeenCalledWith({ avatar_url: "user-77/avatar-123456789.jpg" });
    expect(dbEq).toHaveBeenCalledWith("id", "user-77");
    expect(storageCreateSignedUrl).toHaveBeenCalledWith("user-77/avatar-123456789.jpg", 3600);

    expect(response).toEqual({
      avatarPath: "user-77/avatar-123456789.jpg",
      signedUrl: "https://signed.example/avatar.jpg",
    });

    expect(setQueryDataSpy).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["perfil-drawer", "user-77"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["profile-avatar", "user-77"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["community-feed"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-search"] });
  });

  it("rechaza imagenes mayores de 8MB", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useProfileAvatarUpload(), { wrapper });

    const size = PROFILE_AVATAR_MAX_FILE_SIZE_BYTES + 1;
    const hugeBytes = new Uint8Array(size);
    const bigImg = new File([hugeBytes], "big.jpg", { type: "image/jpeg" });

    await expect(
      result.current.mutateAsync({
        file: bigImg,
        userId: "user-2",
      }),
    ).rejects.toThrow("La imagen supera el límite de 8 MB.");
  });
});

