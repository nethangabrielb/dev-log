import { useMemo, useState } from "react";
import { buildHeatmapGrid, type HeatmapCell } from "@/lib/heatmap.util";
import type { DailyActivityPoint } from "@devlog/types";
import { formatDuration } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Zap, Flame } from "lucide-react";

export interface ContributionHeatmapProps {
  data?: DailyActivityPoint[];
  timezone?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  daysCount?: number;
  onDayClick?: (cell: HeatmapCell) => void;
  className?: string;
}

const LEVEL_STYLE_MAP: Record<
  0 | 1 | 2 | 3 | 4,
  { fill: string; stroke: string }
> = {
  0: { fill: "#1c1c21", stroke: "#2a2a35" },
  1: { fill: "rgba(201, 118, 47, 0.28)", stroke: "rgba(201, 118, 47, 0.45)" },
  2: { fill: "rgba(201, 118, 47, 0.52)", stroke: "rgba(201, 118, 47, 0.68)" },
  3: { fill: "rgba(201, 118, 47, 0.78)", stroke: "rgba(201, 118, 47, 0.90)" },
  4: { fill: "#c9762f", stroke: "rgba(232, 232, 240, 0.40)" },
};

const CELL_SIZE = 10.5;
const CELL_GAP = 3;
const CELL_RADIUS = 2;
const LEFT_PAD = 26;
const TOP_PAD = 16;

