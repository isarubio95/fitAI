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
 * bucket `ejercicios` los tiene todos: las demos en WebP animado y los
 * thumbnails de `thumbs/`. Antes se decidía por la extensión —los .gif se
 * servían de `public/ejercicios/` y el resto del bucket—, lo que obligaba a
 * arrastrar 637 MB de GIF en el repo y a excluirlos del bundle de Android.
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
