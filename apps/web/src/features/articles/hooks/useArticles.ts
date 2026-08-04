import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { ArticleStatus } from "@devlog/types";
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

function applyToArticlesCache(
  qc: QueryClient,
  mutate: (article: Article) => Article | null
) {
  for (const [queryKey] of qc.getQueriesData({ queryKey: ["articles"] })) {
    qc.setQueryData(queryKey, (old: unknown) => {
      if (!Array.isArray(old)) return old;
      return old
        .map(mutate)
        .filter((a): a is Article => a !== null);
    });
  }
}

function refetchArticlesDependents(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["articles"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateArticleDto) => articlesApi.create(dto),
    onMutate: async (dto: CreateArticleDto) => {
      await qc.cancelQueries({ queryKey: ["articles"] });
      const previous = qc.getQueriesData({ queryKey: ["articles"] });
      const tempId = `temp-${Date.now()}`;
      const optimistic: Article = {
        _id: tempId,
        ...dto,
        status: dto.status ?? ArticleStatus.UNREAD,
      };
      for (const [queryKey] of previous) {
        qc.setQueryData(queryKey, (old: unknown) => {
          if (!Array.isArray(old)) return old;
          if (old.some((a) => (a._id || a.id) === tempId)) return old;
          return [optimistic, ...old];
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      refetchArticlesDependents(qc);
    },
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateArticleDto }) =>
      articlesApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: ["articles"] });
      const previous = qc.getQueriesData({ queryKey: ["articles"] });
      applyToArticlesCache(qc, (article) => {
        const articleId = article._id || article.id;
        if (articleId !== id) return article;
        return { ...article, ...dto } as Article;
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      refetchArticlesDependents(qc);
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["articles"] });
      const previous = qc.getQueriesData({ queryKey: ["articles"] });
      applyToArticlesCache(qc, (article) =>
        article._id === id || article.id === id ? null : article
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      refetchArticlesDependents(qc);
    },
  });
}
