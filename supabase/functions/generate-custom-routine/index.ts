import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type GenerateRoutinePayload = {
  userId?: string;
  age: number;
  sex: "hombre" | "mujer" | "otro";
  heightCm: number;
  weightKg: number;
  trainingDaysPerWeek: number;
  sessionDurationMinutes: number;
  selectedDays: number[];
  targetSport?: string;
  goal: "fuerza" | "hipertrofia" | "perdida_grasa" | "resistencia" | "salud_general";
  level: "principiante" | "intermedio" | "avanzado";
  availableEquipment?: string;
  injuriesOrLimits?: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function upstreamError(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function parsePayload(raw: unknown): GenerateRoutinePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const selectedDays = Array.isArray(body.selectedDays) ? body.selectedDays : [];

  const payload: GenerateRoutinePayload = {
    userId: typeof body.userId === "string" ? body.userId.trim() : undefined,
    age: Number(body.age),
    sex: body.sex as GenerateRoutinePayload["sex"],
    heightCm: Number(body.heightCm),
    weightKg: Number(body.weightKg),
    trainingDaysPerWeek: Number(body.trainingDaysPerWeek),
    sessionDurationMinutes: Number(body.sessionDurationMinutes),
    selectedDays: selectedDays.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
    targetSport: typeof body.targetSport === "string" ? body.targetSport.trim() : undefined,
    goal: body.goal as GenerateRoutinePayload["goal"],
    level: body.level as GenerateRoutinePayload["level"],
    availableEquipment: typeof body.availableEquipment === "string" ? body.availableEquipment.trim() : undefined,
    injuriesOrLimits: typeof body.injuriesOrLimits === "string" ? body.injuriesOrLimits.trim() : undefined,
  };

  const validSex = ["hombre", "mujer", "otro"].includes(payload.sex);
  const validGoal = ["fuerza", "hipertrofia", "perdida_grasa", "resistencia", "salud_general"].includes(payload.goal);
  const validLevel = ["principiante", "intermedio", "avanzado"].includes(payload.level);
  const validUserId =
    payload.userId === undefined ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.userId);

  if (
    !Number.isFinite(payload.age) || payload.age < 14 || payload.age > 90 ||
    !validSex ||
    !validUserId ||
    !Number.isFinite(payload.heightCm) || payload.heightCm < 120 || payload.heightCm > 230 ||
    !Number.isFinite(payload.weightKg) || payload.weightKg < 35 || payload.weightKg > 250 ||
    !Number.isFinite(payload.trainingDaysPerWeek) || payload.trainingDaysPerWeek < 1 || payload.trainingDaysPerWeek > 7 ||
    !Number.isFinite(payload.sessionDurationMinutes) || payload.sessionDurationMinutes < 20 || payload.sessionDurationMinutes > 180 ||
    payload.selectedDays.length < 1 ||
    !validGoal ||
    !validLevel
  ) {
    return null;
  }

  return payload;
}

