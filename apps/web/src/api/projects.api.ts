import { client } from "./client";

export const projectsApi = {
  findAll: () => client.get("/projects").then((r) => r.data),
  findOne: (id: string) => client.get(`/projects/${id}`).then((r) => r.data),
  create: (dto: any) => client.post("/projects", dto).then((r) => r.data),
  update: (id: string, dto: any) =>
    client.patch(`/projects/${id}`, dto).then((r) => r.data),
  remove: (id: string) => client.delete(`/projects/${id}`).then((r) => r.data),
  getStats: (id: string) =>
    client.get(`/projects/${id}/statistics`).then((r) => r.data),
};
