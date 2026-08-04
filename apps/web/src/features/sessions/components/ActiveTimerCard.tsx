import { useEffect, useState } from "react";
import {
  CheckSquare,
  Folder,
  Plus,
  Square,
  StopCircle,
  X,
} from "lucide-react";
import { SESSION_TYPE_COLOR } from "@/lib/formatters";
import { useActiveSession } from "../context/ActiveSessionContext";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatClock(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function ActiveTimerCard() {
  const {
    activeSession,
    addTodo,
    toggleTodo,
    removeTodo,
    stopSession,
    cancelSession,
  } = useActiveSession();
  const [now, setNow] = useState(() => Date.now());
  const [todoInput, setTodoInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: projects } = useProjects();
  const linkedProject = activeSession?.linkedTo
    ? projects?.find((p) => (p._id || p.id) === activeSession.linkedTo?.id)
    : undefined;

  useEffect(() => {
    if (!activeSession) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const baseline = setTimeout(() => setNow(Date.now()), 0);
    return () => {
      clearInterval(tick);
      clearTimeout(baseline);
    };
  }, [activeSession]);

  if (!activeSession) return null;

  const elapsedMs = now - activeSession.startedAt.getTime();

  const typeColor =
    SESSION_TYPE_COLOR[activeSession.type] || "var(--devlog-text-muted)";

  const handleAddTodo = () => {
    const name = todoInput.trim();
    if (!name) return;
    addTodo(name);
    setTodoInput("");
  };

  const handleStop = async () => {
    setIsSaving(true);
    try {
      await stopSession();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-80 rounded-lg border p-4 space-y-3"
      style={{
        backgroundColor: "var(--devlog-bg-surface)",
        borderColor: "var(--devlog-border)",
        color: "var(--devlog-text-primary)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: "var(--devlog-accent)" }}
          />
          <span
            className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: typeColor,
              borderColor: typeColor,
              backgroundColor: "var(--devlog-bg-elevated)",
            }}
          >
            {activeSession.type}
          </span>
        </div>
        <span
          className="text-base font-mono font-medium tracking-tight tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--devlog-text-primary)",
          }}
        >
          {formatClock(elapsedMs)}
        </span>
      </div>

      {activeSession.linkedTo && (
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--devlog-text-secondary)" }}
        >
          <Folder className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {linkedProject?.name ?? "Project session"}
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        {activeSession.todos.map((todo, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleTodo(index)}
              className="shrink-0 cursor-pointer p-0"
              title={todo.completed ? "Mark as not done" : "Mark as done"}
            >
              {todo.completed ? (
                <CheckSquare
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--devlog-success)" }}
                />
              ) : (
                <Square
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--devlog-border)" }}
                />
              )}
            </button>
            <span
              className="flex-1 truncate font-mono"
              style={{
                fontFamily: "var(--font-mono)",
                color: todo.completed
                  ? "var(--devlog-text-muted)"
                  : "var(--devlog-text-secondary)",
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.name}
            </span>
            <button
              type="button"
              onClick={() => removeTodo(index)}
              className="shrink-0 cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-[var(--devlog-bg-hover)]"
              style={{ color: "var(--devlog-text-muted)" }}
              title="Remove todo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-1">
          <Input
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTodo();
              }
            }}
            placeholder="Add a task..."
            className="text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTodo}
            className="shrink-0"
            title="Add todo"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          onClick={handleStop}
          disabled={isSaving}
          className="flex-1 bg-accent text-accent-fg hover:bg-accent-dim"
        >
          <StopCircle className="h-4 w-4" />
          {isSaving ? "Saving..." : "Stop & Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={cancelSession}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
