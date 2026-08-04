import { client } from "./client";
import type {
  ProjectCategory,
  ProjectStatus,
  TasksCompleted,
  TotalTimeLogged,
} from "@devlog/types";

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  category: ProjectCategory;
  description?: string;
  status: ProjectStatus;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  category: ProjectCategory;
  description?: string;
  status?: ProjectStatus;
  tags?: string[];
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

export interface ProjectStats {
  totalTimeLogged: TotalTimeLogged;
  tasksCompleted: TasksCompleted;
  sessionFrequencyOverTime: { date: string; count: number }[];
}

export const projectsApi = {
  findAll: () => client.get<Project[]>("/projects").then((r) => r.data),

  findOne: (id: string) =>
    client.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (dto: CreateProjectDto) =>
    client.post<Project>("/projects", dto).then((r) => r.data),

  update: (id: string, dto: UpdateProjectDto) =>
    client.patch<Project>(`/projects/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    client.delete(`/projects/${id}`).then((r) => r.data),

  getStats: (id: string) =>
    client.get<ProjectStats>(`/projects/${id}/stats`).then((r) => r.data),
};