function buildPrompt(data: GenerateRoutinePayload) {
  const weekdays = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const selectedDayNames = data.selectedDays.map((d) => weekdays[d]).join(", ");

  return `
Eres un entrenador personal experto en entrenamiento de fuerza y acondicionamiento.
Debes responder SOLO un JSON valido sin markdown.

Datos del usuario:
- edad: ${data.age}
- sexo: ${data.sex}
- altura_cm: ${data.heightCm}
- peso_kg: ${data.weightKg}
- dias_por_semana_objetivo: ${data.trainingDaysPerWeek} (frecuencia deseada; puede no coincidir con cuantos dias concretos marca el usuario)
- minutos_por_sesion: ${data.sessionDurationMinutes}
- dias_concretos_entreno: ${selectedDayNames} (solo estos dias de la semana deben aparecer en weeklyStructure)
- deporte_a_mejorar: ${data.targetSport || "ninguno"}
- objetivo_principal: ${data.goal}
- nivel: ${data.level}
- equipamiento: ${data.availableEquipment || "no especificado"}
- lesiones_limitaciones: ${data.injuriesOrLimits || "ninguna"}

Devuelve este JSON exacto:
{
  "summary": "string corto",
  "roadmap": [
    { "week": 1, "goal": "string", "intensity": "suave|media|alta", "notes": "string" }
  ],
  "weeklyStructure": [
    {
      "dayOfWeek": 1,
      "routineTitle": "string",
      "focus": "string",
      "durationMinutes": 60,
      "notes": "string",
      "exercises": [
        { "name": "string", "sets": 3, "reps": "8-12", "restSeconds": 90, "rir": 2 }
      ]
    }
  ],
  "recommendations": ["string", "string"]
}

Reglas:
- weeklyStructure debe tener exactamente ${data.selectedDays.length} elemento(s), uno por cada dia concreto indicado.
- Cada dayOfWeek debe ser uno de estos valores: ${JSON.stringify(data.selectedDays)}.
- Si dias_por_semana_objetivo es mayor que la cantidad de dias concretos, explica en summary o recommendations como repartir volumen (puede ser mas de una sesion el mismo dia o rotacion en roadmap).
- durationMinutes no debe superar ${data.sessionDurationMinutes}.
- Enfoca seguridad y progresion.
- Si hay lesiones, adapta ejercicios y mencionalo en notes.
`.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return badRequest("Body JSON invalido");
  }

  const payload = parsePayload(rawBody);
  if (!payload) {
    return badRequest("Datos del formulario invalidos");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let userId = payload.userId ?? "";
  if (!userId && authHeader) {
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    const { data: userData } = await supabaseAuth.auth.getUser();
    if (userData?.user?.id) {
      userId = userData.user.id;
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  const { data: premiumProfile, error: premiumError } = await supabaseAdmin
    .from("perfil")
    .select("es_premium")
    .eq("id", userId)
    .maybeSingle();

  if (premiumError) {
    return new Response(JSON.stringify({ error: premiumError.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!premiumProfile?.es_premium) {
    return new Response(JSON.stringify({ error: "Premium requerido" }), {
      status: 403,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const prompt = buildPrompt(payload);

  const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `Responde solo JSON valido.\n\n${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    try {
      const parsed = JSON.parse(errText) as {
        error?: {
          code?: number;
          status?: string;
          message?: string;
          details?: Array<{
            "@type"?: string;
            reason?: string;
            metadata?: Record<string, string>;
          }>;
        };
      };
      const reason = parsed.error?.details?.find((d) => d?.reason)?.reason;
      if (reason === "API_KEY_SERVICE_BLOCKED") {
        return upstreamError(502, {
          error: "Gemini API bloqueada para esta clave",
          code: "GEMINI_API_KEY_SERVICE_BLOCKED",
          hint:
            "Tu API key no tiene permitido llamar a generativelanguage.googleapis.com. Activa la API 'Generative Language API' y revisa restricciones de la key en Google Cloud.",
          detail: parsed.error?.message ?? errText,
        });
      }
      return upstreamError(502, {
        error: "Fallo Gemini",
        code: "GEMINI_UPSTREAM_ERROR",
        detail: parsed.error?.message ?? errText,
        upstreamStatus: parsed.error?.status ?? null,
      });
    } catch {
      return upstreamError(502, { error: "Fallo Gemini", code: "GEMINI_UPSTREAM_ERROR", detail: errText });
    }
  }

  const aiJson = await aiResponse.json();
  const content = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== "string") {
    return new Response(JSON.stringify({ error: "Respuesta IA vacia" }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let parsedPlan: Record<string, unknown>;
  try {
    parsedPlan = JSON.parse(content);
  } catch {
    return new Response(JSON.stringify({ error: "Gemini no devolvio JSON valido", raw: content }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  await supabaseAdmin.from("plan_generado_ia").insert({
    usuario_id: userId,
    prompt,
    respuesta: parsedPlan,
  });

  return new Response(
    JSON.stringify({
      roadmap: parsedPlan.roadmap ?? [],
      weeklyStructure: parsedPlan.weeklyStructure ?? [],
      recommendations: parsedPlan.recommendations ?? [],
      summary: parsedPlan.summary ?? "",
      generatedAt: new Date().toISOString(),
    }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
