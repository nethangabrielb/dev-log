import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { keys } from "../lib/queryKeys";

export function useAuth() {
  const query = useQuery({
    queryKey: keys.auth.profile(),
    queryFn: authApi.profile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
  };
}
