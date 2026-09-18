/**
 * El buscador de ejercicios vive en `supabase/functions/_shared/domain/` porque
 * también lo usa el servidor MCP (Deno), que no puede importar de `src/`: el
 * bundle de `supabase functions deploy` se construye desde `supabase/functions`.
 *
 * Fuente única a propósito: si el MCP tuviera su propia copia, "press banca"
 * devolvería un ejercicio distinto según se pregunte por la app o por el
 * asistente. Este fichero solo reexporta para que los imports del front
 * (`@/lib/exerciseSearch`) sigan funcionando.
 */
export * from "../../supabase/functions/_shared/domain/exerciseSearch.ts";
