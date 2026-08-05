import { Search, X } from "lucide-react";
import { ProjectStatus } from "@devlog/types";

export interface ProjectFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  statusCounts: Record<string, number>;
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Active", value: ProjectStatus.ACTIVE },
  { label: "Paused", value: ProjectStatus.PAUSED },
  { label: "Completed", value: ProjectStatus.COMPLETED },
  { label: "Archived", value: ProjectStatus.ARCHIVED },
];

export function ProjectFilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  statusCounts,
}: ProjectFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects by name, description, category, tags..."
          className="w-full pl-9 pr-8 py-1.5 text-xs font-sans rounded-md border border-border bg-bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const isSelected = selectedStatus === tab.value;
          const count = statusCounts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className="px-2.5 py-1 text-xs font-mono rounded-md border font-medium transition-colors cursor-pointer flex items-center gap-1.5"
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
              <span>{tab.label}</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px] opacity-80"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(0, 0, 0, 0.2)"
                    : "var(--devlog-border-subtle)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
