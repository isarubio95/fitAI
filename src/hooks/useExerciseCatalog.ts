import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import type { RegistroSeries } from "@/types/workout";

export type ExerciseCatalogFilters = {
  q?: string;
  tipos?: string[];
  grupos?: string[];
  equipments?: string[];
  /**
   * `nombre` (por defecto) busca solo en el nombre.
   * `amplio` busca además en material y grupo muscular ("mancuernas", "pecho").
   */
  searchScope?: "nombre" | "amplio";
};

type TipoEjercicioRow = Tables<"tipo_ejercicio"> & {
  body_part?: string[] | null;
};

type UsuarioEjercicioRow = Tables<"usuario_ejercicio"> & {
  body_part?: string[] | null;
};

type CatalogItem = TipoEjercicioRow & { __source: "catalogo" };
type UserItem = UsuarioEjercicioRow & { __source: "usuario" };
export type ExerciseCatalogItem = CatalogItem | UserItem;

const EMPTY_USUARIO_RESULT: { data: null; error: null } = { data: null, error: null };

const CATALOG_STALE_MS = 30 * 60 * 1000;

/** Listados/lookup: sin gif, imagen ni instrucciones (payload grande). */
// `equipment_list` es la columna con el vocabulario canónico de equipo; el
// string `equipment` se deriva de ella y se mantiene solo para mostrarlo.
// El filtro tiene que ir contra la lista: partir el string por comas no
// permite casar átomos ni en cliente ni en servidor.
const SHARED_LIST_COLUMNS =
  "id, nombre, registro_series, tipo, grupo_muscular, dificultad, equipment, equipment_list, musculos_involucrados, body_part:musculos_involucrados";
// `nombre_en` (el nombre original en inglés, para que el buscador encuentre
// "bench press" → "Press de Banca") existe solo en el catálogo del sistema:
// los ejercicios de `usuario_ejercicio` los teclea el propio usuario.
const TIPO_LIST_COLUMNS = `${SHARED_LIST_COLUMNS}, nombre_en`;
const USUARIO_LIST_COLUMNS = `${SHARED_LIST_COLUMNS}, usuario_id, descripcion`;

/** Selector / página de ejercicios: thumbs, sin instructions. */
const TIPO_THUMB_COLUMNS = `${TIPO_LIST_COLUMNS}, gif_url, imagen`;
const USUARIO_THUMB_COLUMNS = `${USUARIO_LIST_COLUMNS}, gif_url, imagen`;

function invalidateExerciseCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["exerciseCatalog"] });
  queryClient.invalidateQueries({ queryKey: ["exerciseCatalogInfinite"] });
  queryClient.invalidateQueries({ queryKey: ["exerciseCatalogAll"] });
}

/** PostgREST corta en `max-rows` (1000 por defecto en Supabase): hay que encadenar rangos. */
const CATALOG_FETCH_CHUNK = 1000;

async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += CATALOG_FETCH_CHUNK) {
    const { data, error } = await page(from, from + CATALOG_FETCH_CHUNK - 1);
    if (error) throw error;
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < CATALOG_FETCH_CHUNK) return rows;
  }
}

/**
 * Catálogo completo (sistema + ejercicios del usuario) en una sola query cacheada.
 *
 * La página de Biblioteca busca y filtra en cliente, así que necesita el conjunto
 * entero: mientras se paginaba en servidor, el buscador y los filtros de equipo y
 * dificultad solo miraban las filas ya descargadas, y las listas de opciones de los
 * filtros salían incompletas.
 */
export function useExerciseCatalogAll() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exerciseCatalogAll", user?.id],
    staleTime: CATALOG_STALE_MS,
    gcTime: CATALOG_STALE_MS * 2,
    queryFn: async (): Promise<ExerciseCatalogItem[]> => {
      const [catalogo, usuario] = await Promise.all([
        fetchAllRows<TipoEjercicioRow>((from, to) =>
          supabase.from("tipo_ejercicio").select(TIPO_THUMB_COLUMNS).order("nombre").range(from, to),
        ),
        user
          ? fetchAllRows<UsuarioEjercicioRow>((from, to) =>
              supabase
                .from("usuario_ejercicio")
                .select(USUARIO_THUMB_COLUMNS)
                .eq("usuario_id", user.id)
                .order("nombre")
                .range(from, to),
            )
          : Promise.resolve([] as UsuarioEjercicioRow[]),
      ]);

      return [
        ...usuario.map((x): UserItem => ({ ...x, __source: "usuario" as const })),
        ...catalogo.map((x): CatalogItem => ({ ...x, __source: "catalogo" as const })),
      ];
    },
  });
}

