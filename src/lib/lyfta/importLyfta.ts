import { supabase } from "@/integrations/supabase/client";
import { fetchAllPages } from "@/lib/supabaseBatch";
import { DEFAULT_ROUTINE_ICON_KEY } from "@/lib/routineIcons";
import { normalizeExerciseName, type MatchableExercise } from "@/lib/matchExerciseByName";
import { LYFTA_ORIGIN, type LyftaImportScope, type LyftaWorkout } from "@/lib/lyfta/types";
import {
  extractLyftaTemplateList,
  mapLyftaRoutineFromTemplate,
  mapLyftaWorkout,
  remapSupersetKeys,
  type MappedLyftaExercise,
  type MappedLyftaRoutine,
  type MappedLyftaWorkout,
} from "@/lib/lyfta/mapLyftaWorkout";
import { reconstructRoutinesFromWorkouts } from "@/lib/lyfta/reconstructRoutines";
import {
  fetchLyftaResource,
  LyftaProxyError,
  parseLibraryPage,
  parseSummaryPage,
  parseWorkoutsPage,
} from "@/lib/lyfta/proxy";
import { matchLyftaToCatalog, pretokenizeCatalog, type LyftaCatalogEntry } from "@/lib/lyfta/matchLyftaCatalog";
import { normalizeRegistroSeries, serieFieldsForRegistro, type RegistroSeries } from "@/types/workout";
import type { TablesInsert } from "@/integrations/supabase/types";

export type LyftaImportProgress = {
  phase: "fetch" | "match" | "history" | "routines";
  current: number;
  total: number;
  label: string;
};

export type LyftaImportResult = {
  workoutsImported: number;
  workoutsSkipped: number;
  routinesImported: number;
  routinesSkipped: number;
  exercisesOmitted: number;
  customExercises: number;
};

export type UnmatchedLyftaExercise = {
  lyftaId: string;
  nombre: string;
};

export type LyftaExerciseResolution = {
  lyftaId: string;
  tipoEjercicioId: string | null;
  createCustom?: boolean;
};

export type PrepareLyftaImportResult =
  | { status: "done"; result: LyftaImportResult }
  | { status: "needs_review"; unmatched: UnmatchedLyftaExercise[] };

type UsedLyftaMeta = {
  nombre: string;
  registro_series: RegistroSeries;
};

type PreparedLyftaImport = {
  userId: string;
  mappedWorkouts: MappedLyftaWorkout[];
  routines: MappedLyftaRoutine[];
  needHistory: boolean;
  needRoutines: boolean;
  idToTipo: Map<string, string>;
  idToCustom: Map<string, string>;
  used: Map<string, UsedLyftaMeta>;
};

let preparedImport: PreparedLyftaImport | null = null;

export function clearPreparedLyftaImport(): void {
  preparedImport = null;
}

async function loadExistingExternalIds(
  table: "actividad" | "rutina",
  userId: string,
): Promise<Set<string>> {
  const rows = await fetchAllPages<{ origen_externo_id: string | null }>(async (from, to) =>
    supabase
      .from(table)
      .select("origen_externo_id")
      .eq("usuario_id", userId)
      .eq("origen", LYFTA_ORIGIN)
      .not("origen_externo_id", "is", null)
      .range(from, to),
  );
  return new Set(rows.map((r) => r.origen_externo_id).filter((id): id is string => !!id));
}

async function fetchAllLyftaWorkouts(
  apiKey: string,
  onProgress?: (p: LyftaImportProgress) => void,
): Promise<{ workouts: LyftaWorkout[]; durationById: Map<string, string> }> {
  const durationById = new Map<string, string>();
  try {
    let summaryPage = 1;
    let summaryTotal = 1;
    while (summaryPage <= summaryTotal) {
      const raw = await fetchLyftaResource({
        apiKey,
        resource: "workouts_summary",
        page: summaryPage,
        limit: 1000,
      });
      const parsed = parseSummaryPage(raw);
      summaryTotal = Math.max(1, parsed.total_pages ?? 1);
      for (const w of parsed.workouts) {
        if (w.id != null && w.workout_duration) {
          durationById.set(String(w.id), w.workout_duration);
        }
      }
      summaryPage += 1;
    }
  } catch (err) {
    if (!(err instanceof LyftaProxyError && (err.lyftaStatus === 404 || err.lyftaStatus === 405))) {
      throw err;
    }
  }

  const workouts: LyftaWorkout[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    onProgress?.({
      phase: "fetch",
      current: page,
      total: totalPages,
      label: `Descargando entrenos (${page}/${totalPages})…`,
    });
    const raw = await fetchLyftaResource({ apiKey, resource: "workouts", page, limit: 100 });
    const parsed = parseWorkoutsPage(raw);
    totalPages = Math.max(1, parsed.total_pages ?? 1);
    workouts.push(...(parsed.workouts ?? []));
    page += 1;
  }
  return { workouts, durationById };
}

