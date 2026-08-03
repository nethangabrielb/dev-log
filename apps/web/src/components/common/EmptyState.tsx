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
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center rounded-xl border border-dashed border-border bg-bg-surface text-foreground">
      <div className="p-3 rounded-full border border-border bg-bg-elevated mb-3">
        <Icon className="h-6 w-6 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold tracking-tight mb-1 text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-sm mb-4 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
