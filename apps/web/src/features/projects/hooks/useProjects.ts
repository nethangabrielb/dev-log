import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProjectsStatistics } from "@devlog/types";
import {
  projectsApi,
  type CreateProjectDto,
  type Project,
  type ProjectStats,
  type UpdateProjectDto,
} from "@/api/projects.api";
import { keys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/apiError";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: keys.projects.all(),
    queryFn: projectsApi.findAll,
  });
}

export function useProject(id?: string) {
  return useQuery<Project>({
    queryKey: keys.projects.one(id ?? ""),
    queryFn: () => projectsApi.findOne(id ?? ""),
    enabled: !!id,
  });
}

export function useProjectStats(id?: string) {
  return useQuery<ProjectStats>({
    queryKey: keys.projects.stats(id ?? ""),
    queryFn: () => projectsApi.getStats(id ?? ""),
    enabled: !!id,
  });
}

export function useProjectsStatistics() {
  return useQuery<ProjectsStatistics>({
    queryKey: keys.projects.statsAll(),
    queryFn: projectsApi.getStatistics,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create project"));
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      projectsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update project"));
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete project"));
    },
  });
}
