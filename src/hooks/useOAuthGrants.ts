import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Aplicaciones a las que el usuario ha dado acceso por OAuth: los asistentes de
 * IA conectados al servidor MCP.
 *
 * Deliberadamente NO se persiste en disco. `queryPersistence.ts` funciona por
 * lista blanca, así que basta con no añadirla ahí: una lista cacheada de «quién
 * puede entrar en tu cuenta» pintada desde la caché al arrancar sería engañosa
 * justo donde más importa que el dato sea el de ahora mismo.
 */

export type OAuthGrant = {
  client: { id?: string | null; name?: string | null; uri?: string | null };
  scopes: string[];
  granted_at: string;
};

/**
 * El SDK puede ir por delante del GoTrue desplegado en el proyecto. Si el
 * endpoint no existe todavía, se distingue del resto de errores para poder
 * explicarlo en vez de enseñar un fallo genérico.
 */
export class OAuthGrantsUnsupportedError extends Error {
  constructor() {
    super("El servidor de este proyecto todavía no expone la lista de accesos.");
    this.name = "OAuthGrantsUnsupportedError";
  }
}

function esNoSoportado(error: { message?: string; status?: number } | null): boolean {
  if (!error) return false;
  const status = (error as { status?: number }).status;
  if (status === 404) return true;
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("not found") || msg.includes("404");
}

export const oauthGrantsQueryKey = (userId: string | undefined) => ["oauthGrants", userId] as const;

export function useOAuthGrants() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: oauthGrantsQueryKey(user?.id),
    enabled: !!user,
    // Revocar en otro dispositivo debe notarse al abrir esta pantalla.
    staleTime: 30_000,
    queryFn: async (): Promise<OAuthGrant[]> => {
      const { data, error } = await supabase.auth.oauth.listGrants();
      if (error) {
        if (esNoSoportado(error)) throw new OAuthGrantsUnsupportedError();
        throw error;
      }
      return (data ?? []) as OAuthGrant[];
    },
    retry: (fallos, error) => !(error instanceof OAuthGrantsUnsupportedError) && fallos < 2,
  });

  const revoke = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase.auth.oauth.revokeGrant({ clientId });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: oauthGrantsQueryKey(user?.id) });
    },
  });

  return {
    grants: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    unsupported: query.error instanceof OAuthGrantsUnsupportedError,
    revoke,
  };
}
