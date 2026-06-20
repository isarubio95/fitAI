import { supabase } from "@/integrations/supabase/client";

export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
    body: {},
  });

  if (error) throw error;

  const payload = data as { error?: string; success?: boolean } | null;
  if (payload?.error) {
    throw new Error(payload.error);
  }

  await supabase.auth.signOut();
}
