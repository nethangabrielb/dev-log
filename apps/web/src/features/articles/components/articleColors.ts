import { ArticleCategory } from "@devlog/types";

export const ARTICLE_CATEGORY_COLOR: Record<ArticleCategory, string> = {
  [ArticleCategory.DSA]: "#4ade80",
  [ArticleCategory.FRONTEND]: "#5b9bd9",
  [ArticleCategory.BACKEND]: "#f87171",
  [ArticleCategory.FULLSTACK]: "#a78bfa",
  [ArticleCategory.AI]: "#22d3ee",
  [ArticleCategory.CAREER]: "#f4c542",
  [ArticleCategory.CLOUD]: "#34d399",
  [ArticleCategory.OTHER]: "var(--devlog-text-muted)",
};

export function articleCategoryColor(category: ArticleCategory): string {
  return ARTICLE_CATEGORY_COLOR[category] ?? "var(--devlog-text-muted)";
}
