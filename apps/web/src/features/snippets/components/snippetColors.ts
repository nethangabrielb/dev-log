import { SnippetCategory, SnippetLanguage } from "@devlog/types";

export const LANGUAGE_COLOR: Record<SnippetLanguage, string> = {
  [SnippetLanguage.TYPESCRIPT]: "#5b9bd9",
  [SnippetLanguage.JAVASCRIPT]: "#f4c542",
  [SnippetLanguage.BASH]: "#4ade80",
  [SnippetLanguage.SQL]: "#f472b6",
  [SnippetLanguage.HTML]: "#c084fc",
  [SnippetLanguage.CSS]: "#38bdf8",
  [SnippetLanguage.JSON]: "#f4c542",
  [SnippetLanguage.YAML]: "#e879f9",
  [SnippetLanguage.PYTHON]: "#4ade80",
  [SnippetLanguage.OTHER]: "var(--devlog-text-muted)",
};

export const CATEGORY_COLOR: Record<SnippetCategory, string> = {
  [SnippetCategory.PATTERN]: "#5b9bd9",
  [SnippetCategory.COMMAND]: "#4ade80",
  [SnippetCategory.CONFIG]: "#f4c542",
  [SnippetCategory.REFERENCE]: "#38bdf8",
  [SnippetCategory.SNIPPET]: "var(--devlog-accent)",
  [SnippetCategory.OTHER]: "var(--devlog-text-muted)",
};
