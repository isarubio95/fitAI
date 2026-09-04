import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PROFILE_AVATAR_BUCKET, getNormalizedAvatarStoragePath } from "@/hooks/useProfileAvatarUpload";
import { supabase } from "@/integrations/supabase/client";
import {
  cleanAvatarUrl,
  isDirectAvatarUrl,
  isGoogleAvatarUrl,
  normalizeGoogleAvatarUrl,
  toDisplayableAvatarUrl,
} from "@/lib/avatarUrl";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const signedAvatarCache = new Map<string, { url: string; expiresAt: number }>();

function areSameStringArray(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function canonicalizeAvatarCandidate(value: string): string {
  return isGoogleAvatarUrl(value) ? normalizeGoogleAvatarUrl(value) : value;
}

async function resolveAvatarCandidate(candidate: string): Promise<string | undefined> {
  if (isDirectAvatarUrl(candidate)) {
    return toDisplayableAvatarUrl(candidate, import.meta.env.DEV);
  }

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

  return Array.from(
    new Set(
      raw
        .filter((v): v is string => Boolean(v))
        .map(canonicalizeAvatarCandidate),
    ),
  );
}

export function useUserAvatar(candidatesInput: Array<string | null | undefined>) {
  const candidatesKey = useMemo(() => {
    const normalized = Array.from(
      new Set(
        candidatesInput
          .map(cleanAvatarUrl)
          .filter((v): v is string => Boolean(v))
          .map(canonicalizeAvatarCandidate),
      ),
    ).slice(0, 4);
    return normalized.join("|");
  }, [candidatesInput]);
  const candidates = useMemo(() => (candidatesKey ? candidatesKey.split("|") : []), [candidatesKey]);
  const [resolvedCandidates, setResolvedCandidates] = useState<string[]>([]);
  const [resolvedForKey, setResolvedForKey] = useState("");
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
          setResolvedForKey(candidatesKey);
        }
        return;
      }

      const resolved = await Promise.all(candidates.map(resolveAvatarCandidate));
      if (cancelled) return;
      const nextResolved = Array.from(new Set(resolved.filter((v): v is string => Boolean(v))));
      setResolvedCandidates((prev) => (areSameStringArray(prev, nextResolved) ? prev : nextResolved));
      setResolvedForKey(candidatesKey);
    };

    void resolveCandidates();

    return () => {
      cancelled = true;
    };
  }, [candidatesKey, candidates]);

  const ready = resolvedForKey === candidatesKey;
  const src = ready ? resolvedCandidates[index] : undefined;
  const isLoading = !ready;
  const onError = useCallback(() => {
    if (index >= resolvedCandidates.length - 1) return false;
    setIndex((prev) => prev + 1);
    return true;
  }, [index, resolvedCandidates.length]);

  return { src, onError, isLoading };
}