export async function fetchExerciseCatalogDetail(
  id: string,
  source: "catalogo" | "usuario",
): Promise<ExerciseCatalogItem> {
  if (source === "usuario") {
    const { data, error } = await supabase
      .from("usuario_ejercicio")
      .select("*, body_part:musculos_involucrados")
      .eq("id", id)
      .single();
    if (error) throw error;
    return { ...(data as UsuarioEjercicioRow), __source: "usuario" };
  }
  const { data, error } = await supabase
    .from("tipo_ejercicio")
    .select("*, body_part:musculos_involucrados")
    .eq("id", id)
    .single();
  if (error) throw error;
  return { ...(data as TipoEjercicioRow), __source: "catalogo" };
}

/** Trae las filas del catálogo (con thumb) para claves `catalogo:id` / `usuario:id`. */
async function fetchExercisesByKeys(keys: string[]): Promise<ExerciseCatalogItem[]> {
  const catalogIds: string[] = [];
  const usuarioIds: string[] = [];

  for (const key of keys) {
    const sep = key.indexOf(":");
    if (sep === -1) continue;
    const source = key.slice(0, sep);
    const id = key.slice(sep + 1);
    if (!id) continue;
    if (source === "catalogo") catalogIds.push(id);
    else if (source === "usuario") usuarioIds.push(id);
  }

  const [catRes, usrRes] = await Promise.all([
    catalogIds.length
      ? supabase.from("tipo_ejercicio").select(TIPO_THUMB_COLUMNS).in("id", catalogIds)
      : Promise.resolve({ data: [] as TipoEjercicioRow[], error: null }),
    usuarioIds.length
      ? supabase.from("usuario_ejercicio").select(USUARIO_THUMB_COLUMNS).in("id", usuarioIds)
      : Promise.resolve({ data: [] as UsuarioEjercicioRow[], error: null }),
  ]);

  if (catRes.error) throw catRes.error;
  if (usrRes.error) throw usrRes.error;

  return [
    ...((usrRes.data ?? []) as UsuarioEjercicioRow[]).map(
      (x): UserItem => ({ ...x, __source: "usuario" as const }),
    ),
    ...((catRes.data ?? []) as TipoEjercicioRow[]).map(
      (x): CatalogItem => ({ ...x, __source: "catalogo" as const }),
    ),
  ];
}

export function useFavoriteExercisesCatalog(favoriteKeys: Set<string>, enabled: boolean) {
  const sortedKeys = [...favoriteKeys].sort();

  return useQuery({
    queryKey: ["exerciseFavoritesCatalog", sortedKeys],
    enabled: enabled && sortedKeys.length > 0,
    staleTime: CATALOG_STALE_MS,
    queryFn: () => fetchExercisesByKeys(sortedKeys),
  });
}

/**
 * Ejercicios concretos por clave (`catalogo:id` / `usuario:id`), al margen de la
 * paginación del catálogo. Lo usa el selector para poder poner arriba "los más
 * usados" aunque estén en la página 12 del catálogo.
 */
export function useExercisesByKeys(keys: string[], enabled: boolean) {
  const sortedKeys = [...new Set(keys)].sort();

  return useQuery({
    queryKey: ["exercisesByKeys", sortedKeys],
    enabled: enabled && sortedKeys.length > 0,
    staleTime: CATALOG_STALE_MS,
    queryFn: () => fetchExercisesByKeys(sortedKeys),
  });
}

/** PostgREST usa `,` y `()` como separadores en `or(...)`: fuera del término. */
function sanitizeOrTerm(value: string) {
  return value.replace(/[,()]/g, " ").replace(/\s+/g, " ").trim();
}

