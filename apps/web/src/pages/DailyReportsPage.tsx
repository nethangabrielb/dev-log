import { useMemo } from "react";
import { AlertCircle, ClipboardList } from "lucide-react";
import type { DailyReport } from "@/api/daily-reports.api";
import {
  useDailyReports,
  useMarkDailyReportRead,
} from "@/features/daily-reports/hooks/useDailyReports";
import { DailyReportCard } from "@/features/daily-reports/components/DailyReportCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/apiError";

export function DailyReportsPage() {
  const { data: rawReports, isLoading, isError, error } = useDailyReports();
  const { mutate: markRead } = useMarkDailyReportRead();

  const reports = useMemo<DailyReport[]>(() => {
    if (!Array.isArray(rawReports)) return [];
    return [...rawReports].sort((a, b) => b.date.localeCompare(a.date));
  }, [rawReports]);

  const unreadCount = reports.filter((r) => r.isRead !== true).length;

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Reports</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Auto-generated summaries of each day's logging activity
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md border border-border bg-bg-elevated text-text-secondary shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              {unreadCount} unread
            </span>
          )}
        </div>

        {isError && (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                error,
                "Failed to load daily reports. Make sure the backend server is running."
              )}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 border border-border rounded-lg flex items-center justify-between bg-bg-surface"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No daily reports yet"
            description="Reports are generated nightly after your first logged sessions. Check back tomorrow."
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <DailyReportCard
                key={report.date}
                report={report}
                onMarkRead={markRead}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default DailyReportsPage;
