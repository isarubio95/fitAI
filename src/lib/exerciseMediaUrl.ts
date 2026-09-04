import { Capacitor } from "@capacitor/core";

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
 * Los 749 GIF originales son los únicos que existen en `public/ejercicios/`.
 * Los medios del catálogo ampliado son WebP y viven SOLO en el bucket: esa
 * carpeta ya pesa 635 MB y no se quiso engordar más.
 */
function soloEnStorage(objectPath: string): boolean {
  return !/\.gif$/i.test(objectPath);
}

/**
 * Resuelve rutas locales `/ejercicios/...` a Supabase Storage (bucket público).
 *
 * En nativo siempre usa Storage (los medios no van en el AAB). En web mantiene
 * la ruta relativa para servir desde `public/` en desarrollo, salvo que el
 * fichero no exista ahí —los WebP del catálogo ampliado— o que
 * `VITE_EXERCISE_MEDIA_ORIGIN` fuerce Storage para todo.
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

  // Android/iOS: sin archivos locales empaquetados → Storage.
  if (Capacitor.isNativePlatform()) {
    return supabasePublicObjectUrl(objectPath);
  }

  // Web: Storage si el fichero no está en public/, o si se fuerza por entorno.
  const forzarStorage = !!(import.meta.env.VITE_EXERCISE_MEDIA_ORIGIN as string | undefined);
  if (forzarStorage || soloEnStorage(objectPath)) {
    return supabasePublicObjectUrl(objectPath) ?? path;
  }

  // Web: public/ejercicios sigue disponible en Vite.
  return path;
}