async function tryFetchLyftaTemplates(apiKey: string): Promise<MappedLyftaRoutine[] | null> {
  for (const resource of ["templates", "collections"] as const) {
    try {
      const raw = await fetchLyftaResource({ apiKey, resource, page: 1, limit: 100 });
      const mapped = extractLyftaTemplateList(raw)
        .map(mapLyftaRoutineFromTemplate)
        .filter((r): r is MappedLyftaRoutine => r != null);
      if (mapped.length) return mapped;
    } catch (err) {
      if (err instanceof LyftaProxyError && (err.lyftaStatus === 404 || err.lyftaStatus === 405)) {
        continue;
      }
      throw err;
    }
  }
  return null;
}

async function countLyftaMapRows(): Promise<number> {
  const { count, error } = await supabase
    .from("lyfta_ejercicio_map")
    .select("lyfta_id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function upsertMapRows(
  rows: Array<{ lyfta_id: string; lyfta_nombre: string }>,
): Promise<void> {
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200).map((row) => ({
      lyfta_id: row.lyfta_id,
      lyfta_nombre: row.lyfta_nombre,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("lyfta_ejercicio_map").upsert(chunk, {
      onConflict: "lyfta_id",
      ignoreDuplicates: true,
    });
    if (error) throw error;
  }
}

async function fetchAndCacheLyftaLibrary(
  apiKey: string,
  onProgress?: (p: LyftaImportProgress) => void,
): Promise<void> {
  const existing = await countLyftaMapRows();
  if (existing > 0) return;

  const pageSize = 100;
  let offset = 0;
  let hasMore = true;
  let page = 1;
  while (hasMore) {
    onProgress?.({
      phase: "fetch",
      current: page,
      total: Math.max(page, 1),
      label: `Descargando catálogo Lyfta (${offset}…)…`,
    });
    const raw = await fetchLyftaResource({
      apiKey,
      resource: "exercises_library",
      offset,
      limit: pageSize,
    });
    const parsed = parseLibraryPage(raw);
    if (parsed.results.length) {
      await upsertMapRows(parsed.results.map((r) => ({ lyfta_id: r.id, lyfta_nombre: r.name })));
    }
    hasMore = parsed.hasMore && parsed.results.length > 0;
    offset += parsed.results.length;
    page += 1;
    if (!parsed.results.length) break;
  }
}

async function loadMapTable(): Promise<Map<string, { nombre: string; tipoId: string | null }>> {
  const rows = await fetchAllPages<{
    lyfta_id: string;
    lyfta_nombre: string;
    tipo_ejercicio_id: string | null;
  }>(async (from, to) =>
    supabase.from("lyfta_ejercicio_map").select("lyfta_id, lyfta_nombre, tipo_ejercicio_id").range(from, to),
  );
  return new Map(rows.map((r) => [r.lyfta_id, { nombre: r.lyfta_nombre, tipoId: r.tipo_ejercicio_id }]));
}

async function autoMatchUnmapped(catalog: LyftaCatalogEntry[], onProgress?: (p: LyftaImportProgress) => void): Promise<void> {
  const rows = await fetchAllPages<{ lyfta_id: string; lyfta_nombre: string }>(async (from, to) =>
    supabase
      .from("lyfta_ejercicio_map")
      .select("lyfta_id, lyfta_nombre")
      .is("tipo_ejercicio_id", null)
      .range(from, to),
  );
  if (!rows.length) return;
  const tokenized = pretokenizeCatalog(catalog);
  const updates: Array<{ lyfta_id: string; tipo_ejercicio_id: string; auto_matched: boolean; updated_at: string }> = [];
  for (let i = 0; i < rows.length; i++) {
    if (i % 200 === 0) {
      onProgress?.({
        phase: "match",
        current: i,
        total: rows.length,
        label: `Emparejando catálogo (${i}/${rows.length})…`,
      });
    }
    const match = matchLyftaToCatalog(rows[i].lyfta_nombre, tokenized);
    if (match) {
      updates.push({
        lyfta_id: rows[i].lyfta_id,
        tipo_ejercicio_id: match.id,
        auto_matched: true,
        updated_at: new Date().toISOString(),
      });
    }
  }
  for (let i = 0; i < updates.length; i += 200) {
    const chunk = updates.slice(i, i + 200);
    const { error } = await supabase.from("lyfta_ejercicio_map").upsert(chunk, { onConflict: "lyfta_id" });
    if (error) throw error;
  }
}

export function lyftaExerciseKey(ex: MappedLyftaExercise): string {
  return ex.lyftaExerciseId ?? `name:${normalizeExerciseName(ex.nombre)}`;
}

function collectUsedExercises(
  workouts: MappedLyftaWorkout[],
  routines: MappedLyftaRoutine[],
): Map<string, UsedLyftaMeta> {
  const used = new Map<string, UsedLyftaMeta>();
  const add = (ex: MappedLyftaExercise) => {
    const id = lyftaExerciseKey(ex);
    if (!used.has(id)) {
      used.set(id, { nombre: ex.nombre, registro_series: ex.registro_series });
    }
  };
  for (const w of workouts) for (const ex of w.exercises) add(ex);
  for (const r of routines) for (const ex of r.exercises) add(ex);
  return used;
}

export function filterMappedExercisesForImport(
  exercises: MappedLyftaExercise[],
  idToTipo: Map<string, string>,
  omitted: Set<string>,
  idToCustom: Map<string, string> = new Map(),
): MappedLyftaExercise[] {
  return remapSupersetKeys(exercises).filter((ex) => {
    const id = lyftaExerciseKey(ex);
    if (omitted.has(id)) return false;
    return idToTipo.has(id) || idToCustom.has(id);
  });
}

function mappedExerciseRef(
  id: string,
  idToTipo: Map<string, string>,
  idToCustom: Map<string, string>,
): { tipo_ejercicio_id: string | null; usuario_ejercicio_id: string | null } {
  const tipoId = idToTipo.get(id);
  if (tipoId) return { tipo_ejercicio_id: tipoId, usuario_ejercicio_id: null };
  return { tipo_ejercicio_id: null, usuario_ejercicio_id: idToCustom.get(id) ?? null };
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

async function persistWorkout(
  userId: string,
  mapped: MappedLyftaWorkout,
  idToTipo: Map<string, string>,
  idToCustom: Map<string, string>,
  omitted: Set<string>,
): Promise<"imported" | "skipped"> {
  const exercises = filterMappedExercisesForImport(mapped.exercises, idToTipo, omitted, idToCustom);
  if (!exercises.length) return "skipped";

  const { data: actividad, error: actError } = await supabase
    .from("actividad")
    .insert({
      titulo: mapped.titulo,
      fecha: mapped.fecha,
      fecha_fin: mapped.fechaFin,
      usuario_id: userId,
      es_publica: false,
      icono: DEFAULT_ROUTINE_ICON_KEY,
      origen: LYFTA_ORIGIN,
      origen_externo_id: mapped.origenExternoId,
    })
    .select("id")
    .single();

  if (isUniqueViolation(actError)) return "skipped";
  if (actError) throw actError;
  if (!actividad) throw new Error("No se pudo crear el entrenamiento");

  try {
    const baseCreatedAt = Date.parse(mapped.fecha) || Date.now();
    const { data: ejerciciosDB, error: ejError } = await supabase
      .from("ejercicio")
      .insert(
        exercises.map((ex, i) => {
          const id = lyftaExerciseKey(ex);
          const ref = mappedExerciseRef(id, idToTipo, idToCustom);
          return {
            actividad_id: actividad.id,
            tipo_ejercicio_id: ref.tipo_ejercicio_id,
            usuario_ejercicio_id: ref.usuario_ejercicio_id,
            usuario_id: userId,
            registro_series: ex.registro_series,
            descanso: ex.descanso,
            superset_id: ex.supersetKey,
            created_at: new Date(baseCreatedAt + i).toISOString(),
          };
        }),
      )
      .select("id");
    if (ejError) throw ejError;

    const serieInserts: TablesInsert<"serie">[] = exercises.flatMap((ex, i) => {
      const mode = normalizeRegistroSeries(ex.registro_series);
      return ex.sets.map((s, si) => {
        const dr = serieFieldsForRegistro(mode, {
          repeticiones: s.repeticiones,
          peso_kg: s.peso_kg,
          duracion_seg: s.duracion_seg,
        });
        return {
          ejercicio_id: ejerciciosDB![i].id,
          usuario_id: userId,
          numero_serie: si + 1,
          repeticiones: s.repeticiones,
          peso_kg: s.peso_kg,
          duracion_seg: dr.duracion_seg,
          ritmo_seg_km: dr.ritmo_seg_km,
          rir: s.rir,
          completed: true,
        };
      });
    });

    if (serieInserts.length > 0) {
      const { error: sError } = await supabase.from("serie").insert(serieInserts);
      if (sError) throw sError;
    }
    return "imported";
  } catch (err) {
    const { data: ejs } = await supabase.from("ejercicio").select("id").eq("actividad_id", actividad.id);
    const ejIds = (ejs ?? []).map((e) => e.id);
    if (ejIds.length) {
      await supabase.from("serie").delete().in("ejercicio_id", ejIds);
      await supabase.from("ejercicio").delete().eq("actividad_id", actividad.id);
    }
    await supabase.from("actividad").delete().eq("id", actividad.id);
    throw err;
  }
}

async function persistRoutine(
  userId: string,
  mapped: MappedLyftaRoutine,
  idToTipo: Map<string, string>,
  idToCustom: Map<string, string>,
  omitted: Set<string>,
): Promise<"imported" | "skipped"> {
  const exercises = filterMappedExercisesForImport(mapped.exercises, idToTipo, omitted, idToCustom);
  if (!exercises.length) return "skipped";

  const { data: rutina, error } = await supabase
    .from("rutina")
    .insert({
      nombre: mapped.nombre,
      descripcion: mapped.descripcion || "Importada desde Lyfta",
      usuario_id: userId,
      icono: DEFAULT_ROUTINE_ICON_KEY,
      origen: LYFTA_ORIGIN,
      origen_externo_id: mapped.origenExternoId,
    })
    .select("id")
    .single();

  if (isUniqueViolation(error)) return "skipped";
  if (error) throw error;
  if (!rutina) throw new Error("No se pudo crear la rutina");

  try {
    const inserts: TablesInsert<"rutina_ejercicio">[] = exercises.map((ex, i) => {
      const id = lyftaExerciseKey(ex);
      const ref = mappedExerciseRef(id, idToTipo, idToCustom);
      const reps = ex.sets.map((s) => s.repeticiones).filter((r) => r > 0);
      const rirs = ex.sets.map((s) => s.rir).filter((r): r is number => r != null);
      return {
        rutina_id: rutina.id,
        tipo_ejercicio_id: ref.tipo_ejercicio_id,
        usuario_ejercicio_id: ref.usuario_ejercicio_id,
        series_objetivo: Math.max(1, ex.sets.length),
        repes_min: reps.length ? Math.min(...reps) : 8,
        repes_max: reps.length ? Math.max(...reps) : 12,
        rir: rirs.length ? Math.round(rirs.reduce((a, b) => a + b, 0) / rirs.length) : null,
        orden: i,
        descanso: ex.descanso ?? 90,
        superset_id: ex.supersetKey,
        registro_series: ex.registro_series,
        duracion_objetivo_seg:
          ex.registro_series === "duracion"
            ? Math.round(
                ex.sets.reduce((acc, s) => acc + (s.duracion_seg ?? 0), 0) / Math.max(1, ex.sets.length),
              ) || null
            : null,
        ritmo_objetivo_seg_km: null,
      };
    });

    if (inserts.length) {
      const { error: ejError } = await supabase.from("rutina_ejercicio").insert(inserts);
      if (ejError) throw ejError;
    }
    return "imported";
  } catch (err) {
    await supabase.from("rutina").delete().eq("id", rutina.id);
    throw err;
  }
}

async function persistPrepared(
  prepared: PreparedLyftaImport,
  omitted: Set<string>,
  customExercises: number,
  onProgress?: (p: LyftaImportProgress) => void,
): Promise<LyftaImportResult> {
  const result: LyftaImportResult = {
    workoutsImported: 0,
    workoutsSkipped: 0,
    routinesImported: 0,
    routinesSkipped: 0,
    exercisesOmitted: omitted.size,
    customExercises,
  };

  if (prepared.needHistory) {
    const existing = await loadExistingExternalIds("actividad", prepared.userId);
    const pending = prepared.mappedWorkouts.filter((w) => !existing.has(w.origenExternoId));
    result.workoutsSkipped += prepared.mappedWorkouts.length - pending.length;
    for (let i = 0; i < pending.length; i++) {
      onProgress?.({
        phase: "history",
        current: i + 1,
        total: pending.length,
        label: `Importando entrenos (${i + 1}/${pending.length})…`,
      });
      const status = await persistWorkout(
        prepared.userId,
        pending[i],
        prepared.idToTipo,
        prepared.idToCustom,
        omitted,
      );
      if (status === "imported") result.workoutsImported += 1;
      else result.workoutsSkipped += 1;
    }
  }

  if (prepared.needRoutines) {
    const existing = await loadExistingExternalIds("rutina", prepared.userId);
    const pending = prepared.routines.filter((r) => !existing.has(r.origenExternoId));
    result.routinesSkipped += prepared.routines.length - pending.length;
    for (let i = 0; i < pending.length; i++) {
      onProgress?.({
        phase: "routines",
        current: i + 1,
        total: pending.length,
        label: `Importando rutinas (${i + 1}/${pending.length})…`,
      });
      const status = await persistRoutine(
        prepared.userId,
        pending[i],
        prepared.idToTipo,
        prepared.idToCustom,
        omitted,
      );
      if (status === "imported") result.routinesImported += 1;
      else result.routinesSkipped += 1;
    }
  }

  return result;
}

export async function prepareLyftaImport(opts: {
  userId: string;
  apiKey: string;
  scope: LyftaImportScope;
  catalog: MatchableExercise[];
  onProgress?: (p: LyftaImportProgress) => void;
}): Promise<PrepareLyftaImportResult> {
  const { userId, apiKey, scope, catalog, onProgress } = opts;
  const needHistory = scope === "history" || scope === "both";
  const needRoutines = scope === "routines" || scope === "both";
  const catalogo: LyftaCatalogEntry[] = catalog
    .filter((e) => e.source === "catalogo")
    .map((e) => ({ id: e.id, nombre: e.nombre }));

  await fetchAndCacheLyftaLibrary(apiKey, onProgress);
  await autoMatchUnmapped(catalogo, onProgress);

  let mappedWorkouts: MappedLyftaWorkout[] = [];
  let routinesFromApi: MappedLyftaRoutine[] | null = null;

  if (needRoutines) {
    onProgress?.({
      phase: "fetch",
      current: 0,
      total: 1,
      label: "Buscando rutinas en Lyfta…",
    });
    routinesFromApi = await tryFetchLyftaTemplates(apiKey);
  }

  const needWorkoutFetch = needHistory || (needRoutines && !routinesFromApi?.length);
  if (needWorkoutFetch) {
    const { workouts, durationById } = await fetchAllLyftaWorkouts(apiKey, onProgress);
    mappedWorkouts = workouts
      .map((w) => mapLyftaWorkout(w, durationById))
      .filter((w): w is MappedLyftaWorkout => w != null);
  }

  const routines = routinesFromApi?.length
    ? routinesFromApi
    : needRoutines
      ? reconstructRoutinesFromWorkouts(mappedWorkouts)
      : [];

  const used = collectUsedExercises(mappedWorkouts, routines);
  const extraRows = [...used.entries()].map(([lyfta_id, meta]) => ({
    lyfta_id,
    lyfta_nombre: meta.nombre,
  }));
  if (extraRows.length) await upsertMapRows(extraRows);

  const mapTable = await loadMapTable();
  const tokenized = pretokenizeCatalog(catalogo);
  const unmatchedUpdates: Array<{ lyfta_id: string; tipo_ejercicio_id: string; auto_matched: boolean }> = [];
  for (const [id, meta] of used) {
    const row = mapTable.get(id);
    if (row?.tipoId) continue;
    const match = matchLyftaToCatalog(meta.nombre, tokenized);
    if (match) {
      unmatchedUpdates.push({ lyfta_id: id, tipo_ejercicio_id: match.id, auto_matched: true });
      mapTable.set(id, { nombre: meta.nombre, tipoId: match.id });
    }
  }
  if (unmatchedUpdates.length) {
    const { error } = await supabase.from("lyfta_ejercicio_map").upsert(
      unmatchedUpdates.map((u) => ({ ...u, updated_at: new Date().toISOString() })),
      { onConflict: "lyfta_id" },
    );
    if (error) throw error;
  }

  const customByName = new Map<string, string>();
  for (const e of catalog) {
    if (e.source !== "usuario") continue;
    const key = normalizeExerciseName(e.nombre);
    if (key && !customByName.has(key)) customByName.set(key, e.id);
  }

  const idToTipo = new Map<string, string>();
  const idToCustom = new Map<string, string>();
  const unmatched: UnmatchedLyftaExercise[] = [];
  for (const [id, meta] of used) {
    const tipoId = mapTable.get(id)?.tipoId ?? null;
    if (tipoId) {
      idToTipo.set(id, tipoId);
      continue;
    }
    const existingCustom = customByName.get(normalizeExerciseName(meta.nombre));
    if (existingCustom) {
      idToCustom.set(id, existingCustom);
      continue;
    }
    unmatched.push({ lyftaId: id, nombre: meta.nombre });
  }

  preparedImport = {
    userId,
    mappedWorkouts,
    routines,
    needHistory,
    needRoutines,
    idToTipo,
    idToCustom,
    used,
  };

  if (unmatched.length) {
    return { status: "needs_review", unmatched };
  }

  const result = await persistPrepared(preparedImport, new Set(), 0, onProgress);
  preparedImport = null;
  return { status: "done", result };
}

async function createUsuarioEjercicio(
  userId: string,
  meta: UsedLyftaMeta,
): Promise<string> {
  const { data, error } = await supabase
    .from("usuario_ejercicio")
    .insert({
      nombre: meta.nombre.trim() || "Ejercicio Lyfta",
      descripcion: "Importado de Lyfta",
      usuario_id: userId,
      registro_series: meta.registro_series || "peso_reps",
    })
    .select("id")
    .single();
  if (error) throw error;
  if (!data?.id) throw new Error("No se pudo crear el ejercicio personalizado");
  return data.id;
}

export async function completeLyftaImport(opts: {
  resolutions: LyftaExerciseResolution[];
  onProgress?: (p: LyftaImportProgress) => void;
}): Promise<LyftaImportResult> {
  if (!preparedImport) {
    throw new Error("No hay una importación de Lyfta pendiente de revisar.");
  }

  const omitted = new Set<string>();
  const toSave: Array<{
    lyfta_id: string;
    tipo_ejercicio_id: string;
    auto_matched: boolean;
    updated_at: string;
  }> = [];
  const createdByName = new Map<string, string>();
  let customExercises = 0;

  for (const res of opts.resolutions) {
    if (res.createCustom) {
      const meta = preparedImport.used.get(res.lyftaId) ?? {
        nombre: res.lyftaId,
        registro_series: "peso_reps" as const,
      };
      const nameKey = normalizeExerciseName(meta.nombre);
      const reused = createdByName.get(nameKey);
      if (reused) {
        preparedImport.idToCustom.set(res.lyftaId, reused);
        continue;
      }
      const customId = await createUsuarioEjercicio(preparedImport.userId, meta);
      preparedImport.idToCustom.set(res.lyftaId, customId);
      if (nameKey) createdByName.set(nameKey, customId);
      customExercises += 1;
      continue;
    }
    if (!res.tipoEjercicioId) {
      omitted.add(res.lyftaId);
      continue;
    }
    preparedImport.idToTipo.set(res.lyftaId, res.tipoEjercicioId);
    toSave.push({
      lyfta_id: res.lyftaId,
      tipo_ejercicio_id: res.tipoEjercicioId,
      auto_matched: false,
      updated_at: new Date().toISOString(),
    });
  }
  if (toSave.length) {
    const { error } = await supabase.from("lyfta_ejercicio_map").upsert(toSave, { onConflict: "lyfta_id" });
    if (error) throw error;
  }

  const result = await persistPrepared(preparedImport, omitted, customExercises, opts.onProgress);
  preparedImport = null;
  return result;
}
