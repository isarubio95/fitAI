/**
 * Servidor MCP de Track Gym.
 *
 * Deja que el usuario gestione su diario de entrenamiento desde cualquier
 * cliente de IA (Claude, ChatGPT, Cursor, Gemini CLI…) sin que Track Gym tenga
 * que construir un chat propio. El cliente se autentica por OAuth 2.1 contra
 * Supabase Auth, aprueba el acceso en /oauth/consent, y a partir de ahí cada
 * llamada trae el JWT del usuario.
 *
 * La autorización NO se programa aquí: `withSupabase({ auth: 'user' })` entrega
 * un cliente con el token del usuario, así que las políticas RLS ya auditadas
 * son las que deciden qué se puede leer y escribir. Por eso en este directorio
 * no se usa nunca la service role key: sería saltarse el único control que hay.
 *
 * Ver el flujo completo y los pasos de despliegue en docs/MCP.md.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { pipeline } from "@supabase/middleware";
import { withOAuthProtectedResource, withSupabase } from "@supabase/server";
import type { Database } from "./database.types.ts";
import { registerAllTools } from "./tools/registry.ts";

const SERVER_INFO = { name: "track-gym", version: "1.0.0" } as const;

Deno.serve(
  pipeline(
    [
      // Primero a propósito: es el único que ve las peticiones SIN autenticar.
      // Publica la metadata de recurso protegido y añade el reto
      // `WWW-Authenticate` al 401 que genera la capa de abajo, que es como un
      // cliente MCP descubre a dónde ir a pedir el token. Si se invierte el
      // orden, el cliente recibe un 401 mudo y no puede ni empezar.
      withOAuthProtectedResource(),
      withSupabase<Database>({ auth: "user" }),
    ],
    // El handler va inline: extraerlo a una función tipada colapsa el contexto
    // inferido a `object` y TypeScript rechaza la composición (TS2345).
    async (req, { supabase }) => {
      const handler = createMcpHandler(
        () => {
          const server = new McpServer(SERVER_INFO);
          registerAllTools(server, supabase);
          return server;
        },
        { onerror: (e: unknown) => console.error("MCP request failed", e) },
      );

      return await handler.fetch(req);
    },
  ),
);
