import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

function cleanAvatarUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

export function buildAuthAvatarCandidates(user: User | null | undefined): string[] {
  if (!user) return [];

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const identities = (user.identities ?? []) as Array<{ identity_data?: Record<string, unknown> }>;

  const raw = [
    cleanAvatarUrl(metadata?.avatar_url),
    cleanAvatarUrl(metadata?.picture),
    cleanAvatarUrl(metadata?.photo_url),
    ...identities.map((i) => cleanAvatarUrl(i.identity_data?.avatar_url)),
    ...identities.map((i) => cleanAvatarUrl(i.identity_data?.picture)),
    ...identities.map((i) => cleanAvatarUrl(i.identity_data?.photo_url)),
  ];

  return Array.from(new Set(raw.filter((v): v is string => Boolean(v))));
}

export function useUserAvatar(candidatesInput: Array<string | null | undefined>) {
  const candidates = useMemo(
    () =>
      Array.from(new Set(candidatesInput.map(cleanAvatarUrl).filter((v): v is string => Boolean(v)))).slice(0, 4),
    [candidatesInput],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates.join("|")]);

  const src = candidates[index];
  const onError = useCallback(() => {
    setIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : prev));
  }, [candidates.length]);

  return { src, onError };
}

