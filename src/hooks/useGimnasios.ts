import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { GimnasioBBox, GeoPoint, RankedGimnasio } from "@/lib/gimnasioSearch";
import type { GimnasioCatalogItem, SelectedGimnasio } from "@/types/gimnasio";

export const GIMNASIOS_QUERY_KEY = ["gimnasios"] as const;
export const GIMNASIO_SEARCH_LIMIT = 50;
export const GIMNASIO_MAP_LIMIT = 2000;

const CATALOG_SELECT = "id, nombre, lat, lng, direccion, ciudad, brand, source, tipo";

export type FetchGimnasiosSearchParams = {
  query?: string;
  origin?: GeoPoint | null;
  bbox?: GimnasioBBox | null;
  pinnedIds?: Array<string | null | undefined>;
  limit?: number;
};

function roundCoord(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function uniquePinnedIds(ids: FetchGimnasiosSearchParams["pinnedIds"]): string[] {
  return [...new Set((ids ?? []).filter((id): id is string => Boolean(id)))];
}

export function gimnasiosSearchQueryKey(params: FetchGimnasiosSearchParams) {
  const origin = params.origin;
  const bbox = params.bbox;
  return [
    ...GIMNASIOS_QUERY_KEY,
    "search",
    {
      q: params.query?.trim() ?? "",
      lat: origin ? roundCoord(origin.lat, 3) : null,
      lng: origin ? roundCoord(origin.lng, 3) : null,
      bbox: bbox
        ? {
            minLat: roundCoord(bbox.minLat, 3),
            maxLat: roundCoord(bbox.maxLat, 3),
            minLng: roundCoord(bbox.minLng, 3),
            maxLng: roundCoord(bbox.maxLng, 3),
          }
        : null,
      pinned: uniquePinnedIds(params.pinnedIds).sort(),
      limit: params.limit ?? GIMNASIO_SEARCH_LIMIT,
    },
  ] as const;
}

export async function fetchGimnasiosSearch(
  params: FetchGimnasiosSearchParams = {},
): Promise<RankedGimnasio[]> {
  const pinned = uniquePinnedIds(params.pinnedIds);
  const { data, error } = await supabase.rpc("search_gimnasios", {
    p_query: params.query?.trim() ?? "",
    p_lat: params.origin?.lat ?? null,
    p_lng: params.origin?.lng ?? null,
    p_min_lat: params.bbox?.minLat ?? null,
    p_max_lat: params.bbox?.maxLat ?? null,
    p_min_lng: params.bbox?.minLng ?? null,
    p_max_lng: params.bbox?.maxLng ?? null,
    p_pinned_ids: pinned,
    p_limit: params.limit ?? GIMNASIO_SEARCH_LIMIT,
  });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    lat: row.lat,
    lng: row.lng,
    direccion: row.direccion,
    ciudad: row.ciudad,
    brand: row.brand,
    source: row.source,
    tipo: row.tipo,
    distanceKm: row.distance_km,
  }));
}

export function useGimnasiosSearch(
  params: FetchGimnasiosSearchParams & {
    enabled?: boolean;
    debounceMs?: number;
  } = {},
) {
  const { user } = useAuth();
  const rawQuery = params.query ?? "";
  const delayMs = rawQuery.trim() ? (params.debounceMs ?? 250) : 0;
  const debouncedQuery = useDebouncedValue(rawQuery, delayMs);
  const searchParams: FetchGimnasiosSearchParams = {
    query: debouncedQuery,
    origin: params.origin,
    bbox: params.bbox,
    pinnedIds: params.pinnedIds,
    limit: params.limit,
  };

  return useQuery({
    queryKey: gimnasiosSearchQueryKey(searchParams),
    enabled: (params.enabled ?? true) && !!user,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: () => fetchGimnasiosSearch(searchParams),
  });
}

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
