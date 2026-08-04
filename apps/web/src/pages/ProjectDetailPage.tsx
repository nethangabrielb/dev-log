import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { ProjectStatus } from "@devlog/types";
import type { SessionTodo } from "@devlog/types";
import {
  useProject,
  useProjectStats,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";
import { ProjectDialog } from "@/features/projects/components/ProjectDialog";
import { SessionCard, type SessionData } from "@/features/sessions/components/SessionCard";
import { useSessions, useDeleteSession, useUpdateSession } from "@/features/sessions/hooks/useSessions";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDuration } from "@/lib/formatters";
import type { ProjectFormValues } from "@/features/projects/schemas/project.schema";

const STATUS_COLOR: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "#4ade80",
  [ProjectStatus.PAUSED]: "#f4c542",
  [ProjectStatus.COMPLETED]: "#5b9bd9",
  [ProjectStatus.ARCHIVED]: "var(--devlog-text-muted)",
};

interface SessionListResponse {
  data?: SessionData[];
  items?: SessionData[];
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useProject(id);
  const { data: stats, isLoading: isStatsLoading } = useProjectStats(id);
  const { mutate: updateProject, isPending: isUpdatePending } =
    useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();

  const { data: rawSessions, isLoading: isSessionsLoading } = useSessions();
  const { mutate: deleteSession } = useDeleteSession();
  const { mutate: updateSession } = useUpdateSession();

  const handleToggleTodo = (sessionId: string, todos: SessionTodo[]) => {
    updateSession({ id: sessionId, dto: { todos } });
  };

  const [isEditOpen, setIsEditOpen] = useState(false);

  const linkedSessions = useMemo<SessionData[]>(() => {
    const res = rawSessions as SessionListResponse | null;
    const all: SessionData[] = Array.isArray(res)
      ? (res as SessionData[])
      : Array.isArray(res?.data)
        ? (res.data as SessionData[])
        : Array.isArray(res?.items)
          ? (res.items as SessionData[])
          : [];
    return all.filter((s) => s.linkedTo?.id === id);
  }, [rawSessions, id]);

  const loading = isProjectLoading || isStatsLoading;

  const chartData = useMemo(
    () =>
      (stats?.sessionFrequencyOverTime ?? []).map((d) => ({
        ...d,
        label: format(new Date(d.date), "MMM d"),
      })),
    [stats]
  );

  const handleUpdate = (values: ProjectFormValues) => {
    if (!id) return;
    updateProject({ id, dto: values }, { onSuccess: () => setIsEditOpen(false) });
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id, { onSuccess: () => navigate("/projects") });
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(sessionId);
    }
  };

  const status = project?.status ?? ProjectStatus.ACTIVE;
  const statusColor = STATUS_COLOR[status] ?? "var(--devlog-text-muted)";

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        {isProjectError ? (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                projectError,
                "Project not found or the backend server is unreachable."
              )}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {loading ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {project?.name}
                    </h1>
                    <span
                      className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
                      style={{
                        color: statusColor,
                        borderColor: statusColor,
                        backgroundColor: "var(--devlog-bg-elevated)",
                      }}
                    >
                      {status}
                    </span>
                  </div>
                )}
                <p className="text-sm mt-1 text-muted-foreground">
                  {loading
                    ? "Loading project details..."
                    : project?.description || project?.category || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                  disabled={loading}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-xl space-y-2 bg-bg-surface">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ))
              ) : (
                <>
                  <StatCard
                    label="Total Time"
                    value={formatDuration(stats?.totalTimeLogged?.totalDuration ?? 0)}
                    sublabel="Time logged across linked sessions"
                    icon={Clock}
                  />
                  <StatCard
                    label="Tasks Completed"
                    value={stats?.tasksCompleted?.totalCompleted ?? 0}
                    sublabel="Completed todos in linked sessions"
                    icon={CheckCircle2}
                  />
                </>
              )}
            </div>

            <div className="p-6 border border-border rounded-xl space-y-4 bg-bg-surface">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Session Frequency — Last 14 Days
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sessions logged per day against this project
                </p>
              </div>
              {loading ? (
                <div className="h-64 pt-8">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="projectAreaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--devlog-accent)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--devlog-accent)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--devlog-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke="var(--devlog-text-secondary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "var(--devlog-border)" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="var(--devlog-text-secondary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "var(--devlog-border)" }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const row = payload[0].payload;
                            return (
                              <div className="p-3 rounded-lg border border-border bg-bg-elevated text-foreground text-xs shadow-lg space-y-1">
                                <p className="font-semibold">{row.label}</p>
                                <p className="text-accent">
                                  {row.count} session{row.count === 1 ? "" : "s"}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--devlog-accent)"
                        strokeWidth={2}
                        fill="url(#projectAreaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Linked Sessions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sessions that were logged against this project
                </p>
              </div>
              {isSessionsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-border rounded-lg flex items-center gap-3 bg-bg-surface"
                  >
                    <Skeleton className="h-6 w-20 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))
              ) : linkedSessions.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No sessions linked yet"
                  description="Log a session against this project to track time here."
                />
              ) : (
                linkedSessions.map((session) => (
                  <SessionCard
                    key={session._id || session.id}
                    session={session}
                    onDelete={handleDeleteSession}
                    onToggleTodo={handleToggleTodo}
                  />
                ))
              )}
            </div>
          </>
        )}

        <ProjectDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          project={project}
          submitting={isUpdatePending}
          onSubmit={handleUpdate}
        />
      </div>
    </ErrorBoundary>
  );
}

export default ProjectDetailPage;
