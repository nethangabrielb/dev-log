import { useState } from "react";
import { Plus, Clock, AlertCircle } from "lucide-react";
import { useSessions, useDeleteSession } from "../features/sessions/hooks/useSessions";
import {
  SessionCard,
  type SessionData,
} from "../features/sessions/components/SessionCard";
import { StartSessionDialog } from "../features/sessions/components/StartSessionDialog";
import { ActiveTimerCard } from "../features/sessions/components/ActiveTimerCard";
import { useActiveSession } from "../features/sessions/context/ActiveSessionContext";
import { FilterBar, type FilterValues } from "../components/common/FilterBar";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
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

        {/* Active Session Timer / Filter Bar */}
        {activeSession ? (
          <ActiveTimerCard />
        ) : (
          <FilterBar filters={filters} onChange={setFilters} />
        )}

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
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 border border-border rounded-lg flex items-center justify-between bg-bg-surface"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
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
