import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type ProfileSetupRow = {
  username: string | null;
};

export function profileHasUsername(row: ProfileSetupRow | null | undefined): boolean {
  return Boolean(row?.username?.trim());
}

export function useProfileSetup() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profileSetup", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ProfileSetupRow | null> => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    retry: 1,
  });
}
