/** Longitud máxima de un comentario social sobre un entreno. */
export const ACTIVITY_COMMENT_MAX_LENGTH = 500;

/**
 * Normaliza el texto de un comentario: trim y valida longitud.
 * Devuelve el texto listo para insertar, o null si no es válido.
 */
export function normalizeActivityCommentText(raw: string): string | null {
  const texto = raw.trim();
  if (texto.length < 1 || texto.length > ACTIVITY_COMMENT_MAX_LENGTH) return null;
  return texto;
}
