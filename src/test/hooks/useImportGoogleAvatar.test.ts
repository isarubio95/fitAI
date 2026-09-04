import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { storageRemove, storageUpload, dbEq, dbUpdate, dbFrom, storageFrom } = vi.hoisted(() => ({
  storageRemove: vi.fn(),
  storageUpload: vi.fn(),
  dbEq: vi.fn(),
  dbUpdate: vi.fn(),
  dbFrom: vi.fn(),
  storageFrom: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: storageFrom,
    },
    from: dbFrom,
  },
}));

import { PROFILE_AVATAR_BUCKET } from "@/hooks/useProfileAvatarUpload";
import { importGoogleProfileAvatar } from "@/hooks/useImportGoogleAvatar";

const GOOGLE_AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocLyhtuBi2XC3MNvmd2Y4YO1xBybWVlrXsnrv9fBUIwSMmPOz5i9=s96-c";

describe("importGoogleProfileAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageRemove.mockResolvedValue({ error: null });
    storageUpload.mockResolvedValue({ error: null });
    dbEq.mockResolvedValue({ error: null });
    dbUpdate.mockReturnValue({ eq: dbEq });
    dbFrom.mockReturnValue({ update: dbUpdate });
    storageFrom.mockReturnValue({
      remove: storageRemove,
      upload: storageUpload,
    });
    vi.spyOn(Date, "now").mockReturnValue(123456789);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("no pisa un avatar ya subido a storage", async () => {
    await expect(
      importGoogleProfileAvatar({
        userId: "user-1",
        googleUrl: GOOGLE_AVATAR,
        currentAvatarUrl: "user-1/avatar.jpg",
      }),
    ).resolves.toBeNull();
    expect(storageUpload).not.toHaveBeenCalled();
  });

  it("descarga la foto de Google y la guarda en el perfil", async () => {
    const blob = new Blob([new Uint8Array(64).fill(7)], { type: "image/jpeg" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "image/jpeg" },
        blob: async () => blob,
      }),
    );

    await expect(
      importGoogleProfileAvatar({
        userId: "user-1",
        googleUrl: GOOGLE_AVATAR,
        currentAvatarUrl: GOOGLE_AVATAR,
      }),
    ).resolves.toBe("user-1/avatar-123456789.jpg");

    expect(storageRemove).not.toHaveBeenCalled();
    expect(storageFrom).toHaveBeenCalledWith(PROFILE_AVATAR_BUCKET);
    expect(storageUpload).toHaveBeenCalledWith(
      "user-1/avatar-123456789.jpg",
      blob,
      expect.objectContaining({ contentType: "image/jpeg", upsert: false }),
    );
    expect(dbUpdate).toHaveBeenCalledWith({ avatar_url: "user-1/avatar-123456789.jpg" });
    expect(dbEq).toHaveBeenCalledWith("id", "user-1");
  });

  it("ignora respuestas que no son imagen", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "text/html" },
        blob: async () => new Blob(["nope"], { type: "text/html" }),
      }),
    );

    await expect(
      importGoogleProfileAvatar({
        userId: "user-1",
        googleUrl: GOOGLE_AVATAR,
      }),
    ).resolves.toBeNull();
    expect(storageUpload).not.toHaveBeenCalled();
  });
});
