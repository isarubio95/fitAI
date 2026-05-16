import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PROFILE_AVATAR_BUCKET, getNormalizedAvatarStoragePath } from "@/hooks/useProfileAvatarUpload";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const signedAvatarCache = new Map<string, { url: string; expiresAt: number }>();

function cleanAvatarUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function isDirectAvatarUrl(value: string) {
  return /^(https?:|blob:|data:)/i.test(value);
}

function areSameStringArray(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function resolveAvatarCandidate(candidate: string): Promise<string | undefined> {
  if (isDirectAvatarUrl(candidate)) return candidate;

  const storagePath = getNormalizedAvatarStoragePath(candidate);
  if (!storagePath) return undefined;

  const cached = signedAvatarCache.get(storagePath);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 10_000) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return undefined;
  }

  signedAvatarCache.set(storagePath, {
    url: data.signedUrl,
    expiresAt: now + SIGNED_URL_TTL_SECONDS * 1000,
  });

  return data.signedUrl;
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
  const candidatesKey = useMemo(() => {
    const normalized = Array.from(
      new Set(candidatesInput.map(cleanAvatarUrl).filter((v): v is string => Boolean(v))),
    ).slice(0, 4);
    return normalized.join("|");
  }, [candidatesInput]);
  const candidates = useMemo(() => (candidatesKey ? candidatesKey.split("|") : []), [candidatesKey]);
  const [resolvedCandidates, setResolvedCandidates] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidatesKey]);

  useEffect(() => {
    let cancelled = false;

    const resolveCandidates = async () => {
      if (candidates.length === 0) {
        if (!cancelled) {
          setResolvedCandidates((prev) => (prev.length === 0 ? prev : []));
        }
        return;
      }

      const resolved = await Promise.all(candidates.map(resolveAvatarCandidate));
      if (cancelled) return;
      const nextResolved = Array.from(new Set(resolved.filter((v): v is string => Boolean(v))));
      setResolvedCandidates((prev) => (areSameStringArray(prev, nextResolved) ? prev : nextResolved));
    };

    resolveCandidates();

    return () => {
      cancelled = true;
    };
  }, [candidatesKey]);

  const src = resolvedCandidates[index];
  const onError = useCallback(() => {
    setIndex((prev) => (prev < resolvedCandidates.length - 1 ? prev + 1 : prev));
  }, [resolvedCandidates.length]);

  return { src, onError };
}

