import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type TrainingDay = {
  day: number;
  durationMinutes: number;
};

type GenerateRoutinePayload = {
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

function parsePayload(raw: unknown): GenerateRoutinePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const selectedDays = Array.isArray(body.selectedDays) ? body.selectedDays : [];

  const payload: GenerateRoutinePayload = {
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

  if (
    !Number.isFinite(payload.age) || payload.age < 14 || payload.age > 90 ||
    !validSex ||
    !Number.isFinite(payload.heightCm) || payload.heightCm < 120 || payload.heightCm > 230 ||
    !Number.isFinite(payload.weightKg) || payload.weightKg < 35 || payload.weightKg > 250 ||
    !Number.isFinite(payload.trainingDaysPerWeek) || payload.trainingDaysPerWeek < 1 || payload.trainingDaysPerWeek > 7 ||
    !Number.isFinite(payload.sessionDurationMinutes) || payload.sessionDurationMinutes < 20 || payload.sessionDurationMinutes > 180 ||
    payload.selectedDays.length === 0 ||
    payload.selectedDays.length !== payload.trainingDaysPerWeek ||
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
- dias_por_semana: ${data.trainingDaysPerWeek}
- minutos_por_sesion: ${data.sessionDurationMinutes}
- dias_preferidos: ${selectedDayNames}
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
- Usa exactamente ${data.trainingDaysPerWeek} elementos en weeklyStructure.
- dayOfWeek debe coincidir con los dias preferidos.
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
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const jwt = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;
  const { data: premiumProfile, error: premiumError } = await supabase
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

  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "Responde solo JSON valido." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    return new Response(JSON.stringify({ error: "Fallo OpenAI", detail: errText }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const aiJson = await aiResponse.json();
  const content = aiJson?.choices?.[0]?.message?.content;
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
    return new Response(JSON.stringify({ error: "La IA no devolvio JSON valido", raw: content }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  await supabase.from("plan_generado_ia").insert({
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
