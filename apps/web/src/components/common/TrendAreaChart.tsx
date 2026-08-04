import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";

export interface TrendPoint {
  x: string;
  y: number;
  displayX?: string;
}

export interface TrendAreaChartProps {
  title: string;
  subtitle: string;
  data: TrendPoint[];
  loading: boolean;
  gradientId: string;
  valueFormatter: (value: number) => string;
  xFormatter: (raw: string) => string;
  yTickFormatter?: (value: number) => string;
  yUnit?: string;
  allowDecimals?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TrendAreaChart({
  title,
  subtitle,
  data,
  loading,
  gradientId,
  valueFormatter,
  xFormatter,
  yTickFormatter,
  yUnit,
  allowDecimals,
  emptyTitle = "No data yet",
  emptyDescription = "Log some activity to see trends here.",
}: TrendAreaChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.displayX ?? xFormatter(d.x),
  }));

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
      ) : chartData.length === 0 || chartData.every((d) => d.y === 0) ? (
        <EmptyState
          icon={TrendingUp}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={gradientId}
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
                allowDecimals={allowDecimals ?? false}
                stroke="var(--devlog-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--devlog-border)" }}
                tickFormatter={yTickFormatter}
                unit={yUnit}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="p-3 rounded-lg border border-border bg-bg-elevated text-foreground text-xs shadow-lg space-y-1">
                        <p className="font-semibold">{point.label}</p>
                        <p className="text-accent">{valueFormatter(point.y)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="var(--devlog-accent)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
