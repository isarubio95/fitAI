/**
 * Extracción y validación del id de vídeo de YouTube.
 *
 * `tipo_ejercicio.video_url` guarda la URL completa (es lo que se pega desde el
 * navegador y lo que hay que poder revisar a ojo en la BD); la UI necesita el
 * id de 11 caracteres para montar la miniatura y el reproductor.
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

const HOSTS_CORTOS = new Set(["youtu.be"]);
const HOSTS_LARGOS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** Rutas de las que el id es el último segmento: /embed/ID, /shorts/ID, /v/ID, /live/ID. */
const PREFIJOS_RUTA = ["/embed/", "/shorts/", "/v/", "/live/"];

export function isYoutubeId(value: unknown): value is string {
  return typeof value === "string" && ID_RE.test(value);
}

/**
 * Devuelve el id de 11 caracteres, o `null` si la entrada no es una URL de
 * YouTube reconocible. Acepta también un id suelto.
 */
export function extractYoutubeId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;

  if (ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (HOSTS_CORTOS.has(host)) {
    const id = url.pathname.slice(1).split("/")[0];
    return ID_RE.test(id) ? id : null;
  }

  if (!HOSTS_LARGOS.has(host)) return null;

  const v = url.searchParams.get("v");
  if (v && ID_RE.test(v)) return v;

  const path = url.pathname;
  for (const prefijo of PREFIJOS_RUTA) {
    if (path.startsWith(prefijo)) {
      const id = path.slice(prefijo.length).split("/")[0];
      return ID_RE.test(id) ? id : null;
    }
  }

  return null;
}

/** Miniatura servida por el CDN de YouTube. `hqdefault` existe para todo vídeo. */
export function youtubeThumbnailUrl(
  id: string,
  quality: "hqdefault" | "mqdefault" | "maxresdefault" = "hqdefault",
): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/**
 * URL del reproductor embebido, en el dominio sin cookies de seguimiento.
 * `autoplay=1` porque solo se monta el iframe tras un clic explícito.
 */
export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
