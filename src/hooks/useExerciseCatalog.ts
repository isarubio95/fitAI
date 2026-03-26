import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ExerciseCatalogFilters = {
  q?: string;
  tipos?: string[];
  grupos?: string[];
  equipments?: string[];
};

export function useExerciseCatalogInfinite(filters?: ExerciseCatalogFilters, pageSize = 30) {
  const { user } = useAuth();
  const q = (filters?.q ?? "").trim();
  const tipos = filters?.tipos?.filter(Boolean) ?? [];
  const grupos = filters?.grupos?.filter(Boolean) ?? [];
  const equipments = filters?.equipments?.filter(Boolean) ?? [];

  return useInfiniteQuery({
    queryKey: ["exerciseCatalogInfinite", q, tipos, grupos, equipments, user?.id, pageSize],
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam }) => {
      const offset = Number(pageParam ?? 0);

      // Catálogo (FitCron/sistema) paginado
      let queryCatalogo = supabase
        .from("tipo_ejercicio")
        .select("*, body_part:musculos_involucrados")
        .order("nombre")
        .range(offset, offset + pageSize - 1);

      if (q) {
        queryCatalogo = queryCatalogo.ilike("nombre", `%${q}%`);
      }
      if (tipos.length) queryCatalogo = queryCatalogo.in("tipo", tipos);
      if (grupos.length) queryCatalogo = queryCatalogo.in("grupo_muscular", grupos);
      if (equipments.length) queryCatalogo = queryCatalogo.in("equipment", equipments);

      // Ejercicios del usuario: normalmente son pocos; los traemos en la primera página
      let queryUsuario = supabase
        .from("usuario_ejercicio")
        .select("*, body_part:musculos_involucrados")
        .order("nombre");

      if (q) {
        queryUsuario = queryUsuario.ilike("nombre", `%${q}%`);
      }
      if (tipos.length) queryUsuario = queryUsuario.in("tipo", tipos);
      if (grupos.length) queryUsuario = queryUsuario.in("grupo_muscular", grupos);
      if (equipments.length) queryUsuario = queryUsuario.in("equipment", equipments);

      const [catRes, usrRes] = await Promise.all([
        queryCatalogo,
        offset === 0 && user ? queryUsuario.eq("usuario_id", user.id) : Promise.resolve({ data: null, error: null } as any),
      ]);

      if (catRes.error) throw catRes.error;
      if (usrRes?.error) throw usrRes.error;

      const catalogo = (catRes.data ?? []).map((x: any) => ({ ...x, __source: "catalogo" as const }));
      const usuario = (usrRes?.data ?? []).map((x: any) => ({ ...x, __source: "usuario" as const }));

      return {
        offset,
        catalogo,
        usuario,
        fetched: catalogo.length,
        hasMore: catalogo.length === pageSize,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.offset + pageSize : undefined),
  });
}

export function useExerciseCatalog(search?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exerciseCatalog", search, user?.id],
    staleTime: 5 * 60 * 1000, // 5 minutos: catálogo cambia poco
    queryFn: async () => {
      // Catálogo (FitCron/sistema)
      let queryCatalogo = supabase
        .from("tipo_ejercicio")
        .select("*, body_part:musculos_involucrados")
        .order("nombre");

      // Ejercicios del usuario (privados)
      let queryUsuario = supabase
        .from("usuario_ejercicio")
        .select("*, body_part:musculos_involucrados")
        .order("nombre");

      if (search) {
        queryCatalogo = queryCatalogo.ilike("nombre", `%${search}%`);
        queryUsuario = queryUsuario.ilike("nombre", `%${search}%`);
      }

      // Importante: usuario_ejercicio tiene RLS, así que sin user devolverá vacío
      const [{ data: catalogo, error: catErr }, { data: usuario, error: usrErr }] =
        await Promise.all([queryCatalogo, user ? queryUsuario.eq("usuario_id", user.id) : queryUsuario]);

      if (catErr) throw catErr;
      if (usrErr) throw usrErr;

      const userId = user?.id;
      const merged = [
        ...(usuario ?? []).map((x) => ({ ...(x as any), __source: "usuario" as const })),
        ...(catalogo ?? []).map((x) => ({ ...(x as any), __source: "catalogo" as const })),
      ];

      // Sort: user exercises first, then system, then alphabetical within each group
      return merged.sort((a, b) => {
        const aIsUser = (a as any).usuario_id === userId ? 0 : 1;
        const bIsUser = (b as any).usuario_id === userId ? 0 : 1;
        if (aIsUser !== bIsUser) return aIsUser - bIsUser;
        return a.nombre.localeCompare(b.nombre);
      });
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nombre,
      descripcion,
      usuario_id,
      musculos_involucrados,
    }: {
      nombre: string;
      descripcion?: string;
      usuario_id: string;
      musculos_involucrados?: string[];
    }) => {
      const { data, error } = await supabase
        .from("usuario_ejercicio")
        .insert({
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || null,
          usuario_id,
          musculos_involucrados:
            musculos_involucrados?.length ? musculos_involucrados : null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exerciseCatalog"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("usuario_ejercicio").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exerciseCatalog"] });
    },
  });
}
