import { client } from "./client";
import type { Paginated, Pagination } from "./pagination";
import type {
  CreateSessionDto,
  SessionFilters,
  SessionTodo,
  SessionType,
} from "@devlog/types";

export interface Session {
  _id?: string;
  id?: string;
  type: SessionType;
  durationInSeconds: number;
  startedAt: string;
  endedAt: string;
  todos?: SessionTodo[];
  linkedTo?: {
    kind?: string;
    id?: string;
    name?: string;
  };
}

export const sessionsApi = {
  findAll: (filters?: SessionFilters & Pagination) =>
    client.get<Paginated<Session>>("/sessions", { params: filters }).then((r) => r.data),

  findOne: (id: string) => client.get(`/sessions/${id}`).then((r) => r.data),

  create: (dto: CreateSessionDto) =>
    client.post("/sessions", dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateSessionDto>) =>
    client.patch(`/sessions/${id}`, dto).then((r) => r.data),

  remove: (id: string) => client.delete(`/sessions/${id}`).then((r) => r.data),

  getStats: () => client.get("/sessions/statistics").then((r) => r.data),

  getStreaks: () => client.get("/sessions/streaks").then((r) => r.data),
};
