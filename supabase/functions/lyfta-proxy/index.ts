import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LYFTA_BASE = "https://my.lyfta.app";

const RESOURCE_PATHS = {
  workouts: "/api/v1/workouts",
  workouts_summary: "/api/v1/workouts/summary",
  templates: "/api/v1/templates",
  collections: "/api/v1/collections",
  exercises_library: "/api/v1/exercises/library",
} as const;

type LyftaResource = keyof typeof RESOURCE_PATHS;

const SUMMARY_MAX_LIMIT = 1000;
const DEFAULT_MAX_LIMIT = 100;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function parseLimit(resource: LyftaResource, raw: unknown): number {
  const max = resource === "workouts_summary" ? SUMMARY_MAX_LIMIT : DEFAULT_MAX_LIMIT;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 1) return Math.min(max, resource === "workouts_summary" ? 1000 : 100);
  return Math.min(max, Math.floor(n));
}

function parsePage(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function parseOffset(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonResponse(500, { error: "Server misconfigured" });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !userData?.user?.id) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON" });
  }

  const apiKey = typeof payload.apiKey === "string" ? payload.apiKey.trim() : "";
  if (!apiKey || apiKey.length > 512 || /[\r\n]/.test(apiKey)) {
    return jsonResponse(400, { error: "API key inválida" });
  }

  const resource = payload.resource as LyftaResource;
  if (!(resource in RESOURCE_PATHS)) {
    return jsonResponse(400, { error: "Recurso no permitido" });
  }

  const path = RESOURCE_PATHS[resource];
  const limit = parseLimit(resource, payload.limit);
  const url = new URL(path, LYFTA_BASE);
  if (resource === "exercises_library") {
    url.searchParams.set("offset", String(parseOffset(payload.offset)));
    url.searchParams.set("limit", String(limit));
    if (typeof payload.search === "string" && payload.search.trim()) {
      url.searchParams.set("search", payload.search.trim());
    }
  } else {
    url.searchParams.set("page", String(parsePage(payload.page)));
    url.searchParams.set("limit", String(limit));
  }

  let lyftaRes: Response;
  try {
    lyftaRes = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
  } catch {
    return jsonResponse(502, { error: "No se pudo contactar con Lyfta" });
  }

  const text = await lyftaRes.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!lyftaRes.ok) {
    const message =
      data && typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `Lyfta respondió ${lyftaRes.status}`;
    return jsonResponse(lyftaRes.status === 401 || lyftaRes.status === 403 ? 401 : 502, {
      error: message,
      lyftaStatus: lyftaRes.status,
    });
  }

  return jsonResponse(200, { ok: true, data });
});
