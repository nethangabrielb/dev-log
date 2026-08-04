import { Edit3, Trash2 } from "lucide-react";
import type { Snippet } from "@/api/snippets.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LANGUAGE_COLOR, CATEGORY_COLOR } from "./snippetColors";

export interface SnippetCardProps {
  snippet: Snippet;
  onOpen: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippet: Snippet) => void;
}

export function SnippetCard({
  snippet,
  onOpen,
  onEdit,
  onDelete,
}: SnippetCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all hover:ring-accent/50 flex flex-col"
      onClick={() => onOpen(snippet)}
    >
      <CardContent className="space-y-2.5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight truncate text-foreground">
              {snippet.title}
            </h3>
          </div>
          <span
            className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: LANGUAGE_COLOR[snippet.language],
              borderColor: LANGUAGE_COLOR[snippet.language],
              backgroundColor: "var(--devlog-bg-elevated)",
            }}
          >
            {snippet.language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: CATEGORY_COLOR[snippet.category],
              borderColor: CATEGORY_COLOR[snippet.category],
              backgroundColor: "var(--devlog-bg-elevated)",
            }}
          >
            {snippet.category}
          </span>
        </div>

        <pre
          className="flex-1 p-3 rounded-lg border border-border overflow-hidden text-xs leading-relaxed"
          style={{
            fontFamily: "var(--font-mono)",
            backgroundColor: "var(--devlog-bg-elevated)",
            color: "var(--devlog-text-secondary)",
            maxHeight: "9rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {snippet.content}
        </pre>

        <div className="flex items-center justify-between gap-3 pt-1">
          {snippet.description ? (
            <p className="text-xs text-muted-foreground line-clamp-1 min-w-0">
              {snippet.description}
            </p>
          ) : (
            <span />
          )}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(snippet)}
              title="Edit snippet"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(snippet)}
              className="text-danger"
              title="Delete snippet"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
