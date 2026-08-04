import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { Clock, Activity, Flame, TrendingUp } from "lucide-react";
import {
  useSessionStats,
  useSessionStreaks,
} from "@/features/sessions/hooks/useSessions";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, SESSION_TYPE_COLOR } from "@/lib/formatters";
import { SessionType } from "@devlog/types";

export function SessionsOverviewPage() {
  const { data: stats, isLoading: isStatsLoading } = useSessionStats();
  const { data: streaks, isLoading: isStreaksLoading } = useSessionStreaks();

  const loading = isStatsLoading || isStreaksLoading;

  const totalByType = stats?.totalByType || [];
  const typeChartData = Object.values(SessionType).map((type) => {
    const found = totalByType.find((item) => item._id === type);
    const seconds = found?.totalDuration || 0;
    return {
      type,
      formatted: formatDuration(seconds),
      hours: +(seconds / 3600).toFixed(1),
    };
  });

  const countSeries = stats?.sessionCountOverTime || [];
  const areaData = countSeries.map((d) => ({
    ...d,
    label: format(new Date(d.date), "MMM d"),
  }));

  const mostProductiveDay = stats?.mostProductiveDay;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions Overview</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Aggregate statistics across all your logged sessions
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label="Total Time"
              value={formatDuration(stats?.totalTimeSpent?.totalDuration || 0)}
              sublabel="Across all sessions"
              icon={Clock}
            />
            <StatCard
              label="Total Sessions"
              value={stats?.totalSessions || 0}
              sublabel="Sessions recorded to date"
              icon={Activity}
            />
            <StatCard
              label="Current Streak"
              value={`${stats?.currentStreak || 0} days`}
              sublabel="Consecutive logging days"
              icon={Flame}
            />
            <StatCard
              label="Avg Per Day"
              value={formatDuration(stats?.averagePerDay?.averageDuration || 0)}
              sublabel="Average session duration"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Time by Type + Streaks by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface lg:col-span-2">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Time by Session Type
            </h3>
            <p className="text-xs text-muted-foreground">
              Distribution of total logged time across categories
            </p>
          </div>
          {loading ? (
            <div className="h-64 flex items-end gap-4 pt-8 px-4">
              <Skeleton className="h-2/3 flex-1 rounded-t" />
              <Skeleton className="h-full flex-1 rounded-t" />
              <Skeleton className="h-1/2 flex-1 rounded-t" />
              <Skeleton className="h-3/4 flex-1 rounded-t" />
              <Skeleton className="h-1/3 flex-1 rounded-t" />
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
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
                    {typeChartData.map((entry) => (
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
          )}
        </div>

        <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Streaks by Type
            </h3>
            <p className="text-xs text-muted-foreground">
              Current and longest active streak per category
            </p>
          </div>
          {loading ? (
            <div className="space-y-3 pt-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {mostProductiveDay && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Most productive day
                  </span>
                  <span className="font-mono text-foreground">
                    {format(new Date(mostProductiveDay._id), "MMM d")} ·{" "}
                    {formatDuration(mostProductiveDay.totalDuration)}
                  </span>
                </div>
              )}
              <ul className="space-y-3">
                {streaks?.map((streak) => {
                  const color =
                    SESSION_TYPE_COLOR[streak.type] ||
                    "var(--devlog-text-muted)";
                  return (
                    <li key={streak.type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="px-2 py-0.5 font-mono font-medium rounded border"
                          style={{
                            color,
                            borderColor: color,
                          }}
                        >
                          {streak.type}
                        </span>
                        <span className="text-muted-foreground">
                          {streak.currentStreak}d now · {streak.longestStreak}d
                          best
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Sessions — Last 14 Days */}
      <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Sessions — Last 14 Days
          </h3>
          <p className="text-xs text-muted-foreground">
            Number of sessions logged per day over the past two weeks
          </p>
        </div>
        {loading ? (
          <div className="h-64 pt-8">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="sessionsAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--devlog-accent)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--devlog-accent)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--devlog-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="var(--devlog-text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--devlog-border)" }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--devlog-text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--devlog-border)" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-lg border border-border bg-bg-elevated text-foreground text-xs shadow-lg space-y-1">
                          <p className="font-semibold">{data.label}</p>
                          <p className="text-accent">
                            {data.count} session{data.count === 1 ? "" : "s"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--devlog-accent)"
                  strokeWidth={2}
                  fill="url(#sessionsAreaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionsOverviewPage;
