import { ProjectCategory, ProjectStatus } from "@devlog/types";

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  ProjectStatus.ACTIVE,
  ProjectStatus.PAUSED,
  ProjectStatus.COMPLETED,
  ProjectStatus.ARCHIVED,
];

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "#4ade80",
  [ProjectStatus.PAUSED]: "#f4c542",
  [ProjectStatus.COMPLETED]: "#5b9bd9",
  [ProjectStatus.ARCHIVED]: "var(--devlog-text-muted)",
};

export const PROJECT_CATEGORY_COLOR: Record<ProjectCategory, string> = {
  [ProjectCategory.PERSONAL]: "var(--devlog-accent)",
  [ProjectCategory.ACADEMIC]: "#5b9bd9",
  [ProjectCategory.PROFESSIONAL]: "#4ade80",
  [ProjectCategory.OPEN_SOURCE]: "#f87171",
  [ProjectCategory.OTHER]: "var(--devlog-text-muted)",
};

export function projectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLOR[status] ?? "var(--devlog-text-muted)";
}

export function projectCategoryColor(category: ProjectCategory): string {
  return PROJECT_CATEGORY_COLOR[category] ?? "var(--devlog-text-muted)";
}
