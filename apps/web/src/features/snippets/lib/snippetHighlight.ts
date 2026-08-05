import { createHighlighter, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { devlogTheme } from "./devlogTheme";
import { SnippetLanguage } from "@devlog/types";

const LANG_MAP: Record<SnippetLanguage, string | null> = {
  [SnippetLanguage.TYPESCRIPT]: "typescript",
  [SnippetLanguage.JAVASCRIPT]: "javascript",
  [SnippetLanguage.BASH]: "bash",
  [SnippetLanguage.SQL]: "sql",
  [SnippetLanguage.HTML]: "html",
  [SnippetLanguage.CSS]: "css",
  [SnippetLanguage.JSON]: "json",
  [SnippetLanguage.YAML]: "yaml",
  [SnippetLanguage.PYTHON]: "python",
  [SnippetLanguage.OTHER]: null,
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [devlogTheme],
      langs: [
        "typescript",
        "javascript",
        "bash",
        "sql",
        "html",
        "css",
        "json",
        "yaml",
        "python",
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function highlightCode(
  code: string,
  language: SnippetLanguage
): Promise<string> {
  const shikiLang = LANG_MAP[language];
  if (!shikiLang) {
    return `<pre class="shiki devlog-theme"><code>${escapeHtml(code)}</code></pre>`;
  }

  try {
    const highlighter = await getHighlighterInstance();
    return highlighter.codeToHtml(code, {
      lang: shikiLang,
      theme: "devlog-theme",
    });
  } catch (err) {
    console.error("Shiki highlighting failed:", err);
    return `<pre class="shiki devlog-theme"><code>${escapeHtml(code)}</code></pre>`;
  }
}
