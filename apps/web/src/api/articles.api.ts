import { client } from "./client";
import type {
  ArticleCategory,
  ArticleStatus,
  ArticlesStatistics,
} from "@devlog/types";

export interface Article {
  _id?: string;
  id?: string;
  url: string;
  title: string;
  category: ArticleCategory;
  readAt?: string | null;
  tags?: string[];
  status?: ArticleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateArticleDto {
  url: string;
  title: string;
  category: ArticleCategory;
  tags?: string[];
  status?: ArticleStatus;
}

export type UpdateArticleDto = Partial<CreateArticleDto>;

export const articlesApi = {
  findAll: () => client.get<Article[]>("/articles").then((r) => r.data),

  findOne: (id: string) =>
    client.get<Article>(`/articles/${id}`).then((r) => r.data),

  create: (dto: CreateArticleDto) =>
    client.post<Article>("/articles", dto).then((r) => r.data),

  update: (id: string, dto: UpdateArticleDto) =>
    client.patch<Article>(`/articles/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    client.delete(`/articles/${id}`).then((r) => r.data),

  getStats: () =>
    client.get<ArticlesStatistics>("/articles/statistics").then((r) => r.data),
};
