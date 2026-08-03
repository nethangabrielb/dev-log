import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, Flame, Activity } from "lucide-react";
import { useSessionStats, useSessionStreaks } from "@/features/sessions/hooks/useSessions";
import { useDsaStats } from "@/features/dsa/hooks/useDsaStats";
import { StatCard } from "@/components/common/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, SESSION_TYPE_COLOR } from "@/lib/formatters";
import { SessionType } from "@devlog/types";

export function DashboardPage() {
  const { data: sessionStats, isLoading: isStatsLoading } = useSessionStats();
  const { data: sessionStreaks, isLoading: isStreaksLoading } = useSessionStreaks();
  const { data: dsaStats, isLoading: isDsaLoading } = useDsaStats();

  // Combine query loading states without full page spinner
  const isLoading = isStatsLoading || isStreaksLoading || isDsaLoading;

  // Prepare chart data for time by SessionType
  const totalByType = sessionStats?.totalByType || [];
  const chartData = Object.values(SessionType).map((type) => {
    const found = totalByType.find((item: any) => item._id === type);
    const durationInSeconds = found?.totalDuration || 0;
    return {
      type,
      durationInSeconds,
      formatted: formatDuration(durationInSeconds),
      hours: +(durationInSeconds / 3600).toFixed(1),
    };
  });

  return (
    <div
      className="p-6 space-y-6 min-h-screen"
      style={{
        backgroundColor: "var(--devlog-bg-base)",
        color: "var(--devlog-text-primary)",
      }}
    >
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--devlog-text-primary)" }}
        >
          Dashboard
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--devlog-text-secondary)" }}
        >
          Overview of your activity, productivity, and developer stats
        </p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-xl space-y-3"
              style={{
                backgroundColor: "var(--devlog-bg-surface)",
                borderColor: "var(--devlog-border)",
              }}
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Total Time Spent"
              value={formatDuration(sessionStats?.totalTimeSpent?.totalDuration || 0)}
              sublabel="Logged across all sessions"
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
        )}
      </div>

      {/* Time by SessionType Bar Chart */}
      <div
        className="p-6 border rounded-xl space-y-4"
        style={{
          backgroundColor: "var(--devlog-bg-surface)",
          borderColor: "var(--devlog-border)",
        }}
      >
        <div>
          <h3
            className="text-base font-semibold tracking-tight"
            style={{ color: "var(--devlog-text-primary)" }}
          >
            Time Spent by Session Type
          </h3>
          <p
            className="text-xs"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            Distribution of logged time across category types
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
        ) : (
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const color =
                        SESSION_TYPE_COLOR[data.type as SessionType] ||
                        "var(--devlog-accent)";
                      return (
                        <div
                          className="p-3 rounded-lg border text-xs shadow-lg space-y-1"
                          style={{
                            backgroundColor: "var(--devlog-bg-elevated)",
                            borderColor: "var(--devlog-border)",
                            color: "var(--devlog-text-primary)",
                          }}
                        >
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
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
