/**
 * Envoltorio del mensaje que devuelve un prompt.
 *
 * Un prompt es un turno de usuario que el cliente inserta en la conversación,
 * así que su texto va en español: es lo que el usuario vería escrito si lo
 * hubiera tecleado él, y llega en el idioma en el que quiere la respuesta. Los
 * nombres de herramienta y de parámetro van literales dentro de ese texto,
 * porque son del modelo y no se traducen.
 *
 * Vive aparte del registro para que los módulos de dominio no tengan que
 * importar de `registry.ts`, que es quien los importa a ellos.
 */

export function userPrompt(text: string) {
  return {
    messages: [{ role: "user" as const, content: { type: "text" as const, text: text.trim() } }],
  };
}
