import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchAllPages } from "@/lib/supabaseBatch";
import type { GimnasioCatalogItem, SelectedGimnasio } from "@/types/gimnasio";

export const GIMNASIOS_QUERY_KEY = ["gimnasios"] as const;

const CATALOG_SELECT = "id, nombre, lat, lng, direccion, ciudad, brand, source";

export async function fetchLastGimnasioForUser(userId: string): Promise<SelectedGimnasio | null> {
  const { data, error } = await supabase
    .from("actividad")
    .select("gimnasio_id, gimnasio_nombre")
    .eq("usuario_id", userId)
    .not("gimnasio_id", "is", null)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.gimnasio_id || !data.gimnasio_nombre) return null;
  return { id: data.gimnasio_id, nombre: data.gimnasio_nombre };
}

export async function fetchDefaultGimnasioForUser(userId: string): Promise<SelectedGimnasio | null> {
  const { data, error } = await supabase
    .from("perfil")
    .select("gimnasio_id, gimnasio_nombre")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.gimnasio_id || !data.gimnasio_nombre) return null;
  return { id: data.gimnasio_id, nombre: data.gimnasio_nombre };
}

/** Prefill de un entreno nuevo: default de Ajustes, si no el último usado. */
export async function fetchPrefillGimnasioForUser(userId: string): Promise<SelectedGimnasio | null> {
  const defaultGym = await fetchDefaultGimnasioForUser(userId).catch(() => null);
  if (defaultGym) return defaultGym;
  return fetchLastGimnasioForUser(userId).catch(() => null);
}

export function useGimnasiosCatalog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...GIMNASIOS_QUERY_KEY, "catalog"],
    enabled: !!user,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async (): Promise<GimnasioCatalogItem[]> => {
      return fetchAllPages<GimnasioCatalogItem>((from, to) =>
        supabase
          .from("gimnasio")
          .select(CATALOG_SELECT)
          .order("nombre", { ascending: true })
          .range(from, to),
      );
    },
  });
}

export function useLastGimnasio() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...GIMNASIOS_QUERY_KEY, "last", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SelectedGimnasio | null> => {
      return fetchLastGimnasioForUser(user!.id);
    },
  });
}

export function useDefaultGimnasio() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...GIMNASIOS_QUERY_KEY, "default", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SelectedGimnasio | null> => {
      return fetchDefaultGimnasioForUser(user!.id);
    },
  });
}

type CreateGimnasioInput = {
  nombre: string;
  lat: number;
  lng: number;
  direccion?: string | null;
  ciudad?: string | null;
};

export function useCreateGimnasio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGimnasioInput): Promise<GimnasioCatalogItem> => {
      if (!user) throw new Error("Debes iniciar sesión");
      const nombre = input.nombre.trim();
      if (!nombre) throw new Error("El nombre es obligatorio");

      const { data, error } = await supabase
        .from("gimnasio")
        .insert({
          nombre,
          lat: input.lat,
          lng: input.lng,
          direccion: input.direccion?.trim() || null,
          ciudad: input.ciudad?.trim() || null,
          source: "user",
          created_by: user.id,
        })
        .select(CATALOG_SELECT)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GIMNASIOS_QUERY_KEY });
    },
  });
}

export async function persistActividadGimnasio(
  actividadId: string,
  gym: SelectedGimnasio | null,
): Promise<void> {
  const { error } = await supabase
    .from("actividad")
    .update({
      gimnasio_id: gym?.id ?? null,
      gimnasio_nombre: gym?.nombre ?? null,
    })
    .eq("id", actividadId);
  if (error) throw error;
}

export async function persistDefaultGimnasio(
  userId: string,
  gym: SelectedGimnasio | null,
): Promise<void> {
  const { error } = await supabase
    .from("perfil")
    .update({
      gimnasio_id: gym?.id ?? null,
      gimnasio_nombre: gym?.nombre ?? null,
    })
    .eq("id", userId);
  if (error) throw error;
}
