/**
 * Dirección del servidor MCP de Track Gym.
 *
 * Se deriva del proyecto Supabase en vez de escribirse a mano: la Edge Function
 * vive siempre en `/functions/v1/mcp` del mismo origen que el resto de la API,
 * así que un cambio de proyecto (o un entorno de pruebas) no deja la URL
 * apuntando al sitio equivocado.
 *
 * La consumen la tarjeta destacada de Inicio y Ajustes → Aplicaciones
 * conectadas; es la misma cadena que el usuario pega en su asistente, y tenerla
 * en un único sitio evita que las dos pantallas enseñen direcciones distintas.
 */
export const MCP_URL = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1/mcp`;
