import type { Snippet } from "@/api/snippets.api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LANGUAGE_COLOR, CATEGORY_COLOR } from "./snippetColors";

export interface SnippetViewSheetProps {
  snippet: Snippet | null;
  onOpenChange: (open: boolean) => void;
}

export function SnippetViewSheet({
  snippet,
  onOpenChange,
}: SnippetViewSheetProps) {
  const open = !!snippet;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl">
        {snippet && (
          <>
            <SheetHeader>
              <SheetTitle className="truncate">{snippet.title}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
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
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              {snippet.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {snippet.description}
                </p>
              )}

              <pre
                className="p-4 rounded-lg border border-border overflow-x-auto text-xs leading-relaxed"
                style={{
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "var(--devlog-bg-elevated)",
                  color: "var(--devlog-text-primary)",
                  whiteSpace: "pre",
                }}
              >
                {snippet.content}
              </pre>

              {snippet.tags && snippet.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 mt-4">
                  {snippet.tags.map((tag, index) => (
                    <li
                      key={`${tag}-${index}`}
                      className="px-2 py-0.5 rounded-md border border-border bg-bg-elevated text-xs font-mono text-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
