import { useState } from "react";
import { Plus, Clock, AlertCircle } from "lucide-react";
import { useSessions, useDeleteSession } from "../features/sessions/hooks/useSessions";
import { SessionCard } from "../features/sessions/components/SessionCard";
import { SessionFormSheet } from "../features/sessions/components/SessionForm";
import { FilterBar, type FilterValues } from "../components/common/FilterBar";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

export function SessionsPage() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: rawSessions, isLoading, isError, error } = useSessions(filters);
  const { mutate: deleteSession } = useDeleteSession();

  const sessions = Array.isArray(rawSessions)
    ? rawSessions
    : Array.isArray((rawSessions as any)?.data)
    ? (rawSessions as any).data
    : Array.isArray((rawSessions as any)?.items)
    ? (rawSessions as any).items
    : [];

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(id);
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="p-6 space-y-6 min-h-screen"
        style={{
          backgroundColor: "var(--devlog-bg-base)",
          color: "var(--devlog-text-primary)",
        }}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--devlog-text-primary)" }}
            >
              Sessions Log
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--devlog-text-secondary)" }}
            >
              Track your coding, study, and project sessions
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="font-medium cursor-pointer border-0 shadow-none gap-2"
            style={{
              backgroundColor: "var(--devlog-accent)",
              color: "var(--devlog-accent-fg)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--devlog-accent-dim)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--devlog-accent)")
            }
          >
            <Plus className="h-4 w-4" />
            <span>New Session</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* API Fetch Error State */}
        {isError && (
          <div
            className="p-4 rounded-lg border flex items-center gap-3 my-4 text-sm"
            style={{
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              borderColor: "var(--devlog-danger)",
              color: "var(--devlog-danger)",
            }}
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {(error as any)?.response?.data?.message ||
                "Failed to load sessions. Make sure the backend server is running."}
            </span>
          </div>
        )}

        {/* Session List / Skeleton Loaders / Empty State */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg flex items-center justify-between"
                style={{
                  backgroundColor: "var(--devlog-bg-surface)",
                  borderColor: "var(--devlog-border)",
                }}
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
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="font-medium cursor-pointer border-0 shadow-none text-xs gap-1.5"
                  style={{
                    backgroundColor: "var(--devlog-accent)",
                    color: "var(--devlog-accent-fg)",
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Session</span>
                </Button>
              }
            />
          ) : (
            sessions.map((session: any) => (
              <SessionCard
                key={session._id || session.id}
                session={session}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Session Form Sheet Modal */}
        <SessionFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>
    </ErrorBoundary>
  );
}

export default SessionsPage;
