import { client } from "./client";
import type { DailyReportStatistics } from "@devlog/types";

export interface DailyReportBreakdown {
  type: string;
  durationInSeconds: number;
  tasksCompleted: number;
}

export interface DailyReport {
  _id?: string;
  id?: string;
  date: string;
  totalTimeLogged: number;
  totalTasksCompleted: number;
  topSessionType: string;
  breakdownBySessionType: DailyReportBreakdown[];
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const dailyReportsApi = {
  findAll: () =>
    client.get<DailyReport[]>("/daily-report").then((r) => r.data),

  findOne: (date: string) =>
    client.get<DailyReport>(`/daily-report/${date}`).then((r) => r.data),

  markAsRead: (date: string) =>
    client.patch<DailyReport>(`/daily-report/${date}/read`).then((r) => r.data),

  getStatistics: () =>
    client.get<DailyReportStatistics>("/daily-report/statistics").then((r) => r.data),
};
