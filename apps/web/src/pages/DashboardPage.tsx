import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, Flame, Activity, AlertCircle, RefreshCw, Timer } from "lucide-react";
import {
  useSessions,
  useSessionStats,
  useSessionActivity,
  useDeleteSession,
  useUpdateSession,
} from "@/features/sessions/hooks/useSessions";
import { useDsaStats } from "@/features/dsa/hooks/useDsaStats";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboard";
import { CopyStandupButton } from "@/features/sessions/components/CopyStandupButton";
import { ContributionHeatmap } from "@/components/common/ContributionHeatmap";
import {
  SessionCard,
  type SessionData,
} from "@/features/sessions/components/SessionCard";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDuration, SESSION_TYPE_COLOR } from "@/lib/formatters";
import { SessionType, type SessionTodo } from "@devlog/types";

export function DashboardPage() {
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
    }).format(new Date());
  }, []);

  const {
    data: todaySessionsData,
    isLoading: isTodaySessionsLoading,
    isError: isTodaySessionsError,
    error: todaySessionsError,
    refetch: refetchTodaySessions,
  } = useSessions({
    startDate: todayStr,
    endDate: todayStr,
    limit: 100,
  });

  const { mutate: deleteSession } = useDeleteSession();
  const { mutate: updateSession } = useUpdateSession();

  const todaySessions = (todaySessionsData?.data || []) as SessionData[];

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

  const {
    data: activityData,
    isLoading: isActivityLoading,
    isError: isActivityError,
    error: activityError,
    refetch: refetchActivity,
  } = useSessionActivity(365);

  const isLoading =
    isStatsLoading ||
    isDsaLoading ||
    isDashboardLoading ||
    isTodaySessionsLoading ||
    isActivityLoading;

  const isError =
    isStatsError ||
    isDsaError ||
    isDashboardError ||
    isTodaySessionsError ||
    isActivityError;
  const error =
    statsError ??
    dsaError ??
    dashboardError ??
    todaySessionsError ??
    activityError;
  const retry = () => {
    refetchStats();
    refetchDsa();
    refetchDashboard();
    refetchTodaySessions();
    refetchActivity();
  };

  // Today's duration & session count from dashboard endpoint
  const todaysDuration = dashboardStats?.todaysSessions?.totalDuration || 0;
  const todaysCount = dashboardStats?.todaysSessions?.totalSessions || 0;

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

  const handleDelete = (id: string) => {
    deleteSession(id);
  };

  const handleToggleTodo = (sessionId: string, todos: SessionTodo[]) => {
    updateSession({ id: sessionId, dto: { todos } });
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground w-full max-w-full min-w-0">
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

      {/* 1. Top 4 Stat Cards (KPI Numbers First) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
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
              label="Time Logged Today"
              value={formatDuration(todaysDuration)}
              sublabel={`${todaysCount} session${todaysCount === 1 ? "" : "s"} recorded today`}
              icon={Timer}
            />
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

      {/* 2. Middle Section: Two-Column Split (Equal Height Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Today's Activity & Standup Section */}
        <div className="lg:col-span-7 p-6 border border-border rounded-xl space-y-4 bg-bg-surface flex flex-col h-full">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Today&apos;s Sessions
              </h3>
              <p className="text-xs text-muted-foreground">
                {todaySessions.length === 0
                  ? "No sessions recorded today yet"
                  : `${todaySessions.length} session${todaySessions.length === 1 ? "" : "s"} recorded today (${formatDuration(todaysDuration)})`}
              </p>
            </div>
            <CopyStandupButton
              sessions={todaySessions}
              isLoading={isTodaySessionsLoading}
            />
          </div>

          {isTodaySessionsLoading ? (
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Card key={idx}>
                  <CardContent className="space-y-2 py-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-24 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg border-border-subtle">
              <Clock
                className="h-8 w-8 mx-auto mb-2 opacity-40"
                style={{ color: "var(--devlog-text-muted)" }}
              />
              <p className="text-sm font-medium text-muted-foreground">
                No sessions recorded today
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start a timer on the Sessions page to track your work
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {todaySessions.map((session) => (
                <SessionCard
                  key={session._id || session.id}
                  session={session}
                  onDelete={handleDelete}
                  onToggleTodo={handleToggleTodo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Time by SessionType Bar Chart */}
        <div className="lg:col-span-5 p-6 border border-border rounded-xl space-y-4 bg-bg-surface flex flex-col h-full">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Time Spent by Session Type
            </h3>
            <p className="text-xs text-muted-foreground">
              Distribution of logged time across category types this week
            </p>
          </div>

          {isLoading ? (
            <div className="flex-1 min-h-[260px] flex items-end gap-4 pt-8 px-4">
              <Skeleton className="h-2/3 flex-1 rounded-t" />
              <Skeleton className="h-full flex-1 rounded-t" />
              <Skeleton className="h-1/2 flex-1 rounded-t" />
              <Skeleton className="h-3/4 flex-1 rounded-t" />
              <Skeleton className="h-1/3 flex-1 rounded-t" />
            </div>
          ) : !isError ? (
            <div className="flex-1 min-h-[260px] w-full pt-4">
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

      {/* 3. Bottom Section: 365-Day GitHub-Style Activity Heatmap */}
      {!isError && (
        <ContributionHeatmap
          data={activityData}
          loading={isActivityLoading}
          title="Activity Calendar"
          subtitle="Daily focus time recorded over the past 365 days"
        />
      )}
    </div>
  );
}

export default DashboardPage;
