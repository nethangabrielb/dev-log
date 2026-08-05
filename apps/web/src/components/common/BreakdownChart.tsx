import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";

export interface BreakdownChartProps {
  title: string;
  subtitle: string;
  data: { name: string; count: number }[];
  colorFor: (name: string) => string;
  loading: boolean;
  labelWidth?: number;
  countNoun?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function BreakdownChart({
  title,
  subtitle,
  data,
  colorFor,
  loading,
  labelWidth = 130,
  countNoun = "items",
  emptyTitle = "No data yet",
  emptyDescription = "Track items to see the breakdown here.",
}: BreakdownChartProps) {
  const filtered = data.filter((d) => d.count > 0);

  return (
    <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {loading ? (
        <div className="h-64 pt-8">
          <Skeleton className="h-full w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filtered}
              layout="vertical"
              margin={{ top: 5, right: 16, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                allowDecimals={false}
                stroke="var(--devlog-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--devlog-border)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={labelWidth}
                stroke="var(--devlog-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--devlog-bg-hover)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="p-3 rounded-lg border border-border bg-bg-elevated text-foreground text-xs shadow-lg space-y-1">
                        <p
                          className="font-semibold"
                          style={{ color: colorFor(row.name) }}
                        >
                          {row.name}
                        </p>
                        <p>
                          {row.count} {countNoun}
                          {row.count === 1 ? "" : "s"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={14}>
                {filtered.map((entry) => (
                  <Cell key={entry.name} fill={colorFor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
