import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ClipboardList,
  Clock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { SessionType } from "@devlog/types";
import { useDailyReportStatistics } from "@/features/daily-reports/hooks/useDailyReports";
import { StatCard } from "@/components/common/StatCard";
import { TrendAreaChart } from "@/components/common/TrendAreaChart";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, SESSION_TYPE_COLOR } from "@/lib/formatters";

export function DailyReportsOverviewPage() {
  const { data: stats, isLoading } = useDailyReportStatistics();

  const breakdown = stats?.breakdownBySessionType || [];

  const typeChartData = Object.values(SessionType).map((type) => {
    const found = breakdown.find((b) => b.type === type);
    const seconds = found?.durationInSeconds || 0;
    return {
      type,
      formatted: formatDuration(seconds),
      hours: +(seconds / 3600).toFixed(1),
    };
  });

  const timeData = (stats?.timeLoggedOverTime ?? []).map((d) => ({
    x: d.date,
    y: d.totalDuration,
  }));

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Daily Reports Overview
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Trends across your auto-generated daily reports
        </p>
      </div>

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
        ) : (
          <>
            <StatCard
              label="Total Reports"
              value={stats?.totalReports ?? 0}
              sublabel="Reports generated to date"
              icon={ClipboardList}
            />
            <StatCard
              label="Total Time Logged"
              value={formatDuration(stats?.totalTimeLogged ?? 0)}
              sublabel="Across all reported days"
              icon={Clock}
            />
            <StatCard
              label="Avg Per Day"
              value={formatDuration(stats?.averageTimePerDay ?? 0)}
              sublabel="Average daily logged time"
              icon={TrendingUp}
            />
            <StatCard
              label="Tasks Completed"
              value={stats?.totalTasksCompleted ?? 0}
              sublabel="Completed across all reports"
              icon={CheckCircle2}
            />
          </>
        )}
      </div>

      <TrendAreaChart
        title="Time Logged Per Day"
        subtitle="Daily logged time from each generated report"
        data={timeData}
        loading={isLoading}
        gradientId="dailyTimeGradient"
        valueFormatter={(seconds) => formatDuration(seconds)}
        xFormatter={(raw) => format(new Date(raw), "MMM d")}
        yTickFormatter={(value) => `${Math.round(value / 3600)}h`}
        allowDecimals={false}
        emptyTitle="No reports yet"
        emptyDescription="Reports are generated nightly after your first logged sessions."
      />

      <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Time by Session Type
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of total logged time across categories
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
    </div>
  );
}

export default DailyReportsOverviewPage;
