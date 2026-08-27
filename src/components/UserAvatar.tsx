import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { cn } from "@/lib/utils";

const AVATAR_LOAD_TIMEOUT_MS = 5_000;

function initialsFromUsername(username?: string | null) {
  return username?.trim()?.[0]?.toUpperCase() || "U";
}

export type UserAvatarProps = {
  avatarUrl?: string | null;
  username?: string | null;
  className?: string;
  fallbackClassName?: string;
  /** URLs a resolver. Si se omite, se usa `avatarUrl`. */
  candidates?: Array<string | null | undefined>;
  /** El padre aún no sabe si hay foto (p. ej. perfil cargando). */
  pending?: boolean;
};

export function UserAvatar({
  avatarUrl,
  username,
  className,
  fallbackClassName,
  candidates,
  pending = false,
}: UserAvatarProps) {
  const avatar = useUserAvatar(candidates ?? [avatarUrl]);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = avatar.src;
  const failed = Boolean(src) && failedSrc === src;
  const imageLoaded = Boolean(src) && loadedSrc === src;
  const showSkeleton = !failed && (pending || avatar.isLoading || (Boolean(src) && !imageLoaded));

  useEffect(() => {
    if (!src || imageLoaded || failed) return;
    const timeoutId = window.setTimeout(() => {
      if (!avatar.onError()) setFailedSrc(src);
    }, AVATAR_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [src, imageLoaded, failed, avatar.onError]);

  return (
    <Avatar className={className} aria-busy={showSkeleton || undefined}>
      {src && !failed ? (
        <AvatarImage
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="object-cover"
          onLoadingStatusChange={(status) => {
            if (status === "loaded") setLoadedSrc(src);
            if (status === "error" && !avatar.onError()) setFailedSrc(src);
          }}
        />
      ) : null}
      <AvatarFallback className={cn("p-0", !showSkeleton && fallbackClassName)}>
        {showSkeleton ? (
          <Skeleton className="h-full w-full rounded-full" aria-hidden />
        ) : (
          initialsFromUsername(username)
        )}
      </AvatarFallback>
    </Avatar>
  );
}
