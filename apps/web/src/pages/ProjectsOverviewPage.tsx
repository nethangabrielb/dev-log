import { format } from "date-fns";
import { FolderKanban, CircleDot, Clock, CheckCircle2 } from "lucide-react";
import { ProjectCategory, ProjectStatus } from "@devlog/types";
import { useProjectsStatistics } from "@/features/projects/hooks/useProjects";
import {
  PROJECT_STATUS_ORDER,
  projectStatusColor,
  projectCategoryColor,
} from "@/features/projects/components/projectColors";
import { StatCard } from "@/components/common/StatCard";
import { BreakdownChart } from "@/components/common/BreakdownChart";
import { TrendAreaChart } from "@/components/common/TrendAreaChart";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/formatters";

export function ProjectsOverviewPage() {
  const { data: stats, isLoading } = useProjectsStatistics();

  const breakdownByStatus = stats?.breakdownByStatus || [];
  const breakdownByCategory = stats?.breakdownByCategory || [];

  const statusData = PROJECT_STATUS_ORDER.map((status) => {
    const found = breakdownByStatus.find((b) => b.status === status);
    return { name: status, count: found?.count ?? 0 };
  });

  const categoryData = Object.values(ProjectCategory).map((category) => {
    const found = breakdownByCategory.find((b) => b.category === category);
    return { name: category, count: found?.count ?? 0 };
  });

  const activeCount =
    breakdownByStatus.find((b) => b.status === ProjectStatus.ACTIVE)?.count ?? 0;

  const activityData = (stats?.sessionActivityOverTime || []).map((d) => ({
    x: d.date,
    y: d.count,
  }));

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects Overview</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Aggregate statistics across all your tracked projects
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label="Total Projects"
              value={stats?.totalProjects ?? 0}
              sublabel="Projects tracked to date"
              icon={FolderKanban}
            />
            <StatCard
              label="Active Projects"
              value={activeCount}
              sublabel="Currently in progress"
              icon={CircleDot}
            />
            <StatCard
              label="Total Time Logged"
              value={formatDuration(stats?.totalTimeLogged ?? 0)}
              sublabel="Across linked project sessions"
              icon={Clock}
            />
            <StatCard
              label="Tasks Completed"
              value={stats?.totalTasksCompleted ?? 0}
              sublabel="Completed todos in project sessions"
              icon={CheckCircle2}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownChart
          title="Projects by Status"
          subtitle="Distribution of projects across statuses"
          data={statusData}
          colorFor={(name) => projectStatusColor(name as ProjectStatus)}
          loading={isLoading}
          labelWidth={90}
          countNoun="project"
          emptyTitle="No projects yet"
          emptyDescription="Create a project to see the status breakdown here."
        />
        <BreakdownChart
          title="Projects by Category"
          subtitle="Distribution of projects across categories"
          data={categoryData}
          colorFor={(name) => projectCategoryColor(name as ProjectCategory)}
          loading={isLoading}
          labelWidth={110}
          countNoun="project"
          emptyTitle="No projects yet"
          emptyDescription="Create a project to see the category breakdown here."
        />
      </div>

      <TrendAreaChart
        title="Project Session Activity — Last 14 Days"
        subtitle="Number of sessions logged against projects per day"
        data={activityData}
        loading={isLoading}
        gradientId="projectsActivityGradient"
        valueFormatter={(count) => `${count} session${count === 1 ? "" : "s"}`}
        xFormatter={(raw) => format(new Date(raw), "MMM d")}
        emptyTitle="No project activity yet"
        emptyDescription="Log sessions linked to a project to see activity here."
      />
    </div>
  );
}

export default ProjectsOverviewPage;
