import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, Flame, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { useSessionStats } from "@/features/sessions/hooks/useSessions";
import { useDsaStats } from "@/features/dsa/hooks/useDsaStats";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboard";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDuration, SESSION_TYPE_COLOR } from "@/lib/formatters";
import { SessionType } from "@devlog/types";

export function DashboardPage() {
  const {
    data: sessionStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useSessionStats();
  const {
    isLoading: isDsaLoading,
    isError: isDsaError,
    error: dsaError,
    refetch: refetchDsa,
  } = useDsaStats();
  const {
    data: dashboardStats,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardStats();

  // Combine query loading states without full page spinner
  const isLoading = isStatsLoading || isDsaLoading || isDashboardLoading;

  const isError = isStatsError || isDsaError || isDashboardError;
  const error = statsError ?? dsaError ?? dashboardError;
  const retry = () => {
    refetchStats();
    refetchDsa();
    refetchDashboard();
  };

  // Weekly data comes from the dashboard aggregate endpoint (week-aware)
  const weeklyBreakdown = dashboardStats?.weeklyBreakdown || [];
  const weeklyTotalSeconds = weeklyBreakdown.reduce(
    (sum, item) => sum + item.totalDuration,
    0
  );

  // Prepare chart data for time by SessionType this week
  const chartData = Object.values(SessionType).map((type) => {
    const found = weeklyBreakdown.find((item) => item.type === type);
    const durationInSeconds = found?.totalDuration || 0;
    return {
      type,
      durationInSeconds,
      formatted: formatDuration(durationInSeconds),
      hours: +(durationInSeconds / 3600).toFixed(1),
    };
  });

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Overview of your activity, productivity, and developer stats
        </p>
      </div>

      {/* API Fetch Error State */}
      {isError && (
        <div className="p-6 rounded-xl border border-destructive/40 bg-destructive/10 flex flex-col items-center justify-center text-center gap-3 my-4">
          <AlertCircle
            className="h-8 w-8 shrink-0"
            style={{ color: "var(--devlog-danger)" }}
          />
          <div className="text-sm text-muted-foreground max-w-md">
            {getApiErrorMessage(
              error,
              "Failed to load dashboard data. Make sure the backend server is running."
            )}
          </div>
          <Button
            onClick={retry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : !isError ? (
          <>
            <StatCard
              label="Total Time This Week"
              value={formatDuration(weeklyTotalSeconds)}
              sublabel="Duration logged so far this week"
              icon={Clock}
            />
            <StatCard
              label="Current Streak"
              value={`${sessionStats?.currentStreak || 0} days`}
              sublabel="Active logging streak"
              icon={Flame}
            />
            <StatCard
              label="Total Sessions"
              value={sessionStats?.totalSessions || 0}
              sublabel="Sessions recorded to date"
              icon={Activity}
            />
          </>
        ) : null}
      </div>

      {/* Time by SessionType Bar Chart */}
      <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Time Spent by Session Type
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of logged time across category types this week
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-end gap-4 pt-8 px-4">
            <Skeleton className="h-2/3 flex-1 rounded-t" />
            <Skeleton className="h-full flex-1 rounded-t" />
            <Skeleton className="h-1/2 flex-1 rounded-t" />
            <Skeleton className="h-3/4 flex-1 rounded-t" />
            <Skeleton className="h-1/3 flex-1 rounded-t" />
          </div>
        ) : !isError ? (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="type"
                  stroke="var(--devlog-text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--devlog-border)" }}
                />
                <YAxis
                  stroke="var(--devlog-text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--devlog-border)" }}
                  unit="h"
                />
                <Tooltip
                  cursor={{ fill: "var(--devlog-bg-hover)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const color =
                        SESSION_TYPE_COLOR[data.type as SessionType] ||
                        "var(--devlog-accent)";
                      return (
                        <div className="p-3 rounded-lg border border-border bg-bg-elevated text-foreground text-xs shadow-lg space-y-1">
                          <p className="font-semibold">{data.type}</p>
                          <p style={{ color }}>
                            Duration: {data.formatted} ({data.hours} hrs)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.type}
                      fill={
                        SESSION_TYPE_COLOR[entry.type as SessionType] ||
                        "var(--devlog-accent)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardPage;
