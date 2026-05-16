import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PROFILE_AVATAR_BUCKET = "profile-avatars";
export const PROFILE_AVATAR_MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
export const PROFILE_AVATAR_OUTPUT_SIZE = 512;
export const PROFILE_AVATAR_OUTPUT_QUALITY = 0.86;

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function normalizeAvatarStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return null;
  if (trimmed.startsWith(`${PROFILE_AVATAR_BUCKET}/`)) {
    return trimmed.slice(PROFILE_AVATAR_BUCKET.length + 1);
  }
  return trimmed;
}

function readImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen seleccionada."));
    };
    img.src = url;
  });
}

async function processAvatarFile(file: File): Promise<Blob> {
  const img = await readImageFromFile(file);
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("La imagen no tiene dimensiones válidas.");
  }

  const side = Math.min(sourceWidth, sourceHeight);
  const sourceX = (sourceWidth - side) / 2;
  const sourceY = (sourceHeight - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = PROFILE_AVATAR_OUTPUT_SIZE;
  canvas.height = PROFILE_AVATAR_OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo preparar el editor de imagen.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    side,
    side,
    0,
    0,
    PROFILE_AVATAR_OUTPUT_SIZE,
    PROFILE_AVATAR_OUTPUT_SIZE,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", PROFILE_AVATAR_OUTPUT_QUALITY);
  });

  if (!blob) {
    throw new Error("No se pudo optimizar la imagen.");
  }

  return blob;
}

type UploadAvatarArgs = {
  file: File;
  userId: string;
  currentAvatarPath?: string | null;
};

type UploadAvatarResult = {
  avatarPath: string;
  signedUrl: string;
};

export function useProfileAvatarUpload() {
  const queryClient = useQueryClient();

  return useMutation<UploadAvatarResult, Error, UploadAvatarArgs>({
    mutationFn: async ({ file, userId, currentAvatarPath }) => {
      if (!userId) throw new Error("No se pudo identificar al usuario.");
      if (!isImageFile(file)) throw new Error("Selecciona un archivo de imagen válido.");
      if (file.size > PROFILE_AVATAR_MAX_FILE_SIZE_BYTES) {
        throw new Error("La imagen supera el límite de 8 MB.");
      }

      const optimizedBlob = await processAvatarFile(file);
      const avatarPath = `${userId}/avatar-${Date.now()}.jpg`;

      const previousPath = normalizeAvatarStoragePath(currentAvatarPath);
      if (previousPath) {
        await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([previousPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .upload(avatarPath, optimizedBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("perfil")
        .update({ avatar_url: avatarPath })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .createSignedUrl(avatarPath, 60 * 60);

      if (signedError || !signedData?.signedUrl) {
        throw signedError ?? new Error("No se pudo generar la URL del avatar.");
      }

      return { avatarPath, signedUrl: signedData.signedUrl };
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData(
        ["perfil-drawer", variables.userId],
        (prev: { username: string | null; avatar_url: string | null } | null | undefined) => ({
          ...(prev ?? { username: null }),
          avatar_url: result.avatarPath,
        }),
      );

      queryClient.invalidateQueries({ queryKey: ["perfil-drawer", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["profile-avatar", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["community-feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-search"] });
    },
  });
}

export function getNormalizedAvatarStoragePath(value: string | null | undefined) {
  return normalizeAvatarStoragePath(value);
}
