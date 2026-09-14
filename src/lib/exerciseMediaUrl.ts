export const EXERCISE_MEDIA_BUCKET = "ejercicios";

const LOCAL_EJERCICIOS_PREFIX = "/ejercicios/";

function supabasePublicObjectUrl(objectPath: string): string | null {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
  if (!base) return null;
  const encoded = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${EXERCISE_MEDIA_BUCKET}/${encoded}`;
}

/**
 * Resuelve rutas `/ejercicios/...` a Supabase Storage (bucket público).
 *
 * Un solo origen para todos los medios del catálogo, en web y en nativo. El
 * bucket `ejercicios` los tiene todos: GIFs nativos, WebP animados y
 * thumbnails de `thumbs/`. No viven en `public/`: copiarlos al repo duplicaba
 * ~635 MB en cada deploy de Vercel.
 *
 * Si falta `VITE_SUPABASE_URL` se devuelve la ruta relativa: no sirve de nada,
 * pero no rompe el render.
 */
export function resolveExerciseMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!path.startsWith(LOCAL_EJERCICIOS_PREFIX)) return trimmed;

  const objectPath = path.slice(LOCAL_EJERCICIOS_PREFIX.length);
  if (!objectPath) return null;

  return supabasePublicObjectUrl(objectPath) ?? path;
}
