import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  SessionType,
  type CreateSessionDto,
  type SessionLinkedTo,
  type SessionTodo,
} from "@devlog/types";
import { sessionsApi } from "@/api/sessions.api";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatClock, formatDuration } from "@/lib/formatters";
import { notifyTimerDone, playChime } from "../lib/timerAlert";

const STORAGE_KEY = "devlog-active-session";
const APP_TITLE = "DevLog";

export type SessionMode = "stopwatch" | "timer";

export interface ActiveSessionState {
  type: SessionType;
  linkedTo?: SessionLinkedTo | null;
  startedAt: Date;
  todos: SessionTodo[];
  mode: SessionMode;
  targetDurationInSeconds?: number;
  iteration?: number;
  isPaused?: boolean;
  accumulatedSeconds?: number;
  lastResumedAt?: Date | null;
  isCompleted?: boolean;
}

export interface StartSessionOptions {
  mode?: SessionMode;
  targetDurationInSeconds?: number;
}

interface ActiveSessionContextValue {
  activeSession: ActiveSessionState | null;
  startSession: (
    type: SessionType,
    linkedTo?: SessionLinkedTo | null,
    initialTodos?: SessionTodo[],
    options?: StartSessionOptions
  ) => void;
  addTodo: (name: string) => void;
  toggleTodo: (index: number) => void;
  removeTodo: (index: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  startNextIteration: () => Promise<void>;
  extendSession: (seconds: number) => void;
  stopSession: () => Promise<void>;
  cancelSession: () => void;
}

export function getSessionElapsedSeconds(
  session: ActiveSessionState,
  nowMs: number = Date.now()
): number {
  const base = session.accumulatedSeconds ?? 0;
  if (session.isPaused || !session.lastResumedAt) {
    return base;
  }
  const lastResumed =
    session.lastResumedAt instanceof Date
      ? session.lastResumedAt.getTime()
      : new Date(session.lastResumedAt).getTime();
  const running = Math.floor((nowMs - lastResumed) / 1000);
  return base + Math.max(0, running);
}

const ActiveSessionContext = createContext<ActiveSessionContextValue | null>(
  null
);

function loadStoredSession(): ActiveSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.type ||
      !parsed.startedAt ||
      !Array.isArray(parsed.todos)
    ) {
      return null;
    }
    const isPaused = Boolean(parsed.isPaused);
    const accumulatedSeconds =
      typeof parsed.accumulatedSeconds === "number"
        ? parsed.accumulatedSeconds
        : 0;
    const lastResumedAt = parsed.lastResumedAt
      ? new Date(parsed.lastResumedAt)
      : null;
    const isCompleted = Boolean(parsed.isCompleted);
    const iteration =
      typeof parsed.iteration === "number" ? parsed.iteration : 1;

    return {
      type: parsed.type as SessionType,
      linkedTo: parsed.linkedTo ?? null,
      startedAt: new Date(parsed.startedAt),
      todos: parsed.todos as SessionTodo[],
      mode: parsed.mode === "timer" ? "timer" : "stopwatch",
      targetDurationInSeconds:
        parsed.mode === "timer"
          ? typeof parsed.targetDurationInSeconds === "number"
            ? parsed.targetDurationInSeconds
            : undefined
          : undefined,
      iteration,
      isPaused,
      accumulatedSeconds,
      lastResumedAt,
      isCompleted,
    };
  } catch {
    return null;
  }
}

