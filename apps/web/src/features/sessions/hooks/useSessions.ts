import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateSessionDto,
  SessionFilters,
  SessionStatistics,
  SessionType,
} from "@devlog/types";
import { sessionsApi } from "@/api/sessions.api";
import type { Paginated } from "@/api/pagination";
import { keys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SessionData } from "@/features/sessions/components/SessionCard";

export interface SessionStreak {
  type: SessionType;
  currentStreak: number;
  longestStreak: number;
}

type SessionsCacheData =
  | SessionData[]
  | { data?: SessionData[] }
  | { items?: SessionData[] };

function mapSessionsCache(
  data: unknown,
  mutate: (session: SessionData) => SessionData | null
): unknown {
  if (data == null) return data;
  const apply = (list?: SessionData[] | null): SessionData[] | undefined =>
    list
      ?.map(mutate)
      .filter((s): s is SessionData => s !== null);

  if (Array.isArray(data)) return apply(data);

  if (typeof data === "object") {
    const record = data as SessionsCacheData;
    if ("data" in record && Array.isArray(record.data)) {
      return { ...record, data: apply(record.data) };
    }
    if ("items" in record && Array.isArray(record.items)) {
      return { ...record, items: apply(record.items) };
    }
  }
  return data;
}

function applyToSessionsCache(
  qc: ReturnType<typeof useQueryClient>,
  mutate: (session: SessionData) => SessionData | null
) {
  for (const [queryKey, data] of qc.getQueriesData({
    queryKey: ["sessions"],
  })) {
    qc.setQueryData(queryKey, mapSessionsCache(data, mutate));
  }
}

function withOptimisticRollback(
  qc: ReturnType<typeof useQueryClient>,
  mutate: (session: SessionData) => SessionData | null
) {
  const previous = qc.getQueriesData({ queryKey: ["sessions"] });
  applyToSessionsCache(qc, mutate);
  return { previous };
}

export function useSessions(filters?: SessionFilters) {
  return useQuery<Paginated<SessionData>>({
    queryKey: keys.sessions.all(filters),
    queryFn: () => sessionsApi.findAll(filters),
  });
}

export function useSessionStats() {
  return useQuery<SessionStatistics>({
    queryKey: keys.sessions.stats(),
    queryFn: sessionsApi.getStats,
  });
}

export function useSessionStreaks() {
  return useQuery<SessionStreak[]>({
    queryKey: keys.sessions.streaks(),
    queryFn: sessionsApi.getStreaks,
  });
}

function refetchSessionsDependents(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["sessions"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["projects"] });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      refetchSessionsDependents(qc);
      toast.success("Session created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create session"));
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.remove,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["sessions"] });
      const context = withOptimisticRollback(qc, (session) =>
        session._id === id || session.id === id ? null : session
      );
      return context;
    },
    onSuccess: () => {
      toast.success("Session deleted");
    },
    onError: (error, _vars, context) => {
      toast.error(getApiErrorMessage(error, "Failed to delete session"));
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      refetchSessionsDependents(qc);
    },
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateSessionDto>;
    }) => sessionsApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: ["sessions"] });
      const context = withOptimisticRollback(qc, (session) => {
        const sessionId = session._id || session.id;
        if (sessionId !== id) return session;
        return { ...session, ...dto } as SessionData;
      });
      return context;
    },
    onSuccess: () => {
      toast.success("Session updated");
    },
    onError: (error, _vars, context) => {
      toast.error(getApiErrorMessage(error, "Failed to update session"));
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      refetchSessionsDependents(qc);
    },
  });
}
