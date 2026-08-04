import { useEffect, useMemo, useState } from "react";
import { Search, Plus, FileCode } from "lucide-react";
import type { Snippet } from "@/api/snippets.api";
import { SnippetCard } from "./SnippetCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SnippetGridProps {
  snippets: Snippet[];
  loading: boolean;
  onOpen: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
  onAdd: () => void;
}

const GRID_CLASSES =
  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";

export function SnippetGrid({
  snippets,
  loading,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
}: SnippetGridProps) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return snippets;
    return snippets.filter((s) =>
      [
        s.title,
        s.content,
        s.description ?? "",
        s.language,
        s.category,
        ...(s.tags ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [snippets, debounced]);

  if (loading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 border border-border rounded-xl space-y-3 bg-bg-surface"
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--devlog-text-muted)" }}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search snippets by title, code, language, or tags..."
          className="pl-9"
        />
      </div>

      {snippets.length === 0 ? (
        <EmptyState
          icon={FileCode}
          title="No snippets yet"
          description="Save code snippets you reference often and keep them searchable."
          action={
            <Button
              onClick={onAdd}
              className="gap-1.5 bg-accent text-accent-fg hover:bg-accent-dim"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Snippet</span>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center border border-dashed border-border rounded-xl bg-bg-surface">
          No snippets match "{debounced}".
        </p>
      ) : (
        <div className={GRID_CLASSES}>
          {filtered.map((snippet) => (
            <SnippetCard
              key={snippet._id || snippet.id}
              snippet={snippet}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
