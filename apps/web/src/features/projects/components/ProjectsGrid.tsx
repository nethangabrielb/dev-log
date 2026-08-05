import { FolderKanban, Plus, SearchX } from "lucide-react";
import type { Project } from "@/api/projects.api";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface ProjectsGridProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAdd: () => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

const GRID_CLASSES =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

export function ProjectsGrid({
  projects,
  loading,
  onEdit,
  onDelete,
  onAdd,
  onResetFilters,
  isFiltered = false,
}: ProjectsGridProps) {
  if (loading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 border border-border rounded-xl space-y-3 bg-bg-surface"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    if (isFiltered && onResetFilters) {
      return (
        <EmptyState
          icon={SearchX}
          title="No matching projects"
          description="Try adjusting your search query or status filter to see your projects."
          action={
            <Button
              onClick={onResetFilters}
              variant="outline"
              size="sm"
            >
              Clear filters
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to track time and tasks against it."
        action={
          <Button
            onClick={onAdd}
            className="gap-1.5 bg-accent text-accent-fg hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </Button>
        }
      />
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {projects.map((project) => (
        <ProjectCard
          key={project._id || project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