export function ActiveSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(
    loadStoredSession
  );

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...activeSession,
          startedAt:
            activeSession.startedAt instanceof Date
              ? activeSession.startedAt.toISOString()
              : activeSession.startedAt,
          lastResumedAt:
            activeSession.lastResumedAt instanceof Date
              ? activeSession.lastResumedAt.toISOString()
              : activeSession.lastResumedAt ?? null,
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) {
      document.title = APP_TITLE;
      return;
    }
    const update = () => {
      const elapsed = getSessionElapsedSeconds(activeSession);
      if (activeSession.isCompleted) {
        document.title = `🎉 [DONE] • ${APP_TITLE}`;
        return;
      }

      let timeText = "";
      if (activeSession.mode === "timer") {
        const remaining = Math.max(
          0,
          (activeSession.targetDurationInSeconds ?? 0) - elapsed
        );
        timeText = formatClock(remaining * 1000);
      } else {
        timeText = formatClock(elapsed * 1000);
      }

      if (activeSession.isPaused) {
        document.title = `⏸ [PAUSED] ${timeText} • ${APP_TITLE}`;
      } else {
        document.title = `${timeText} • ${APP_TITLE}`;
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => {
      clearInterval(interval);
      document.title = APP_TITLE;
    };
  }, [activeSession]);

  const autoStopFired = useRef(false);

  const startSession = useCallback(
    (
      type: SessionType,
      linkedTo?: SessionLinkedTo | null,
      initialTodos?: SessionTodo[],
      options?: StartSessionOptions
    ) => {
      const mode = options?.mode ?? "stopwatch";
      const now = new Date();
      setActiveSession({
        type,
        linkedTo: linkedTo ?? null,
        startedAt: now,
        todos: initialTodos ?? [],
        mode,
        targetDurationInSeconds:
          mode === "timer" ? options?.targetDurationInSeconds : undefined,
        iteration: 1,
        isPaused: false,
        accumulatedSeconds: 0,
        lastResumedAt: now,
        isCompleted: false,
      });
    },
    []
  );

  const addTodo = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setActiveSession((prev) =>
      prev
        ? { ...prev, todos: [...prev.todos, { name: trimmed, completed: false }] }
        : prev
    );
  }, []);

  const toggleTodo = useCallback((index: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todos: prev.todos.map((todo, i) =>
          i === index ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    });
  }, []);

  const removeTodo = useCallback((index: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todos: prev.todos.filter((_, i) => i !== index),
      };
    });
  }, []);

  const pauseSession = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || prev.isPaused || prev.isCompleted) return prev;
      const currentElapsed = getSessionElapsedSeconds(prev);
      return {
        ...prev,
        isPaused: true,
        accumulatedSeconds: currentElapsed,
        lastResumedAt: null,
      };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || !prev.isPaused || prev.isCompleted) return prev;
      return {
        ...prev,
        isPaused: false,
        lastResumedAt: new Date(),
      };
    });
  }, []);

  const extendSession = useCallback((seconds: number) => {
    setActiveSession((prev) => {
      if (!prev || prev.mode !== "timer") return prev;
      const currentTarget = prev.targetDurationInSeconds ?? 0;
      return {
        ...prev,
        targetDurationInSeconds: currentTarget + seconds,
        isCompleted: false,
        isPaused: false,
        lastResumedAt: new Date(),
      };
    });
  }, []);

  const stopSession = useCallback(async () => {
    const current = activeSession;
    if (!current) return;

    const durationInSeconds = Math.max(1, getSessionElapsedSeconds(current));
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - durationInSeconds * 1000);

    const payload: CreateSessionDto = {
      type: current.type,
      durationInSeconds,
      startedAt,
      endedAt,
      todos: current.todos,
      ...(current.linkedTo ? { linkedTo: current.linkedTo } : {}),
    };

    try {
      await sessionsApi.create(payload);
      setActiveSession(null);
      toast.success("Session logged");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to log session")
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  }, [activeSession, queryClient]);

  const startNextIteration = useCallback(async () => {
    const current = activeSession;
    if (!current) return;

    const durationInSeconds = Math.max(1, getSessionElapsedSeconds(current));
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - durationInSeconds * 1000);

    const payload: CreateSessionDto = {
      type: current.type,
      durationInSeconds,
      startedAt,
      endedAt,
      todos: current.todos,
      ...(current.linkedTo ? { linkedTo: current.linkedTo } : {}),
    };

    const nextIterationNumber = (current.iteration ?? 1) + 1;

    try {
      await sessionsApi.create(payload);
      toast.success(`Session logged. Starting iteration ${nextIterationNumber}!`);

      const now = new Date();
      setActiveSession({
        type: current.type,
        linkedTo: current.linkedTo ?? null,
        startedAt: now,
        todos: current.todos,
        mode: current.mode,
        targetDurationInSeconds: current.targetDurationInSeconds,
        iteration: nextIterationNumber,
        isPaused: false,
        accumulatedSeconds: 0,
        lastResumedAt: now,
        isCompleted: false,
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to log session")
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  }, [activeSession, queryClient]);

  useEffect(() => {
    if (
      !activeSession ||
      activeSession.mode !== "timer" ||
      activeSession.isCompleted
    ) {
      autoStopFired.current = false;
      return;
    }
    if (activeSession.isPaused) {
      return;
    }
    const targetSeconds = activeSession.targetDurationInSeconds ?? 0;
    const check = () => {
      if (autoStopFired.current) return;
      const elapsed = getSessionElapsedSeconds(activeSession);
      if (elapsed >= targetSeconds) {
        autoStopFired.current = true;
        const label = formatDuration(targetSeconds);
        playChime();
        notifyTimerDone(label);
        setActiveSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isCompleted: true,
            isPaused: true,
            accumulatedSeconds: targetSeconds,
            lastResumedAt: null,
          };
        });
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const value = useMemo<ActiveSessionContextValue>(
    () => ({
      activeSession,
      startSession,
      addTodo,
      toggleTodo,
      removeTodo,
      pauseSession,
      resumeSession,
      startNextIteration,
      extendSession,
      stopSession,
      cancelSession,
    }),
    [
      activeSession,
      startSession,
      addTodo,
      toggleTodo,
      removeTodo,
      pauseSession,
      resumeSession,
      startNextIteration,
      extendSession,
      stopSession,
      cancelSession,
    ]
  );

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveSession() {
  const ctx = useContext(ActiveSessionContext);
  if (!ctx) {
    throw new Error(
      "useActiveSession must be used within an ActiveSessionProvider"
    );
  }
  return ctx;
}
