import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { keys } from "../lib/queryKeys";
import { getApiErrorMessage } from "../lib/apiError";

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
    isAuthenticated: query.isSuccess,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(keys.auth.profile(), undefined);
      queryClient.clear();
      toast.success("Logged out");
      window.location.href = "/";
    },
    onError: (error) => {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 401) {
        queryClient.clear();
        toast.success("Logged out");
        window.location.href = "/";
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to log out"));
    },
  });
}
