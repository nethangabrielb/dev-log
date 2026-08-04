import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { SessionType } from "@devlog/types";
import type { DailyReport } from "@/api/daily-reports.api";
import { Card, CardContent } from "@/components/ui/card";
import { DailyReportChart } from "./DailyReportChart";
import { formatDate, formatDuration, formatRelativeDay, SESSION_TYPE_COLOR } from "@/lib/formatters";

export interface DailyReportCardProps {
  report: DailyReport;
  onMarkRead: (date: string) => void;
}

function colorForType(type: string): string {
  return SESSION_TYPE_COLOR[type as SessionType] ?? "var(--devlog-text-muted)";
}

export function DailyReportCard({ report, onMarkRead }: DailyReportCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isRead = report.isRead === true;

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !isRead) {
      onMarkRead(report.date);
    }
  };

  return (
    <Card className={expanded ? "border-border" : ""}>
      <CardContent>
        <button
          type="button"
          onClick={handleToggle}
          className="w-full text-left flex items-center gap-3 cursor-pointer"
          aria-expanded={expanded}
        >
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              isRead ? "bg-transparent" : "bg-accent"
            }`}
            aria-hidden
          />
          <span className="font-mono text-sm font-medium text-foreground shrink-0">
            {formatRelativeDay(report.date)}
          </span>
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {formatDate(report.date)}
          </span>
          <span
            className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
            style={{
              color: colorForType(report.topSessionType),
              borderColor: colorForType(report.topSessionType),
              backgroundColor: "var(--devlog-bg-elevated)",
            }}
          >
            {report.topSessionType}
          </span>
          <span className="ml-auto flex items-center gap-3 shrink-0">
            <span className="font-mono text-sm text-foreground">
              {formatDuration(report.totalTimeLogged)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="font-mono">
                {report.totalTasksCompleted}
              </span>
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-text-secondary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            )}
          </span>
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border">
            {report.breakdownBySessionType.length > 0 ? (
              <DailyReportChart breakdown={report.breakdownBySessionType} />
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No session breakdown recorded for this day
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
