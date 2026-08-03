import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8 py-16 text-center rounded-xl border border-dashed"
      style={{
        backgroundColor: "var(--devlog-bg-surface)",
        borderColor: "var(--devlog-border)",
        color: "var(--devlog-text-primary)",
      }}
    >
      <div
        className="p-3 rounded-full border mb-3"
        style={{
          backgroundColor: "var(--devlog-bg-elevated)",
          borderColor: "var(--devlog-border)",
        }}
      >
        <Icon
          className="h-6 w-6"
          style={{ color: "var(--devlog-text-muted)" }}
        />
      </div>
      <h3
        className="text-base font-semibold tracking-tight mb-1"
        style={{ color: "var(--devlog-text-primary)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-sm mb-4"
          style={{ color: "var(--devlog-text-secondary)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
