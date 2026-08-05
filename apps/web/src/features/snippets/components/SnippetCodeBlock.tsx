import { useEffect, useState } from "react";
import type { SnippetLanguage } from "@devlog/types";
import { CopyButton } from "@/components/common/CopyButton";

export interface SnippetCodeBlockProps {
  code: string;
  language: SnippetLanguage;
  maxHeight?: string;
  wrap?: boolean;
  showCopy?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function SnippetCodeBlock({
  code,
  language,
  maxHeight,
  wrap = false,
  showCopy = true,
}: SnippetCodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("../lib/snippetHighlight")
      .then(({ highlightCode }) => highlightCode(code, language))
      .then((html) => {
        if (isMounted) {
          setHighlightedHtml(html);
        }
      })
      .catch((err) => {
        console.error("Error loading code highlighter:", err);
        if (isMounted) {
          setHighlightedHtml(
            `<pre class="shiki devlog-theme"><code>${escapeHtml(code)}</code></pre>`
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  const fallbackHtml = `<pre class="shiki devlog-theme"><code>${escapeHtml(code)}</code></pre>`;

  return (
    <div
      className="relative group/code rounded-lg border border-border overflow-hidden text-xs leading-relaxed flex-1 flex flex-col"
      style={{
        backgroundColor: "var(--devlog-bg-elevated)",
      }}
    >
      {showCopy && (
        <div className="absolute top-2 right-2 z-10 opacity-80 group-hover/code:opacity-100 transition-opacity">
          <CopyButton value={code} />
        </div>
      )}
      <div
        className="flex-1 [&_pre]:m-0 [&_pre]:p-3 [&_pre]:bg-transparent! [&_code]:font-mono"
        style={{
          fontFamily: "var(--font-mono)",
          maxHeight: maxHeight || "none",
          overflowY: maxHeight ? "auto" : "visible",
          overflowX: wrap ? "hidden" : "auto",
          whiteSpace: wrap ? "pre-wrap" : "pre",
          wordBreak: wrap ? "break-word" : "normal",
        }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml ?? fallbackHtml }}
      />
    </div>
  );
}
