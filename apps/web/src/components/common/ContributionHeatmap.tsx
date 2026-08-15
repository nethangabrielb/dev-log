import { useMemo, useState, useRef, useEffect } from "react";
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
  1: "bg-[rgba(201,118,47,0.25)] border border-[rgba(201,118,47,0.40)]",
  2: "bg-[rgba(201,118,47,0.50)] border border-[rgba(201,118,47,0.65)]",
  3: "bg-[rgba(201,118,47,0.76)] border border-[rgba(201,118,47,0.88)]",
  4: "bg-accent border border-[rgba(232,232,240,0.30)] shadow-[0_0_8px_rgba(201,118,47,0.25)]",
};

const LEFT_PAD = 26;
const GAP = 3;
const MIN_CELL_SIZE = 10;
const MAX_CELL_SIZE = 16;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  // Measure container width via ResizeObserver to dynamically compute cell size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el) {
        setContainerWidth(el.clientWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Compute responsive cell size based on measured container width
  const cellSize = useMemo(() => {
    const numWeeks = weeks.length || 53;
    if (!containerWidth) return 12;

    const available = containerWidth - LEFT_PAD - (numWeeks - 1) * GAP;
    const computed = Math.floor(available / numWeeks);
    return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, computed));
  }, [containerWidth, weeks.length]);

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
      className={`p-6 border border-border rounded-xl space-y-5 bg-bg-surface text-text-primary w-full max-w-full min-w-0 relative ${className}`}
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

      {/* Grid Canvas with Resize Observer Measurement */}
      <div
        ref={containerRef}
        className="w-full max-w-full min-w-0 overflow-x-auto scrollbar-thin pt-1 pb-1"
      >
        {loading ? (
          <div className="pt-2 pb-2">
            <Skeleton className="h-[140px] w-full rounded-lg" />
          </div>
        ) : (
          <div className="inline-block min-w-max">
            {/* Month Labels Row */}
            <div
              className="grid mb-1.5 select-none"
              style={{
                gridTemplateColumns: `repeat(${weeks.length}, ${cellSize}px)`,
                gap: `${GAP}px`,
                paddingLeft: `${LEFT_PAD}px`,
              }}
            >
              {monthHeaders.map((header) => (
                <span
                  key={`${header.label}-${header.weekIndex}`}
                  className="text-[10px] font-mono text-text-muted leading-none"
                  style={{
                    gridColumnStart: header.weekIndex + 1,
                  }}
                >
                  {header.label}
                </span>
              ))}
            </div>

            {/* Main 7-Row Grid with Day Labels */}
            <div className="flex items-start">
              {/* Day of Week Labels (Y-Axis) */}
              <div
                className="flex flex-col text-[9px] font-mono text-text-muted select-none text-right pr-2 shrink-0"
                style={{
                  width: `${LEFT_PAD}px`,
                }}
              >
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginBottom: `${GAP}px` }}></span>
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginBottom: `${GAP}px` }}>Mon</span>
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginBottom: `${GAP}px` }}></span>
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginBottom: `${GAP}px` }}>Wed</span>
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginBottom: `${GAP}px` }}></span>
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginBottom: `${GAP}px` }}>Fri</span>
                <span style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}></span>
              </div>

              {/* 53-Week Column Matrix */}
              <div
                className="grid grid-flow-col"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, ${cellSize}px)`,
                  gap: `${GAP}px`,
                }}
                role="grid"
                aria-label="Contribution Activity Heatmap"
              >
                {weeks.map((week, weekIdx) => (
                  <div
                    key={`week-${weekIdx}`}
                    className="grid grid-rows-7"
                    style={{
                      gap: `${GAP}px`,
                    }}
                    role="row"
                  >
                    {week.map((cell) => {
                      if (!cell.inRange) {
                        return (
                          <div
                            key={cell.date}
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`,
                            }}
                            className="opacity-0 pointer-events-none"
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
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            borderRadius: "2px",
                          }}
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
                          className={`transition-all duration-150 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent ${levelClass} hover:scale-125 hover:z-20`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
