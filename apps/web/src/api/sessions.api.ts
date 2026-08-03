import { client } from "./client";

export const sessionsApi = {
  findAll: (filters?: Record<string, any>) =>
    client.get("/sessions", { params: filters }).then((r) => r.data),

  findOne: (id: string) => client.get(`/sessions/${id}`).then((r) => r.data),

  create: (dto: any) => client.post("/sessions", dto).then((r) => r.data),

  update: (id: string, dto: any) =>
    client.patch(`/sessions/${id}`, dto).then((r) => r.data),

  remove: (id: string) => client.delete(`/sessions/${id}`).then((r) => r.data),

  getStats: () => client.get("/sessions/statistics").then((r) => r.data),

  getStreaks: () => client.get("/sessions/streaks").then((r) => r.data),
};
