import { SessionType, type SessionTodo } from "@devlog/types";
import { CheckSquare, Folder, Square, Trash2 } from "lucide-react";
import {
  formatDuration,
  formatRelativeDay,
  SESSION_TYPE_COLOR,
} from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SessionData {
  _id?: string;
  id?: string;
  type: SessionType;
  durationInSeconds: number;
  startedAt: string;
  todos?: SessionTodo[];
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
  const typeColor =
    SESSION_TYPE_COLOR[session.type] || "var(--devlog-text-muted)";
  const projectName = session.linkedTo?.name || session.projectName;
  const todos = session.todos ?? [];

  return (
    <Card className="group transition-all">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                color: typeColor,
                borderColor: typeColor,
                backgroundColor: "var(--devlog-bg-elevated)",
              }}
            >
              {session.type}
            </span>
            {projectName && (
              <div className="flex items-center gap-1.5 text-xs min-w-0 text-muted-foreground">
                <Folder className="h-3 w-3 shrink-0" />
                <span className="truncate">{projectName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
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
              {formatRelativeDay(session.startedAt)}
            </span>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(sessionId)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-danger"
                title="Delete session"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {todos.length > 0 && (
          <ul
            className="border-t pt-3 space-y-1.5 border-border-subtle"
          >
            {todos.map((todo, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs font-mono"
              >
                {todo.completed ? (
                  <CheckSquare
                    className="h-3.5 w-3.5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <Square
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "truncate",
                    todo.completed
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground"
                  )}
                >
                  {todo.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
