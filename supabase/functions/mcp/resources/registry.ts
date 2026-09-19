/**
 * Registro de resources: contexto que el modelo lee una vez en lugar de
 * deducirlo a base de llamadas.
 *
 * La diferencia con una herramienta es que aquí no se pregunta nada: son las
 * reglas del dominio —qué grupos musculares existen, qué serie cuenta como
 * trabajo, cómo se registra cada ejercicio—, y sin ellas el modelo se las
 * inventa. Un `search_exercises` con `muscle_group:'piernas'` no falla, devuelve
 * cero resultados y parece que no hay ejercicios de pierna.
 *
 * Tampoco gastan presupuesto de contexto por turno, igual que los prompts: el
 * cliente los pide cuando los necesita.
 *
 * Todo el contenido va en inglés y en JSON compacto, como las descripciones de
 * las herramientas y sus respuestas: el destinatario es el modelo, no el
 * usuario. Las claves llevan la unidad en el nombre y nada viene formateado.
 */

import type { McpServer } from "@modelcontextprotocol/server";

import type { Supabase } from "../tools/registry.ts";
import { registerCatalogResources } from "./catalog.ts";
import { registerConventionResources } from "./conventions.ts";

export type ResourceModule = (server: McpServer, supabase: Supabase) => void;

const MODULES: ResourceModule[] = [registerCatalogResources, registerConventionResources];

export function registerAllResources(server: McpServer, supabase: Supabase): void {
  for (const registrar of MODULES) registrar(server, supabase);
}
