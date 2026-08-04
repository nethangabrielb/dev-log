export interface DailyReportTimeOverTime {
  date: string;
  totalDuration: number;
}

export interface DailyReportTypeAggregate {
  type: string;
  durationInSeconds: number;
  tasksCompleted: number;
}

export interface DailyReportStatistics {
  totalReports: number;
  totalTimeLogged: number;
  totalTasksCompleted: number;
  averageTimePerDay: number;
  timeLoggedOverTime: DailyReportTimeOverTime[];
  breakdownBySessionType: DailyReportTypeAggregate[];
}
