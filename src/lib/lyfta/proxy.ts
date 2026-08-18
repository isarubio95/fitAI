import { supabase } from "@/integrations/supabase/client";
import type { LyftaProxyResource, LyftaWorkoutsPage, LyftaWorkoutSummary } from "@/lib/lyfta/types";

export class LyftaProxyError extends Error {
  constructor(
    message: string,
    readonly lyftaStatus?: number,
  ) {
    super(message);
    this.name = "LyftaProxyError";
  }
}

type ProxyErrorBody = { error?: string; lyftaStatus?: number };

async function readErrorBody(error: unknown, data: unknown): Promise<ProxyErrorBody | null> {
  if (data && typeof data === "object") return data as ProxyErrorBody;
  const ctx =
    error && typeof error === "object" && "context" in error
      ? (error as { context?: { json?: () => Promise<unknown> } }).context
      : undefined;
  if (ctx && typeof ctx.json === "function") {
    try {
      return (await ctx.json()) as ProxyErrorBody;
    } catch {
      return null;
    }
  }
  return null;
}

export async function fetchLyftaResource(input: {
  apiKey: string;
  resource: LyftaProxyResource;
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke("lyfta-proxy", {
    method: "POST",
    body: {
      apiKey: input.apiKey,
      resource: input.resource,
      page: input.page ?? 1,
      limit: input.limit,
      offset: input.offset,
      search: input.search,
    },
  });

  if (error) {
    const payload = await readErrorBody(error, data);
    throw new LyftaProxyError(payload?.error ?? error.message, payload?.lyftaStatus);
  }

  const payload = data as { error?: string; ok?: boolean; data?: unknown; lyftaStatus?: number } | null;
  if (!payload || payload.error) {
    throw new LyftaProxyError(payload?.error ?? "Error al consultar Lyfta", payload?.lyftaStatus);
  }
  return payload.data;
}

export function parseWorkoutsPage(raw: unknown): LyftaWorkoutsPage {
  if (!raw || typeof raw !== "object") return { workouts: [] };
  return raw as LyftaWorkoutsPage;
}

export function parseSummaryPage(raw: unknown): {
  total_pages?: number;
  workouts: LyftaWorkoutSummary[];
} {
  if (!raw || typeof raw !== "object") return { workouts: [] };
  const obj = raw as LyftaWorkoutsPage & { workouts?: LyftaWorkoutSummary[] };
  return {
    total_pages: obj.total_pages,
    workouts: Array.isArray(obj.workouts) ? obj.workouts : [],
  };
}

export type LyftaLibraryExercise = {
  id: string;
  name: string;
};

export function parseLibraryPage(raw: unknown): {
  results: LyftaLibraryExercise[];
  hasMore: boolean;
} {
  if (!raw || typeof raw !== "object") return { results: [], hasMore: false };
  const root = raw as Record<string, unknown>;
  const data = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  const resultsRaw = Array.isArray(data.results) ? data.results : Array.isArray(root.results) ? root.results : [];
  const results: LyftaLibraryExercise[] = [];
  for (const item of resultsRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as { id?: unknown; name?: unknown };
    if (row.id == null || typeof row.name !== "string" || !row.name.trim()) continue;
    results.push({ id: String(row.id), name: row.name.trim() });
  }
  const pagination = (data.pagination && typeof data.pagination === "object" ? data.pagination : null) as {
    hasMore?: boolean;
  } | null;
  const hasMore = pagination?.hasMore === true;
  return { results, hasMore };
}
