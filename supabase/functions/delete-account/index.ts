import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PROFILE_AVATAR_BUCKET = "profile-avatars";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
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

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
  const userId = userData?.user?.id;

  if (userError || !userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: profile } = await supabaseAdmin
    .from("perfil")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const { error: deleteDataError } = await supabaseAdmin.rpc("delete_user_data", {
    p_user_id: userId,
  });

  if (deleteDataError) {
    return new Response(JSON.stringify({ error: deleteDataError.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const avatarPath = profile?.avatar_url?.trim();
  if (avatarPath && !/^(https?:|blob:|data:)/i.test(avatarPath)) {
    const storagePath = avatarPath.startsWith(`${PROFILE_AVATAR_BUCKET}/`)
      ? avatarPath.slice(PROFILE_AVATAR_BUCKET.length + 1)
      : avatarPath;

    await supabaseAdmin.storage.from(PROFILE_AVATAR_BUCKET).remove([storagePath]);
  }

  const { data: folderFiles } = await supabaseAdmin.storage.from(PROFILE_AVATAR_BUCKET).list(userId);
  if (folderFiles?.length) {
    const paths = folderFiles.map((file) => `${userId}/${file.name}`);
    await supabaseAdmin.storage.from(PROFILE_AVATAR_BUCKET).remove(paths);
  }

  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    return new Response(JSON.stringify({ error: deleteAuthError.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
