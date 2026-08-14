import { useState } from "react";
import { Plus, Clock, AlertCircle } from "lucide-react";
import type { SessionTodo } from "@devlog/types";
import {
  useSessions,
  useDeleteSession,
  useUpdateSession,
} from "../features/sessions/hooks/useSessions";
import {
  SessionCard,
  type SessionData,
} from "../features/sessions/components/SessionCard";
import { ExportSessionsButton } from "../features/sessions/components/ExportSessionsButton";
import { StartSessionDialog } from "../features/sessions/components/StartSessionDialog";
import { useActiveSession } from "../features/sessions/context/ActiveSessionContext";
import { FilterBar, type FilterValues } from "../components/common/FilterBar";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { getApiErrorMessage } from "../lib/apiError";

interface SessionListResponse {
  data?: SessionData[];
  items?: SessionData[];
}

export function SessionsPage() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { activeSession } = useActiveSession();

  const { data: rawSessions, isLoading, isError, error } = useSessions({
    type: filters.type || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  });
  const { mutate: deleteSession } = useDeleteSession();
  const { mutate: updateSession } = useUpdateSession();

  const sessions: SessionData[] = (() => {
    const res = rawSessions as SessionListResponse | null;
    if (Array.isArray(res)) return res as SessionData[];
    if (Array.isArray(res?.data)) return res.data as SessionData[];
    if (Array.isArray(res?.items)) return res.items as SessionData[];
    return [];
  })();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(id);
    }
  };

  const handleToggleTodo = (sessionId: string, todos: SessionTodo[]) => {
    updateSession({ id: sessionId, dto: { todos } });
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sessions Log
            </h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Track your coding, study, and project sessions
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <ExportSessionsButton filters={filters} />
            {!activeSession && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="gap-2 bg-accent text-accent-fg hover:bg-accent-dim"
              >
                <Plus className="h-4 w-4" />
                <span>Start Session</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* API Fetch Error State */}
        {isError && (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                error,
                "Failed to load sessions. Make sure the backend server is running."
              )}
            </span>
          </div>
        )}

        {/* Session List / Skeleton Loaders / Empty State */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Skeleton className="h-6 w-20 rounded" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Skeleton className="h-6 w-14 rounded" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !isError && sessions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No sessions found"
              description="Log your first session or adjust your active filters to view existing entries."
              action={
                !activeSession && (
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="gap-1.5 bg-accent text-accent-fg hover:bg-accent-dim"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Session</span>
                  </Button>
                )
              }
            />
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session._id || session.id}
                session={session}
                onDelete={handleDelete}
                onToggleTodo={handleToggleTodo}
              />
            ))
          )}
        </div>

        {/* Start Session Dialog */}
        <StartSessionDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>
    </ErrorBoundary>
  );
}

export default SessionsPage;
