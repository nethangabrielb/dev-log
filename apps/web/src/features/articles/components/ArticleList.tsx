import { useMemo, useState } from "react";
import { BookOpen, Plus, SearchX } from "lucide-react";
import { ArticleStatus } from "@devlog/types";
import type { Article } from "@/api/articles.api";
import { ArticleCard } from "./ArticleCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  onMarkRead: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onAdd: () => void;
}

const TABS: { label: string; status?: ArticleStatus }[] = [
  { label: "All" },
  { label: "Unread", status: ArticleStatus.UNREAD },
  { label: "In Progress", status: ArticleStatus.READING },
  { label: "Read", status: ArticleStatus.READ },
];

export function ArticleList({
  articles,
  loading,
  onMarkRead,
  onEdit,
  onDelete,
  onAdd,
}: ArticleListProps) {
  const [activeTab, setActiveTab] = useState<string>("All");

  const filtered = useMemo(() => {
    const tab = TABS.find((t) => t.label === activeTab);
    if (!tab?.status) return articles;
    return articles.filter((a) => a.status === tab.status);
  }, [articles, activeTab]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 border border-border rounded-lg flex items-center justify-between bg-bg-surface"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className="px-2.5 py-1 text-xs font-mono rounded-md border font-medium transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: isSelected
                  ? "var(--devlog-accent)"
                  : "var(--devlog-bg-elevated)",
                color: isSelected
                  ? "var(--devlog-accent-fg)"
                  : "var(--devlog-text-primary)",
                borderColor: "var(--devlog-border)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles yet"
          description="Add articles to your reading list to start tracking them."
          action={
            <Button
              onClick={onAdd}
              className="gap-1.5 bg-accent text-accent-fg hover:bg-accent-dim"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Article</span>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No ${activeTab.toLowerCase()} articles yet`}
          description="Try a different filter to see your reading list."
        />
      ) : (
        filtered.map((article) => (
          <ArticleCard
            key={article._id || article.id}
            article={article}
            onMarkRead={onMarkRead}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
