import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
    isAuthenticated: !!query.data,
  };
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to log out"));
    },
  });
}
