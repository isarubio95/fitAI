/** Autores del feed: solo cuentas seguidas, nunca el propio usuario. */
export function communityFeedAuthorIds(
  followingIds: Iterable<string>,
  viewerId?: string | null,
): string[] {
  const ids = new Set<string>();
  for (const id of followingIds) {
    if (id && id !== viewerId) ids.add(id);
  }
  return [...ids].sort();
}

export function communityFeedEmptyMessage(followingCount: number): string {
  if (followingCount <= 0) {
    return "Sigue a alguien para ver sus entrenos aquí.";
  }
  return "Las personas que sigues aún no han publicado entrenos.";
}

export const COMMUNITY_PUBLISH_HINT_ON =
  "Quienes te sigan verán este entreno en su feed.";
export const COMMUNITY_PUBLISH_HINT_OFF = "Este entreno se mantendrá privado.";
