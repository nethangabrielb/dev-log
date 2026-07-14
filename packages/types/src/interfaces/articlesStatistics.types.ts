export interface ReadRatio {
  read: number;
  total: number;
}

export interface ReadThisMonth {
  date: string;
  count: number;
}

export interface TotalTimeSpentReading {
  totalDuration: number;
}

export interface BreakdownByCategory {
  category: string;
  count: number;
}

export interface ArticlesStatistics {
  readRatio: ReadRatio;
  readThisMonth: ReadThisMonth[];
  totalTimeSpentReading: TotalTimeSpentReading;
  breakdownByCategory: BreakdownByCategory[];
}
