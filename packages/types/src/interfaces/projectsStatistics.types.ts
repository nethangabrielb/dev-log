export interface ProjectsStatusBreakdown {
  status: string;
  count: number;
}

export interface ProjectsCategoryBreakdown {
  category: string;
  count: number;
}

export interface ProjectActivityOverTime {
  date: string;
  count: number;
}

export interface ProjectsStatistics {
  totalProjects: number;
  totalTimeLogged: number;
  totalTasksCompleted: number;
  breakdownByStatus: ProjectsStatusBreakdown[];
  breakdownByCategory: ProjectsCategoryBreakdown[];
  sessionActivityOverTime: ProjectActivityOverTime[];
}
