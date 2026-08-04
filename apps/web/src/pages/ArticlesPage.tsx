import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { ArticleStatus } from "@devlog/types";
import type { Article } from "@/api/articles.api";
import {
  useArticles,
  useArticleStats,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from "@/features/articles/hooks/useArticles";
import { ArticleStatsStrip } from "@/features/articles/components/ArticleStatsStrip";
import { ArticleList } from "@/features/articles/components/ArticleList";
import { ArticleSheet } from "@/features/articles/components/ArticleSheet";
import { ArticleDialog } from "@/features/articles/components/ArticleDialog";
import type { ArticleFormValues } from "@/features/articles/schemas/article.schema";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getApiErrorMessage } from "@/lib/apiError";

export function ArticlesPage() {
  const { data: rawArticles, isLoading, isError, error } = useArticles();
  const { data: stats, isLoading: isStatsLoading } = useArticleStats();
  const { mutate: createArticle, isPending: isCreatePending } =
    useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdatePending } =
    useUpdateArticle();
  const { mutate: deleteArticle } = useDeleteArticle();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);

  const articles = useMemo<Article[]>(() => {
    if (Array.isArray(rawArticles)) return rawArticles;
    return [];
  }, [rawArticles]);

  const handleCreate = (values: ArticleFormValues) => {
    createArticle(values, { onSuccess: () => setIsSheetOpen(false) });
  };

  const handleUpdate = (values: ArticleFormValues) => {
    if (!editing) return;
    const id = editing._id || editing.id || "";
    if (!id) return;
    updateArticle({ id, dto: values }, { onSuccess: () => setEditing(null) });
  };

  const handleMarkRead = (article: Article) => {
    const id = article._id || article.id || "";
    if (!id) return;
    if (article.status === ArticleStatus.READ) return;
    updateArticle({ id, dto: { status: ArticleStatus.READ } });
  };

  const handleDelete = (article: Article) => {
    const id = article._id || article.id || "";
    if (!id) return;
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticle(id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Manage your reading list and track reading progress
            </p>
          </div>
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="gap-2 bg-accent text-accent-fg hover:bg-accent-dim"
          >
            <Plus className="h-4 w-4" />
            <span>Add Article</span>
          </Button>
        </div>

        {isError && (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                error,
                "Failed to load articles. Make sure the backend server is running."
              )}
            </span>
          </div>
        )}

        <ArticleStatsStrip stats={stats} loading={isStatsLoading} />

        <ArticleList
          articles={articles}
          loading={isLoading}
          onMarkRead={handleMarkRead}
          onEdit={setEditing}
          onDelete={handleDelete}
          onAdd={() => setIsSheetOpen(true)}
        />

        <ArticleSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          submitting={isCreatePending}
          onSubmit={handleCreate}
        />
        <ArticleDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          article={editing ?? undefined}
          submitting={isUpdatePending}
          onSubmit={handleUpdate}
        />
      </div>
    </ErrorBoundary>
  );
}

export default ArticlesPage;
