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

const LEVEL_CLASS_MAP: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-bg-elevated/70 border border-border-subtle/50 hover:border-border",
  1: "bg-[rgba(201,118,47,0.22)] border border-[rgba(201,118,47,0.35)]",
  2: "bg-[rgba(201,118,47,0.48)] border border-[rgba(201,118,47,0.60)]",
  3: "bg-[rgba(201,118,47,0.75)] border border-[rgba(201,118,47,0.85)]",
  4: "bg-accent border border-[rgba(232,232,240,0.30)] shadow-[0_0_8px_rgba(201,118,47,0.25)]",
};

export function ContributionHeatmap({
  data = [],
  timezone = "Asia/Manila",
  title = "Contribution Activity",
  subtitle = "Daily focus time across the past 365 days",
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

  return (
    <div
      className={`p-6 border border-border rounded-xl space-y-4 bg-bg-surface text-text-primary relative ${className}`}
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

      {/* Grid Canvas + Annual Insights Sidebar */}
      {loading ? (
        <div className="pt-3 pb-2">
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row xl:items-center gap-6 justify-between pt-1">
          {/* Left / Compact Heatmap Matrix */}
          <div className="overflow-x-auto pb-2 scrollbar-thin flex-1 min-w-0">
            <div className="inline-block">
              {/* Month Labels Row */}
              <div className="flex items-center mb-1.5 pl-8">
                <div
                  className="grid auto-cols-[12px] gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${weeks.length}, 12px)`,
                  }}
                >
                  {monthHeaders.map((header) => (
                    <span
                      key={`${header.label}-${header.weekIndex}`}
                      className="text-[10px] font-mono text-text-muted leading-none select-none"
                      style={{
                        gridColumnStart: header.weekIndex + 1,
                      }}
                    >
                      {header.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Main 7-Row Grid with Day-of-Week Labels */}
              <div className="flex items-start gap-2">
                {/* Day of Week Labels (Y-Axis) */}
                <div className="grid grid-rows-7 gap-[3px] text-[9px] font-mono text-text-muted select-none pt-[1px] w-6 text-right">
                  <span className="h-3 leading-3"></span>
                  <span className="h-3 leading-3">Mon</span>
                  <span className="h-3 leading-3"></span>
                  <span className="h-3 leading-3">Wed</span>
                  <span className="h-3 leading-3"></span>
                  <span className="h-3 leading-3">Fri</span>
                  <span className="h-3 leading-3"></span>
                </div>

                {/* 53 Column Week Grid */}
                <div
                  className="grid auto-cols-[12px] gap-[3px] grid-flow-col"
                  style={{
                    gridTemplateColumns: `repeat(${weeks.length}, 12px)`,
                  }}
                  role="grid"
                  aria-label="Contribution Activity Heatmap"
                >
                  {weeks.map((week, weekIdx) => (
                    <div
                      key={`week-${weekIdx}`}
                      className="grid grid-rows-7 gap-[3px]"
                      role="row"
                    >
                      {week.map((cell) => {
                        if (!cell.inRange) {
                          return (
                            <div
                              key={cell.date}
                              className="w-3 h-3 opacity-0 pointer-events-none"
                              aria-hidden="true"
                            />
                          );
                        }

                        const levelClass = LEVEL_CLASS_MAP[cell.level];

                        return (
                          <button
                            key={cell.date}
                            type="button"
                            tabIndex={0}
                            aria-label={`${formatTooltipDate(cell.date)}: ${
                              cell.totalDuration > 0
                                ? formatDuration(cell.totalDuration)
                                : "No activity"
                            }`}
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
                            className={`w-3 h-3 rounded-[2.5px] transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent ${levelClass} hover:scale-125 hover:z-20`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right / Annual Insights Sidebar */}
          <div className="xl:w-56 shrink-0 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-2.5 xl:border-l xl:border-border-subtle xl:pl-6 pt-2 xl:pt-0">
            <div className="p-2.5 rounded-lg bg-bg-elevated/60 border border-border-subtle space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-accent" />
                <span>Longest Streak</span>
              </div>
              <div className="font-mono text-sm font-semibold text-text-primary">
                {longestStreak} {longestStreak === 1 ? "day" : "days"}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-bg-elevated/60 border border-border-subtle space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span>Active Day Avg</span>
              </div>
              <div className="font-mono text-sm font-semibold text-text-primary">
                {formatDuration(dailyAverageSeconds)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-bg-elevated/60 border border-border-subtle space-y-1 col-span-2 sm:col-span-1 xl:col-span-1">
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span>Most Active Day</span>
              </div>
              <div className="font-mono text-xs font-semibold text-text-primary truncate">
                {bestDay
                  ? `${formatTooltipDate(bestDay.date).replace(/, \d{4}$/, "")} (${formatDuration(bestDay.totalDuration)})`
                  : "—"}
              </div>
            </div>
          </div>
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
              className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS_MAP[0]}`}
              title="0 mins"
            />
            <span
              className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS_MAP[1]}`}
              title="≤ 30 mins"
            />
            <span
              className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS_MAP[2]}`}
              title="30 mins – 1.5 hrs"
            />
            <span
              className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS_MAP[3]}`}
              title="1.5 hrs – 3 hrs"
            />
            <span
              className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS_MAP[4]}`}
              title="> 3 hrs"
            />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
