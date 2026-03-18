import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserSearchResult = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export function useUserSearch(usernameQuery: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userSearch", usernameQuery, user?.id],
    enabled: !!user && usernameQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UserSearchResult[]> => {
      const q = usernameQuery.trim();

      const { data, error } = await supabase
        .from("perfil")
        .select("id, username, avatar_url")
        .ilike("username", `%${q}%`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data ?? []) as unknown as UserSearchResult[];
    },
  });
}

