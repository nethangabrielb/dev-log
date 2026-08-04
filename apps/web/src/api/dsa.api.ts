import { client } from "./client";
import type {
  ConfidenceLevel,
  Difficulty,
  DsaPattern,
  DsaStatistics,
} from "@devlog/types";

export interface DsaRecord {
  _id?: string;
  id?: string;
  problemName: string;
  problemNumber: number;
  difficulty: Difficulty;
  pattern: DsaPattern;
  isSolved: boolean;
  solvedAt?: string | null;
  confidenceLevel: ConfidenceLevel;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDsaDto {
  problemName: string;
  problemNumber: number;
  difficulty: Difficulty;
  pattern: DsaPattern;
  isSolved?: boolean;
  solvedAt?: Date | string;
  confidenceLevel: ConfidenceLevel;
  notes?: string;
}

export type UpdateDsaDto = Partial<CreateDsaDto>;

export interface DsaFilters {
  difficulty?: Difficulty;
}

export const dsaApi = {
  findAll: (filters?: DsaFilters) =>
    client.get("/dsa", { params: filters }).then((r) => r.data),

  findOne: (id: string) => client.get(`/dsa/${id}`).then((r) => r.data),

  create: (dto: CreateDsaDto) => client.post("/dsa", dto).then((r) => r.data),

  update: (id: string, dto: UpdateDsaDto) =>
    client.patch(`/dsa/${id}`, dto).then((r) => r.data),

  remove: (id: string) => client.delete(`/dsa/${id}`).then((r) => r.data),

  getStats: () => client.get<DsaStatistics>("/dsa/statistics").then((r) => r.data),
};
