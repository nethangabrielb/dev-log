import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { ProjectStatus } from "@devlog/types";
import type { Project } from "@/api/projects.api";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";
import { ProjectsGrid } from "@/features/projects/components/ProjectsGrid";
import { ProjectFilterBar } from "@/features/projects/components/ProjectFilterBar";
import { ProjectSheet } from "@/features/projects/components/ProjectSheet";
import { ProjectDialog } from "@/features/projects/components/ProjectDialog";
import type { ProjectFormValues } from "@/features/projects/schemas/project.schema";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getApiErrorMessage } from "@/lib/apiError";

export function ProjectsPage() {
  const { data: rawProjects, isLoading, isError, error } = useProjects();
  const { mutate: createProject, isPending: isCreatePending } =
    useCreateProject();
  const { mutate: updateProject, isPending: isUpdatePending } =
    useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const rawProjectsList = useMemo<Project[]>(() => {
    return rawProjects?.data ?? [];
  }, [rawProjects]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: rawProjectsList.length,
      [ProjectStatus.ACTIVE]: 0,
      [ProjectStatus.PAUSED]: 0,
      [ProjectStatus.COMPLETED]: 0,
      [ProjectStatus.ARCHIVED]: 0,
    };
    for (const proj of rawProjectsList) {
      if (proj.status && counts[proj.status] !== undefined) {
        counts[proj.status]++;
      }
    }
    return counts;
  }, [rawProjectsList]);

  const filteredProjects = useMemo<Project[]>(() => {
    return rawProjectsList.filter((project) => {
      // 1. Status filter check
      if (statusFilter !== "All" && project.status !== statusFilter) {
        return false;
      }

      // 2. Search query check (name, description, category, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = project.name?.toLowerCase().includes(q);
        const matchDesc = project.description?.toLowerCase().includes(q);
        const matchCategory = project.category?.toLowerCase().includes(q);
        const matchTags = project.tags?.some((tag) =>
          tag.toLowerCase().includes(q)
        );

        return Boolean(matchName || matchDesc || matchCategory || matchTags);
      }

      return true;
    });
  }, [rawProjectsList, statusFilter, searchQuery]);

  const isFiltered = searchQuery !== "" || statusFilter !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
  };

  const handleCreate = (values: ProjectFormValues) => {
    createProject(values, { onSuccess: () => setIsSheetOpen(false) });
  };

  const handleUpdate = (values: ProjectFormValues) => {
    if (!editing) return;
    const id = editing._id || editing.id || "";
    if (!id) return;
    updateProject({ id, dto: values }, { onSuccess: () => setEditing(null) });
  };

  const handleDelete = (project: Project) => {
    const id = project._id || project.id || "";
    if (!id) return;
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Browse your projects and the time logged against them
            </p>
          </div>
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="gap-2 bg-accent text-accent-fg hover:bg-accent-dim"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>

        {isError && (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                error,
                "Failed to load projects. Make sure the backend server is running."
              )}
            </span>
          </div>
        )}

        <ProjectFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          statusCounts={statusCounts}
        />

        <ProjectsGrid
          projects={filteredProjects}
          loading={isLoading}
          onEdit={setEditing}
          onDelete={handleDelete}
          onAdd={() => setIsSheetOpen(true)}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />

        <ProjectSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          submitting={isCreatePending}
          onSubmit={handleCreate}
        />
        <ProjectDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          project={editing ?? undefined}
          submitting={isUpdatePending}
          onSubmit={handleUpdate}
        />
      </div>
    </ErrorBoundary>
  );
}

export default ProjectsPage;
