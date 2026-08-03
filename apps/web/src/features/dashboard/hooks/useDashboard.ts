import { useQuery } from "@tanstack/react-query";
import type { TodaysSessions, TopSessions } from "@devlog/types";
import { dashboardApi } from "@/api/dashboard.api";
import { keys } from "@/lib/queryKeys";

export interface DashboardOverview {
  todaysSessions: TodaysSessions;
  topSessionTypes: TopSessions[];
  activeStreaks: { type: string; currentStreak: number }[];
  weeklyBreakdown: TopSessions[];
  activeProjects: { name: string; lastSessionDate: string | null }[];
  readingBacklog: { unreadCount: number };
}

export function useDashboardStats() {
  return useQuery<DashboardOverview>({
    queryKey: keys.dashboard.all(),
    queryFn: dashboardApi.getOverview,
  });
}