export function useExerciseCatalogInfinite(filters?: ExerciseCatalogFilters, pageSize = 30) {
  const { user } = useAuth();
  const q = (filters?.q ?? "").trim();
  const tipos = filters?.tipos?.filter(Boolean) ?? [];
  const grupos = filters?.grupos?.filter(Boolean) ?? [];
  const equipments = filters?.equipments?.filter(Boolean) ?? [];
  const searchScope = filters?.searchScope ?? "nombre";
  const broadTerm = searchScope === "amplio" ? sanitizeOrTerm(q) : "";
  const searchOr = broadTerm
    ? `nombre.ilike.%${broadTerm}%,equipment.ilike.%${broadTerm}%,grupo_muscular.ilike.%${broadTerm}%`
    : "";

  return useInfiniteQuery({
    queryKey: ["exerciseCatalogInfinite", q, tipos, grupos, equipments, searchScope, user?.id, pageSize],
    initialPageParam: 0,
    staleTime: CATALOG_STALE_MS,
    queryFn: async ({ pageParam }) => {
      const offset = Number(pageParam ?? 0);

      // Catálogo (FitCron/sistema) paginado
      let queryCatalogo = supabase
        .from("tipo_ejercicio")
        .select(TIPO_THUMB_COLUMNS)
        .order("nombre")
        .range(offset, offset + pageSize - 1);

      if (q) {
        queryCatalogo = searchOr
          ? queryCatalogo.or(searchOr)
          : queryCatalogo.ilike("nombre", `%${q}%`);
      }
      if (tipos.length) queryCatalogo = queryCatalogo.in("tipo", tipos);
      if (grupos.length) queryCatalogo = queryCatalogo.in("grupo_muscular", grupos);
      if (equipments.length) queryCatalogo = queryCatalogo.in("equipment", equipments);

      // Ejercicios del usuario: normalmente son pocos; los traemos en la primera página
      let queryUsuario = supabase
        .from("usuario_ejercicio")
        .select(USUARIO_THUMB_COLUMNS)
        .order("nombre");

      if (q) {
        queryUsuario = searchOr
          ? queryUsuario.or(searchOr)
          : queryUsuario.ilike("nombre", `%${q}%`);
      }
      if (tipos.length) queryUsuario = queryUsuario.in("tipo", tipos);
      if (grupos.length) queryUsuario = queryUsuario.in("grupo_muscular", grupos);
      if (equipments.length) queryUsuario = queryUsuario.in("equipment", equipments);

      const [catRes, usrRes] = await Promise.all([
        queryCatalogo,
        offset === 0 && user ? queryUsuario.eq("usuario_id", user.id) : Promise.resolve(EMPTY_USUARIO_RESULT),
      ]);

      if (catRes.error) throw catRes.error;
      if (usrRes?.error) throw usrRes.error;

      const catalogo: CatalogItem[] = ((catRes.data ?? []) as TipoEjercicioRow[]).map((x) => ({
        ...x,
        __source: "catalogo" as const,
      }));
      const usuario: UserItem[] = ((usrRes?.data ?? []) as UsuarioEjercicioRow[]).map((x) => ({
        ...x,
        __source: "usuario" as const,
      }));

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
    staleTime: CATALOG_STALE_MS,
    queryFn: async (): Promise<ExerciseCatalogItem[]> => {
      // Catálogo (FitCron/sistema)
      let queryCatalogo = supabase
        .from("tipo_ejercicio")
        .select(TIPO_LIST_COLUMNS)
        .order("nombre");

      // Ejercicios del usuario (privados)
      let queryUsuario = supabase
        .from("usuario_ejercicio")
        .select(USUARIO_LIST_COLUMNS)
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
      const merged: ExerciseCatalogItem[] = [
        ...((usuario ?? []) as UsuarioEjercicioRow[]).map(
          (x): UserItem => ({ ...x, __source: "usuario" as const }),
        ),
        ...((catalogo ?? []) as TipoEjercicioRow[]).map(
          (x): CatalogItem => ({ ...x, __source: "catalogo" as const }),
        ),
      ];

      // Sort: user exercises first, then system, then alphabetical within each group
      return merged.sort((a, b) => {
        const aIsUser = a.__source === "usuario" && "usuario_id" in a && a.usuario_id === userId ? 0 : 1;
        const bIsUser = b.__source === "usuario" && "usuario_id" in b && b.usuario_id === userId ? 0 : 1;
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
      registro_series,
    }: {
      nombre: string;
      descripcion?: string;
      usuario_id: string;
      musculos_involucrados?: string[];
      registro_series?: RegistroSeries;
    }) => {
      const payload: TablesInsert<"usuario_ejercicio"> = {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        usuario_id,
        musculos_involucrados:
          musculos_involucrados?.length ? musculos_involucrados : null,
        registro_series: registro_series ?? "peso_reps",
      };
      const { data, error } = await supabase
        .from("usuario_ejercicio")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateExerciseCatalog(queryClient);
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
      invalidateExerciseCatalog(queryClient);
    },
  });
}
