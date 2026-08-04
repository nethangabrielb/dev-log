import { client } from "./client";
import type { SnippetCategory, SnippetLanguage } from "@devlog/types";

export interface Snippet {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  content: string;
  language: SnippetLanguage;
  category: SnippetCategory;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSnippetDto {
  title: string;
  content: string;
  description?: string;
  language: SnippetLanguage;
  category: SnippetCategory;
  tags?: string[];
}

export type UpdateSnippetDto = Partial<CreateSnippetDto>;

export const snippetsApi = {
  findAll: () => client.get<Snippet[]>("/snippets").then((r) => r.data),

  findOne: (id: string) =>
    client.get<Snippet>(`/snippets/${id}`).then((r) => r.data),

  create: (dto: CreateSnippetDto) =>
    client.post<Snippet>("/snippets", dto).then((r) => r.data),

  update: (id: string, dto: UpdateSnippetDto) =>
    client.patch<Snippet>(`/snippets/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    client.delete(`/snippets/${id}`).then((r) => r.data),
};
