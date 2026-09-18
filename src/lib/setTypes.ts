/**
 * Los tipos de serie los comparten la app y el servidor MCP: `isWorkingSet` es
 * el criterio que decide qué series cuentan para volumen, XP y progreso, y debe
 * ser el mismo en los dos. Ver `@/lib/exerciseSearch` para el porqué de la
 * ubicación.
 */
export * from "../../supabase/functions/_shared/domain/setTypes.ts";
