export interface BreakdownByDifficulty {
  _id: string;
  count: number;
}

export interface BreakdownByPattern {
  _id: string;
  count: number;
}

export interface ProblemSolvedOverTime {
  _id: string;
  count: number;
}

export interface DsaStatistics {
  totalProblemsSolved: number;
  longestStreak: number;
  currentStreak: number;
  breakdownByDifficulty: BreakdownByDifficulty[];
  breakdownByPattern: BreakdownByPattern[];
  problemsSolvedOverTime: ProblemSolvedOverTime[];
}
