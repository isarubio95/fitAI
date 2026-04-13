import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function usePremium() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["premium-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { isPremium: false };
      const { data, error } = await supabase
        .from("perfil")
        .select("es_premium")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return { isPremium: !!data?.es_premium };
    },
  });
}
