import type { Page, Request, Route } from "@playwright/test";
import {
  E2E_CARDIO_DISCIPLINE_ID,
  E2E_CARDIO_SESSION_ID,
  E2E_CARDIO_TRACK_ID,
  E2E_EXERCISE_ID,
  E2E_SERIE_ID,
  E2E_TIPO_EJERCICIO_ID,
  E2E_USER_EMAIL,
  E2E_USER_ID,
  E2E_WORKOUT_ID,
} from "./ids";
import { buildAuthSession } from "./auth";

export type CapturedMutation = {
  method: string;
  table: string;
  body: unknown;
  url: string;
};

export type SupabaseMockState = {
  mutations: CapturedMutation[];
  actividad: Record<string, unknown> | null;
  ejercicios: Record<string, unknown>[];
  series: Record<string, unknown>[];
  cardioSesion: Record<string, unknown> | null;
  lastCardioTrack: Record<string, unknown> | null;
  lastCardioTrackPoints: unknown[] | null;
};

function json(route: Route, status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return route.fulfill({
    status,
    contentType: "application/json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "Content-Range, Prefer",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

function tableFromUrl(url: string): string {
  const path = new URL(url).pathname;
  const marker = "/rest/v1/";
  const idx = path.indexOf(marker);
  if (idx < 0) return "";
  return path.slice(idx + marker.length).split("/")[0] ?? "";
}

async function parseBody(request: Request): Promise<unknown> {
  try {
    return request.postDataJSON();
  } catch {
    return null;
  }
}

function asArray(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body == null) return [];
  return [body];
}

function firstRow(body: unknown): Record<string, unknown> {
  const rows = asArray(body);
  return (rows[0] as Record<string, unknown>) ?? {};
}

export async function installSupabaseMock(page: Page): Promise<SupabaseMockState> {
  const state: SupabaseMockState = {
    mutations: [],
    actividad: null,
    ejercicios: [],
    series: [],
    cardioSesion: null,
    lastCardioTrack: null,
    lastCardioTrackPoints: null,
  };

  // Evita que el service worker de la PWA intercepte fetch en E2E
  await page.addInitScript(() => {
    void navigator.serviceWorker?.getRegistrations?.().then((regs) => {
      for (const r of regs) void r.unregister();
    });
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        animation-duration: 0s !important;
        transition: none !important;
        transition-duration: 0s !important;
      }
      [data-pill-circle], [data-circle-center], [transition-style], [data-open-from-pill] {
        clip-path: none !important;
        -webkit-clip-path: none !important;
        transform: none !important;
      }
    `;
    const mount = () => document.documentElement?.appendChild(style);
    if (document.documentElement) mount();
    else document.addEventListener("DOMContentLoaded", mount, { once: true });
  });

  await page.route("**/*vercel*", (route) => route.abort());
  await page.route("**/va.vercel-scripts/**", (route) => route.abort());
  await page.route("**/_vercel/**", (route) => route.abort());

  await page.route("**/auth/v1/**", async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (method === "OPTIONS") {
      return json(route, 200, {});
    }

    if (url.includes("/token") && method === "POST") {
      return json(route, 200, buildAuthSession());
    }

    if (url.includes("/user") && method === "GET") {
      return json(route, 200, buildAuthSession().user);
    }

    if (url.includes("/logout") && method === "POST") {
      return json(route, 204, {});
    }

    return json(route, 200, buildAuthSession());
  });

  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();
    const table = tableFromUrl(url);
    const prefer = request.headers()["prefer"] ?? "";
    const returnRep = prefer.includes("return=representation");

    if (method === "OPTIONS") {
      return json(route, 200, {});
    }

    if (method === "GET") {
      return handleGet(route, table, url, state);
    }

    const body = await parseBody(request);
    state.mutations.push({ method, table, body, url });

    if (method === "POST") {
      return handlePost(route, table, body, returnRep, state);
    }

    if (method === "PATCH" || method === "PUT") {
      return handlePatch(route, table, body, returnRep, state, url);
    }

    if (method === "DELETE") {
      return json(route, 204, null);
    }

    return json(route, 200, []);
  });

  // MapLibre tiles/worker + stub del chunk del mapa (WebGL rompe headless)
  await page.route("**/tiles.openfreemap.org/**", (route) => route.abort());
  await page.route("**/*openfreemap*/**", (route) => route.abort());
  await page.route("**/maplibre-gl-worker*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "/* e2e stub worker */",
    }),
  );
  await page.route(
    (url) => url.pathname.includes("LiveCardioMap"),
    async (route) => {
      const url = route.request().url();
      if (url.includes(".css")) {
        return route.fulfill({ status: 200, contentType: "text/css", body: "/* stub */" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/javascript",
        headers: { "Cache-Control": "no-store" },
        body: "export function LiveCardioMap(){ return null; }\n",
      });
    },
  );

  return state;
}

async function handleGet(route: Route, table: string, url: string, state: SupabaseMockState) {
  switch (table) {
    case "perfil":
      return json(route, 200, {
        id: E2E_USER_ID,
        username: "e2e_user",
        es_premium: false,
        xp: 0,
        nivel: 1,
        racha_actual: 0,
        mejor_racha: 0,
      });

    case "tipo_ejercicio":
      return json(
        route,
        200,
        [
          {
            id: E2E_TIPO_EJERCICIO_ID,
            nombre: "Press banca",
            grupo_muscular: "Pecho",
            tipo: "fuerza",
            equipment: "barra",
            registro_series: "peso_reps",
            musculos_involucrados: ["Pecho"],
            body_part: ["Pecho"],
            activo: true,
          },
        ],
        { "Content-Range": "0-0/1" },
      );

    case "usuario_ejercicio":
      return json(route, 200, []);

    case "cardio_disciplina":
      // Solo interior en E2E browser: MapLibre/WebGL tumba Chromium headless.
      // El muestreo GPS se cubre en Vitest (useCardioGpsRecorder.test.ts).
      return json(route, 200, [
        {
          id: E2E_CARDIO_DISCIPLINE_ID,
          nombre: "Cinta",
          codigo: "treadmill",
          activo: true,
          orden: 1,
        },
      ]);

    case "actividad": {
      if (url.includes("fecha_fin=is.null")) {
        if (state.actividad && state.actividad.fecha_fin == null) {
          return json(route, 200, [state.actividad]);
        }
        return json(route, 200, []);
      }
      if (url.includes(`id=eq.${E2E_WORKOUT_ID}`) || url.includes("id=eq.")) {
        const idMatch = url.match(/id=eq\.([0-9a-f-]+)/i);
        const id = idMatch?.[1];
        if (state.actividad && (!id || state.actividad.id === id)) {
          return json(route, 200, state.actividad);
        }
      }
      return json(route, 200, []);
    }

    case "ejercicio": {
      if (!state.actividad || state.ejercicios.length === 0) return json(route, 200, []);
      const withJoins = state.ejercicios.map((ej) => ({
        ...ej,
        tipo_ejercicio: {
          id: E2E_TIPO_EJERCICIO_ID,
          nombre: "Press banca",
          registro_series: "peso_reps",
          grupo_muscular: "Pecho",
        },
        usuario_ejercicio: null,
      }));
      return json(route, 200, withJoins);
    }

    case "serie":
      return json(route, 200, state.series);

    case "cardio_sesion": {
      if (url.includes("fecha_fin=is.null")) {
        if (state.cardioSesion && state.cardioSesion.fecha_fin == null) {
          return json(route, 200, [
            {
              ...state.cardioSesion,
              cardio_disciplina: {
                id: E2E_CARDIO_DISCIPLINE_ID,
                nombre: "Cinta",
                codigo: "treadmill",
              },
              cardio_bloque: [],
              cardio_sesion_running: [],
              cardio_sesion_cycling: [],
              cardio_track: [],
            },
          ]);
        }
        return json(route, 200, []);
      }
      // Detalle por id (.single / .maybeSingle) → objeto
      if (url.includes("id=eq.") && state.cardioSesion) {
        return json(route, 200, {
          ...state.cardioSesion,
          cardio_disciplina: {
            id: E2E_CARDIO_DISCIPLINE_ID,
            nombre: "Cinta",
            codigo: "treadmill",
          },
          cardio_bloque: [],
          cardio_sesion_running: [],
          cardio_sesion_cycling: [],
          cardio_track: [],
        });
      }
      // Listados (mes, historial, etc.) → siempre array
      return json(route, 200, []);
    }

    case "notificacion":
    case "seguimiento":
    case "logro":
    case "usuario_logro":
    case "medida":
    case "rutina":
    case "plan_rutina":
    case "cardio_rutina":
      return json(route, 200, []);

    default:
      return json(route, 200, []);
  }
}

async function handlePost(
  route: Route,
  table: string,
  body: unknown,
  returnRep: boolean,
  state: SupabaseMockState,
) {
  const row = firstRow(body);

  switch (table) {
    case "actividad": {
      state.actividad = {
        id: E2E_WORKOUT_ID,
        usuario_id: E2E_USER_ID,
        titulo: row.titulo ?? "Entrenamiento",
        fecha: row.fecha ?? new Date().toISOString(),
        fecha_fin: row.fecha_fin ?? null,
        es_publica: row.es_publica ?? false,
        icono: row.icono ?? "dumbbell",
        comentarios: row.comentarios ?? null,
      };
      return json(route, 201, returnRep ? state.actividad : null);
    }

    case "ejercicio": {
      const created = {
        id: `${E2E_EXERCISE_ID}-${state.ejercicios.length}`,
        ...row,
        actividad_id: row.actividad_id ?? E2E_WORKOUT_ID,
        usuario_id: E2E_USER_ID,
        tipo_ejercicio_id: row.tipo_ejercicio_id ?? E2E_TIPO_EJERCICIO_ID,
        registro_series: row.registro_series ?? "peso_reps",
      };
      state.ejercicios.push(created);
      return json(route, 201, returnRep ? created : null);
    }

    case "serie": {
      const created = {
        id: `${E2E_SERIE_ID}-${state.series.length}`,
        ...row,
        ejercicio_id: row.ejercicio_id ?? state.ejercicios[0]?.id ?? E2E_EXERCISE_ID,
        usuario_id: E2E_USER_ID,
        numero_serie: row.numero_serie ?? state.series.length + 1,
        repeticiones: row.repeticiones ?? 0,
        peso_kg: row.peso_kg ?? 0,
        completed: row.completed ?? false,
      };
      state.series.push(created);
      return json(route, 201, returnRep ? created : null);
    }

    case "cardio_sesion": {
      state.cardioSesion = {
        id: E2E_CARDIO_SESSION_ID,
        usuario_id: E2E_USER_ID,
        titulo: row.titulo ?? "Cardio",
        fecha_inicio: row.fecha_inicio ?? new Date().toISOString(),
        fecha_fin: row.fecha_fin ?? null,
        es_publica: row.es_publica ?? false,
        comentarios: row.comentarios ?? null,
        cardio_disciplina_id: row.cardio_disciplina_id ?? E2E_CARDIO_DISCIPLINE_ID,
      };
      return json(route, 201, returnRep ? { id: E2E_CARDIO_SESSION_ID } : null);
    }

    case "cardio_bloque":
      return json(route, 201, returnRep ? asArray(body).map((b, i) => ({ id: `bloque-${i}`, ...(b as object) })) : null);

    case "cardio_track": {
      state.lastCardioTrack = {
        id: E2E_CARDIO_TRACK_ID,
        ...row,
        cardio_sesion_id: row.cardio_sesion_id ?? E2E_CARDIO_SESSION_ID,
      };
      return json(route, 201, returnRep ? state.lastCardioTrack : null);
    }

    case "cardio_track_point": {
      state.lastCardioTrackPoints = asArray(body);
      return json(route, 201, returnRep ? state.lastCardioTrackPoints : null);
    }

    case "cardio_sesion_running":
    case "cardio_sesion_cycling":
      return json(route, 201, returnRep ? { id: `${table}-1`, ...row } : null);

    default:
      return json(route, 201, returnRep ? { id: `${table}-1`, ...row } : null);
  }
}

async function handlePatch(
  route: Route,
  table: string,
  body: unknown,
  returnRep: boolean,
  state: SupabaseMockState,
  url: string,
) {
  const row = firstRow(body);

  if (table === "actividad" && state.actividad) {
    state.actividad = { ...state.actividad, ...row };
    return json(route, 200, returnRep ? state.actividad : null);
  }

  if (table === "cardio_sesion") {
    if (!state.cardioSesion) {
      state.cardioSesion = {
        id: E2E_CARDIO_SESSION_ID,
        usuario_id: E2E_USER_ID,
        titulo: "Cardio",
        fecha_inicio: new Date().toISOString(),
        cardio_disciplina_id: E2E_CARDIO_DISCIPLINE_ID,
      };
    }
    state.cardioSesion = { ...state.cardioSesion, ...row };
    return json(route, 200, returnRep ? state.cardioSesion : null);
  }

  if (table === "serie" || table === "ejercicio" || table === "perfil") {
    return json(route, 200, returnRep ? { ...row, id: url.match(/id=eq\.([0-9a-f-]+)/i)?.[1] } : null);
  }

  return json(route, 200, returnRep ? row : null);
}

export function findMutation(
  state: SupabaseMockState,
  table: string,
  predicate: (m: CapturedMutation) => boolean = () => true,
) {
  return state.mutations.filter((m) => m.table === table && predicate(m));
}

export function mutationHasFechaFin(body: unknown): boolean {
  const row = firstRow(body);
  return typeof row.fecha_fin === "string" && row.fecha_fin.length > 0;
}

export { E2E_USER_EMAIL };
