import { useNavigate } from "react-router-dom";
import { Clock, Edit3, Trash2 } from "lucide-react";
import type { Project } from "@/api/projects.api";
import { ProjectStatus } from "@devlog/types";
import { useProjectStats } from "../hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/formatters";

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const STATUS_COLOR: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "#4ade80",
  [ProjectStatus.PAUSED]: "#f4c542",
  [ProjectStatus.COMPLETED]: "#5b9bd9",
  [ProjectStatus.ARCHIVED]: "var(--devlog-text-muted)",
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const id = project._id || project.id || "";
  const status = project.status ?? ProjectStatus.ACTIVE;
  const statusColor = STATUS_COLOR[status] ?? "var(--devlog-text-muted)";

  const { data: stats, isLoading: isStatsLoading } = useProjectStats(id);
  const totalDuration = stats?.totalTimeLogged?.totalDuration ?? 0;

  return (
    <Card
      className="group cursor-pointer transition-all hover:ring-accent/50"
      onClick={() => navigate(`/projects/${id}`)}
    >
      <CardContent className="flex h-full flex-col space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight truncate text-foreground">
              {project.name}
            </h3>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              {project.category}
            </p>
          </div>
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

        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {isStatsLoading ? "—" : formatDuration(totalDuration)}
          </div>
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(project)}
              title="Edit project"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(project)}
              className="text-danger"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
