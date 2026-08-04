import { CheckCircle2, Edit3, Trash2 } from "lucide-react";
import { ArticleCategory, ArticleStatus } from "@devlog/types";
import type { Article } from "@/api/articles.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeDay } from "@/lib/formatters";

export interface ArticleCardProps {
  article: Article;
  onMarkRead: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

const CATEGORY_COLOR: Record<ArticleCategory, string> = {
  [ArticleCategory.DSA]: "#4ade80",
  [ArticleCategory.FRONTEND]: "var(--devlog-accent)",
  [ArticleCategory.BACKEND]: "#5b9bd9",
  [ArticleCategory.FULLSTACK]: "#c084fc",
  [ArticleCategory.AI]: "#f472b6",
  [ArticleCategory.CAREER]: "#f4c542",
  [ArticleCategory.CLOUD]: "#38bdf8",
  [ArticleCategory.OTHER]: "var(--devlog-text-muted)",
};

const STATUS_COLOR: Record<ArticleStatus, string> = {
  [ArticleStatus.UNREAD]: "var(--devlog-text-muted)",
  [ArticleStatus.READING]: "#f4c542",
  [ArticleStatus.READ]: "#4ade80",
};

export function ArticleCard({
  article,
  onMarkRead,
  onEdit,
  onDelete,
}: ArticleCardProps) {
  const status = article.status ?? ArticleStatus.UNREAD;
  const categoryColor =
    CATEGORY_COLOR[article.category] ?? "var(--devlog-text-muted)";
  const statusColor = STATUS_COLOR[status] ?? "var(--devlog-text-muted)";

  return (
    <Card className="group transition-all">
      <CardContent className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-semibold tracking-tight text-foreground truncate block hover:text-accent transition-colors"
          >
            {article.title}
          </a>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                color: categoryColor,
                borderColor: categoryColor,
                backgroundColor: "var(--devlog-bg-elevated)",
              }}
            >
              {article.category}
            </span>
            {article.readAt && (
              <span className="text-xs font-mono text-muted-foreground">
                Read {formatRelativeDay(article.readAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status !== ArticleStatus.READ && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(article)}
              className="gap-1.5 text-xs border border-border"
              title="Mark as read"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Mark as read
            </Button>
          )}
          <span
            className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
            style={{
              color: statusColor,
              borderColor: statusColor,
              backgroundColor: "var(--devlog-bg-elevated)",
            }}
          >
            {status}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(article)}
              title="Edit article"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(article)}
              className="text-danger"
              title="Delete article"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
