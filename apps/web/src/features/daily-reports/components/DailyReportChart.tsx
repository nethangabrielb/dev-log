import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SessionType } from "@devlog/types";
import type { DailyReportBreakdown } from "@/api/daily-reports.api";
import { formatDuration, SESSION_TYPE_COLOR } from "@/lib/formatters";

export interface DailyReportChartProps {
  breakdown: DailyReportBreakdown[];
}

function colorForType(type: string): string {
  return (
    SESSION_TYPE_COLOR[type as SessionType] ?? "var(--devlog-text-muted)"
  );
}

export function DailyReportChart({ breakdown }: DailyReportChartProps) {
  const data = [...breakdown]
    .sort((a, b) => b.durationInSeconds - a.durationInSeconds)
    .map((item) => ({
      type: item.type,
      durationInSeconds: item.durationInSeconds,
      tasksCompleted: item.tasksCompleted,
      formatted: formatDuration(item.durationInSeconds),
    }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(140, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          allowDecimals={false}
          stroke="var(--devlog-text-secondary)"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "var(--devlog-border)" }}
          tickFormatter={(value: number) => formatDuration(value)}
        />
        <YAxis
          type="category"
          dataKey="type"
          width={110}
          stroke="var(--devlog-text-secondary)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--devlog-bg-hover)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0].payload;
            return (
              <div className="p-3 rounded-lg border border-border bg-bg-elevated text-foreground text-xs shadow-lg space-y-1">
                <p
                  className="font-semibold"
                  style={{ color: colorForType(row.type) }}
                >
                  {row.type}
                </p>
                <p className="font-mono">
                  {row.formatted} logged
                </p>
                {row.tasksCompleted > 0 && (
                  <p className="text-muted-foreground">
                    {row.tasksCompleted} task
                    {row.tasksCompleted === 1 ? "" : "s"} completed
                  </p>
                )}
              </div>
            );
          }}
        />
        <Bar dataKey="durationInSeconds" radius={[4, 4, 4, 4]} barSize={14}>
          {data.map((entry) => (
            <Cell key={entry.type} fill={colorForType(entry.type)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
