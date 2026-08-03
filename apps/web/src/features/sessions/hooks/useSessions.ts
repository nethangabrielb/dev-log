import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/api/sessions.api";
import { keys } from "@/lib/queryKeys";

export function useSessions(filters?: Record<string, any>) {
  return useQuery({
    queryKey: keys.sessions.all(filters),
    queryFn: () => sessionsApi.findAll(filters),
  });
}

export function useSessionStats() {
  return useQuery({
    queryKey: keys.sessions.stats(),
    queryFn: sessionsApi.getStats,
  });
}

export function useSessionStreaks() {
  return useQuery({
    queryKey: keys.sessions.streaks(),
    queryFn: sessionsApi.getStreaks,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
