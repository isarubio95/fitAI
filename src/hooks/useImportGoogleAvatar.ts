import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  PROFILE_AVATAR_BUCKET,
  PROFILE_AVATAR_MAX_FILE_SIZE_BYTES,
  getNormalizedAvatarStoragePath,
} from "@/hooks/useProfileAvatarUpload";
import { buildAuthAvatarCandidates } from "@/hooks/useUserAvatar";
import { supabase } from "@/integrations/supabase/client";
import {
  GOOGLE_AVATAR_IMPORT_SIZE,
  isGoogleAvatarUrl,
  normalizeGoogleAvatarUrl,
  shouldImportGoogleAvatar,
  toDisplayableAvatarUrl,
} from "@/lib/avatarUrl";

const attemptedUsers = new Set<string>();

function extensionForImageType(contentType: string): "jpg" | "png" | "webp" {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

export async function importGoogleProfileAvatar(input: {
  userId: string;
  googleUrl: string;
  currentAvatarUrl?: string | null;
}): Promise<string | null> {
  if (!shouldImportGoogleAvatar(input.currentAvatarUrl)) return null;
  if (!isGoogleAvatarUrl(input.googleUrl)) return null;

  const remoteUrl = toDisplayableAvatarUrl(
    normalizeGoogleAvatarUrl(input.googleUrl, GOOGLE_AVATAR_IMPORT_SIZE),
    import.meta.env.DEV,
  );

  const response = await fetch(remoteUrl, {
    referrerPolicy: "no-referrer",
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
  });
  if (!response.ok) return null;

  const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!contentType.startsWith("image/")) return null;

  const blob = await response.blob();
  if (blob.size < 32 || blob.size > PROFILE_AVATAR_MAX_FILE_SIZE_BYTES) return null;

  const avatarPath = `${input.userId}/avatar-${Date.now()}.${extensionForImageType(contentType)}`;
  const previousPath = getNormalizedAvatarStoragePath(input.currentAvatarUrl);
  if (previousPath) {
    await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([previousPath]);
  }

  const { error: uploadError } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).upload(avatarPath, blob, {
    contentType,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("perfil")
    .update({ avatar_url: avatarPath })
    .eq("id", input.userId);
  if (updateError) throw updateError;

  return avatarPath;
}

export function useImportGoogleAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userId = user?.id;
    if (!userId || attemptedUsers.has(userId)) return;
    attemptedUsers.add(userId);

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("perfil")
          .select("avatar_url")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          attemptedUsers.delete(userId);
          return;
        }
        if (!shouldImportGoogleAvatar(data.avatar_url)) return;

        const profileAvatar = data.avatar_url;
        const googleUrl =
          profileAvatar && isGoogleAvatarUrl(profileAvatar)
            ? profileAvatar
            : buildAuthAvatarCandidates(user).find(isGoogleAvatarUrl);
        if (!googleUrl) return;

        const imported = await importGoogleProfileAvatar({
          userId,
          googleUrl,
          currentAvatarUrl: data.avatar_url,
        });
        if (!imported) return;

        queryClient.invalidateQueries({ queryKey: ["profile-avatar", userId] });
        queryClient.invalidateQueries({ queryKey: ["perfil-drawer", userId] });
        queryClient.invalidateQueries({ queryKey: ["community-feed"] });
      } catch {
        attemptedUsers.delete(userId);
      }
    })();
  }, [user, queryClient]);
}
