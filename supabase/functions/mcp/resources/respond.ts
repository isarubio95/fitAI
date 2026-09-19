/**
 * Formato de salida de los resources, hermano de `lib/respond.ts`.
 *
 * Mismo criterio que las herramientas: JSON compacto y en inglés, con la unidad
 * en el nombre de la clave y nada preformateado. El destinatario es el modelo.
 *
 * Vive aparte del registro para que los módulos de dominio no tengan que
 * importar de `registry.ts`, que es quien los importa a ellos.
 */

/** Esquema propio: los resources de este servidor no son ficheros ni URLs. */
export const RESOURCE_SCHEME = "trackgym";

/**
 * `uri.href` y no el literal registrado: el SDK resuelve el resource por la URL
 * ya normalizada, y la respuesta debe declarar cuál ha servido.
 */
export function jsonResource(uri: URL, payload: unknown) {
  return {
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(payload) }],
  };
}
