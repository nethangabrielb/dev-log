export interface BreakdownByDifficulty {
  difficulty: string;
  count: number;
}

export interface BreakdownByPattern {
  pattern: string;
  count: number;
}

export interface ProblemSolvedOverTime {
  date: string;
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
