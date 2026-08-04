import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  type CreateProjectDto,
  type Project,
  type ProjectStats,
  type UpdateProjectDto,
} from "@/api/projects.api";
import { keys } from "@/lib/queryKeys";

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

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
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
    },
  });
}
