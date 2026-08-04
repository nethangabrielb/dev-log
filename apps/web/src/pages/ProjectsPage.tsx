import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import type { Project } from "@/api/projects.api";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";
import { ProjectsGrid } from "@/features/projects/components/ProjectsGrid";
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

  const projects = useMemo<Project[]>(() => {
    if (Array.isArray(rawProjects)) return rawProjects;
    return [];
  }, [rawProjects]);

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

        <ProjectsGrid
          projects={projects}
          loading={isLoading}
          onEdit={setEditing}
          onDelete={handleDelete}
          onAdd={() => setIsSheetOpen(true)}
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