export function ContributionHeatmap({
  data = [],
  timezone = "Asia/Manila",
  title = "Contribution Activity",
  subtitle = "Daily focus time recorded across the past 365 days",
  loading = false,
  daysCount = 365,
  onDayClick,
  className = "",
}: ContributionHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const {
    weeks,
    monthHeaders,
    totalSeconds,
    activeDaysCount,
    dailyAverageSeconds,
    longestStreak,
    bestDay,
  } = useMemo(
    () => buildHeatmapGrid(data, timezone, daysCount),
    [data, timezone, daysCount]
  );

  const formatTooltipDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const viewBoxWidth = LEFT_PAD + weeks.length * (CELL_SIZE + CELL_GAP);
  const viewBoxHeight = TOP_PAD + 7 * (CELL_SIZE + CELL_GAP);

  return (
    <div
      className={`p-6 border border-border rounded-xl space-y-5 bg-bg-surface text-text-primary relative ${className}`}
    >
      {/* Header with Title and Aggregate Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>

        {!loading && (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-accent font-medium bg-bg-elevated px-2.5 py-1 rounded-md border border-border-subtle">
              {formatDuration(totalSeconds)} logged
            </span>
            <span className="text-text-secondary">
              <strong className="text-text-primary font-mono font-medium">
                {activeDaysCount}
              </strong>{" "}
              active day{activeDaysCount === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {/* 3 Core Value-Add Stat Badges */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-accent" />
                <span>Longest Streak</span>
              </div>
              <div className="font-mono text-sm font-semibold text-text-primary">
                {longestStreak} {longestStreak === 1 ? "day" : "days"}
              </div>
            </div>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider bg-bg-base px-2 py-0.5 rounded border border-border-subtle/60">
              Streak
            </span>
          </div>

          <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span>Active Day Avg</span>
              </div>
              <div className="font-mono text-sm font-semibold text-text-primary">
                {formatDuration(dailyAverageSeconds)}
              </div>
            </div>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider bg-bg-base px-2 py-0.5 rounded border border-border-subtle/60">
              Daily
            </span>
          </div>

          <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border-subtle flex items-center justify-between">
            <div className="space-y-0.5 min-w-0 pr-2">
              <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span>Most Active Day</span>
              </div>
              <div className="font-mono text-xs font-semibold text-text-primary truncate">
                {bestDay
                  ? `${formatTooltipDate(bestDay.date).replace(/, \d{4}$/, "")} (${formatDuration(bestDay.totalDuration)})`
                  : "—"}
              </div>
            </div>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider bg-bg-base px-2 py-0.5 rounded border border-border-subtle/60 shrink-0">
              Peak
            </span>
          </div>
        </div>
      )}

      {/* SVG Edge-to-Edge Responsive Contribution Heatmap Graph */}
      {loading ? (
        <div className="pt-2 pb-2">
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto scrollbar-thin pt-1 pb-1">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-auto min-w-[700px] overflow-visible select-none"
            role="grid"
            aria-label="Contribution Activity Heatmap"
          >
            {/* Month Labels (Top X-Axis) */}
            {monthHeaders.map((header) => {
              const x = LEFT_PAD + header.weekIndex * (CELL_SIZE + CELL_GAP);
              return (
                <text
                  key={`${header.label}-${header.weekIndex}`}
                  x={x}
                  y={10}
                  fill="var(--devlog-text-muted)"
                  fontSize={8.5}
                  fontFamily="ui-monospace, monospace"
                  textAnchor="start"
                >
                  {header.label}
                </text>
              );
            })}

            {/* Day of Week Labels (Y-Axis) */}
            <text
              x={LEFT_PAD - 5}
              y={TOP_PAD + 1 * (CELL_SIZE + CELL_GAP) + 8}
              fill="var(--devlog-text-muted)"
              fontSize={8}
              fontFamily="ui-monospace, monospace"
              textAnchor="end"
            >
              Mon
            </text>
            <text
              x={LEFT_PAD - 5}
              y={TOP_PAD + 3 * (CELL_SIZE + CELL_GAP) + 8}
              fill="var(--devlog-text-muted)"
              fontSize={8}
              fontFamily="ui-monospace, monospace"
              textAnchor="end"
            >
              Wed
            </text>
            <text
              x={LEFT_PAD - 5}
              y={TOP_PAD + 5 * (CELL_SIZE + CELL_GAP) + 8}
              fill="var(--devlog-text-muted)"
              fontSize={8}
              fontFamily="ui-monospace, monospace"
              textAnchor="end"
            >
              Fri
            </text>

            {/* 53 Column Week Rectangles */}
            {weeks.map((week, weekIdx) => {
              const x = LEFT_PAD + weekIdx * (CELL_SIZE + CELL_GAP);

              return (
                <g key={`week-${weekIdx}`}>
                  {week.map((cell) => {
                    if (!cell.inRange) return null;

                    const y = TOP_PAD + cell.dayOfWeek * (CELL_SIZE + CELL_GAP);
                    const style = LEVEL_STYLE_MAP[cell.level];

                    return (
                      <rect
                        key={cell.date}
                        x={x}
                        y={y}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={CELL_RADIUS}
                        ry={CELL_RADIUS}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={0.8}
                        className="cursor-pointer transition-all duration-150 hover:stroke-[rgba(232,232,240,0.9)] hover:stroke-[1.2px]"
                        onClick={() => onDayClick?.(cell)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <title>
                          {`${formatTooltipDate(cell.date)}: ${
                            cell.totalDuration > 0
                              ? formatDuration(cell.totalDuration)
                              : "No activity"
                          }`}
                        </title>
                      </rect>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-bg-elevated text-text-primary px-3 py-2 rounded-lg border border-border shadow-xl text-xs space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 6}px`,
          }}
        >
          <div className="font-semibold text-text-primary">
            {formatTooltipDate(hoveredCell.cell.date)}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredCell.cell.totalDuration > 0
                  ? "bg-accent"
                  : "bg-text-muted"
              }`}
            />
            <span className="font-mono text-accent font-medium">
              {hoveredCell.cell.totalDuration > 0
                ? formatDuration(hoveredCell.cell.totalDuration)
                : "No focus time logged"}
            </span>
            {hoveredCell.cell.count > 0 && (
              <span className="text-text-muted">
                ({hoveredCell.cell.count} session
                {hoveredCell.cell.count === 1 ? "" : "s"})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer & Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px] text-text-muted">
        <span>Showing past 365 days</span>

        <div className="flex items-center gap-1.5 select-none font-mono">
          <span>Less</span>
          <div className="flex items-center gap-[3px]">
            <span
              className="w-[11px] h-[11px] rounded-[2px] bg-bg-elevated/70 border border-border-subtle/50"
              title="0 mins"
            />
            <span
              className="w-[11px] h-[11px] rounded-[2px] bg-[rgba(201,118,47,0.28)] border border-[rgba(201,118,47,0.45)]"
              title="≤ 30 mins"
            />
            <span
              className="w-[11px] h-[11px] rounded-[2px] bg-[rgba(201,118,47,0.52)] border border-[rgba(201,118,47,0.68)]"
              title="30 mins – 1.5 hrs"
            />
            <span
              className="w-[11px] h-[11px] rounded-[2px] bg-[rgba(201,118,47,0.78)] border border-[rgba(201,118,47,0.90)]"
              title="1.5 hrs – 3 hrs"
            />
            <span
              className="w-[11px] h-[11px] rounded-[2px] bg-accent border border-[rgba(232,232,240,0.30)] shadow-[0_0_8px_rgba(201,118,47,0.25)]"
              title="> 3 hrs"
            />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
