import { SessionType } from "@devlog/types";
import { Trash2, Folder } from "lucide-react";
import {
  formatDuration,
  formatRelativeDay,
  SESSION_TYPE_COLOR,
} from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SessionData {
  _id?: string;
  id?: string;
  title: string;
  sessionType: SessionType;
  durationInSeconds: number;
  createdAt?: string;
  date?: string;
  linkedTo?: {
    kind?: string;
    id?: string;
    name?: string;
  };
  projectName?: string;
}

export interface SessionCardProps {
  session: SessionData;
  onDelete?: (id: string) => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const sessionId = session._id || session.id || "";
  const dateStr = session.createdAt || session.date || new Date().toISOString();
  const typeColor =
    SESSION_TYPE_COLOR[session.sessionType] || "var(--devlog-text-muted)";
  const projectName = session.linkedTo?.name || session.projectName;

  return (
    <Card
      className="group border rounded-lg transition-all"
      style={{
        backgroundColor: "var(--devlog-bg-surface)",
        borderColor: "var(--devlog-border)",
      }}
    >
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: typeColor,
              borderColor: typeColor,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
          >
            {session.sessionType}
          </span>
          <div className="min-w-0 flex-1">
            <h4
              className="text-sm font-medium truncate"
              style={{ color: "var(--devlog-text-primary)" }}
            >
              {session.title}
            </h4>
            {projectName && (
              <div
                className="flex items-center gap-1 text-xs mt-0.5"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                <Folder className="h-3 w-3 shrink-0" />
                <span className="truncate">{projectName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span
            className="text-xs font-mono font-medium px-2 py-1 rounded"
            style={{
              fontFamily: "var(--font-mono)",
              backgroundColor: "var(--devlog-bg-elevated)",
              color: "var(--devlog-text-primary)",
            }}
          >
            {formatDuration(session.durationInSeconds)}
          </span>
          <span
            className="text-xs font-mono"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--devlog-text-secondary)",
            }}
          >
            {formatRelativeDay(dateStr)}
          </span>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(sessionId)}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded"
              style={{ color: "var(--devlog-danger)" }}
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
