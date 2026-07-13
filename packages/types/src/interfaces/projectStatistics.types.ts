export interface TotalTimeLogged {
  totalDuration: number;
}

export interface TasksCompleted {
  totalCompleted: number;
}

export interface SessionFrequencyOverTime {
  _id: string;
  count: number;
}

export interface ProjectStatistics {
  totalTimeLogged: number;
  tasksCompleted: TasksCompleted;
  sessionFrequencyOverTime: SessionFrequencyOverTime;
}
