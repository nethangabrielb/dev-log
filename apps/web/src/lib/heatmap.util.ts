import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { DailyActivityPoint } from '@devlog/types';

export interface HeatmapCell {
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  totalDuration: number;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean; // true if within the requested days window
}

export interface MonthHeader {
  label: string; // 'Jan', 'Feb', etc.
  weekIndex: number; // 0-52
}

/**
 * Fixed round thresholds in seconds:
 * - Level 1: >0s up to 30 mins (1,800s)
 * - Level 2: >30 mins up to 1.5 hours (5,400s)
 * - Level 3: >1.5 hours up to 3 hours (10,800s)
 * - Level 4: >3 hours (>10,800s)
 */
export const HEATMAP_THRESHOLDS = {
  LEVEL_1: 1800,
  LEVEL_2: 5400,
  LEVEL_3: 10800,
} as const;

/**
 * Derives the 0-4 intensity level for a given duration in seconds.
 */
export function getIntensityLevel(seconds: number): 0 | 1 | 2 | 3 | 4 {
  if (!seconds || seconds <= 0) return 0;
  if (seconds <= HEATMAP_THRESHOLDS.LEVEL_1) return 1;
  if (seconds <= HEATMAP_THRESHOLDS.LEVEL_2) return 2;
  if (seconds <= HEATMAP_THRESHOLDS.LEVEL_3) return 3;
  return 4;
}

export interface GridBoundaries {
  gridStartSunday: Date;
  gridEndSaturday: Date;
  zonedRangeStart: Date;
  zonedEndDay: Date;
  numWeeks: number;
}

/**
 * Computes calendar-accurate grid boundaries strictly in the user's timezone using date-fns and date-fns-tz:
 * 1. Converts reference UTC date to the user's local wall-clock time.
 * 2. Finds midnight of the logical range start (daysCount - 1 prior).
 * 3. Uses `startOfWeek(..., { weekStartsOn: 0 })` to anchor to Sunday on or before that day.
 * 4. Uses `endOfWeek(..., { weekStartsOn: 0 })` to close on Saturday on or after the end day.
 */
export function computeHeatmapGridBoundaries(
  timezone: string = 'Asia/Manila',
  daysCount: number = 365,
  referenceDate: Date = new Date(),
): GridBoundaries {
  const zonedNow = toZonedTime(referenceDate, timezone);
  const zonedEndDay = startOfDay(zonedNow);
  const zonedRangeStart = subDays(zonedEndDay, daysCount - 1);
  const gridStartSunday = startOfWeek(zonedRangeStart, { weekStartsOn: 0 });
  const gridEndSaturday = endOfWeek(zonedEndDay, { weekStartsOn: 0 });

  const totalDays = differenceInCalendarDays(gridEndSaturday, gridStartSunday) + 1;
  const numWeeks = Math.ceil(totalDays / 7);

  return {
    gridStartSunday,
    gridEndSaturday,
    zonedRangeStart,
    zonedEndDay,
    numWeeks,
  };
}

export interface HeatmapGridData {
  weeks: HeatmapCell[][];
  monthHeaders: MonthHeader[];
  totalSeconds: number;
  activeDaysCount: number;
  dailyAverageSeconds: number;
  longestStreak: number;
  currentStreak: number;
  bestDay: { date: string; totalDuration: number } | null;
}

/**
 * Builds the complete 7-row x ~53-column heatmap matrix and month headers
 * from an array of daily activity points.
 */
export function buildHeatmapGrid(
  data: DailyActivityPoint[] = [],
  timezone: string = 'Asia/Manila',
  daysCount: number = 365,
  referenceDate?: Date,
): HeatmapGridData {
  // Index incoming data points by 'YYYY-MM-DD'
  const dataMap = new Map<string, DailyActivityPoint>();
  let totalSeconds = 0;
  let activeDaysCount = 0;
  let bestDay: { date: string; totalDuration: number } | null = null;

  for (const point of data) {
    if (point && point.date) {
      dataMap.set(point.date, point);
      if (point.totalDuration > 0) {
        totalSeconds += point.totalDuration;
        activeDaysCount += 1;
        if (!bestDay || point.totalDuration > bestDay.totalDuration) {
          bestDay = { date: point.date, totalDuration: point.totalDuration };
        }
      }
    }
  }

  // Determine reference end date (either provided, from last item in data, or today)
  let refDate = referenceDate;
  if (!refDate) {
    if (data.length > 0 && data[data.length - 1]?.date) {
      refDate = new Date(`${data[data.length - 1].date}T12:00:00.000Z`);
    } else {
      refDate = new Date();
    }
  }

  const { gridStartSunday, zonedRangeStart, zonedEndDay, numWeeks } =
    computeHeatmapGridBoundaries(timezone, daysCount, refDate);

  const weeks: HeatmapCell[][] = [];
  const monthHeaders: MonthHeader[] = [];
  let lastLabeledMonth = -1;
  let lastLabeledWeekIndex = -10;

  // Track streaks across chronological in-range days
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let w = 0; w < numWeeks; w++) {
    const week: HeatmapCell[] = [];

    for (let d = 0; d < 7; d++) {
      const currentZonedDay = addDays(gridStartSunday, w * 7 + d);
      const dateStr = format(currentZonedDay, 'yyyy-MM-dd');
      const inRange =
        currentZonedDay >= zonedRangeStart && currentZonedDay <= zonedEndDay;

      const activity = dataMap.get(dateStr);
      const totalDuration = activity?.totalDuration ?? 0;
      const count = activity?.count ?? 0;

      if (inRange) {
        if (totalDuration > 0) {
          tempStreak += 1;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      }

      // Track month label on the first day of each week or when a new month begins
      const monthIndex = currentZonedDay.getMonth();
      if (
        inRange &&
        monthIndex !== lastLabeledMonth &&
        w - lastLabeledWeekIndex >= 2 &&
        w <= numWeeks - 2
      ) {
        monthHeaders.push({
          label: format(currentZonedDay, 'MMM'),
          weekIndex: w,
        });
        lastLabeledMonth = monthIndex;
        lastLabeledWeekIndex = w;
      }

      week.push({
        date: dateStr,
        dayOfWeek: d,
        totalDuration,
        count,
        level: inRange ? getIntensityLevel(totalDuration) : 0,
        inRange,
      });
    }

    weeks.push(week);
  }

  currentStreak = tempStreak;
  const dailyAverageSeconds =
    activeDaysCount > 0 ? Math.round(totalSeconds / activeDaysCount) : 0;

  return {
    weeks,
    monthHeaders,
    totalSeconds,
    activeDaysCount,
    dailyAverageSeconds,
    longestStreak,
    currentStreak,
    bestDay,
  };
}
