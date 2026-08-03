import { SessionType } from "@devlog/types";

export const SESSION_TYPE_COLOR: Record<SessionType, string> = {
  [SessionType.PROJECT]: "var(--devlog-accent)",
  [SessionType.DSA]: "#4ade80",
  [SessionType.STUDY]: "#60a5fa",
  [SessionType.ARTICLE]: "#fbbf24",
  [SessionType.OTHER]: "var(--devlog-text-muted)",
};

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(iso: string, tz = "Asia/Manila"): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: tz,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatRelativeDay(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}
