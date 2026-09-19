/**
 * Registro de prompts: las plantillas que el cliente MCP enseña como comandos.
 *
 * Existen porque el valor del servidor dependía de que el usuario supiera qué
 * preguntar. Veinticinco herramientas sin un punto de entrada sugerido son una
 * API, no un producto: el usuario escribe «¿cómo voy?» y se queda en la
 * superficie de un servidor que sabe responder progresión por ejercicio, PRs
 * por 1RM estimado, volumen por músculo y adherencia al calendario.
 *
 * A diferencia de las herramientas, esto **no gasta presupuesto de contexto**:
 * las tools pagan ~120-200 tokens de esquema en cada turno, y los prompts se
 * listan solo cuando el cliente los pide. Por eso el catálogo puede crecer con
 * un criterio más laxo que el de `tools/registry.ts`.
 *
 * Ninguno lleva argumentos, por dos razones que apuntan al mismo sitio. La de
 * producto: un comando tiene que dar una respuesta útil con un solo clic, y lo
 * que haga falta afinar se afina hablando, que es lo que sabe hacer un chat. La
 * técnica: `prompts/get` del SDK valida `params.arguments` tal cual llega, sin
 * el `?? {}` que sí hacen las tools, así que un esquema de argumentos —aunque
 * fueran todos opcionales— revienta con `InvalidParams` en cuanto un cliente
 * invoca el comando sin mandar nada.
 */

import type { McpServer } from "@modelcontextprotocol/server";

import { registerTrainingPrompts } from "./training.ts";
import { registerPlanningPrompts } from "./planning.ts";

export type PromptModule = (server: McpServer) => void;

const MODULES: PromptModule[] = [registerTrainingPrompts, registerPlanningPrompts];

export function registerAllPrompts(server: McpServer): void {
  for (const registrar of MODULES) registrar(server);
}
