/**
 * Formato de salida único para todas las herramientas.
 *
 * JSON compacto y no prosa, a propósito: los números de este dominio (peso, RIR,
 * segundos por kilómetro) se transcriben mal desde texto formateado, y el modelo
 * ya sabe verbalizarlos. Las unidades van en el nombre de la clave
 * (`weight_kg`, `rest_seconds`, `pace_seconds_per_km`), nunca formateadas como
 * `"5:30 /km"`.
 *
 * Los errores sí llevan una `hint` en inglés natural: ahí es donde de verdad
 * sirve, porque guía el siguiente turno del modelo.
 */

import { MAX_RESPONSE_BYTES } from "./limits.ts";
import { UNTRUSTED_NOTE } from "./untrusted.ts";

export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export type OkOptions = {
  /** Hay más filas de las devueltas: valor a pasar como `offset` para seguir. */
  nextOffset?: number | null;
  /** La respuesta contiene texto escrito por el usuario. */
  untrusted?: boolean;
  /** Avisos dirigidos al modelo (p. ej. qué se resolvió, qué se ignoró). */
  notes?: string[];
};

function wrap(payload: unknown, isError = false): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload) }],
    ...(isError ? { isError: true } : {}),
  };
}

/**
 * Respuesta correcta. Si el JSON se pasa del tope, recorta el array de datos por
 * la cola hasta que quepa y lo dice: es preferible que el modelo sepa que hay
 * más y pagine a que crea que ha visto todo el historial.
 */
export function ok(data: unknown, options: OkOptions = {}): ToolResult {
  const notes = [...(options.notes ?? [])];
  if (options.untrusted) notes.push(UNTRUSTED_NOTE);

  const build = (d: unknown, truncated: boolean) => ({
    ok: true as const,
    data: d,
    ...(Array.isArray(d) ? { count: d.length } : {}),
    ...(truncated ? { truncated: true } : {}),
    ...(options.nextOffset != null ? { next_offset: options.nextOffset } : {}),
    ...(notes.length ? { notes } : {}),
  });

  let payload = build(data, false);
  if (JSON.stringify(payload).length <= MAX_RESPONSE_BYTES) return wrap(payload);

  if (!Array.isArray(data)) {
    // Un único objeto que no cabe (una sesión enorme). No se puede paginar, así
    // que se devuelve el error con instrucciones en vez de un objeto mutilado,
    // que el modelo leería como si estuviera completo.
    return fail(
      "RESPONSE_TOO_LARGE",
      "The result is too large to return in one call.",
      "Narrow the request: use a shorter date range, a lower limit, or request less detail.",
    );
  }

  const filas = [...data];
  while (filas.length > 1) {
    filas.pop();
    payload = build(filas, true);
    if (JSON.stringify(payload).length <= MAX_RESPONSE_BYTES) break;
  }

  return wrap({
    ...payload,
    truncated: true,
    notes: [
      ...notes,
      "Response was truncated to fit. Use limit/offset or a narrower date range to see the rest.",
    ],
  });
}

/** Respuesta de error. `extra` lleva datos accionables (p. ej. `candidates`). */
export function fail(
  code: string,
  message: string,
  hint?: string,
  extra?: Record<string, unknown>,
): ToolResult {
  return wrap(
    {
      ok: false as const,
      error: { code, message, ...(hint ? { hint } : {}), ...(extra ?? {}) },
    },
    true,
  );
}

/**
 * Traduce un error de PostgREST a algo que el modelo pueda usar. Importa
 * distinguir los dos casos habituales: RLS (el dato existe pero no es suyo, y
 * reintentar no va a arreglarlo) y violación de restricción (el payload es
 * inválido).
 */
export function failFromPostgrest(error: { code?: string; message: string }): ToolResult {
  const code = error.code ?? "";

  if (code === "42501" || code === "PGRST301") {
    return fail(
      "FORBIDDEN",
      "The row does not exist or belongs to another user.",
      "Do not retry. List the user's own items first and use an ID from that list.",
    );
  }
  if (code === "23505") {
    return fail("DUPLICATE", error.message, "An equivalent row already exists.");
  }
  if (code === "23514" || code === "23502" || code === "22P02") {
    return fail("INVALID_INPUT", error.message, "Fix the arguments and call again.");
  }

  return fail("DB_ERROR", error.message);
}
