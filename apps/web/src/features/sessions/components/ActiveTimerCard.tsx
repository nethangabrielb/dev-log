import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CheckSquare,
  Folder,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  StopCircle,
  X,
} from "lucide-react";
import { SESSION_TYPE_COLOR, formatClock } from "@/lib/formatters";
import {
  useActiveSession,
  getSessionElapsedSeconds,
} from "../context/ActiveSessionContext";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ActiveTimerCard() {
  const {
    activeSession,
    addTodo,
    toggleTodo,
    removeTodo,
    pauseSession,
    resumeSession,
    startNextIteration,
    extendSession,
    stopSession,
    cancelSession,
  } = useActiveSession();
  const [now, setNow] = useState(() => Date.now());
  const [todoInput, setTodoInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: projects } = useProjects();
  const linkedProject = activeSession?.linkedTo
    ? projects?.data.find((p) => (p._id || p.id) === activeSession.linkedTo?.id)
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

  const elapsedSeconds = getSessionElapsedSeconds(activeSession, now);
  const elapsedMs = elapsedSeconds * 1000;
  const targetSeconds = activeSession.targetDurationInSeconds ?? null;
  const targetMs = targetSeconds !== null ? targetSeconds * 1000 : null;
  const remainingMs =
    targetMs !== null ? Math.max(0, targetMs - elapsedMs) : null;
  const progressPct =
    targetMs !== null && targetMs > 0
      ? Math.min(100, (elapsedMs / targetMs) * 100)
      : null;

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

  const handleNextIteration = async () => {
    setIsSaving(true);
    try {
      await startNextIteration();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-96 rounded-lg border p-4 space-y-3 shadow-lg"
      style={{
        backgroundColor: "var(--devlog-bg-surface)",
        borderColor: activeSession.isCompleted
          ? "var(--devlog-accent)"
          : "var(--devlog-border)",
        color: "var(--devlog-text-primary)",
      }}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {activeSession.isCompleted ? (
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--devlog-success, #4ade80)" }}
              title="Completed"
            />
          ) : activeSession.isPaused ? (
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--devlog-warning, #f4c542)" }}
              title="Paused"
            />
          ) : (
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: "var(--devlog-accent)" }}
            />
          )}

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

          {activeSession.iteration && activeSession.iteration > 1 && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono rounded border shrink-0"
              style={{
                backgroundColor: "var(--devlog-bg-elevated)",
                borderColor: "var(--devlog-border)",
                color: "var(--devlog-text-secondary)",
              }}
            >
              Iter {activeSession.iteration}
            </span>
          )}

          {activeSession.isPaused && !activeSession.isCompleted && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded shrink-0"
              style={{
                backgroundColor: "rgba(244, 197, 66, 0.15)",
                color: "#f4c542",
              }}
            >
              Paused
            </span>
          )}
        </div>

        <div className="text-right shrink-0">
          <span
            className="text-base font-mono font-medium tracking-tight tabular-nums block"
            style={{
              fontFamily: "var(--font-mono)",
              color: activeSession.isCompleted
                ? "var(--devlog-success, #4ade80)"
                : "var(--devlog-text-primary)",
            }}
          >
            {remainingMs !== null
              ? formatClock(remainingMs)
              : formatClock(elapsedMs)}
          </span>
          {remainingMs !== null && !activeSession.isCompleted && (
            <span
              className="text-[10px] uppercase tracking-wider block"
              style={{ color: "var(--devlog-text-muted)" }}
            >
              left
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar (countdown mode only) */}
      {progressPct !== null && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--devlog-bg-elevated)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-linear"
            style={{
              width: `${100 - progressPct}%`,
              backgroundColor: activeSession.isCompleted
                ? "var(--devlog-success, #4ade80)"
                : progressPct >= 90
                ? "var(--devlog-danger)"
                : "var(--devlog-accent)",
            }}
          />
        </div>
      )}

      {/* Completed Banner */}
      {activeSession.isCompleted && (
        <div
          className="p-2.5 rounded text-xs font-mono flex items-center justify-between border"
          style={{
            backgroundColor: "var(--devlog-bg-elevated)",
            borderColor: "var(--devlog-accent)",
            color: "var(--devlog-text-primary)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" style={{ color: "var(--devlog-accent)" }} />
            <span className="font-semibold">Time&apos;s up! Ready to save or repeat.</span>
          </div>
        </div>
      )}

      {/* Linked Project */}
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

      {/* Todos Checklist */}
      <div className="space-y-1.5 overflow-y-auto pr-1 max-h-40">
        {activeSession.todos.map((todo, index) => (
          <div key={todo._id || index} className="flex items-start gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleTodo(index)}
              className="shrink-0 cursor-pointer p-0 mt-0.5"
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
              className="flex-1 min-w-0 whitespace-normal break-words leading-snug font-mono"
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
              className="shrink-0 cursor-pointer rounded-sm p-0.5 mt-0.5 transition-colors hover:bg-[var(--devlog-bg-hover)]"
              style={{ color: "var(--devlog-text-muted)" }}
              title="Remove todo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Task Input */}
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

      {/* Action Controls */}
      {activeSession.isCompleted ? (
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            onClick={handleNextIteration}
            disabled={isSaving}
            className="w-full bg-accent text-accent-fg hover:bg-accent-dim flex items-center justify-center gap-2 font-mono text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            {isSaving ? "Saving session..." : "Start Next Iteration"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleStop}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-mono"
            >
              <CheckCircle2
                className="h-3.5 w-3.5"
                style={{ color: "var(--devlog-success)" }}
              />
              {isSaving ? "Saving..." : "Save & Finish"}
            </Button>

            {activeSession.mode === "timer" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => extendSession(300)}
                disabled={isSaving}
                className="px-2.5 text-xs font-mono"
                title="Add 5 more minutes"
              >
                +5m
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={cancelSession}
              disabled={isSaving}
              className="px-2.5 text-xs"
              title="Discard session"
            >
              Discard
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          {activeSession.isPaused ? (
            <Button
              type="button"
              variant="outline"
              onClick={resumeSession}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 font-mono text-xs"
              style={{
                borderColor: "var(--devlog-accent)",
                color: "var(--devlog-accent)",
              }}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Resume
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={pauseSession}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 font-mono text-xs"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
          )}

          <Button
            type="button"
            onClick={handleStop}
            disabled={isSaving}
            className="flex-1 bg-accent text-accent-fg hover:bg-accent-dim flex items-center justify-center gap-1.5 font-mono text-xs"
          >
            <StopCircle className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Stop & Save"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={cancelSession}
            disabled={isSaving}
            className="text-xs px-2.5"
            title="Cancel session without saving"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
