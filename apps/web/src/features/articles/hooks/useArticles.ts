import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  articlesApi,
  type Article,
  type CreateArticleDto,
  type UpdateArticleDto,
} from "@/api/articles.api";
import { keys } from "@/lib/queryKeys";

export function useArticles() {
  return useQuery<Article[]>({
    queryKey: keys.articles.all(),
    queryFn: articlesApi.findAll,
  });
}

export function useArticleStats() {
  return useQuery({
    queryKey: keys.articles.stats(),
    queryFn: articlesApi.getStats,
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateArticleDto) => articlesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateArticleDto }) =>
      articlesApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
