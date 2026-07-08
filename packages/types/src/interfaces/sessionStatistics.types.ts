export interface TotalByType {
  _id: string; // SessionType
  totalDuration: number;
}

export interface AveragePerDay {
  _id: null;
  averageDuration: number;
}

export interface MostProductiveDay {
  _id: string;
  totalDuration: number;
}

export interface TotalTimeSpent {
  _id: null;
  totalDuration: number;
}

export interface SessionCountOverTime {
  _id: string;
  count: number;
}

export interface SessionStatistics {
  totalByType: TotalByType[];
  averagePerDay: AveragePerDay | null;
  mostProductiveDay: MostProductiveDay | null;
  totalTimeSpent: TotalTimeSpent | null;
  totalSessions: number;
  sessionCountOverTime: SessionCountOverTime[]; // missing
  currentStreak: number;
}
