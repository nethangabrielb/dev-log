import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
}

export function StatCard({ label, value, sublabel, icon: Icon }: StatCardProps) {
  return (
    <Card className="p-4 rounded-xl">
      <CardContent className="p-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            {label}
          </span>
          {Icon && (
            <Icon
              className="h-4 w-4 shrink-0"
              style={{ color: "var(--devlog-text-muted)" }}
            />
          )}
        </div>
        <div
          className="font-mono text-2xl font-bold tracking-tight"
          style={{ color: "var(--devlog-text-primary)" }}
        >
          {value}
        </div>
        {sublabel && (
          <p
            className="text-xs"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            {sublabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
